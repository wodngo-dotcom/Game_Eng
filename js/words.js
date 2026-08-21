/*
 * 100 word dataset for the English word learning game.
 * Each word has:
 *  - id: unique key
 *  - en: target English word (what the child must say)
 *  - ko: Korean gloss shown only AFTER the round (reinforcement, never a pre-answer hint)
 *  - category: one of animals | food | colors | shapes | numbers | objects
 *  - visual: how to render the "character" on stage
 *  - hasBuiltInFace: true if the emoji already has an expressive face drawn in
 *    (most animal emoji do) so we skip layering an extra cartoon face on top
 *  - soundFamily: which synthesized entrance-sound family to play (see audio.js)
 */

const CATEGORY_META = {
  animals: { label: '동물', color: '#ffb703', bg: 'linear-gradient(160deg,#fff6e0,#ffe4b0)' },
  food: { label: '과일·음식', color: '#ff6b6b', bg: 'linear-gradient(160deg,#fff0f0,#ffd6d6)' },
  colors: { label: '색깔', color: '#8e7cff', bg: 'linear-gradient(160deg,#f2effe,#ded4ff)' },
  shapes: { label: '모양', color: '#4dd0e1', bg: 'linear-gradient(160deg,#e6fbfd,#c3f3f7)' },
  numbers: { label: '숫자', color: '#66bb6a', bg: 'linear-gradient(160deg,#eefbee,#cdf0cf)' },
  objects: { label: '일상 사물', color: '#5b9bff', bg: 'linear-gradient(160deg,#eaf2ff,#cfe1ff)' },
};

const WORDS = [
  // ---------------- Animals (20) ----------------
  w('dog', '강아지', 'animals', emoji('🐶'), true, 'boing'),
  w('cat', '고양이', 'animals', emoji('🐱'), true, 'boing'),
  w('lion', '사자', 'animals', emoji('🦁'), true, 'drum'),
  w('tiger', '호랑이', 'animals', emoji('🐯'), true, 'drum'),
  w('elephant', '코끼리', 'animals', emoji('🐘'), true, 'drum'),
  w('monkey', '원숭이', 'animals', emoji('🐒'), true, 'boing'),
  w('rabbit', '토끼', 'animals', emoji('🐰'), true, 'boing'),
  w('bear', '곰', 'animals', emoji('🐻'), true, 'drum'),
  w('duck', '오리', 'animals', emoji('🦆'), true, 'boing'),
  w('pig', '돼지', 'animals', emoji('🐷'), true, 'drum'),
  w('cow', '소', 'animals', emoji('🐮'), true, 'drum'),
  w('horse', '말', 'animals', emoji('🐴'), true, 'drum'),
  w('sheep', '양', 'animals', emoji('🐑'), true, 'boing'),
  w('frog', '개구리', 'animals', emoji('🐸'), true, 'boing'),
  w('fish', '물고기', 'animals', emoji('🐟'), true, 'chime'),
  w('bird', '새', 'animals', emoji('🐦'), true, 'chime'),
  w('snake', '뱀', 'animals', emoji('🐍'), true, 'chime'),
  w('mouse', '쥐', 'animals', emoji('🐭'), true, 'chime'),
  w('chicken', '닭', 'animals', emoji('🐔'), true, 'chime'),
  w('turtle', '거북이', 'animals', emoji('🐢'), true, 'chime'),

  // ---------------- Fruits & Food (20) ----------------
  w('apple', '사과', 'food', emoji('🍎'), false, 'pop'),
  w('banana', '바나나', 'food', emoji('🍌'), false, 'pop'),
  w('orange', '오렌지', 'food', emoji('🍊'), false, 'pop'),
  w('grape', '포도', 'food', emoji('🍇'), false, 'pop'),
  w('strawberry', '딸기', 'food', emoji('🍓'), false, 'pop'),
  w('watermelon', '수박', 'food', emoji('🍉'), false, 'pop'),
  w('milk', '우유', 'food', emoji('🥛'), false, 'chime'),
  w('bread', '빵', 'food', emoji('🍞'), false, 'pop'),
  w('egg', '계란', 'food', emoji('🥚'), false, 'pop'),
  w('cheese', '치즈', 'food', emoji('🧀'), false, 'pop'),
  w('pizza', '피자', 'food', emoji('🍕'), false, 'pop'),
  w('cookie', '쿠키', 'food', emoji('🍪'), false, 'pop'),
  w('candy', '사탕', 'food', emoji('🍬'), false, 'pop'),
  w('ice cream', '아이스크림', 'food', emoji('🍦'), false, 'chime'),
  w('juice', '주스', 'food', emoji('🧃'), false, 'chime'),
  w('rice', '밥', 'food', emoji('🍚'), false, 'pop'),
  w('water', '물', 'food', emoji('💧'), false, 'chime'),
  w('cake', '케이크', 'food', emoji('🍰'), false, 'pop'),
  w('potato', '감자', 'food', emoji('🥔'), false, 'pop'),
  w('carrot', '당근', 'food', emoji('🥕'), false, 'pop'),

  // ---------------- Colors (20 incl. shapes below split 10/10 per spec) ----------------
  w('red', '빨강', 'colors', color('#ef4444'), false, 'chime'),
  w('blue', '파랑', 'colors', color('#3b82f6'), false, 'chime'),
  w('yellow', '노랑', 'colors', color('#f5c518'), false, 'chime'),
  w('green', '초록', 'colors', color('#22c55e'), false, 'chime'),
  w('black', '검정', 'colors', color('#2b2b2b'), false, 'chime'),
  w('white', '하양', 'colors', color('#ffffff'), false, 'chime'),
  w('pink', '분홍', 'colors', color('#f472b6'), false, 'chime'),
  w('purple', '보라', 'colors', color('#a855f7'), false, 'chime'),
  w('brown', '갈색', 'colors', color('#92400e'), false, 'chime'),
  w('gray', '회색', 'colors', color('#9ca3af'), false, 'chime'),

  // ---------------- Shapes (10) ----------------
  w('circle', '원', 'shapes', shape('circle'), false, 'pop'),
  w('square', '사각형', 'shapes', shape('square'), false, 'pop'),
  w('triangle', '삼각형', 'shapes', shape('triangle'), false, 'pop'),
  w('star', '별', 'shapes', emoji('⭐'), false, 'chime'),
  w('heart', '하트', 'shapes', emoji('❤️'), false, 'chime'),
  w('moon', '달', 'shapes', emoji('🌙'), false, 'chime'),
  w('sun', '해', 'shapes', emoji('☀️'), false, 'chime'),
  w('cloud', '구름', 'shapes', emoji('☁️'), false, 'chime'),
  w('diamond', '다이아몬드', 'shapes', shape('diamond'), false, 'pop'),
  w('oval', '타원', 'shapes', shape('oval'), false, 'pop'),

  // ---------------- Numbers (20) ----------------
  w('one', '하나', 'numbers', number(1), false, 'number'),
  w('two', '둘', 'numbers', number(2), false, 'number'),
  w('three', '셋', 'numbers', number(3), false, 'number'),
  w('four', '넷', 'numbers', number(4), false, 'number'),
  w('five', '다섯', 'numbers', number(5), false, 'number'),
  w('six', '여섯', 'numbers', number(6), false, 'number'),
  w('seven', '일곱', 'numbers', number(7), false, 'number'),
  w('eight', '여덟', 'numbers', number(8), false, 'number'),
  w('nine', '아홉', 'numbers', number(9), false, 'number'),
  w('ten', '열', 'numbers', number(10), false, 'number'),
  w('eleven', '열하나', 'numbers', number(11), false, 'number'),
  w('twelve', '열둘', 'numbers', number(12), false, 'number'),
  w('thirteen', '열셋', 'numbers', number(13), false, 'number'),
  w('fourteen', '열넷', 'numbers', number(14), false, 'number'),
  w('fifteen', '열다섯', 'numbers', number(15), false, 'number'),
  w('sixteen', '열여섯', 'numbers', number(16), false, 'number'),
  w('seventeen', '열일곱', 'numbers', number(17), false, 'number'),
  w('eighteen', '열여덟', 'numbers', number(18), false, 'number'),
  w('nineteen', '열아홉', 'numbers', number(19), false, 'number'),
  w('twenty', '스물', 'numbers', number(20), false, 'number'),

  // ---------------- Everyday Objects (20) ----------------
  w('chair', '의자', 'objects', emoji('🪑'), false, 'drum'),
  w('table', '탁자', 'objects', icon('table'), false, 'drum'),
  w('book', '책', 'objects', emoji('📖'), false, 'pop'),
  w('ball', '공', 'objects', emoji('⚽'), false, 'boing'),
  w('cup', '컵', 'objects', emoji('🥤'), false, 'chime'),
  w('spoon', '숟가락', 'objects', emoji('🥄'), false, 'chime'),
  w('fork', '포크', 'objects', emoji('🍴'), false, 'chime'),
  w('bag', '가방', 'objects', emoji('🎒'), false, 'pop'),
  w('hat', '모자', 'objects', emoji('🧢'), false, 'pop'),
  w('shoe', '신발', 'objects', emoji('👟'), false, 'pop'),
  w('clock', '시계', 'objects', emoji('⏰'), false, 'tick'),
  w('door', '문', 'objects', emoji('🚪'), false, 'drum'),
  w('window', '창문', 'objects', emoji('🪟'), false, 'drum'),
  w('bed', '침대', 'objects', emoji('🛏️'), false, 'drum'),
  w('pillow', '베개', 'objects', icon('pillow'), false, 'pop'),
  w('car', '자동차', 'objects', emoji('🚗'), false, 'drum'),
  w('bus', '버스', 'objects', emoji('🚌'), false, 'drum'),
  w('key', '열쇠', 'objects', emoji('🔑'), false, 'pop'),
  w('phone', '전화기', 'objects', emoji('📱'), false, 'pop'),
  w('umbrella', '우산', 'objects', emoji('☂️'), false, 'boing'),
];

function w(en, ko, category, visual, hasBuiltInFace, soundFamily) {
  return {
    id: en.replace(/\s+/g, '-'),
    en,
    ko,
    category,
    visual,
    hasBuiltInFace,
    soundFamily,
  };
}
function emoji(value) { return { type: 'emoji', value }; }
function color(value) { return { type: 'color', value }; }
function shape(value) { return { type: 'shape', value }; }
function number(value) { return { type: 'number', value }; }
function icon(value) { return { type: 'icon', value }; }

/*
 * Face placement, baked into the same SVG coordinate system as the object
 * itself (see app.js buildCharacterSVG) so eyes/mouth always land relative
 * to that specific object's own size and center — never a separate layer
 * whose coordinates can drift out of sync with the artwork.
 * cy = vertical center of the face as a fraction of the 200x200 viewBox
 * (0 = top, 1 = bottom). scale = relative size of the face for objects
 * that are thin or already visually busy. Falls back to a per-category
 * default when a word has no override below.
 */
const FACE_DEFAULT = {
  food: { cy: 0.44, scale: 1 },
  colors: { cy: 0.46, scale: 1 },
  shapes: { cy: 0.46, scale: 1 },
  numbers: { cy: 0.80, scale: 0.55 },
  objects: { cy: 0.42, scale: 0.9 },
};
const FACE_OVERRIDES = {
  // food — round fruit sits high; drink containers/cones are tall and narrow
  apple: { cy: 0.40 }, banana: { cy: 0.50 }, orange: { cy: 0.42 }, grape: { cy: 0.42 },
  strawberry: { cy: 0.40 }, watermelon: { cy: 0.46 }, milk: { cy: 0.34, scale: 0.85 },
  bread: { cy: 0.46 }, egg: { cy: 0.40 }, cheese: { cy: 0.48 }, pizza: { cy: 0.56 },
  cookie: { cy: 0.46 }, candy: { cy: 0.42 }, 'ice-cream': { cy: 0.36, scale: 0.85 },
  juice: { cy: 0.34, scale: 0.85 }, rice: { cy: 0.40 }, water: { cy: 0.42, scale: 0.8 },
  cake: { cy: 0.40 }, potato: { cy: 0.48 }, carrot: { cy: 0.58, scale: 0.75 },
  // shapes (emoji-based only; CSS-drawn shapes compute their own center)
  star: { cy: 0.50 }, heart: { cy: 0.42 }, moon: { cy: 0.46 }, sun: { cy: 0.46 }, cloud: { cy: 0.52 },
  // everyday objects — many are wide/flat/thin/asymmetric
  chair: { cy: 0.36 }, table: { cy: 0.30, scale: 0.8 }, book: { cy: 0.42 },
  ball: { cy: 0.46 }, cup: { cy: 0.40 }, spoon: { cy: 0.28, scale: 0.6 },
  fork: { cy: 0.26, scale: 0.6 }, bag: { cy: 0.40 }, hat: { cy: 0.54 },
  shoe: { cy: 0.44 }, clock: { cy: 0.46 }, door: { cy: 0.38 }, window: { cy: 0.42 },
  bed: { cy: 0.32 }, pillow: { cy: 0.46 }, car: { cy: 0.42 }, bus: { cy: 0.40 },
  key: { cy: 0.24, scale: 0.55 }, phone: { cy: 0.36 }, umbrella: { cy: 0.28, scale: 0.85 },
};
function faceLayoutFor(word) {
  const base = FACE_DEFAULT[word.category] || { cy: 0.44, scale: 1 };
  const override = FACE_OVERRIDES[word.id] || {};
  return { cy: override.cy != null ? override.cy : base.cy, scale: override.scale != null ? override.scale : base.scale };
}

// sanity check: exactly 100 words, unique ids
if (typeof console !== 'undefined') {
  const ids = new Set(WORDS.map((x) => x.id));
  if (WORDS.length !== 100 || ids.size !== 100) {
    console.warn('WORDS dataset expected 100 unique entries, got', WORDS.length, ids.size);
  }
}
