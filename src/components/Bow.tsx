import { motion } from "framer-motion";

const Bow = ({ size = 40, className = "" }: { size?: number; className?: string }) => {
  const uid = `bow-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <motion.svg
      width={size}
      height={size * 0.78}
      viewBox="0 0 120 94"
      className={className}
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 12 }}
      style={{ filter: "drop-shadow(0 4px 10px hsla(335,80%,60%,0.35))" }}
    >
      <defs>
        <linearGradient id={`bg-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(348 100% 90%)" />
          <stop offset="55%" stopColor="hsl(338 92% 70%)" />
          <stop offset="100%" stopColor="hsl(335 85% 50%)" />
        </linearGradient>
        <radialGradient id={`knot-${uid}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="hsl(348 100% 82%)" />
          <stop offset="100%" stopColor="hsl(335 85% 48%)" />
        </radialGradient>
      </defs>
      {/* Tails */}
      <path d="M 48 56 Q 38 80, 30 90" stroke="hsl(335 88% 62%)" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M 72 56 Q 82 80, 90 90" stroke="hsl(335 88% 62%)" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M 48 56 Q 38 80, 30 90" stroke="hsl(348 100% 86%)" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M 72 56 Q 82 80, 90 90" stroke="hsl(348 100% 86%)" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
      {/* Left loop */}
      <path
        d="M 60 46 C 36 22, 12 26, 10 48 C 8 70, 38 66, 60 54 Z"
        fill={`url(#bg-${uid})`}
        stroke="hsl(335 78% 45%)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Right loop */}
      <path
        d="M 60 46 C 84 22, 108 26, 110 48 C 112 70, 82 66, 60 54 Z"
        fill={`url(#bg-${uid})`}
        stroke="hsl(335 78% 45%)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Loop folds */}
      <path d="M 22 38 Q 32 48, 26 60" stroke="hsl(335 80% 45%)" strokeWidth="1.2" fill="none" opacity="0.55" />
      <path d="M 98 38 Q 88 48, 94 60" stroke="hsl(335 80% 45%)" strokeWidth="1.2" fill="none" opacity="0.55" />
      {/* Knot */}
      <ellipse cx="60" cy="50" rx="11" ry="14" fill={`url(#knot-${uid})`} stroke="hsl(335 80% 42%)" strokeWidth="1.4" />
      <path d="M 55 42 Q 60 50, 55 58" stroke="hsl(348 100% 92%)" strokeWidth="1.2" fill="none" opacity="0.7" />
      {/* Highlights */}
      <ellipse cx="30" cy="34" rx="4" ry="2" fill="white" opacity="0.75" transform="rotate(-25 30 34)" />
      <ellipse cx="90" cy="34" rx="4" ry="2" fill="white" opacity="0.75" transform="rotate(25 90 34)" />
      <circle cx="60" cy="36" r="1.6" fill="white" opacity="0.9" />
    </motion.svg>
  );
};

export default Bow;
