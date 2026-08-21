/*
 * Main game logic: state machine, rendering, persistence, reactions.
 */

(() => {
  const STORAGE_KEY = 'ewg_progress_v1';
  const MILESTONES = [10, 50];
  const ROUND_ADVANCE_DELAY = 2400;
  const REINSERT_MIN_GAP = 3;
  const REINSERT_MAX_GAP = 8;

  const PRAISE = [
    'Great job!', 'Awesome!', 'You got it!', 'Fantastic!',
    'Well done!', 'Super star!', 'Nice work!', "You're amazing!",
  ];
  const GENTLE = [
    'Good try!', 'Almost there!', "Let's try again!", 'So close!',
    'Nice try!', 'Keep going!', 'You can do it!',
  ];
  const SHAPE_PALETTE = ['#ff8fa3', '#ffd166', '#4dd0e1', '#8e7cff', '#66bb6a', '#ff9f5b'];

  const WORDS_BY_ID = Object.fromEntries(WORDS.map((w) => [w.id, w]));
  const ALL_IDS = WORDS.map((w) => w.id);

  // ---------------- DOM refs ----------------
  const $ = (id) => document.getElementById(id);
  const startScreen = $('startScreen');
  const startBtn = $('startBtn');
  const progressFill = $('progressFill');
  const progressLabel = $('progressLabel');
  const starCount = $('starCount');
  const badgeRow = $('badgeRow');
  const resetBtn = $('resetBtn');
  const categoryLabel = $('categoryLabel');
  const stage = $('stage');
  const characterStage = $('characterStage');
  const characterEl = $('character');
  const burstEl = $('burst');
  const feedbackToast = $('feedbackToast');
  const comboToast = $('comboToast');
  const wordEn = $('wordEn');
  const wordKo = $('wordKo');
  const wordPlaceholder = $('wordPlaceholder');
  const waveform = $('waveform');
  const micBtn = $('micBtn');
  const idkBtn = $('idkBtn');
  const statusText = $('statusText');
  const milestoneOverlay = $('milestoneOverlay');
  const milestoneEmoji = $('milestoneEmoji');
  const milestoneTitle = $('milestoneTitle');
  const milestoneDesc = $('milestoneDesc');
  const milestoneContinue = $('milestoneContinue');
  const completeOverlay = $('completeOverlay');
  const wordReviewGrid = $('wordReviewGrid');
  const restartBtn = $('restartBtn');
  const confettiLayer = $('confettiLayer');

  // ---------------- State ----------------
  let mastered = new Set();
  let badges = new Set();
  let stars = 0;
  let comboCount = 0;
  let queue = [];
  let currentWord = null;
  let listeningNow = false;
  let resolving = false;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      mastered = new Set(data.mastered || []);
      badges = new Set(data.badges || []);
      stars = data.stars || 0;
    } catch (e) { /* ignore corrupt storage */ }
  }
  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        mastered: [...mastered], badges: [...badges], stars,
      }));
    } catch (e) { /* storage unavailable, continue without persistence */ }
  }

  function buildQueue() {
    queue = shuffle(ALL_IDS.filter((id) => !mastered.has(id)));
  }

  function insertWordLater(id) {
    const remaining = queue.length;
    if (remaining <= REINSERT_MIN_GAP) { queue.push(id); return; }
    const span = Math.min(REINSERT_MAX_GAP, remaining) - REINSERT_MIN_GAP;
    const pos = REINSERT_MIN_GAP + Math.floor(Math.random() * (Math.max(span, 0) + 1));
    queue.splice(Math.min(pos, queue.length), 0, id);
  }

  // ---------------- Rendering ----------------
  function updateTopbar() {
    progressFill.style.width = `${mastered.size}%`;
    progressLabel.textContent = `${mastered.size}/100`;
    starCount.textContent = `⭐ ${stars}`;
  }

  function renderBadges() {
    badgeRow.innerHTML = '';
    const labels = { 10: '🥉 10개 마스터!', 50: '🥈 50개 마스터!', 100: '🏆 100개 마스터!' };
    [...badges].sort((a, b) => a - b).forEach((count) => {
      const pill = document.createElement('div');
      pill.className = 'badge-pill';
      pill.textContent = labels[count] || `${count}개 마스터!`;
      badgeRow.appendChild(pill);
    });
  }

  function iconMarkup(kind) {
    if (kind === 'table') {
      return '<div class="icon-table"><div class="top"></div><div class="legs"><span></span><span></span></div></div>';
    }
    if (kind === 'pillow') {
      return '<div class="icon-pillow"></div>';
    }
    return '';
  }

  function renderCharacter(word) {
    characterEl.className = 'character';
    characterEl.style.background = '';
    characterEl.style.removeProperty('--shape-fill');
    characterEl.innerHTML = '';
    characterEl.textContent = '';

    const v = word.visual;
    if (v.type === 'emoji') {
      characterEl.classList.add('visual-emoji');
      characterEl.textContent = v.value;
    } else if (v.type === 'color') {
      characterEl.classList.add('visual-color');
      characterEl.style.background = v.value;
      characterEl.style.border = '3px solid rgba(0,0,0,0.08)';
    } else if (v.type === 'shape') {
      characterEl.classList.add('visual-shape', `shape-${v.value}`);
      const c = pick(SHAPE_PALETTE);
      if (v.value === 'triangle') {
        characterEl.style.setProperty('--shape-fill', c);
      } else {
        characterEl.style.background = c;
      }
    } else if (v.type === 'number') {
      characterEl.classList.add('visual-number');
      characterEl.textContent = String(v.value);
    } else if (v.type === 'icon') {
      characterEl.classList.add('visual-icon');
      characterEl.innerHTML = iconMarkup(v.value);
    }

    const oldFace = characterStage.querySelector('.face');
    if (oldFace) oldFace.remove();
    if (!word.hasBuiltInFace) {
      const face = document.createElement('div');
      face.className = 'face';
      face.innerHTML = '<div class="eye"></div><div class="eye"></div><div class="mouth"></div>';
      characterStage.appendChild(face);
    }

    const meta = CATEGORY_META[word.category];
    categoryLabel.textContent = meta.label;
    categoryLabel.style.background = meta.color;
    $('card').style.background = meta.bg;
  }

  function triggerEntrance() {
    characterStage.classList.remove('enter-bounce', 'enter-spin');
    // eslint-disable-next-line no-unused-expressions
    void characterStage.offsetWidth; // force reflow so animation replays
    characterStage.classList.add(Math.random() < 0.5 ? 'enter-bounce' : 'enter-spin');
  }

  function setStageState(name) {
    stage.classList.remove('state-idle', 'state-listening', 'state-correct', 'state-wrong');
    stage.classList.add(`state-${name}`);
  }

  function revealWord(show) {
    if (show) {
      wordPlaceholder.classList.add('hidden');
      wordEn.textContent = currentWord.en;
      wordKo.textContent = currentWord.ko;
      requestAnimationFrame(() => {
        wordEn.classList.add('shown');
        wordKo.classList.add('shown');
      });
    } else {
      wordPlaceholder.classList.remove('hidden');
      wordEn.classList.remove('shown');
      wordKo.classList.remove('shown');
      wordEn.textContent = '';
      wordKo.textContent = '';
    }
  }

  function resetToasts() {
    feedbackToast.className = 'feedback-toast';
    feedbackToast.textContent = '';
    comboToast.className = 'combo-toast';
    comboToast.textContent = '';
    burstEl.innerHTML = '';
  }

  function showToast(el, text, cls) {
    el.className = `feedback-toast show ${cls}`;
    el.textContent = text;
  }

  function showCombo(text) {
    comboToast.textContent = text;
    comboToast.className = 'combo-toast show';
  }

  function spawnBurst() {
    burstEl.innerHTML = '';
    const n = 16;
    for (let i = 0; i < n; i++) {
      const span = document.createElement('span');
      const angle = (i / n) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      const dist = 60 + Math.random() * 70;
      span.style.setProperty('--p-x', `${Math.cos(angle) * dist}px`);
      span.style.setProperty('--p-y', `${Math.sin(angle) * dist}px`);
      span.style.setProperty('--p-color', pick(['#ffd166', '#ff8fa3', '#4dd0e1', '#8e7cff', '#66bb6a']));
      span.style.setProperty('--p-delay', `${Math.random() * 0.15}s`);
      burstEl.appendChild(span);
    }
    setTimeout(() => { burstEl.innerHTML = ''; }, 900);
  }

  function spawnConfetti(count) {
    confettiLayer.classList.remove('hidden');
    confettiLayer.innerHTML = '';
    const colors = ['#ff8fa3', '#ffd166', '#4dd0e1', '#8e7cff', '#66bb6a', '#ff9f5b'];
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = pick(colors);
      piece.style.animationDuration = `${1.8 + Math.random() * 1.6}s`;
      piece.style.animationDelay = `${Math.random() * 0.6}s`;
      piece.style.borderRadius = Math.random() < 0.5 ? '50%' : '2px';
      confettiLayer.appendChild(piece);
    }
    setTimeout(() => {
      confettiLayer.classList.add('hidden');
      confettiLayer.innerHTML = '';
    }, 3600);
  }

  function setMicListening(on) {
    listeningNow = on;
    stage.classList.toggle('state-listening', on);
    micBtn.classList.toggle('listening', on);
    waveform.classList.toggle('active', on);
  }

  function setControlsEnabled(enabled) {
    micBtn.disabled = !enabled || !SpeechEngine.supported;
    idkBtn.disabled = !enabled;
  }

  // ---------------- Round flow ----------------
  function nextRound() {
    resolving = false;
    if (mastered.size >= 100) { showComplete(); return; }
    if (queue.length === 0) buildQueue();
    if (queue.length === 0) { showComplete(); return; }

    currentWord = WORDS_BY_ID[queue.shift()];
    resetToasts();
    setStageState('idle');
    revealWord(false);
    renderCharacter(currentWord);
    triggerEntrance();
    GameAudio.playEntrance(currentWord);
    statusText.textContent = '그림을 보고 영어로 말해보세요!';
    setControlsEnabled(true);
    updateTopbar();
  }

  function handleCorrect() {
    if (resolving) return;
    resolving = true;
    setControlsEnabled(false);

    mastered.add(currentWord.id);
    stars += 1;
    comboCount += 1;
    persist();
    updateTopbar();

    setStageState('correct');
    spawnBurst();
    showToast(feedbackToast, pick(PRAISE), 'good');
    if (comboCount >= 2) showCombo(`🔥 ${comboCount} in a row!`);
    GameAudio.playCorrect(comboCount);
    revealWord(true);
    statusText.textContent = '정답이에요!';

    setTimeout(() => GameAudio.speak(currentWord.en), 650);

    const count = mastered.size;
    if (count === 100) {
      setTimeout(() => showComplete(), ROUND_ADVANCE_DELAY);
      return;
    }
    if (MILESTONES.includes(count) && !badges.has(count)) {
      badges.add(count);
      persist();
      renderBadges();
      setTimeout(() => showMilestone(count), ROUND_ADVANCE_DELAY);
      return;
    }
    setTimeout(nextRound, ROUND_ADVANCE_DELAY);
  }

  function handleWrong() {
    if (resolving) return;
    resolving = true;
    setControlsEnabled(false);

    comboCount = 0;
    setStageState('wrong');
    showToast(feedbackToast, pick(GENTLE), 'soft');
    GameAudio.playGentleTryAgain();
    revealWord(true);
    statusText.textContent = '괜찮아요, 다시 들어볼까요?';

    setTimeout(() => GameAudio.speak(currentWord.en), 650);
    insertWordLater(currentWord.id);
    setTimeout(nextRound, ROUND_ADVANCE_DELAY);
  }

  function handleMicClick() {
    if (resolving || listeningNow) return;
    if (!SpeechEngine.supported) {
      statusText.textContent = '이 브라우저는 음성인식을 지원하지 않아요. Chrome을 사용해보세요.';
      return;
    }
    setMicListening(true);
    GameAudio.playListenStart();
    statusText.textContent = '듣고 있어요... 🎧';
    SpeechEngine.start({
      onResult(alts) {
        setMicListening(false);
        const matched = alts.some((a) => SpeechEngine.isMatch(a, currentWord.en));
        if (matched) handleCorrect(); else handleWrong();
      },
      onError(err) {
        setMicListening(false);
        if (err === 'no-speech') statusText.textContent = '다시 마이크를 눌러 말해보세요!';
        else if (err === 'not-allowed' || err === 'service-not-allowed') statusText.textContent = '마이크 권한을 허용해주세요.';
        else statusText.textContent = '다시 한 번 눌러주세요.';
      },
      onEnd() {
        setMicListening(false);
      },
    });
  }

  function handleIdk() {
    if (resolving) return;
    if (listeningNow) { SpeechEngine.stop(); setMicListening(false); }
    handleWrong();
  }

  // ---------------- Milestones / completion ----------------
  const MILESTONE_INFO = {
    10: { emoji: '🥉', title: '10개 단어 마스터!', desc: '정말 잘하고 있어요! 계속 도전해봐요 💪' },
    50: { emoji: '🥈', title: '50개 단어 마스터!', desc: '벌써 절반이나 배웠어요! 대단해요 🌟' },
  };
  function showMilestone(count) {
    const info = MILESTONE_INFO[count] || { emoji: '🏅', title: `${count}개 단어 마스터!`, desc: '정말 대단해요!' };
    milestoneEmoji.textContent = info.emoji;
    milestoneTitle.textContent = info.title;
    milestoneDesc.textContent = info.desc;
    milestoneOverlay.classList.remove('hidden');
    spawnConfetti(60);
  }
  milestoneContinue.addEventListener('click', () => {
    milestoneOverlay.classList.add('hidden');
    nextRound();
  });

  function showComplete() {
    if (!badges.has(100)) { badges.add(100); renderBadges(); persist(); }
    wordReviewGrid.innerHTML = '';
    WORDS.forEach((w) => {
      const cell = document.createElement('div');
      cell.textContent = `${w.en}`;
      wordReviewGrid.appendChild(cell);
    });
    completeOverlay.classList.remove('hidden');
    spawnConfetti(100);
  }
  restartBtn.addEventListener('click', () => {
    if (!confirm('정말 처음부터 다시 시작할까요? 지금까지의 기록이 모두 사라져요.')) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    mastered = new Set();
    badges = new Set();
    stars = 0;
    comboCount = 0;
    buildQueue();
    updateTopbar();
    renderBadges();
    completeOverlay.classList.add('hidden');
    milestoneOverlay.classList.add('hidden');
    nextRound();
  });

  resetBtn.addEventListener('click', () => {
    if (!confirm('정말 처음부터 다시 시작할까요? 지금까지의 기록이 모두 사라져요.')) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    mastered = new Set();
    badges = new Set();
    stars = 0;
    comboCount = 0;
    buildQueue();
    updateTopbar();
    renderBadges();
    completeOverlay.classList.add('hidden');
    milestoneOverlay.classList.add('hidden');
    nextRound();
  });

  micBtn.addEventListener('click', handleMicClick);
  idkBtn.addEventListener('click', handleIdk);

  // ---------------- Boot ----------------
  load();
  buildQueue();
  updateTopbar();
  renderBadges();
  if (!SpeechEngine.supported) {
    micBtn.disabled = true;
  }

  startBtn.addEventListener('click', () => {
    GameAudio.unlock();
    startScreen.classList.add('hidden');
    if (mastered.size >= 100) {
      showComplete();
    } else {
      nextRound();
    }
  });
})();
