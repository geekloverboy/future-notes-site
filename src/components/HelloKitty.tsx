import { motion } from "framer-motion";

interface Props {
  size?: number;
  className?: string;
  bowColor?: string;
  blink?: boolean;
}

/**
 * High-fidelity Hello-Kitty inspired chibi cat — original stylized art.
 * Layered gradients, soft inner shadow, polished bow, glossy eyes.
 */
const HelloKitty = ({ size = 120, className = "", bowColor = "hsl(338 92% 64%)", blink = true }: Props) => {
  const uid = `hk-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 220 200"
      className={className}
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 14 }}
      style={{ filter: "drop-shadow(0 8px 18px hsla(335,80%,60%,0.28))" }}
    >
      <defs>
        {/* Face gradient — soft, creamy, dimensional */}
        <radialGradient id={`face-${uid}`} cx="42%" cy="38%" r="72%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="hsl(350 100% 99%)" />
          <stop offset="100%" stopColor="hsl(345 50% 92%)" />
        </radialGradient>
        {/* Inner ear */}
        <radialGradient id={`ear-${uid}`} cx="50%" cy="60%" r="60%">
          <stop offset="0%" stopColor="hsl(345 95% 86%)" />
          <stop offset="100%" stopColor="hsl(338 80% 72%)" />
        </radialGradient>
        {/* Bow gradient */}
        <linearGradient id={`bow-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(348 100% 86%)" />
          <stop offset="55%" stopColor={bowColor} />
          <stop offset="100%" stopColor="hsl(335 85% 52%)" />
        </linearGradient>
        <radialGradient id={`bowKnot-${uid}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="hsl(348 100% 82%)" />
          <stop offset="100%" stopColor="hsl(335 85% 50%)" />
        </radialGradient>
        {/* Blush */}
        <radialGradient id={`blush-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(345 100% 78%)" stopOpacity="0.9" />
          <stop offset="70%" stopColor="hsl(345 100% 78%)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="hsl(345 100% 78%)" stopOpacity="0" />
        </radialGradient>
        {/* Eye gradient */}
        <radialGradient id={`eye-${uid}`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#3b2a3a" />
          <stop offset="100%" stopColor="#0f0a14" />
        </radialGradient>
        {/* Nose gradient */}
        <linearGradient id={`nose-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(48 100% 78%)" />
          <stop offset="100%" stopColor="hsl(38 95% 60%)" />
        </linearGradient>
        {/* Subtle inner shadow on face */}
        <radialGradient id={`shade-${uid}`} cx="50%" cy="78%" r="60%">
          <stop offset="0%" stopColor="hsl(335 60% 80%)" stopOpacity="0" />
          <stop offset="100%" stopColor="hsl(335 60% 80%)" stopOpacity="0.18" />
        </radialGradient>
        <filter id={`soft-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
      </defs>

      {/* Ears (outer) */}
      <path
        d="M 38 78 Q 30 28, 38 22 Q 48 22, 86 56 Z"
        fill={`url(#face-${uid})`}
        stroke="hsl(338 35% 78%)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M 182 78 Q 190 28, 182 22 Q 172 22, 134 56 Z"
        fill={`url(#face-${uid})`}
        stroke="hsl(338 35% 78%)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Inner ears */}
      <path d="M 50 62 Q 46 38, 52 34 Q 60 38, 78 56 Z" fill={`url(#ear-${uid})`} opacity="0.85" />
      <path d="M 170 62 Q 174 38, 168 34 Q 160 38, 142 56 Z" fill={`url(#ear-${uid})`} opacity="0.85" />

      {/* Head — slightly squashed for chibi */}
      <ellipse
        cx="110"
        cy="112"
        rx="86"
        ry="72"
        fill={`url(#face-${uid})`}
        stroke="hsl(338 35% 78%)"
        strokeWidth="1.6"
      />
      {/* Inner shading */}
      <ellipse cx="110" cy="112" rx="86" ry="72" fill={`url(#shade-${uid})`} />

      {/* Blush */}
      <ellipse cx="58" cy="128" rx="16" ry="9" fill={`url(#blush-${uid})`} />
      <ellipse cx="162" cy="128" rx="16" ry="9" fill={`url(#blush-${uid})`} />

      {/* Eyes */}
      <motion.g
        animate={blink ? { scaleY: [1, 1, 0.08, 1, 1] } : {}}
        transition={{ duration: 4.2, repeat: Infinity, times: [0, 0.86, 0.92, 0.97, 1], ease: "easeInOut" }}
        style={{ transformOrigin: "110px 112px", transformBox: "fill-box" } as React.CSSProperties}
      >
        <ellipse cx="74" cy="112" rx="7.5" ry="11" fill={`url(#eye-${uid})`} />
        <ellipse cx="146" cy="112" rx="7.5" ry="11" fill={`url(#eye-${uid})`} />
        {/* Glossy highlights */}
        <ellipse cx="76.5" cy="107" rx="2.6" ry="3.4" fill="white" opacity="0.95" />
        <ellipse cx="148.5" cy="107" rx="2.6" ry="3.4" fill="white" opacity="0.95" />
        <circle cx="72" cy="116" r="1.2" fill="white" opacity="0.7" />
        <circle cx="144" cy="116" r="1.2" fill="white" opacity="0.7" />
      </motion.g>

      {/* Nose */}
      <ellipse cx="110" cy="128" rx="6" ry="4.2" fill={`url(#nose-${uid})`} stroke="hsl(36 70% 50%)" strokeWidth="0.6" />
      <ellipse cx="108" cy="126.5" rx="1.6" ry="1.1" fill="white" opacity="0.7" />

      {/* Whiskers */}
      <g stroke="hsl(338 30% 65%)" strokeWidth="1.5" strokeLinecap="round" fill="none" filter={`url(#soft-${uid})`}>
        <path d="M 22 116 Q 40 116, 56 122" />
        <path d="M 20 130 Q 38 130, 56 130" />
        <path d="M 24 144 Q 42 142, 56 138" />
        <path d="M 198 116 Q 180 116, 164 122" />
        <path d="M 200 130 Q 182 130, 164 130" />
        <path d="M 196 144 Q 178 142, 164 138" />
      </g>

      {/* Mouth — tiny y-shape */}
      <g stroke="hsl(335 45% 55%)" strokeWidth="1.4" fill="none" strokeLinecap="round">
        <path d="M 110 132 L 110 138" />
        <path d="M 110 138 Q 104 144, 100 140" />
        <path d="M 110 138 Q 116 144, 120 140" />
      </g>

      {/* Bow on left ear — layered, ribbon-like */}
      <motion.g
        style={{ transformOrigin: "60px 56px", transformBox: "fill-box" } as React.CSSProperties}
        animate={{ rotate: [-5, 5, -5] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Back ribbon shadow */}
        <ellipse cx="60" cy="60" rx="42" ry="14" fill="hsl(335 70% 45%)" opacity="0.18" />
        {/* Left loop */}
        <path
          d="M 60 56 C 38 36, 18 38, 18 56 C 18 74, 42 70, 60 62 Z"
          fill={`url(#bow-${uid})`}
          stroke="hsl(335 75% 45%)"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        {/* Right loop */}
        <path
          d="M 60 56 C 82 36, 102 38, 102 56 C 102 74, 78 70, 60 62 Z"
          fill={`url(#bow-${uid})`}
          stroke="hsl(335 75% 45%)"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        {/* Loop folds */}
        <path d="M 26 50 Q 34 56, 30 64" stroke="hsl(335 80% 45%)" strokeWidth="1" fill="none" opacity="0.5" />
        <path d="M 94 50 Q 86 56, 90 64" stroke="hsl(335 80% 45%)" strokeWidth="1" fill="none" opacity="0.5" />
        {/* Knot */}
        <ellipse cx="60" cy="60" rx="9" ry="12" fill={`url(#bowKnot-${uid})`} stroke="hsl(335 80% 42%)" strokeWidth="1.3" />
        <path d="M 56 54 Q 60 58, 56 64" stroke="hsl(348 100% 90%)" strokeWidth="1" fill="none" opacity="0.7" />
        {/* Tiny highlights */}
        <ellipse cx="36" cy="48" rx="3" ry="1.6" fill="white" opacity="0.7" transform="rotate(-25 36 48)" />
        <ellipse cx="84" cy="48" rx="3" ry="1.6" fill="white" opacity="0.7" transform="rotate(25 84 48)" />
        {/* Sparkle */}
        <g fill="white" opacity="0.85">
          <circle cx="60" cy="46" r="1.4" />
        </g>
      </motion.g>
    </motion.svg>
  );
};

export default HelloKitty;
