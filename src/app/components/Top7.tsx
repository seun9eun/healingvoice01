import { useCallback, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { TOP7_DATA, type Top7Voice } from "../data/top7Data";
import { Reveal } from "./Reveal";
import { brandGradient } from "../theme";
import { VoiceModal } from "./VoiceModal";

// TOP 7 섹션 — 출연진과 보이스 사이(2026-11-20). Figma 국문 PC 2119:3851 / 모바일 2119:4654 /
// 영문 PC 2119:5324 / 영문 모바일 2119:6142. 반응형 단위(vw) 규칙은 Cast.tsx 맨 위 주석 참고.
//
// 구성: 최종 우승자 카드 1장(640x518) + 일반 카드 6장(282x304, 3장씩 2행).
// 일반 카드는 보이스 섹션 카드와 마스크·테두리가 같은 그림이라 그 에셋을 그대로 쓴다
// (마스크 SVG는 바이트 단위로 같았다). 카드 배경은 다르다 — 보이스는 파란 조명, TOP 7은 보라색.
// 그 밖에 다른 것은 이름 색(그라디언트 C)과 영문 이름 배치뿐이다.
// 카드를 누르면 보이스 섹션과 같은 모달이 열리고, 좌우로는 이 7명 안에서만 넘어간다.
//
// 인물 사진은 카드 크기로 배치까지 끝낸 파일이다(scripts/build-top7-images.mjs).

const cardMask = "/images/voices/card_mask.svg";
const cardStroke = "/images/voices/card_stroke.svg";
const cardStrokeInner = "/images/voices/card_stroke_inner.svg";
const cardBg = "/images/top7/card_bg.webp";
const winnerMask = "/images/top7/winner_mask.svg";
const winnerStroke = "/images/top7/winner_stroke.svg"; // 바깥 금색 6.8px + 안쪽 흰색 8px 두 겹
const winnerBg = "/images/top7/card_bg_winner.webp";
const laurel = "/images/top7/laurel.webp";

// 제목 그라디언트 A — 보이스 타이틀(titleGradient)과 색은 같지만 가운데 정지점이 24.52%로 다르다.
const top7TitleGradient = "linear-gradient(180deg, #EDF4FF 0%, #B4D3FF 24.52%, #69A6FF 100%)";
// 그라디언트 B — 우승자 이름. 덤프 각도가 "약 103~112도"라 112도로 둔다.
const goldGradient = "linear-gradient(112deg, #FCDA6E 12.68%, #F6ECDE 97.11%)";
const diamondGradient = "linear-gradient(180deg, #FEECA6 0%, #E4AF61 100%)";

const mask = (url: string, bg: string) =>
  ({
    maskImage: `url(${url})`,
    WebkitMaskImage: `url(${url})`,
    maskSize: "100% 100%",
    WebkitMaskSize: "100% 100%",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    backgroundImage: `url(${bg})`,
    backgroundSize: "100% 100%",
  }) as const;
const CARD_MASK = mask(cardMask, cardBg);
const WINNER_MASK = mask(winnerMask, winnerBg);
const CARD_STROKE = {
  backgroundImage: `url(${cardStroke}), url(${cardStrokeInner})`,
  backgroundSize: "100% 100%, 100% 100%",
  backgroundRepeat: "no-repeat, no-repeat",
} as const;

const btn =
  "relative block w-full cursor-pointer transition-transform duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8890FC] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

function Photo({ v }: { v: Top7Voice }) {
  return (
    <picture>
      <source media="(min-width: 840px)" srcSet={v.card} />
      <img src={v.cardMobile} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full" />
    </picture>
  );
}

function Diamond() {
  // 12x12(모바일 4.5) 정사각형을 45도 돌린 것
  return (
    <span
      aria-hidden
      className="shrink-0 rotate-45 w-[1.1538vw] h-[1.1538vw] md:w-[0.625vw] md:h-[0.625vw]"
      style={{ backgroundImage: diamondGradient }}
    />
  );
}

function WinnerCard({ v, isEn, label, onOpen, cardRef }: CardProps & { label: string }) {
  const name = isEn ? v.enLines[0] : v.nameKo;
  return (
    <button ref={cardRef} type="button" onClick={onOpen} aria-label={`${name} 프로필 보기`} className={`${btn} aspect-[640/518]`}>
      {/* 레이어 순서(Figma): 배경 → 월계잎(screen) → 사진 → 하단 그라디언트, 그 위에 테두리와 이름 */}
      <div className="absolute inset-0" style={WINNER_MASK}>
        {/* 월계잎 좌표: 왼쪽 x42.4 y106 / 오른쪽 x429.88 y106.41, 180.73x350.59 (카드 640x518 기준) */}
        <img src={laurel} alt="" aria-hidden className="absolute left-[6.625%] top-[20.463%] w-[28.239%] h-[67.68%] mix-blend-screen" />
        <img src={laurel} alt="" aria-hidden className="absolute left-[67.169%] top-[20.543%] w-[28.239%] h-[67.68%] mix-blend-screen -scale-x-100" />
        <Photo v={v} />
        <div
          className="absolute left-0 w-full top-[50.58%] h-[49.42%]"
          style={{ background: "linear-gradient(180deg, rgba(23,10,64,0) 18.25%, #170A40 79.08%)" }}
        />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `url(${winnerStroke})`, backgroundSize: "100% 100%" }}
      />
      {/* 이름 묶음 — PC top 354/518, 모바일 135.12/194.62. 폭은 글자에 맞춰 늘어난다(영문은 카드 폭을 넘는다고
          기획자가 경고 — 묶음 폭을 고정하지 말 것) */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[69.43%] md:top-[68.34%] flex flex-col items-center md:gap-[0.2083vw] font-redSpirit font-black leading-[1.5] whitespace-nowrap">
        <div className="flex items-center gap-[1.0256vw] md:gap-[0.8333vw] h-[6.1538vw] md:h-[3.125vw]">
          <Diamond />
          <span
            className={`uppercase text-transparent bg-clip-text ${isEn ? "text-[4.359vw] md:text-[2.2917vw]" : "text-[5.1282vw] md:text-[2.7083vw]"}`}
            style={{ backgroundImage: goldGradient }}
          >
            {name}
          </span>
          <Diamond />
        </div>
        <span
          className={`text-transparent bg-clip-text text-[3.0769vw] ${isEn ? "md:text-[1.875vw]" : "md:text-[2.0833vw]"}`}
          style={{ backgroundImage: goldGradient }}
        >
          {label}
        </span>
      </div>
    </button>
  );
}

type CardProps = { v: Top7Voice; isEn: boolean; onOpen: () => void; cardRef: (el: HTMLButtonElement | null) => void };

function Top7Card({ v, isEn, onOpen, cardRef }: CardProps) {
  const name = isEn ? v.enLines.join(" ") : v.nameKo;
  return (
    <button ref={cardRef} type="button" onClick={onOpen} aria-label={`${name} 프로필 보기`} className={`${btn} aspect-[110/118] md:aspect-[282/304]`}>
      <div className="absolute inset-0" style={CARD_MASK}>
        <Photo v={v} />
        {/* 하단 그라디언트 — 모바일 64/118, PC 150/304. 정지점까지 둘이 다르다 */}
        <div
          className="absolute bottom-0 left-0 w-full h-[54.24%] md:hidden"
          style={{ background: "linear-gradient(180deg, rgba(13,24,171,0) 15.57%, #02055C 82.21%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-full h-[49.34%] hidden md:block"
          style={{ background: "linear-gradient(180deg, rgba(13,24,171,0) 15.57%, #00097E 98.33%)" }}
        />
      </div>
      <div className="absolute inset-0 pointer-events-none" style={CARD_STROKE} />

      {/* 이름 — 그라디언트는 줄마다 따로 건다(보이스 섹션과 같은 이유: 바깥에 걸면 두 줄이 한 그라디언트를 나눠 쓴다).
            국문      하단 기준. 모바일 padding-bottom 12/118, PC 하단 여백 16/304
            영문 PC   28px·행간 120%. 1줄·2줄 모두 중심이 y≈238이라 y204에서 2줄 높이(68)짜리 상자의 가운데에 둔다
            영문 모바일 11px·행간 110%·자간 -5%, 왼쪽 정렬. 상자 y78.38에서 높이 26(40 - 아래 여백 14), x13 */}
      <div
        className={`absolute flex flex-col font-redSpirit font-black uppercase whitespace-nowrap ${
          isEn
            ? "left-[11.818%] top-[66.42%] h-[6.6667vw] justify-center gap-[0.5128vw] text-[2.8205vw] leading-[1.1] tracking-[-0.05em] md:left-0 md:right-0 md:items-center md:top-[67.1053%] md:h-[3.5417vw] md:gap-0 md:text-[1.4583vw] md:leading-[1.2] md:tracking-normal"
            : "inset-x-0 items-center bottom-[10.17%] md:bottom-[5.26%] text-[3.8462vw] md:text-[1.6667vw] leading-[1.5]"
        }`}
      >
        {(isEn ? v.enLines : [v.nameKo]).map((line) => (
          <span key={line} className="block text-transparent bg-clip-text" style={{ backgroundImage: brandGradient }}>
            {line}
          </span>
        ))}
      </div>
    </button>
  );
}

export function Top7() {
  const { t, lang } = useLanguage();
  const isEn = lang === "en";
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const getOrigin = useCallback((i: number) => cardRefs.current[i]?.getBoundingClientRect() ?? null, []);
  const close = useCallback(() => setOpenIndex(null), []);

  const [winner, ...rest] = TOP7_DATA;
  const card = (v: Top7Voice, i: number) => (
    <div key={v.id} className="w-[28.2051vw] md:w-[14.6875vw]">
      <Top7Card v={v} isEn={isEn} onOpen={() => setOpenIndex(i)} cardRef={(el) => (cardRefs.current[i] = el)} />
    </div>
  );

  return (
    <section
      id="top7"
      // PC는 섹션 높이 1696 고정(120 + 제목 137 + 64 + 인물 1255 + 120), 모바일은 위아래 96
      className="relative isolate overflow-hidden w-full flex flex-col items-center gap-[4.1026vw] md:gap-[3.3333vw] py-[24.6154vw] md:py-[6.25vw] px-[4.1026vw] md:px-0 bg-cover bg-center bg-[url(/images/top7/mobile/section_bg.webp)] md:bg-[url(/images/top7/section_bg.webp)]"
    >
      {/* 위·아래 경계를 앞뒤 섹션 색으로 녹이는 그라디언트. 모바일 위 154/아래 352, PC 위 400/아래 600 */}
      <div className="absolute -z-10 inset-x-0 top-0 h-[39.4872vw] md:h-[20.8333vw] pointer-events-none bg-[linear-gradient(180deg,#1e1f4d_0%,rgba(21,57,118,0)_92.29%)] md:bg-[linear-gradient(180deg,#161f46_0%,rgba(21,57,118,0)_92.29%)]" />
      <div className="absolute -z-10 inset-x-0 bottom-0 h-[90.2564vw] md:h-[31.25vw] pointer-events-none bg-[linear-gradient(180deg,rgba(21,57,118,0)_0%,#1e1f4d_100%)] md:bg-[linear-gradient(180deg,rgba(21,57,118,0)_0%,#161f46_100%)]" />
      <div className="flex flex-col items-center gap-[4.1026vw] md:gap-[0.8333vw] text-center">
        <span className="text-[#44A9FF] md:text-[#4D94FF] font-bold uppercase tracking-[0.41vw] md:tracking-[0.0833vw] text-[4.1026vw] md:text-[0.8333vw] leading-[6.1538vw] md:leading-[1.25vw]">
          {t("top7Section.eyebrow")}
        </span>
        <h2
          className="text-[10.2564vw] leading-[8.9744vw] md:text-[2.9167vw] md:leading-[2.5vw] font-black text-transparent bg-clip-text"
          style={{ backgroundImage: top7TitleGradient, fontFamily: "HiKR, Paperlogy, Pretendard Variable, sans-serif" }}
        >
          {t("top7Section.title")}
        </h2>
        {/* 모바일만 두 줄. <br> 뒤 공백은 줄 첫머리라 모바일에서는 접히고, PC에서는 단어 사이 공백이 된다 */}
        <p className="text-[#D4EBFF] font-semibold text-[4.1026vw] leading-[6.1538vw] tracking-[-0.1231vw] md:text-[1.1094vw] md:leading-[1.7188vw] md:tracking-[-0.0344vw]">
          {t("top7Section.desc1")}
          <br className="md:hidden" /> {t("top7Section.desc2")}
        </p>
      </div>

      {/* 인물 — 모바일: 위 여백 24, 우승 카드 아래 36.09(20 + 16.09), 행 사이 20 / PC: 세 덩어리 사이 64 */}
      <div className="flex flex-col items-center gap-[5.1282vw] md:gap-[3.3333vw] pt-[6.1538vw] md:pt-0">
        <Reveal className="w-[61.5385vw] md:w-[33.3333vw] mb-[4.1256vw] md:mb-0">
          <WinnerCard
            v={winner}
            isEn={isEn}
            label={t("top7Section.winner")}
            onOpen={() => setOpenIndex(0)}
            cardRef={(el) => (cardRefs.current[0] = el)}
          />
        </Reveal>
        {[rest.slice(0, 3), rest.slice(3)].map((row, r) => (
          <Reveal key={r} className="flex gap-[3.5897vw] md:gap-[1.25vw]">
            {row.map((v, j) => card(v, 1 + r * 3 + j))}
          </Reveal>
        ))}
      </div>

      <VoiceModal index={openIndex} lang={lang} onClose={close} onSelect={setOpenIndex} getOrigin={getOrigin} items={TOP7_DATA} />
    </section>
  );
}
