// 실행: cd nr/dangjang && node test/catalog.test.mjs
import { splitLabel, canonPart, normSize, sortSizes, normalizeSizes, inferSub, normalizeProduct } from '../lib/catalog.js';
let pass = 0, fail = 0;
const eq = (name, a, b) => { const x = JSON.stringify(a), y = JSON.stringify(b); if (x === y) pass++; else { fail++; console.log('실패:', name, '\n  나온 값:', x, '\n  기대 값:', y); } };
const codes = (r, lv) => r.issues.filter((i) => !lv || i.level === lv).map((i) => i.code);

// 부위 이름 묶기
eq('어깨너비', canonPart('어깨너비'), { part: '어깨', circ: false });
eq('가슴둘레', canonPart('가슴둘레'), { part: '가슴', circ: true });
eq('가슴 단면', canonPart('가슴 단면'), { part: '가슴', circ: false });
eq('총기장', canonPart('총기장')?.part, '총장');
eq('소매길이', canonPart('소매길이')?.part, '소매');
eq('소매부리는 안 씀', canonPart('소매부리'), null);
eq('밑단은 안 씀', canonPart('밑단단면'), null);
eq('허벅지단면', canonPart('허벅지단면')?.part, '허벅지');
eq('안기장→인심', canonPart('안기장')?.part, '인심');
eq('영문 대소문자 공백 무시', canonPart(' 허리  단면 (cm) ')?.part, '허리');
eq('모르는 이름', canonPart('색상'), null);

// 사이즈 이름
eq('SMALL→S', [normSize('SMALL'), normSize('Medium'), normSize('X-LARGE'), normSize('XXLARGE')], ['S', 'M', 'XL', 'XXL']);
eq('085→85', normSize('085'), '85');
eq('프리', normSize('프리'), 'FREE');
eq('F', normSize('F'), 'FREE');
eq('S(95)', normSize('S(95)'), 'S');
eq('소문자 xl', normSize('xl'), 'XL');
eq('정렬 알파벳', sortSizes(['XL', 'S', 'M', 'L', '2XL']), ['S', 'M', 'L', 'XL', '2XL']);
eq('정렬 숫자', sortSizes(['32', '28', '30', '34']), ['28', '30', '32', '34']);
eq('정렬 0 1 2', sortSizes(['2', '0', '1']), ['0', '1', '2']);

// 정상 상의
const top = { M: { 총장: 70, 어깨: 50, 가슴: 56, 소매길이: 60 }, L: { 총장: 72, 어깨: 52, 가슴: 58, 소매길이: 61 }, S: { 총장: 68, 어깨: 48, 가슴: 54, 소매길이: 59 } };
let r = normalizeSizes('top', top);
eq('상의 정상', r.ok, true); eq('상의 순서 정렬', Object.keys(r.sizes), ['S', 'M', 'L']); eq('상의 배열', r.sizes.M, [70, 50, 56, 60]);

// 둘레로 적은 표 → 단면
r = normalizeSizes('top', { M: { 총장: 70, 어깨너비: 50, 가슴둘레: 112, 소매길이: 60 }, L: { 총장: 72, 어깨너비: 52, 가슴둘레: 116, 소매길이: 61 } });
eq('가슴둘레 반으로', r.sizes.M[2], 56); eq('둘레는 오류 아님', r.ok, true);
// 이름은 단면인데 값이 둘레
r = normalizeSizes('top', { M: { 총장: 70, 어깨: 50, 가슴: 112, 소매: 60 }, L: { 총장: 72, 어깨: 52, 가슴: 116, 소매: 61 } });
eq('값이 커서 반으로', r.sizes.L[2], 58);
// 인치
r = normalizeSizes('top', { M: { 총장: 27.5, 어깨: 19.5, 가슴: 22, 소매: 23.5 }, L: { 총장: 28.5, 어깨: 20.5, 가슴: 23, 소매: 24 } }, { inch: true });
eq('인치→cm', r.sizes.M[0], 69.8);
// 값 문자열 · 단위 글자
r = normalizeSizes('top', { M: { 총장: '70cm', 어깨: '50.5', 가슴: '56 cm', 소매: '60' }, L: { 총장: '72', 어깨: '52', 가슴: '58', 소매: '61' } });
eq('문자열 숫자', r.sizes.M, [70, 50.5, 56, 60]);
// 빈 값 · 0 · '-'
r = normalizeSizes('top', { M: { 총장: 70, 어깨: '-', 가슴: 56, 소매: 0 }, L: { 총장: 72, 어깨: '-', 가슴: 58, 소매: 0 } });
eq('어깨 없음은 경고만', r.ok, true); eq('빠진 칸은 0', r.sizes.M, [70, 0, 56, 0]); eq('어깨 경고', codes(r, 'warn').includes('missing'), true);
// 가슴 없음 → 오류
r = normalizeSizes('top', { M: { 총장: 70, 어깨: 50 }, L: { 총장: 72, 어깨: 52 } });
eq('가슴 없으면 오류', r.ok, false);
// 사이즈가 커지는데 줄어드는 표
r = normalizeSizes('top', { S: { 총장: 68, 어깨: 48, 가슴: 60, 소매: 59 }, M: { 총장: 70, 어깨: 50, 가슴: 54, 소매: 60 }, L: { 총장: 72, 어깨: 52, 가슴: 52, 소매: 61 } });
eq('순서 어긋남 오류', r.ok, false);
// 범위 밖(가슴 너무 작음)
r = normalizeSizes('top', { M: { 총장: 70, 어깨: 50, 가슴: 12, 소매: 60 }, L: { 총장: 72, 어깨: 52, 가슴: 13, 소매: 61 } });
eq('범위 밖 오류', r.ok, false);
// 중복 사이즈
r = normalizeSizes('top', { M: { 총장: 70, 어깨: 50, 가슴: 56, 소매: 60 }, m: { 총장: 71, 어깨: 51, 가슴: 57, 소매: 61 }, L: { 총장: 72, 어깨: 52, 가슴: 58, 소매: 61 } });
eq('중복 하나만', Object.keys(r.sizes), ['M', 'L']);
// 빈 표
eq('빈 표', normalizeSizes('top', {}).ok, false);
eq('표 없음', normalizeSizes('top', null).ok, false);
// 색상·핏 이름이 붙은 사이즈
const v1 = { '블랙 M': { 총장: 67, 어깨너비: 53, 가슴단면: 62, 소매길이: 60 }, '블랙 L': { 총장: 69, 어깨너비: 55, 가슴단면: 64, 소매길이: 61 }, '네이비 M': { 총장: 67, 어깨너비: 53, 가슴단면: 62, 소매길이: 60 }, '네이비 L': { 총장: 69, 어깨너비: 55, 가슴단면: 64, 소매길이: 61 } };
r = normalizeSizes('top', v1); eq('색상만 다르면 합침', [r.ok, Object.keys(r.sizes)], [true, ['M', 'L']]);
const v2 = { 'M(48)': { 총장: 76, 어깨너비: 48, 가슴단면: 55, 소매길이: 61.5 }, 'L(50)': { 총장: 77.5, 어깨너비: 49.5, 가슴단면: 57.5, 소매길이: 62.5 }, '컴포트 M(48)': { 총장: 76, 어깨너비: 49.5, 가슴단면: 57.5, 소매길이: 61 }, '컴포트 L(50)': { 총장: 77.5, 어깨너비: 51.5, 가슴단면: 61, 소매길이: 62 } };
r = normalizeSizes('top', v2); eq('핏이 다르면 첫 변형만', [r.ok, Object.keys(r.sizes), r.sizes.M[1]], [true, ['M', 'L'], 48]);
eq('사이즈 이름 나누기', [splitLabel('블랙 XL').size, splitLabel('컴포트 L(50)').prefix, splitLabel('2XL').size, splitLabel('30').size, splitLabel('0').size], ['XL', '컴포트', '2XL', '30', '0']);
r = normalizeSizes('outer', { M: { 총장: 112, 어깨: 50, 가슴: 60, 소매: 91 }, L: { 총장: 114, 어깨: 52, 가슴: 62, 소매: 92 } }); eq('코트 소매 91 은 정상', r.ok, true);

// 하의
const pants = { 30: { 허리단면: 40, 밑위: 29, 허벅지단면: 31, 인심: 76, 총장: 102 }, 28: { 허리단면: 38, 밑위: 28, 허벅지단면: 30, 인심: 76, 총장: 101 }, 32: { 허리단면: 42, 밑위: 30, 허벅지단면: 32, 인심: 76, 총장: 103 } };
r = normalizeSizes('bottom', pants); eq('하의 정상', r.ok, true); eq('하의 순서', Object.keys(r.sizes), ['28', '30', '32']); eq('하의 배열', r.sizes[30], [40, 29, 31, 76, 102]);
r = normalizeSizes('bottom', { 0: { 허리: 39, 밑위: 29, 허벅지: 32, 총장: 105 }, 1: { 허리: 41, 밑위: 30, 허벅지: 33, 총장: 107 }, 2: { 허리: 43, 밑위: 31, 허벅지: 34, 총장: 109 } });
eq('0 1 2 사이즈 + 인심 없음', r.ok, true); eq('인심 0 칸', r.sizes[1][3], 0);
r = normalizeSizes('bottom', { 30: { 허리둘레: 80, 밑위: 29, 허벅지둘레: 62, 인심: 76, 총장: 102 }, 32: { 허리둘레: 84, 밑위: 30, 허벅지둘레: 64, 인심: 76, 총장: 103 } });
eq('허리둘레→단면', r.sizes[30][0], 40); eq('허벅지둘레→단면', r.sizes[30][2], 31);
r = normalizeSizes('bottom', { M: { 허리: 40, 총장: 102 }, L: { 허리: 42, 총장: 103 } }); eq('하의 허벅지 밑위 둘 다 없으면 경고', codes(r, 'warn').includes('missing'), true);
r = normalizeSizes('bottom', { M: { 허리: 40, 밑위: 29, 허벅지: 31, 인심: 18, 총장: 46 }, L: { 허리: 42, 밑위: 30, 허벅지: 32, 인심: 19, 총장: 47 } }, { sub: '반바지' });
eq('반바지 인심 짧아도 정상', r.ok, true);

// 세부 종류
eq('반팔 티셔츠', inferSub('top', { name: '헤비 반팔 티셔츠' }).sub, '반팔 티셔츠');
eq('롱 슬리브는 긴팔', inferSub('top', { name: '피그먼트 롱 슬리브 티셔츠' }).sub, '긴팔 티셔츠');
eq('긴팔 셔츠', inferSub('top', { name: '옥스포드 셔츠' }).sub, '긴팔 셔츠');
eq('반팔 셔츠', inferSub('top', { name: '크로셰 반팔 셔츠' }).sub, '반팔 셔츠');
eq('후드티', inferSub('top', { name: 'Solar System Hoodie' }).sub, '후드티');
eq('후드 집업은 후드티 아님', inferSub('top', { name: '후드 집업' }).sub !== '후드티', true);
eq('이름은 긴팔인데 소매가 짧으면 반팔', inferSub('top', { name: '긴팔 티', sizes: { M: [70, 50, 56, 22] } }).sub, '반팔 티셔츠');
eq('이름은 반팔인데 소매가 길면 긴팔', inferSub('top', { name: '반팔 티', sizes: { M: [70, 50, 56, 60] } }).sub, '긴팔 티셔츠');
eq('맨투맨', inferSub('top', { name: '오버사이즈 맨투맨' }).sub, '긴팔 티셔츠');
eq('니트', inferSub('top', { name: '헨리넥 니트' }).sub, '긴팔 티셔츠');
eq('쇼츠', inferSub('bottom', { name: '나일론 쇼츠' }).sub, '반바지');
eq('인심 짧으면 반바지', inferSub('bottom', { name: '와이드 팬츠', sizes: { M: [40, 30, 32, 20, 48] } }).sub, '반바지');
eq('긴바지', inferSub('bottom', { name: '슬랙스', sizes: { M: [40, 30, 32, 76, 102] } }).sub, '긴바지');
eq('가디건', inferSub('outer', { name: '메리노 울 가디건' }).sub, '가디건');
eq('패딩 길이로 롱패딩', inferSub('outer', { name: '구스다운 패딩', sizes: { M: [105, 50, 60, 62] } }).sub, '롱패딩');
eq('숏패딩', inferSub('outer', { name: '라이트 다운 점퍼', sizes: { M: [68, 50, 60, 62] } }).sub, '숏패딩');
eq('롱코트', inferSub('outer', { name: '멜톤 코트', sizes: { M: [112, 50, 60, 62] } }).sub, '롱코트');
eq('숏코트', inferSub('outer', { name: '발마칸 코트', sizes: { M: [86, 50, 60, 62] } }).sub, '숏코트');
eq('블루종은 점퍼/자켓', inferSub('outer', { name: '코튼 블루종' }).sub, '점퍼/자켓');
eq('출처 카테고리 우선', inferSub('outer', { name: 'Ray Yacht', srcCat: '카디건' }).sub, '가디건');

// 무신사 분류 이름 (1차 / 2차)
const mm = (cat, srcCat, name = '') => inferSub(cat, { srcCat, name });
eq('맨투맨/스웨트셔츠', mm('top', '맨투맨/스웨트셔츠').sub, '긴팔 티셔츠');
eq('후드 티셔츠', mm('top', '후드 티셔츠').sub, '후드티');
eq('셔츠/블라우스', mm('top', '셔츠/블라우스').sub, '긴팔 셔츠');
eq('반소매 티셔츠', mm('top', '반소매 티셔츠').sub, '반팔 티셔츠');
eq('긴소매 티셔츠', mm('top', '긴소매 티셔츠').sub, '긴팔 티셔츠');
eq('피케/카라 티셔츠', mm('top', '피케/카라 티셔츠').sub, '긴팔 티셔츠');
eq('니트/스웨터', mm('top', '니트/스웨터').sub, '긴팔 티셔츠');
eq('데님 팬츠', mm('bottom', '데님 팬츠', '스트레이트').sub, '긴바지');
eq('숏 팬츠', mm('bottom', '숏 팬츠').sub, '반바지');
eq('슈트 팬츠/슬랙스', mm('bottom', '슈트 팬츠/슬랙스').sub, '긴바지');
eq('후드 집업은 아우터', inferSub(null, { srcCat: '후드 집업' }).cat, 'outer');
eq('블루종/MA-1', mm('outer', '블루종/MA-1').sub, '점퍼/자켓');
eq('나일론/코치 재킷', mm('outer', '나일론/코치 재킷').sub, '점퍼/자켓');
eq('카디건', mm('outer', '카디건').sub, '가디건');
eq('겨울 싱글 코트(길이로)', inferSub('outer', { srcCat: '겨울 싱글 코트', sizes: { M: [108, 50, 60, 62] } }).sub, '롱코트');
eq('환절기 코트(짧으면 숏)', inferSub('outer', { srcCat: '환절기 코트', sizes: { M: [85, 50, 60, 62] } }).sub, '숏코트');
eq('롱패딩/롱헤비', mm('outer', '롱패딩/롱헤비 아우터').sub, '롱패딩');
eq('숏패딩/숏헤비', inferSub('outer', { srcCat: '숏패딩/숏헤비 아우터', sizes: { M: [68, 50, 60, 62] } }).sub, '숏패딩');
eq('종류 모를 때', inferSub(null, { name: '양말' }).cat, null);

// 한 번에
r = normalizeProduct({ cat: 'top', name: '피그먼트 롱 슬리브', table: top });
eq('통합 정상', [r.ok, r.sub], [true, '긴팔 티셔츠']);
r = normalizeProduct({ cat: 'bottom', name: '나일론 쇼츠', table: { M: { 허리: 40, 밑위: 29, 허벅지: 31, 인심: 18, 총장: 46 }, L: { 허리: 42, 밑위: 30, 허벅지: 32, 인심: 19, 총장: 47 } } });
eq('통합 반바지', [r.ok, r.sub], [true, '반바지']);
eq('종류 모름', normalizeProduct({ name: 'x', table: top }).ok, false);

console.log(`\n통과 ${pass} · 실패 ${fail}`); process.exit(fail ? 1 : 0);
