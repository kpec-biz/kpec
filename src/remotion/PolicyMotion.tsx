import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";

/* ───── 와이어프레임 컬러 시스템 ───── */
const C = {
  bg: "#ffffff",
  bgSoft: "#f4f5f6",
  bgBlue: "#ecf2fe",
  blue: "#256ef4",
  blueDark: "#0b50d0",
  blueDeep: "#083891",
  blueLight: "#d8e5fd",
  red: "#d63d4a",
  redLight: "#fef2f2",
  green: "#16a34a",
  greenLight: "#f0fdf4",
  amber: "#d97706",
  text: "#1e2124",
  textSub: "#464c53",
  textMuted: "#6d7882",
  border: "#e6e8ea",
  white: "#ffffff",
};

/* ───── 카운트업 숫자 ───── */
function AnimatedNumber({
  value,
  decimal = 0,
  suffix = "",
  color = C.text,
  size = 48,
}: {
  value: number;
  decimal?: number;
  suffix?: string;
  color?: string;
  size?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame,
    fps,
    config: { damping: 30, stiffness: 80 },
  });
  const current = interpolate(progress, [0, 1], [0, value]);
  const display =
    decimal > 0
      ? current.toFixed(decimal)
      : Math.round(current).toLocaleString();

  return (
    <span style={{ fontSize: size, fontWeight: 900, color, lineHeight: 1 }}>
      {display}
      {suffix}
    </span>
  );
}

/* ───── 페이드인 래퍼 ───── */
function FadeIn({
  children,
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 25, stiffness: 120 },
  });

  const offset = 24;
  const transforms: Record<string, string> = {
    up: `translateY(${interpolate(progress, [0, 1], [offset, 0])}px)`,
    down: `translateY(${interpolate(progress, [0, 1], [-offset, 0])}px)`,
    left: `translateX(${interpolate(progress, [0, 1], [offset, 0])}px)`,
    right: `translateX(${interpolate(progress, [0, 1], [-offset, 0])}px)`,
    none: "none",
  };

  return (
    <div style={{ opacity: progress, transform: transforms[direction] }}>
      {children}
    </div>
  );
}

/* ───── 프로그레스 바 ───── */
function ProgressBar({
  percent,
  color,
  delay = 0,
}: {
  percent: number;
  color: string;
  delay?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 30, stiffness: 60 },
  });
  const width = interpolate(progress, [0, 1], [0, percent]);

  return (
    <div
      style={{
        height: 14,
        background: C.border,
        borderRadius: 100,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${width}%`,
          borderRadius: 100,
          background: color,
        }}
      />
    </div>
  );
}

/* =========================================================
   SCENE 1: 훅 — "1억 빌리면 이자가 얼마?"
   ========================================================= */
function Scene1() {
  return (
    <AbsoluteFill
      style={{
        background: C.white,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 100,
        padding: "100px 24px 24px",
      }}
    >
      <FadeIn delay={8}>
        <p
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: C.text,
            textAlign: "center",
            lineHeight: 1.35,
          }}
        >
          <span style={{ color: C.blue }}>1억</span> 빌리면
          <br />
          이자 얼마나 낼까?
        </p>
      </FadeIn>
      <FadeIn delay={22}>
        <p
          style={{
            fontSize: 12,
            color: C.textMuted,
            textAlign: "center",
            marginTop: 10,
          }}
        >
          시중은행 vs 정책자금 비교
        </p>
      </FadeIn>
    </AbsoluteFill>
  );
}

/* =========================================================
   SCENE 2: 시중은행 금리
   ========================================================= */
function Scene2() {
  return (
    <AbsoluteFill
      style={{
        background: C.white,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <FadeIn delay={3}>
        <div
          style={{
            background: C.redLight,
            border: `1px solid #fecaca`,
            borderRadius: 6,
            padding: "3px 10px",
            fontSize: 11,
            fontWeight: 700,
            color: C.red,
            marginBottom: 14,
          }}
        >
          시중은행 중소기업 대출
        </div>
      </FadeIn>
      <FadeIn delay={8}>
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <AnimatedNumber
            value={5.5}
            decimal={1}
            suffix="%"
            size={52}
            color={C.red}
          />
        </div>
      </FadeIn>
      <FadeIn delay={12}>
        <p
          style={{
            fontSize: 12,
            color: C.textMuted,
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          평균 신용대출 금리 (4.5~6.5%)
        </p>
      </FadeIn>
      <FadeIn delay={18}>
        <div
          style={{
            background: C.redLight,
            border: `1px solid #fecaca`,
            borderRadius: 12,
            padding: "14px 20px",
            textAlign: "center",
            width: "100%",
          }}
        >
          <p
            style={{
              fontSize: 11,
              color: C.red,
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            5년간 총 이자
          </p>
          <AnimatedNumber value={1448} suffix="만원" color={C.red} size={30} />
        </div>
      </FadeIn>
    </AbsoluteFill>
  );
}

/* =========================================================
   SCENE 3: 정책자금 금리
   ========================================================= */
function Scene3() {
  return (
    <AbsoluteFill
      style={{
        background: C.white,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <FadeIn delay={3}>
        <div
          style={{
            background: C.bgBlue,
            border: `1px solid ${C.blueLight}`,
            borderRadius: 6,
            padding: "3px 10px",
            fontSize: 11,
            fontWeight: 700,
            color: C.blue,
            marginBottom: 14,
          }}
        >
          정부 정책자금
        </div>
      </FadeIn>
      <FadeIn delay={8}>
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <AnimatedNumber
            value={2.5}
            decimal={1}
            suffix="%"
            size={52}
            color={C.blue}
          />
        </div>
      </FadeIn>
      <FadeIn delay={12}>
        <p
          style={{
            fontSize: 12,
            color: C.textMuted,
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          고정금리 (중진공 2026년)
        </p>
      </FadeIn>
      <FadeIn delay={18}>
        <div
          style={{
            background: C.bgBlue,
            border: `1px solid ${C.blueLight}`,
            borderRadius: 12,
            padding: "14px 20px",
            textAlign: "center",
            width: "100%",
          }}
        >
          <p
            style={{
              fontSize: 11,
              color: C.blue,
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            5년간 총 이자
          </p>
          <AnimatedNumber
            value={645}
            suffix="만원"
            color={C.blueDark}
            size={30}
          />
        </div>
      </FadeIn>
    </AbsoluteFill>
  );
}

/* =========================================================
   SCENE 4: 절감 금액
   ========================================================= */
function Scene4() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const punch = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  return (
    <AbsoluteFill
      style={{
        background: C.white,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <FadeIn delay={3}>
        <div
          style={{
            display: "flex",
            gap: 20,
            alignItems: "baseline",
            marginBottom: 20,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 10, color: C.red, fontWeight: 700 }}>
              시중은행
            </p>
            <p
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: C.red,
                textDecoration: "line-through",
              }}
            >
              1,448만원
            </p>
          </div>
          <p style={{ fontSize: 16, color: C.border }}>→</p>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 10, color: C.blue, fontWeight: 700 }}>
              정책자금
            </p>
            <p style={{ fontSize: 18, fontWeight: 900, color: C.text }}>
              645만원
            </p>
          </div>
        </div>
      </FadeIn>

      <div
        style={{
          transform: `scale(${interpolate(punch, [0, 1], [0.5, 1])})`,
          opacity: punch,
          background: C.bgBlue,
          border: `2px solid ${C.blue}`,
          borderRadius: 14,
          padding: "18px 28px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 38,
            fontWeight: 900,
            color: C.blue,
            lineHeight: 1,
          }}
        >
          -803만원
        </p>
        <p style={{ fontSize: 12, color: C.textSub, marginTop: 6 }}>
          같은 1억, 같은 5년의 차이
        </p>
      </div>
    </AbsoluteFill>
  );
}

/* =========================================================
   SCENE 5: 프로그레스 바 + 폐업 비교
   ========================================================= */
function Scene5() {
  return (
    <AbsoluteFill
      style={{
        background: C.white,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "16px 20px",
        gap: 6,
      }}
    >
      {/* 프로그레스 바 — 컴팩트 */}
      <FadeIn delay={3}>
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 10,
              marginBottom: 3,
            }}
          >
            <span style={{ color: C.textSub, fontWeight: 600 }}>시중은행</span>
            <span style={{ color: C.red, fontWeight: 800 }}>1,448만원</span>
          </div>
          <ProgressBar percent={100} color={C.red} delay={8} />
        </div>
      </FadeIn>
      <FadeIn delay={10}>
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 10,
              marginBottom: 3,
            }}
          >
            <span style={{ color: C.textSub, fontWeight: 600 }}>정책자금</span>
            <span style={{ color: C.blue, fontWeight: 800 }}>645만원</span>
          </div>
          <ProgressBar percent={44.5} color={C.blue} delay={15} />
        </div>
      </FadeIn>

      {/* 구분선 */}
      <FadeIn delay={18}>
        <div style={{ height: 1, background: C.border, margin: "6px 0 4px" }} />
      </FadeIn>

      {/* 폐업 비교 */}
      <FadeIn delay={20}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: C.text,
            textAlign: "center",
            marginBottom: 4,
          }}
        >
          사업이 어려워지면?
        </p>
      </FadeIn>
      <FadeIn delay={25} direction="left">
        <div
          style={{
            background: C.redLight,
            border: "1px solid #fecaca",
            borderRadius: 8,
            padding: "8px 14px",
            marginLeft: 10,
            marginRight: 10,
          }}
        >
          <p
            style={{
              fontSize: 11,
              color: C.red,
              fontWeight: 700,
              lineHeight: 1,
              marginBottom: 2,
            }}
          >
            시중은행
          </p>
          <p
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: C.text,
              lineHeight: 1.3,
            }}
          >
            잔액 전액 즉시 상환
          </p>
        </div>
      </FadeIn>
      <FadeIn delay={32} direction="right">
        <div
          style={{
            background: C.bgBlue,
            border: `1px solid ${C.blueLight}`,
            borderRadius: 8,
            padding: "8px 14px",
            marginLeft: 10,
            marginRight: 10,
          }}
        >
          <p
            style={{
              fontSize: 11,
              color: C.blue,
              fontWeight: 700,
              lineHeight: 1,
              marginBottom: 2,
            }}
          >
            정책자금
          </p>
          <p
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: C.text,
              lineHeight: 1.3,
            }}
          >
            기존대로 분할 상환 OK
          </p>
        </div>
      </FadeIn>
    </AbsoluteFill>
  );
}

/* =========================================================
   SCENE 6: CTA
   ========================================================= */
function Scene6() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulse = Math.sin((frame / fps) * Math.PI * 2) * 0.03 + 1;

  return (
    <AbsoluteFill
      style={{
        background: C.blueDark,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <FadeIn delay={5}>
        <p
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: C.white,
            textAlign: "center",
            lineHeight: 1.35,
            marginBottom: 20,
          }}
        >
          우리 기업도
          <br />
          받을 수 있을까?
        </p>
      </FadeIn>
      <FadeIn delay={12}>
        <div
          style={{
            transform: `scale(${pulse})`,
            background: C.white,
            color: C.blueDark,
            fontWeight: 800,
            fontSize: 15,
            padding: "12px 28px",
            borderRadius: 10,
            textAlign: "center",
          }}
        >
          무료 자금진단 →
        </div>
      </FadeIn>
      <FadeIn delay={18}>
        <p
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.6)",
            marginTop: 12,
            textAlign: "center",
          }}
        >
          KPEC 기업정책자금센터
        </p>
      </FadeIn>
    </AbsoluteFill>
  );
}

/* =========================================================
   SCENE 7: 로고 마무리
   ========================================================= */
function Scene7() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        background: C.white,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          transform: `scale(${interpolate(logoScale, [0, 1], [0.8, 1])})`,
          opacity: logoScale,
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 28,
            fontWeight: 900,
            lineHeight: 1,
            marginBottom: 4,
          }}
        >
          <span style={{ color: C.red }}>K</span>
          <span style={{ color: C.blueDark }}>PEC</span>
        </p>
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: C.text,
            marginBottom: 16,
          }}
        >
          한국기업정책자금센터
        </p>
      </div>
      <FadeIn delay={12}>
        <div
          style={{
            height: 1,
            background: C.border,
            width: 60,
            margin: "0 auto 14px",
          }}
        />
      </FadeIn>
      <FadeIn delay={18}>
        <p
          style={{
            fontSize: 12,
            color: C.textSub,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          중소기업 맞춤형
          <br />
          정책자금 컨설팅
        </p>
      </FadeIn>
      <FadeIn delay={25}>
        <p
          style={{
            fontSize: 10,
            color: C.textMuted,
            textAlign: "center",
            marginTop: 12,
          }}
        >
          jsbizfunding.kr
        </p>
      </FadeIn>
    </AbsoluteFill>
  );
}

/* =========================================================
   메인 컴포지션: 26초 (780프레임 @ 30fps)
   사이드바 크기: 300 x 400
   ========================================================= */
export const PolicyMotion: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        fontFamily: "'Pretendard', 'Inter', system-ui, sans-serif",
      }}
    >
      <Sequence from={0} durationInFrames={90}>
        <Scene1 />
      </Sequence>
      <Sequence from={90} durationInFrames={120}>
        <Scene2 />
      </Sequence>
      <Sequence from={210} durationInFrames={150}>
        <Scene3 />
      </Sequence>
      <Sequence from={360} durationInFrames={120}>
        <Scene4 />
      </Sequence>
      <Sequence from={480} durationInFrames={180}>
        <Scene5 />
      </Sequence>
      <Sequence from={660} durationInFrames={120}>
        <Scene6 />
      </Sequence>
      <Sequence from={780} durationInFrames={90}>
        <Scene7 />
      </Sequence>
    </AbsoluteFill>
  );
};
