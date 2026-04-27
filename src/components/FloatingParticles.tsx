import { useEffect, useState } from "react";

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
  emoji: string;
  layer: number;
}

const EMOJIS = ["💕", "💖", "✨", "🎀", "💗", "💞", "🌸", "💝"];

const FloatingParticles = ({ count = 18 }: { count?: number }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const arr: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 15,
      duration: 12 + Math.random() * 16,
      size: 14 + Math.random() * 22,
      drift: -60 + Math.random() * 120,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      layer: Math.random(),
    }));
    setParticles(arr);
  }, [count]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute select-none"
          style={{
            left: `${p.left}%`,
            bottom: "-40px",
            fontSize: `${p.size}px`,
            opacity: 0.35 + p.layer * 0.55,
            filter: `blur(${(1 - p.layer) * 1.5}px)`,
            animation: `float-up ${p.duration}s linear ${p.delay}s infinite`,
            // @ts-expect-error CSS var
            "--drift": `${p.drift}px`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
};

export default FloatingParticles;
