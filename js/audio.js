/*
 * Synthesized sound effects (Web Audio API) + speech synthesis (TTS) helper.
 * No external audio files are used, so the game works fully offline and
 * needs no network/licensing for sound assets.
 */

const GameAudio = (() => {
  let ctx = null;
  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, start, dur, { type = 'sine', gain = 0.2, sweepTo = null } = {}) {
    const c = ensureCtx();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime + start);
    if (sweepTo != null) {
      osc.frequency.exponentialRampToValueAtTime(sweepTo, c.currentTime + start + dur);
    }
    g.gain.setValueAtTime(0.0001, c.currentTime + start);
    g.gain.exponentialRampToValueAtTime(gain, c.currentTime + start + Math.min(0.02, dur / 4));
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
    osc.connect(g).connect(c.destination);
    osc.start(c.currentTime + start);
    osc.stop(c.currentTime + start + dur + 0.02);
  }

  function noiseBurst(start, dur, { gain = 0.15, filterFreq = 1200 } = {}) {
    const c = ensureCtx();
    const bufferSize = Math.floor(c.sampleRate * dur);
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    const src = c.createBufferSource();
    src.buffer = buffer;
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    const g = c.createGain();
    g.gain.setValueAtTime(gain, c.currentTime + start);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
    src.connect(filter).connect(g).connect(c.destination);
    src.start(c.currentTime + start);
  }

  // simple deterministic hash for per-word pitch variety
  function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h;
  }

  const FAMILIES = {
    pop(seed) {
      const p = 620 + (seed % 260);
      tone(p, 0, 0.14, { type: 'triangle', gain: 0.22, sweepTo: p * 1.4 });
    },
    boing(seed) {
      const p = 300 + (seed % 150);
      tone(p, 0, 0.32, { type: 'sine', gain: 0.2, sweepTo: p * 2.4 });
      tone(p * 2.4, 0.1, 0.18, { type: 'sine', gain: 0.12, sweepTo: p * 1.6 });
    },
    tick(seed) {
      noiseBurst(0, 0.05, { gain: 0.18, filterFreq: 2600 });
      noiseBurst(0.22, 0.05, { gain: 0.18, filterFreq: 2200 });
    },
    chime(seed) {
      const p = 500 + (seed % 300);
      tone(p, 0, 0.45, { type: 'sine', gain: 0.16 });
      tone(p * 1.5, 0.02, 0.4, { type: 'sine', gain: 0.09 });
    },
    drum(seed) {
      tone(90 + (seed % 30), 0, 0.22, { type: 'sine', gain: 0.28 });
      noiseBurst(0, 0.08, { gain: 0.12, filterFreq: 500 });
    },
    number(seed, value) {
      const p = 440 + (value || 1) * 22;
      tone(p, 0, 0.28, { type: 'triangle', gain: 0.18, sweepTo: p * 1.1 });
    },
  };

  function playEntrance(word) {
    try {
      const seed = hash(word.id);
      const fam = FAMILIES[word.soundFamily] || FAMILIES.pop;
      fam(seed, word.visual && word.visual.value);
    } catch (e) { /* audio not available, ignore */ }
  }

  function playCorrect(comboLevel = 0) {
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C
      const n = Math.min(notes.length, 3 + (comboLevel >= 3 ? 1 : 0));
      for (let i = 0; i < n; i++) {
        tone(notes[i], i * 0.09, 0.18, { type: 'triangle', gain: 0.22 });
      }
    } catch (e) {}
  }

  function playGentleTryAgain() {
    try {
      tone(392, 0, 0.16, { type: 'sine', gain: 0.14 });
      tone(330, 0.12, 0.22, { type: 'sine', gain: 0.14 });
    } catch (e) {}
  }

  function playMilestone() {
    try {
      const notes = [523.25, 587.33, 659.25, 783.99, 1046.5, 1318.5];
      notes.forEach((f, i) => tone(f, i * 0.11, 0.28, { type: 'triangle', gain: 0.22 }));
    } catch (e) {}
  }

  function playListenStart() {
    try {
      tone(700, 0, 0.09, { type: 'sine', gain: 0.15, sweepTo: 900 });
    } catch (e) {}
  }

  // ---------- Text to speech ----------
  let voices = [];
  function loadVoices() {
    voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  }
  if (window.speechSynthesis) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
  function pickVoice() {
    return (
      voices.find((v) => /en-US/i.test(v.lang) && /female|samantha|zira|google us/i.test(v.name)) ||
      voices.find((v) => /en-US/i.test(v.lang)) ||
      voices.find((v) => /^en/i.test(v.lang)) ||
      null
    );
  }
  function speak(text, { rate = 0.85, pitch = 1.15, onend = null } = {}) {
    if (!window.speechSynthesis) { if (onend) onend(); return; }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const v = pickVoice();
      if (v) u.voice = v;
      u.lang = 'en-US';
      u.rate = rate;
      u.pitch = pitch;
      u.volume = 1;
      if (onend) u.onend = onend;
      window.speechSynthesis.speak(u);
    } catch (e) {
      if (onend) onend();
    }
  }

  function unlock() {
    ensureCtx();
    if (window.speechSynthesis) {
      // Priming call so later speak() calls work reliably after a user gesture
      const u = new SpeechSynthesisUtterance('');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    }
  }

  return {
    unlock,
    playEntrance,
    playCorrect,
    playGentleTryAgain,
    playMilestone,
    playListenStart,
    speak,
  };
})();
