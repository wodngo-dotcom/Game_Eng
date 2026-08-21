/*
 * Speech recognition wrapper + generous fuzzy matching so that a 6 year old's
 * imperfect pronunciation is still accepted. We never require a "perfect"
 * native-sounding match.
 */

const NUMBER_WORDS = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
};

function normalize(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}
function compact(str) {
  return normalize(str).replace(/\s+/g, '');
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(
        dp[j] + 1,
        dp[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      prev = tmp;
    }
  }
  return dp[n];
}

function similarity(a, b) {
  if (!a.length && !b.length) return 1;
  const dist = levenshtein(a, b);
  return 1 - dist / Math.max(a.length, b.length);
}

// Generous acceptance: fuzzy edit-distance similarity OR substring containment,
// plus special handling for number words (speech engines often transcribe as digits).
function isMatch(transcript, target) {
  const t = compact(target);
  const guess = compact(transcript);
  if (!guess) return false;

  if (guess === t) return true;
  if (guess.length >= 2 && (guess.includes(t) || t.includes(guess))) return true;

  const sim = similarity(guess, t);
  const threshold = t.length <= 3 ? 0.66 : t.length <= 5 ? 0.55 : 0.45;
  if (sim >= threshold) return true;

  if (Object.prototype.hasOwnProperty.call(NUMBER_WORDS, target)) {
    const digit = String(NUMBER_WORDS[target]);
    const rawGuess = normalize(transcript);
    if (rawGuess === digit || rawGuess.split(/\s+/).includes(digit)) return true;
  }
  return false;
}

function bestSimilarityAmong(alternatives, target) {
  let best = 0;
  for (const alt of alternatives) {
    if (isMatch(alt, target)) return { matched: true, best: 1 };
    const sim = similarity(compact(alt), compact(target));
    if (sim > best) best = sim;
  }
  return { matched: false, best };
}

const SpeechEngine = (() => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const supported = !!SR;
  let recognition = null;
  let listening = false;

  function create() {
    const r = new SR();
    r.lang = 'en-US';
    r.continuous = false;
    r.interimResults = false;
    r.maxAlternatives = 5;
    return r;
  }

  function start({ onResult, onEnd, onError, onStart }) {
    if (!supported) {
      if (onError) onError('unsupported');
      return;
    }
    if (listening) return;
    recognition = create();
    listening = true;
    recognition.onstart = () => onStart && onStart();
    recognition.onresult = (event) => {
      const alts = [];
      const result = event.results[0];
      for (let i = 0; i < result.length; i++) alts.push(result[i].transcript);
      onResult && onResult(alts);
    };
    recognition.onerror = (event) => {
      onError && onError(event.error);
    };
    recognition.onend = () => {
      listening = false;
      onEnd && onEnd();
    };
    try {
      recognition.start();
    } catch (e) {
      listening = false;
      onError && onError('start-failed');
    }
  }

  function stop() {
    if (recognition && listening) {
      try { recognition.stop(); } catch (e) {}
    }
  }

  return { supported, start, stop, isMatch, bestSimilarityAmong };
})();
