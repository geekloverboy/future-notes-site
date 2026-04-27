import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface EnvelopeFlightProps {
  message: string;
  onComplete: () => void;
}

const EnvelopeFlight = ({ message, onComplete }: EnvelopeFlightProps) => {
  const [phase, setPhase] = useState<"appear" | "open" | "fill" | "close" | "fly" | "done">("appear");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("open"), 600),
      setTimeout(() => setPhase("fill"), 1200),
      setTimeout(() => setPhase("close"), 2200),
      setTimeout(() => setPhase("fly"), 2900),
      setTimeout(() => {
        setPhase("done");
        onComplete();
      }, 4800), // Increased slightly for a more graceful exit
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Trail of hearts
  const trailHearts = Array.from({ length: 14 }, (_, i) => i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Backdrop fade */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "radial-gradient(circle at center, hsla(348,100%,91%,0.6), hsla(351,100%,86%,0.3))" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <AnimatePresence>
        {phase !== "done" && (
          <motion.div
            key="env"
            className="relative"
            initial={{ scale: 0, opacity: 0, y: 0, x: 0 }}
            animate={
              phase === "fly"
                ? {
                    scale: [1, 0.9, 0.4, 0.2, 0.1],
                    y: [0, -100, -350, -globalThis.innerHeight - 200],
                    x: [0, 100, -80, -200],
                    rotate: [0, 20, -15, -30],
                    rotateY: [0, 45, -45, 0],
                    opacity: [1, 1, 1, 0.8, 0],
                  }
                : { scale: 1, opacity: 1, y: 0, x: 0, rotate: 0, rotateY: 0 }
            }
            transition={
              phase === "fly"
                ? { 
                    duration: 1.8, 
                    ease: [0.23, 1, 0.32, 1], // Custom "swoosh" easing
                    opacity: { duration: 1.8, times: [0, 0.6, 0.8, 0.9, 1] }
                  }
                : { type: "spring", stiffness: 200, damping: 20 }
            }
          >
            {/* Glow pulse */}
            <motion.div
              className="absolute inset-0 rounded-3xl"
              style={{ boxShadow: "0 0 80px 20px hsla(340, 100%, 80%, 0.7)" }}
              animate={{ opacity: phase === "close" ? [0, 1, 0.6] : 0.3 }}
              transition={{ duration: 0.8 }}
            />

            {/* Envelope SVG */}
            <svg width="220" height="160" viewBox="0 0 220 160" className="drop-shadow-2xl">
              <defs>
                <linearGradient id="envGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(348 100% 91%)" />
                  <stop offset="100%" stopColor="hsl(345 90% 75%)" />
                </linearGradient>
                <linearGradient id="flapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(345 90% 78%)" />
                  <stop offset="100%" stopColor="hsl(335 90% 68%)" />
                </linearGradient>
              </defs>

              {/* Envelope body */}
              <rect x="10" y="40" width="200" height="110" rx="14" fill="url(#envGrad)" stroke="hsl(335 80% 60%)" strokeWidth="1.5" />

              {/* Letter inside (slides in during 'fill') */}
              <motion.g
                initial={{ y: -80, opacity: 0 }}
                animate={
                  phase === "fill" || phase === "close" || phase === "fly"
                    ? { y: 0, opacity: 1 }
                    : { y: -80, opacity: 0 }
                }
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <rect x="25" y="55" width="170" height="80" rx="6" fill="white" stroke="hsl(348 60% 88%)" strokeWidth="1" />
                <line x1="35" y1="72" x2="180" y2="72" stroke="hsl(348 60% 88%)" strokeWidth="2" strokeLinecap="round" />
                <line x1="35" y1="85" x2="170" y2="85" stroke="hsl(348 60% 88%)" strokeWidth="2" strokeLinecap="round" />
                <line x1="35" y1="98" x2="160" y2="98" stroke="hsl(348 60% 88%)" strokeWidth="2" strokeLinecap="round" />
              </motion.g>

              {/* Front flap (bottom triangle) */}
              <path d="M 10 150 L 110 100 L 210 150 Z" fill="url(#flapGrad)" opacity="0.85" />

              {/* Top flap - opens & closes */}
              <motion.path
                d="M 10 40 L 110 110 L 210 40 Z"
                fill="url(#flapGrad)"
                stroke="hsl(335 80% 60%)"
                strokeWidth="1.5"
                style={{ transformOrigin: "110px 40px" }}
                initial={{ rotateX: 0 }}
                animate={{
                  rotateX: (phase === "open" || phase === "fill") ? -170 : 0,
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />

              {/* Wax seal heart on closed envelope */}
              <motion.g
                initial={{ scale: 0 }}
                animate={{ scale: phase === "close" || phase === "fly" ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.3 }}
              >
                <circle cx="110" cy="100" r="18" fill="hsl(335 85% 65%)" stroke="white" strokeWidth="2" />
                <text x="110" y="107" textAnchor="middle" fontSize="16">💕</text>
              </motion.g>
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* With love text appearing during flight */}
      {phase === "fly" && (
        <motion.div
          className="absolute bottom-20 left-0 right-0 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: [0, 1, 1, 0], y: [20, 0, -20, -40] }}
          transition={{ duration: 1.8, times: [0, 0.2, 0.8, 1] }}
        >
          <span 
            className="text-2xl font-bold tracking-widest uppercase italic"
            style={{ 
              color: "white", 
              textShadow: "0 2px 10px rgba(255,105,180,0.5)",
              fontFamily: "'Quicksand', sans-serif"
            }}
          >
            With love... 💕
          </span>
        </motion.div>
      )}

      {/* Cosmic Trail & Heart explosion */}
      {phase === "fly" && (
        <>
          {/* Central Trail Glow */}
          <motion.div
            className="fixed inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            style={{
              background: "radial-gradient(circle at 50% 50%, hsla(335, 100%, 85%, 0.4), transparent 70%)",
            }}
          />
          
          {trailHearts.map((i) => (
            <motion.span
              key={i}
              className="absolute text-3xl select-none"
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{
                x: [
                  (Math.random() - 0.5) * 100, 
                  (Math.random() - 0.5) * 400 + (i % 2 === 0 ? 150 : -150),
                  (Math.random() - 0.5) * 800
                ],
                y: [
                  0, 
                  -200 - Math.random() * 200, 
                  -globalThis.innerHeight - 300
                ],
                opacity: [0, 1, 0.8, 0],
                scale: [0.5, 1.8, 0.5],
                rotate: [0, Math.random() * 360, Math.random() * 720],
              }}
              transition={{ 
                duration: 1.6 + Math.random() * 0.6, 
                ease: "easeOut", 
                delay: i * 0.08 // Staggered trail effect
              }}
            >
              {["💕", "✨", "💖", "🎀", "🌟", "🌸"][i % 6]}
            </motion.span>
          ))}
        </>
      )}

      {/* Hidden message preview text (a11y) */}
      <span className="sr-only">Sending letter: {message.slice(0, 60)}</span>
    </div>
  );
};

export default EnvelopeFlight;
