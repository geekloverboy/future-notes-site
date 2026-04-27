import React from "react";
import { motion } from "framer-motion";
import HelloKitty from "./HelloKitty";

interface KittyFrameProps {
  children: React.ReactNode;
}

// 🌸 Flower with floating animation
const Flower = ({ color, size = 24, className = "" }: { color: string; size?: number; className?: string }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    style={{ willChange: "transform" }}
    animate={{ y: [0, -6, 0], rotate: [-2, 2, -2] }}
    transition={{ duration: 4 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
  >
    <g fill={color} stroke="black" strokeWidth="1">
      <circle cx="12" cy="7" r="4" />
      <circle cx="17" cy="12" r="4" />
      <circle cx="12" cy="17" r="4" />
      <circle cx="7" cy="12" r="4" />
    </g>
    <circle cx="12" cy="12" r="3" fill="yellow" stroke="black" strokeWidth="1" />
  </motion.svg>
);

// ❤️ Heart with floating + fade
const Heart = ({ className = "" }: { className?: string }) => (
  <motion.svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="red"
    className={className}
    stroke="black"
    strokeWidth="1"
    style={{ willChange: "transform, opacity" }}
    animate={{
      y: [0, -12, 0],
      scale: [1, 1.3, 1],
      opacity: [0.8, 1, 0.8],
    }}
    transition={{
      duration: 3 + Math.random(),
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </motion.svg>
);

const KittyFrame = ({ children }: KittyFrameProps) => {
  return (
    <div
      className="relative mx-auto w-full max-w-[420px] h-[680px] max-h-[85vh] md:max-h-none rounded-[40px] overflow-hidden border-[1px] border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
      style={{
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.04))",
        backdropFilter: "blur(30px) saturate(160%)",
        WebkitBackdropFilter: "blur(30px) saturate(160%)",
        boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.2), 0 25px 45px rgba(0, 0, 0, 0.2)",
      }}
    >
      {/* ✨ Glossy Sheen Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(125deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.05) 100%)",
        }}
      />
      
      {/* ✨ Soft pink texture/grain overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.4) 10%, transparent 20%) 0 0 / 24px 24px",
        }}
      />
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, hsla(348, 100%, 91%, 0.3), hsla(335, 90%, 75%, 0.1))",
        }}
      />

      <div className="absolute top-8 left-0 right-0 text-center z-10">
        <h2 
          className="text-[22px] font-black tracking-tight"
          style={{ 
            color: "hsl(335 80% 45%)", 
            textShadow: "0 2px 4px rgba(255,255,255,0.8)",
            fontFamily: "'Quicksand', sans-serif"
          }}
        >
          Future Letter 🎀
        </h2>
      </div>

      {/* 🌸 Floating flowers (moved to corners to avoid covering text) */}
      <Flower color="red" className="absolute top-4 left-6" size={28} />
      <Flower color="white" className="absolute top-6 left-16" size={22} />
      <Flower color="white" className="absolute top-4 right-16" size={24} />
      <Flower color="red" className="absolute top-7 right-6" size={20} />

      {/* 🐱 Top Kitty (parallax feel) */}
      <motion.div
        className="absolute top-[2%] -right-[6%]"
        style={{ willChange: "transform" }}
        animate={{ y: [0, -5, 0], rotate: [8, 12, 8] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        <HelloKitty size={110} />
      </motion.div>

      {/* 📦 Main content */}
      <motion.div
        className="absolute top-[12%] bottom-[6%] left-[4%] right-[4%] bg-white/40 backdrop-blur-xl rounded-2xl border-[1px] border-white/50 overflow-hidden flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"
        style={{ willChange: "transform, opacity" }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>

      {/* 🌸 Side flowers */}
      <Flower color="white" className="absolute top-[45%] -right-2" size={22} />
      <Flower color="white" className="absolute top-[55%] -right-1" size={22} />

      {/* 🐱 Bottom Kitty (bouncy) */}
      <motion.div
        className="absolute -bottom-6 -left-10"
        style={{ willChange: "transform" }}
        animate={{ y: [0, -10, 0], rotate: [-6, -2, -6] }}
        transition={{ duration: 3.5, repeat: Infinity }}
      >
        <HelloKitty size={140} />
      </motion.div>

      {/* ❤️ Floating hearts */}
      <Heart className="absolute bottom-[35%] left-3" />
      <Heart className="absolute bottom-[42%] left-6" />
      <Heart className="absolute bottom-[48%] left-2" />

      {/* ✨ subtle glow pulse */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(circle, #fff5f8, transparent)", willChange: "opacity" }}
        animate={{ opacity: [0.1, 0.25, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </div>
  );
};

export default KittyFrame;
