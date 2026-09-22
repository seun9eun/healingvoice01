import { useLanguage } from "../context/LanguageContext";
import { Reveal } from "./Reveal";
import { titleGradient } from "../theme";

// 투표 섹션 — 보이스 섹션과 푸터 사이에 들어간다(8차 추가 프로젝트).
// 실제 투표 기능은 없고 퐁당 인앱 투표 페이지로 내보내기만 한다.
//
// 스펙 출처: 슬랙 #figma-요청 답변(2026-09-22)
//   국문 PC 2003:2569 / 국문 모바일 2003:3272 / 영문 PC 2003:3847 / 영문 모바일 2003:4547
// 2026-09-18에 받았던 1962:* 버전에서 구조가 두 군데 바뀌었다.
//   1) 제목 아래 있던 "퐁당 5주년 특별 기획" 배지와 부제("시청자 투표 안내" / "VOTING GUIDE")가 삭제되어
//      이제 로고 이미지만 남는다.
//   2) 참여/필수 조건이 투명한 텍스트 블록에서 테두리 있는 카드로 바뀌었다.
//
// 반응형 단위(vw) 규칙과 모바일/PC 분기 방식은 Cast.tsx 맨 위 주석 참고.

// 헤드카피는 CSS 그라디언트가 아니라 "014" 텍스처를 글자 모양으로 잘라낸 것이다.
// Figma에서 헤드카피 TEXT가 마스크이고 그 아래 텍스처 이미지가 깔린 Mask group 구조이며,
// CSS로는 background-image + background-clip: text 에 해당한다(기획자 확인).
// 시안은 언어·해상도별로 텍스처를 4장 내보내지만 전부 같은 원본(1024x1024)을 자른 것이라 한 장만 쓴다.
const headlineTexture = "/images/vote/vote_headline_texture.png";

// 로고는 Hero에 있는 것과 같은 에셋이다.
const logoKo = "/images/header/healingvoice_logo.png";
const logoEn = "/images/hero/hero_logo_en.png";
const iconArrow = "/images/voices/icon_arrow.svg";

// 투표 페이지 — 퐁당 인앱 투표 페이지로 가는 단축 주소(2026-09-22 수급)
const VOTE_URL = "https://fnd.my/MVH";

const HEADLINE_CLASS = "whitespace-pre-line text-center font-black text-transparent bg-clip-text";
const headlineStyle = {
  fontFamily: "GFC Red Spirit, HiKR, Pretendard Variable, sans-serif",
  backgroundImage: `url(${headlineTexture})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
} as const;

// 디자인 확정 전이라 기본적으로는 투표 섹션을 그리지 않는다. 주소 뒤에 ?vote=on 을 붙였을 때만 보인다
// (Hero의 방청 신청 버튼에 쓴 ?rqbtn=on, deadline.ts의 ?testDeadline=true 와 같은 방식).
// Header의 GNB 메뉴도 이 값을 같이 본다 — 섹션이 없는데 메뉴만 남으면 눌러도 아무 데도 못 가기 때문이다.
// 정식 공개할 때 이 상수와 쓰는 곳 두 군데(여기 아래, Header.tsx의 navItems)를 지우면 된다.
export const VOTE_SECTION_VISIBLE =
  new URLSearchParams(window.location.search).get("vote") === "on";

export function Vote() {
  const { t, lang } = useLanguage();
  const isEn = lang === "en";

  if (!VOTE_SECTION_VISIBLE) return null;

  // 참여/필수 조건 한 줄.
  // PC는 "라벨: 내용"이 가로 한 줄로 붙고 라벨에 콜론이 있다(가로 gap 12).
  // 모바일은 라벨이 위, 내용이 아래로 쌓이고 콜론이 없다(세로 gap 4).
  // 콜론을 문구에 넣지 않고 여기서 PC에만 붙이는 이유는, 같은 번역 키를 양쪽이 공유하기 때문이다.
  const condition = (label: string, value: string) => (
    // 시안의 안쪽 좌우 여백은 24지만, 영문 모바일은 그 값이면 텍스트 가용 폭이 293px밖에 안 남아
    // "1 vote per ID daily (1 contestant per day)"가 두 줄로 접힌다(시안은 한 줄). 영문만 12로 줄인다.
    <div className={`flex flex-col md:flex-row items-center justify-center gap-[1.0256vw] md:gap-[0.625vw] md:px-[1.25vw] ${isEn ? "px-[3.0769vw]" : "px-[6.1538vw]"}`}>
      <span className="font-extrabold text-white text-[4.1026vw] md:text-[1.25vw] leading-[1.4] whitespace-nowrap">
        {label}
        <span className="hidden md:inline">:</span>
      </span>
      <span className="font-medium text-white text-[4.1026vw] md:text-[1.25vw] leading-[1.4] text-center">
        {value}
      </span>
    </div>
  );

  return (
    <section
      id="vote"
      // 루트 세로 간격은 PC 48 / 모바일 48(국문)·32(영문), 좌우 패딩은 PC 360 / 모바일 16, 위아래는 PC 120 / 모바일 64.
      // 루트 프레임에 배경색이 없어 위쪽 보이스 섹션 배경을 그대로 이어받는다.
      className={`w-full flex flex-col items-center ${isEn ? "gap-[8.2051vw]" : "gap-[12.3077vw]"} md:gap-[2.5vw] py-[16.4103vw] md:py-[6.25vw] px-[4.1026vw] md:px-[18.75vw]`}
    >
      {/* 라벨 + 제목 — 라벨 색이 PC/모바일 다른 것은 보이스 섹션 eyebrow와 같은 프로젝트 관례다 */}
      <Reveal className="flex flex-col items-center gap-[4.1026vw] md:gap-[0.8333vw] text-center">
        <span className="text-[#44A9FF] md:text-[#4D94FF] font-bold uppercase tracking-[1.6px] text-[4.1026vw] md:text-[0.8333vw]">
          {t("voteSection.eyebrow")}
        </span>
        <h2
          className="text-[10.2564vw] leading-[8.9744vw] md:text-[2.9167vw] md:leading-tight font-black uppercase text-transparent bg-clip-text"
          style={{ backgroundImage: titleGradient, fontFamily: "HiKR, Paperlogy, Pretendard Variable, sans-serif" }}
        >
          {t("voteSection.title")}
        </h2>
      </Reveal>

      {/* 로고 — 이전 시안에 있던 배지와 부제는 이번에 삭제됐다 */}
      <Reveal delay={0.1}>
        <img
          src={isEn ? logoEn : logoKo}
          alt="Healing Voice"
          className={isEn ? "w-auto h-[15.6923vw] md:h-[6.8411vw] object-contain" : "w-auto h-[17.0179vw] md:h-[7.7005vw] object-contain"}
        />
      </Reveal>

      {/* 헤드카피 + 조건 카드 — 모바일은 래퍼 하나로 묶여 gap 20이고, PC는 국문 56 / 영문 32다 */}
      <Reveal
        className={`flex flex-col items-center gap-[5.1282vw] ${isEn ? "md:gap-[1.6667vw]" : "md:gap-[2.9167vw]"}`}
        delay={0.15}
      >
        {/* 헤드카피는 PC와 모바일의 줄 나눔이 달라 문구 키를 따로 둔다.
            국문은 PC 2줄 / 모바일 3줄로 개행 위치가 다르고,
            영문은 PC가 개행 없이 폭에 맞춰 자동 2줄, 모바일은 4줄 고정이다.
            (영문 모바일 시안은 줄바꿈 문자가 U+2028 2개 + \n 1개로 섞여 있는데,
             브라우저마다 U+2028 처리가 달라서 전부 일반 개행으로 통일했다) */}
        <h3 className={`${HEADLINE_CLASS} md:hidden ${isEn ? "text-[8.2051vw] leading-[1.3]" : "text-[9.7436vw] leading-[1.2]"}`} style={headlineStyle}>
          {t("voteSection.headlineMobile")}
        </h3>
        <h3 className={`${HEADLINE_CLASS} hidden md:block leading-[1.3] ${isEn ? "md:text-[3.0208vw]" : "md:text-[2.9167vw]"}`} style={headlineStyle}>
          {t("voteSection.headline")}
        </h3>

        {/* 조건 카드 — radius PC 24 / 모바일 16, 배경 #062259, 테두리 #e5faff 1px.
            모바일 좌우 패딩이 국문 16 / 영문 8로 다르다. 영문은 문구가 길어 8이 아니면
            "1 vote per ID daily (1 contestant per day)"가 두 줄로 접힌다(시안은 한 줄). */}
        <div
          className={`flex flex-col items-center gap-[4.1026vw] md:gap-[0.4167vw] rounded-[4.1026vw] md:rounded-[1.25vw] border border-[#e5faff] bg-[#062259] py-[4.1026vw] md:py-[1.25vw] md:px-[1.25vw] ${
            isEn ? "px-[2.0513vw]" : "px-[4.1026vw]"
          }`}
        >
          {condition(t("voteSection.eligibilityLabel"), t("voteSection.eligibility"))}
          {condition(t("voteSection.requirementsLabel"), t("voteSection.requirements"))}
        </div>
      </Reveal>

      {/* CTA — 버튼 스타일은 Hero·보이스 섹션 CTA와 같은 계열이다 */}
      <Reveal delay={0.2}>
        <a
          href={VOTE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-[2.0513vw] md:gap-[0.4167vw] rounded-full bg-[#6276FB] hover:bg-[#4f5fe0] transition-colors shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] px-[8.2051vw] py-[4.1026vw] md:px-[2.5vw] md:py-[1.25vw]"
        >
          <span className="font-bold text-white text-[4.6154vw] md:text-[1.25vw] leading-none whitespace-nowrap">
            {t("voteSection.cta")}
          </span>
          <img src={iconArrow} alt="" aria-hidden className="-rotate-90 w-[5.1282vw] h-[5.1282vw] md:w-[1.25vw] md:h-[1.25vw]" />
        </a>
      </Reveal>
    </section>
  );
}
