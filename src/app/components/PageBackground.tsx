// 공용 배경 레이어 (Figma `bg` 그룹 1746:239, 2026-09-09 답변 기준으로 전면 교체)
//
// [이전 구현과 무엇이 달라졌나]
// 예전엔 별 배경을 세로로 무한 반복(repeat)하는 타일 방식이었다. 그래서 타일 경계에 가로 이음새가
// 생기는 문제를 미러 타일로 덮는 등 계속 손을 봐야 했다. v6.1 실제 구조는 반복이 아니라
// "같은 별 이미지 3장을 서로 다른 위치·크기로 수동 배치"한 것이다(3장 모두 동일 imageHash).
// 그래서 repeat를 걷어내고 3장을 각각 절대배치한다. 이음새 보정도 더 이상 필요 없다.
//
// [좌표계] Figma 페이지 프레임 `힐링보이스_PC_KO_v6.1`(1746:238, 1920x8719) 좌상단이 원점.
// 답변의 수치는 bg 그룹 원점 기준이라 x는 -908, y는 +852를 더해 페이지 기준으로 옮겨 적었다.
// 가로는 1920 기준 vw로, 세로는 페이지 높이 8719 기준 %로 환산한다(실제 페이지 높이가 Figma와
// 정확히 같지는 않으므로, 세로는 비율로 따라가게 두는 것이 기존 관례).
//
// [주의] bg 그룹은 3435x8963으로 프레임(1920)보다 넓어 좌우로 넘친다. 페이지 프레임이
// clipsContent=true라 이 컨테이너의 overflow:hidden이 반드시 있어야 한다. 넘치는 폭을 잘라
// 1920에 맞추면 별 위치가 달라진다.
// 상단 0~852 구간에는 bg 요소가 없다. 그 구간은 01_Hero가 자기 프레임 배경으로 덮는다.
import { glowGradient } from "../theme";

const bgStar = "/images/bg/bg_star.webp"; // 2880x2777 원본(JPEG)을 2048폭 webp로 변환

// glow는 ELLIPSE의 래디얼 그라디언트 채움이고 blur 효과는 없다. 부드럽게 보이는 건 SCREEN 블렌드 때문.
// Figma는 도형 반경의 83% 지점에서 알파 0이 되는데, 그 반경이 closest-side의 약 1.055배라
// closest-side 기준으로는 87.6% 지점이 알파 0이다. 도형 경계(100%)에 닿기 전에 완전히 투명해지므로
// 예전에 QA에서 지적됐던 "원형 테두리 선"은 생기지 않는다.
const purpleGlow = glowGradient("rgba(114,47,246,1)", "rgba(26,0,255,0)", 87.6, "49% 52%"); // #722ff6 → #1a00ff
const blueGlow = glowGradient("rgba(56,111,183,1)", "rgba(0,111,255,0)", 87.6, "49% 52%"); // #386fb7 → #006fff

// 별 배경 3장. z는 star1 → star3 → star2 순(레이어 이름 순서와 z-order가 다르다 — 2026-09-09 확인).
// star2·star3은 rotation 180이며, 아래 x/y/W/H는 회전이 반영된 바운딩 박스라 위치는 그대로 쓰고
// 이미지만 뒤집는다.
const STARS = [
  // bg_star 1 — bg(530, 0) 2734x2636 → page(-378, 852)
  { left: "-19.6875vw", top: "9.7718%", w: "142.3958vw", h: "137.2917vw", flip: false },
  // bg_star 3 — bg(359, 3676) 3076x2967 → page(-549, 4528)
  { left: "-28.5938vw", top: "51.9326%", w: "160.2083vw", h: "154.5313vw", flip: true },
  // bg_star 2 — bg(359, 5996) 3076x2967 → page(-549, 6848). 프레임 하단을 넘어가 잘린다.
  { left: "-28.5938vw", top: "78.5411%", w: "160.2083vw", h: "154.5313vw", flip: true },
];

// ── 모바일 (힐링보이스_M_KO_v3.1 = 2003:2641, 390x6679.83, 2026-09-28 답변) ──────────────
//
// [v2.1 → v3.1에서 무엇이 달라졌나]
// 투표 섹션이 들어가면서 페이지 높이가 5901.63 → 6679.83으로 778.2 늘었다(= 투표 섹션 높이).
// 세로 위치를 페이지 높이 대비 %로 환산해 쓰는데, 분모가 바뀌었는데 예전 %를 그대로 두니
// 별들이 서로 벌어져 star2 끝(5168)과 star3 시작(5699) 사이에 531px짜리 빈 띠가 생겼고,
// 하필 그 경계가 투표 섹션 한가운데라 또렷한 가로선으로 보였다(2026-09-27 QA 지적).
//
// 단순히 %만 다시 계산한 게 아니다. v3.1에서는 아래 두 장의 크기 자체가 커졌다.
// v2.1은 셋 다 846x815였는데, v3.1은 846x815 / 1414x1363 / 1424x1374로 서로 다르다.
// 그래서 공용 크기 상수를 버리고 별마다 크기를 갖게 했다. 커진 덕에 두 장이 247px 겹쳐
// 빈 구간이 사라진다(star2 4226~5589, star4 5342~6716).
//
// 레이어 이름이 v2.1의 "bg_star 3"에서 v3.1의 "bg_star 4"로 바뀌었다. 이름이 아니라
// z-order와 위치로 대응시킬 것(기획자 주의사항).
// PC와 달리 회전은 셋 다 0도다. 별 이미지는 v2.1과 같은 파일이다(imageHash 동일).
// 배열 순서가 곧 z-order(먼저 = 아래)이며 레이어 이름 순서와 다르다.
const MOBILE_STARS = [
  { left: "-131.2821vw", top: "63.2651%", w: "362.5641vw", h: "349.4872vw" }, // bg_star 2 — x-512 y4226 1414x1363
  { left: "-132.5641vw", top: "79.9721%", w: "365.1282vw", h: "352.3077vw" }, // bg_star 4 — x-517 y5342 1424x1374
  { left: "-58.4615vw", top: "9.9853%", w: "216.9231vw", h: "208.9744vw" },   // bg_star 1 — x-228 y667 846x815
];

// 모바일에는 페이지 레벨 glow가 없다. 대신 02_Big Text 섹션 안에 보라 glow 3개가 있는데,
// 셋 다 페이지 위쪽 같은 구역에 모여 있어 여기서 페이지 좌표로 함께 그린다
// (섹션 컴포넌트에 넣으면 섹션 밖으로 삐져나가는 음수 좌표를 다시 풀어야 한다).
// 절대 y는 v2.1과 같지만 페이지 높이가 바뀌어 %는 다시 계산했다.
const MOBILE_GLOWS = [
  { left: "50vw", top: "10.7378%", size: "72.0513vw" }, // 2003:2681 — x195 y717.27 281
  { left: "79.7436vw", top: "12.4594%", size: "12.8205vw" }, // 2003:2682 — x311 y832.27 50
  { left: "-85.6410vw", top: "10.9733%", size: "159.7436vw" }, // 2003:2683 — x-334 y733 623
];

export function PageBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* ── 모바일 ── */}
      {MOBILE_STARS.map((s, i) => (
        <div
          key={`m${i}`}
          className="md:hidden absolute bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgStar})`, left: s.left, top: s.top, width: s.w, height: s.h }}
        />
      ))}
      {MOBILE_GLOWS.map((g, i) => (
        <div
          key={`mg${i}`}
          className="md:hidden absolute rounded-full opacity-40 mix-blend-screen"
          style={{ backgroundImage: purpleGlow, left: g.left, top: g.top, width: g.size, height: g.size }}
        />
      ))}

      {/* ── PC ── */}
      {STARS.map((s, i) => (
        <div
          key={i}
          className="hidden md:block absolute bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${bgStar})`,
            left: s.left,
            top: s.top,
            width: s.w,
            height: s.h,
            transform: s.flip ? "rotate(180deg)" : undefined,
          }}
        />
      ))}

      {/* glow 보라 (1746:244) — page(-908, 1058), 1715x1715, paint opacity 0.4 / SCREEN */}
      <div
        className="hidden md:block absolute left-[-47.2917vw] top-[12.1344%] w-[89.3229vw] h-[89.3229vw] rounded-full opacity-40 mix-blend-screen"
        style={{ backgroundImage: purpleGlow }}
      />
      {/* glow 파랑 (1746:243) — page(157, 3184), 1607x1607, paint opacity 0.5 / SCREEN. 모바일에는 없다. */}
      <div
        className="hidden md:block absolute left-[8.1771vw] top-[36.5179%] w-[83.6979vw] h-[83.6979vw] rounded-full opacity-50 mix-blend-screen"
        style={{ backgroundImage: blueGlow }}
      />
    </div>
  );
}
