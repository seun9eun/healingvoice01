// TOP 7 섹션 이미지 빌드 스크립트 (2026-11-20)
//
// 원본: D:/cgn-mini-project/_assets/top7_figma_original/
//   <한글이름>.png      — Figma가 쓰는 인물 누끼 원본(슬랙 답변 에셋). 저장소에 넣지 않는다.
//   laurel.png          — 우승 카드 월계잎(왼쪽). 오른쪽은 CSS로 좌우 반전해 같은 파일을 쓴다.
//   card_bg_winner@3x.png — 우승 카드 배경(그라디언트+이미지 2장이 합쳐진 3배수 export)
//   card_bg@3x.png      — 일반 카드 배경. 보이스 섹션 카드 배경(파란 조명)과 다른 보라색 그림이다
//   section_bg@2x.png / section_bg_mobile@3x.png — 섹션 배경(프레임 크기 렌더)
// 출력: public/images/top7/
//
// [배치값의 출처] 기획자 덤프에는 CROP 사진의 imageTransform이 없어서 표시 박스만으로는 위치를
// 알 수 없었다(박스대로 넣으면 인물이 훨씬 작게 나온다). 그래서 Figma가 렌더한 결과에 원본을
// 맞춰 역산했다 — PC는 사진 레이어 3배수 export(x3_*), 모바일은 섹션 3배수 스크린샷에 대고
// 배율·위치를 전역 탐색(FFT 상관). FIT 3명(김호준·나시온·호림)은 덤프 박스로 계산한 값과 1px
// 안에서 일치해 방법이 검증됐다.
//   x, y = 카드 좌상단 기준, (회전한 뒤의) 사진 좌상단 / s = 원본 1px당 카드 1x px / rot = Figma 각도
// 사진이 바뀌면 이 표도 다시 맞춰야 한다.

import sharp from "sharp";
import fs from "fs";
import path from "path";

const SRC = "D:/cgn-mini-project/_assets/top7_figma_original";
const OUT = "public/images/top7";
const SCALE = 2; // 출력 배수

// 노출 순서: 우승자, 1행 3명, 2행 3명. 파일 번호도 이 순서다(0 = 우승자).
const ORDER = ["장근희", "김성결", "김호준", "나시온", "아삽", "이철규", "호림"];

// PC — 우승 카드 640x518, 일반 카드 282x304
const PC = {
  "장근희": { s: 1.14067, rot: 0, x: -190, y: -54 },
  "김성결": { s: 0.5456, rot: 9.13, x: -154, y: -67 },
  "김호준": { s: 0.28039, rot: 0, x: -392, y: -129 },
  "나시온": { s: 0.56983, rot: 0, x: -135, y: -33 },
  "아삽": { s: 0.57552, rot: 0, x: -141, y: -38 },
  "이철규": { s: 0.44287, rot: 0, x: -15, y: 39 },
  "호림": { s: 0.57837, rot: 0, x: -138, y: -38 },
};

// 모바일 — 우승 카드 240x194.62(PC의 정확히 0.375배라 PC 값을 그대로 줄인다), 일반 카드 110x118.
// 일반 카드는 6명 모두 9.13도 회전이고 PC와 구도가 달라 따로 맞췄다.
const MO_WINNER_RATIO = 240 / 640;
const MO = {
  "장근희": { ...PC["장근희"], s: PC["장근희"].s * MO_WINNER_RATIO, x: PC["장근희"].x * MO_WINNER_RATIO, y: PC["장근희"].y * MO_WINNER_RATIO },
  "김성결": { s: 0.1911, rot: 9.13, x: -45.67, y: -23.33 },
  "김호준": { s: 0.1042, rot: 9.13, x: -157.67, y: -74.33 },
  "나시온": { s: 0.19546, rot: 9.13, x: -48.67, y: -26.33 },
  "아삽": { s: 0.18357, rot: 9.13, x: -40.33, y: -21 },
  "이철규": { s: 0.15521, rot: 9.13, x: -4.33, y: 2 },
  "호림": { s: 0.18451, rot: 9.13, x: -41.67, y: -21.67 },
};

async function bake(name, p, cardW, cardH, outFile) {
  const src = path.join(SRC, name + ".png");
  const meta = await sharp(src).metadata();
  const w = Math.round(meta.width * p.s * SCALE);
  let img = sharp(src).resize({ width: w });
  // Figma 회전(+ = 반시계)은 sharp에서 음수다. 캔버스는 회전한 크기로 자동으로 넓어진다.
  if (p.rot) img = sharp(await img.png().toBuffer()).rotate(-p.rot, { background: { r: 0, g: 0, b: 0, alpha: 0 } });
  const photo = await img.png().toBuffer();
  const pm = await sharp(photo).metadata();

  // 카드 밖으로 나가는 부분은 큰 캔버스에 합성한 뒤 카드 영역만 잘라낸다(composite는 음수 좌표 불가).
  const outW = Math.round(cardW * SCALE), outH = Math.round(cardH * SCALE);
  const px = Math.round(p.x * SCALE), py = Math.round(p.y * SCALE);
  const padX = Math.max(0, -px), padY = Math.max(0, -py);
  const big = await sharp({
    create: { width: padX + Math.max(outW, px + pm.width), height: padY + Math.max(outH, py + pm.height), channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  }).composite([{ input: photo, left: padX + px, top: padY + py }]).png().toBuffer();
  await sharp(big).extract({ left: padX, top: padY, width: outW, height: outH }).webp({ quality: 82, alphaQuality: 90 }).toFile(outFile);
  console.log(`${path.basename(outFile).padEnd(22)} ${name}  ${(fs.statSync(outFile).size / 1024).toFixed(0)}KB`);
}

fs.mkdirSync(path.join(OUT, "mobile"), { recursive: true });
for (const [i, name] of ORDER.entries()) {
  const winner = i === 0;
  const file = winner ? "winner.webp" : `card_${i}.webp`;
  await bake(name, PC[name], winner ? 640 : 282, winner ? 518 : 304, path.join(OUT, file));
  if (MO[name]) await bake(name, MO[name], winner ? 240 : 110, winner ? 194.62 : 118, path.join(OUT, "mobile", file));
}

// 우승 카드 배경 — 3배수 export를 2배수로. 월계잎 — 원본(233x452)이 표시 크기(180.73x350.59)보다
// 조금 커서 그대로 포맷만 바꾼다.
await sharp(path.join(SRC, "card_bg_winner@3x.png")).resize({ width: 1280 }).webp({ quality: 82 }).toFile(path.join(OUT, "card_bg_winner.webp"));
await sharp(path.join(SRC, "card_bg@3x.png")).resize({ width: 564 }).webp({ quality: 82 }).toFile(path.join(OUT, "card_bg.webp"));
await sharp(path.join(SRC, "laurel.png")).webp({ quality: 90, alphaQuality: 95 }).toFile(path.join(OUT, "laurel.webp"));
console.log("card_bg_winner.webp / card_bg.webp / laurel.webp 완료");

// 섹션 배경(2026-11-20 슬랙 답변) — 프레임 크기로 잘린 렌더. 모바일 프레임 fill은 2장(위 FILL, 아래 CROP)인데
// 위 장이 불투명해 아래 장은 보이지 않으므로 위 장 렌더 하나만 쓴다.
await sharp(path.join(SRC, "section_bg@2x.png")).resize({ width: 1920 }).webp({ quality: 78 }).toFile(path.join(OUT, "section_bg.webp"));
await sharp(path.join(SRC, "section_bg_mobile@3x.png")).resize({ width: 780 }).webp({ quality: 78 }).toFile(path.join(OUT, "mobile", "section_bg.webp"));
console.log("section_bg 완료");
