// src/app/data/top7Data.ts
//
// TOP 7 섹션 데이터(2026-11-20, Figma 국문 PC 2119:3851 기준). 7명 모두 보이스 32인에 있는
// 인물이라 이름·모달 사진은 voicesData에서 그대로 가져오고, 카드 사진과 영문 이름 줄만 여기서 정한다.
// 순서: 0 = 최종 우승자, 1~3 = 1행, 4~6 = 2행. 카드 사진 번호(card_N)도 이 순서다
// (scripts/build-top7-images.mjs의 ORDER와 같아야 한다).
import { VOICES_DATA, type Voice } from "./voicesData";

export interface Top7Voice extends Voice {
  card: string; // PC 카드 사진(우승자는 640x518, 나머지 282x304 카드 크기로 배치까지 끝난 것)
  cardMobile: string;
  enLines: string[]; // 영문 카드 이름 줄. Figma TOP 7은 나시온도 한 줄이라 보이스 섹션 규칙과 다르다
}

const ORDER: [string, string[]][] = [
  ["장근희", ["Jang Geun Hee"]],
  ["김성결", ["Kim", "Sung Gyeul"]],
  ["김호준", ["Kim", "Ho Jun"]],
  ["나시온", ["Na Zion"]],
  ["아삽", ["Asaph"]],
  ["이철규", ["Lee", "Cheol Kyu"]],
  ["호림", ["Horim"]],
];

// 모달 소개글 — TOP 7 전용 문구(Figma 2133:4170 표, 원문은 한 줄씩). "/"는 모달에서 줄바꿈할 자리라 추가한 것.
const DESC: Record<string, { descKo: string; descEn: string }> = {
  "김성결": { descKo: "대한민국 오페라의 얼굴에서 / 이제는 K-CCM의 얼굴로!", descEn: "From the face of Korean opera / to the face of K-CCM!" },
  "김호준": { descKo: "인디 신의 원석을 넘어 / K-CCM을 이끌 신흥 강자", descEn: "A rising powerhouse leading K-CCM, / beyond a hidden gem / of the indie scene" },
  "나시온": { descKo: "폭넓은 음악 스펙트럼을 가진 / 찬양 사역자", descEn: "A worship leader / with a wide musical spectrum" },
  "아삽": { descKo: "힙합부터 CCM까지 아우르는 / 크리스천 아티스트", descEn: "A Christian artist / spanning hip-hop to CCM" },
  "이철규": { descKo: "짙은 그루브와 독보적인 음색을 지닌 / 소울 뮤지션", descEn: "A soul musician / with deep groove / and an unrivaled tone" },
  "장근희": { descKo: "CCM계의 살아있는 전설이자, / 보이스들의 일타 교수", descEn: "A living legend of CCM / and an anchor for the Voices" },
  "호림": { descKo: "독보적인 음색과 / 압도적인 무대 장악력을 갖춘 / 감성 보컬", descEn: "An expressive vocalist / with an unrivaled tone / and commanding stage presence" },
};

export const TOP7_DATA: Top7Voice[] = ORDER.map(([nameKo, enLines], i) => {
  const v = VOICES_DATA.find((x) => x.nameKo === nameKo);
  if (!v) throw new Error(`TOP 7: 보이스 데이터에 없는 이름 ${nameKo}`);
  const file = i === 0 ? "winner" : `card_${i}`;
  return {
    ...v,
    ...DESC[nameKo],
    card: `/images/top7/${file}.webp`,
    cardMobile: `/images/top7/mobile/${file}.webp`,
    enLines,
  };
});
