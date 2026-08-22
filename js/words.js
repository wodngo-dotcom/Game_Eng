/*
 * 100 word dataset for the English word learning game.
 * Each word has:
 *  - id: unique key
 *  - en: target English word (what the child must say)
 *  - ko: Korean gloss shown only AFTER the round (reinforcement, never a pre-answer hint)
 *  - category: one of animals | food | colors | shapes | numbers | objects
 *  - visual: how to render the "character" on stage
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
  w('dog', '강아지', 'animals', emoji('🐶'), 'boing'),
  w('cat', '고양이', 'animals', emoji('🐱'), 'boing'),
  w('lion', '사자', 'animals', emoji('🦁'), 'drum'),
  w('tiger', '호랑이', 'animals', emoji('🐯'), 'drum'),
  w('elephant', '코끼리', 'animals', emoji('🐘'), 'drum'),
  w('monkey', '원숭이', 'animals', emoji('🐒'), 'boing'),
  w('rabbit', '토끼', 'animals', emoji('🐰'), 'boing'),
  w('bear', '곰', 'animals', emoji('🐻'), 'drum'),
  w('duck', '오리', 'animals', emoji('🦆'), 'boing'),
  w('pig', '돼지', 'animals', emoji('🐷'), 'drum'),
  w('cow', '소', 'animals', emoji('🐮'), 'drum'),
  w('horse', '말', 'animals', emoji('🐴'), 'drum'),
  w('sheep', '양', 'animals', emoji('🐑'), 'boing'),
  w('frog', '개구리', 'animals', emoji('🐸'), 'boing'),
  w('fish', '물고기', 'animals', emoji('🐟'), 'chime'),
  w('bird', '새', 'animals', emoji('🐦'), 'chime'),
  w('snake', '뱀', 'animals', emoji('🐍'), 'chime'),
  w('mouse', '쥐', 'animals', emoji('🐭'), 'chime'),
  w('chicken', '닭', 'animals', emoji('🐔'), 'chime'),
  w('turtle', '거북이', 'animals', emoji('🐢'), 'chime'),

  // ---------------- Fruits & Food (20) ----------------
  w('apple', '사과', 'food', emoji('🍎'), 'pop'),
  w('banana', '바나나', 'food', emoji('🍌'), 'pop'),
  w('orange', '오렌지', 'food', emoji('🍊'), 'pop'),
  w('grape', '포도', 'food', emoji('🍇'), 'pop'),
  w('strawberry', '딸기', 'food', emoji('🍓'), 'pop'),
  w('watermelon', '수박', 'food', emoji('🍉'), 'pop'),
  w('milk', '우유', 'food', emoji('🥛'), 'chime'),
  w('bread', '빵', 'food', emoji('🍞'), 'pop'),
  w('egg', '계란', 'food', emoji('🥚'), 'pop'),
  w('cheese', '치즈', 'food', emoji('🧀'), 'pop'),
  w('pizza', '피자', 'food', emoji('🍕'), 'pop'),
  w('cookie', '쿠키', 'food', emoji('🍪'), 'pop'),
  w('candy', '사탕', 'food', emoji('🍬'), 'pop'),
  w('ice cream', '아이스크림', 'food', emoji('🍦'), 'chime'),
  w('juice', '주스', 'food', emoji('🧃'), 'chime'),
  w('rice', '밥', 'food', emoji('🍚'), 'pop'),
  w('water', '물', 'food', emoji('💧'), 'chime'),
  w('cake', '케이크', 'food', emoji('🍰'), 'pop'),
  w('potato', '감자', 'food', emoji('🥔'), 'pop'),
  w('carrot', '당근', 'food', emoji('🥕'), 'pop'),

  // ---------------- Colors (20 incl. shapes below split 10/10 per spec) ----------------
  w('red', '빨강', 'colors', color('#ef4444'), 'chime'),
  w('blue', '파랑', 'colors', color('#3b82f6'), 'chime'),
  w('yellow', '노랑', 'colors', color('#f5c518'), 'chime'),
  w('green', '초록', 'colors', color('#22c55e'), 'chime'),
  w('black', '검정', 'colors', color('#000000'), 'chime'),
  w('white', '하양', 'colors', color('#ffffff'), 'chime'),
  w('pink', '분홍', 'colors', color('#f472b6'), 'chime'),
  w('purple', '보라', 'colors', color('#a855f7'), 'chime'),
  w('brown', '갈색', 'colors', color('#92400e'), 'chime'),
  w('gray', '회색', 'colors', color('#9ca3af'), 'chime'),

  // ---------------- Shapes (10) ----------------
  w('circle', '원', 'shapes', shape('circle'), 'pop'),
  w('square', '사각형', 'shapes', shape('square'), 'pop'),
  w('triangle', '삼각형', 'shapes', shape('triangle'), 'pop'),
  w('star', '별', 'shapes', emoji('⭐'), 'chime'),
  w('heart', '하트', 'shapes', emoji('❤️'), 'chime'),
  w('moon', '달', 'shapes', emoji('🌙'), 'chime'),
  w('sun', '해', 'shapes', emoji('☀️'), 'chime'),
  w('cloud', '구름', 'shapes', emoji('☁️'), 'chime'),
  w('diamond', '다이아몬드', 'shapes', shape('diamond'), 'pop'),
  w('oval', '타원', 'shapes', shape('oval'), 'pop'),

  // ---------------- Numbers (20) ----------------
  w('one', '하나', 'numbers', number(1), 'number'),
  w('two', '둘', 'numbers', number(2), 'number'),
  w('three', '셋', 'numbers', number(3), 'number'),
  w('four', '넷', 'numbers', number(4), 'number'),
  w('five', '다섯', 'numbers', number(5), 'number'),
  w('six', '여섯', 'numbers', number(6), 'number'),
  w('seven', '일곱', 'numbers', number(7), 'number'),
  w('eight', '여덟', 'numbers', number(8), 'number'),
  w('nine', '아홉', 'numbers', number(9), 'number'),
  w('ten', '열', 'numbers', number(10), 'number'),
  w('eleven', '열하나', 'numbers', number(11), 'number'),
  w('twelve', '열둘', 'numbers', number(12), 'number'),
  w('thirteen', '열셋', 'numbers', number(13), 'number'),
  w('fourteen', '열넷', 'numbers', number(14), 'number'),
  w('fifteen', '열다섯', 'numbers', number(15), 'number'),
  w('sixteen', '열여섯', 'numbers', number(16), 'number'),
  w('seventeen', '열일곱', 'numbers', number(17), 'number'),
  w('eighteen', '열여덟', 'numbers', number(18), 'number'),
  w('nineteen', '열아홉', 'numbers', number(19), 'number'),
  w('twenty', '스물', 'numbers', number(20), 'number'),

  // ---------------- Everyday Objects (20) ----------------
  w('chair', '의자', 'objects', emoji('🪑'), 'drum'),
  w('table', '탁자', 'objects', icon('table'), 'drum'),
  w('book', '책', 'objects', emoji('📖'), 'pop'),
  w('ball', '공', 'objects', emoji('⚽'), 'boing'),
  w('cup', '컵', 'objects', emoji('🥤'), 'chime'),
  w('spoon', '숟가락', 'objects', emoji('🥄'), 'chime'),
  w('fork', '포크', 'objects', emoji('🍴'), 'chime'),
  w('bag', '가방', 'objects', emoji('🎒'), 'pop'),
  w('hat', '모자', 'objects', emoji('🧢'), 'pop'),
  w('shoe', '신발', 'objects', emoji('👟'), 'pop'),
  w('clock', '시계', 'objects', emoji('⏰'), 'tick'),
  w('door', '문', 'objects', emoji('🚪'), 'drum'),
  w('window', '창문', 'objects', emoji('🪟'), 'drum'),
  w('bed', '침대', 'objects', emoji('🛏️'), 'drum'),
  w('pillow', '베개', 'objects', icon('pillow'), 'pop'),
  w('car', '자동차', 'objects', emoji('🚗'), 'drum'),
  w('bus', '버스', 'objects', emoji('🚌'), 'drum'),
  w('key', '열쇠', 'objects', emoji('🔑'), 'pop'),
  w('phone', '전화기', 'objects', emoji('📱'), 'pop'),
  w('umbrella', '우산', 'objects', emoji('☂️'), 'boing'),
];

function w(en, ko, category, visual, soundFamily) {
  return {
    id: en.replace(/\s+/g, '-'),
    en,
    ko,
    category,
    visual,
    soundFamily,
  };
}
function emoji(value) { return { type: 'emoji', value }; }
function color(value) { return { type: 'color', value }; }
function shape(value) { return { type: 'shape', value }; }
function number(value) { return { type: 'number', value }; }
function icon(value) { return { type: 'icon', value }; }

// sanity check: exactly 100 words, unique ids
if (typeof console !== 'undefined') {
  const ids = new Set(WORDS.map((x) => x.id));
  if (WORDS.length !== 100 || ids.size !== 100) {
    console.warn('WORDS dataset expected 100 unique entries, got', WORDS.length, ids.size);
  }
}
