import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, Heart, Sparkles, Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import KittyPattern from "@/components/KittyPattern";

const DEFAULT_PIN_LENGTH = 5; // Updated for "Karan"

const SecretLock = () => {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus when opened
  useEffect(() => {
    if (open && !revealed) {
      const t = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
  }, [open, revealed]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!password.trim() || loading) return;
    setLoading(true);
    setError(false);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("verify-secret", {
        body: { password },
      });
      if (fnErr || !data?.success) {
        setError(true);
        setTimeout(() => setError(false), 800);
        setPassword("");
        inputRef.current?.focus();
      } else {
        // Add a small delay for a "processing" feel before revealing
        setTimeout(() => setRevealed(data.message), 400);
      }
    } catch {
      setError(true);
      setTimeout(() => setError(false), 700);
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setOpen(false);
    setTimeout(() => {
      setRevealed(null);
      setPassword("");
      setError(false);
      setCopied(false);
    }, 350);
  };

  const copyMessage = async () => {
    if (!revealed) return;
    try {
      await navigator.clipboard.writeText(revealed);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  // Helper for dot styles to reduce complexity
  const getDotStyle = (index: number) => {
    const filled = index < password.length;
    const isCurrent = index === password.length - 1 && filled;
    
    let backgroundColor = "hsl(350 60% 88%)";
    if (error) {
      backgroundColor = "hsl(0 80% 65%)";
    } else if (filled) {
      backgroundColor = "hsl(335 80% 60%)";
    }

    return {
      scale: isCurrent ? [1, 1.4, 1] : filled ? 1 : 0.7,
      backgroundColor,
      boxShadow: isCurrent 
        ? "0 0 12px hsla(335, 80%, 60%, 0.6)" 
        : "none"
    };
  };

  // Render dots (dynamic)
  const dots = Array.from({ length: Math.max(DEFAULT_PIN_LENGTH, password.length) }).map((_, i) => {
    const filled = i < password.length;
    const isCurrent = i === password.length - 1 && filled;

    return (
      <motion.div
        key={`dot-${i}`}
        className="rounded-full relative"
        animate={getDotStyle(i)}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 18,
          scale: { duration: 0.2 }
        }}
        style={{ width: 12, height: 12 }}
      >
        {isCurrent && (
          <motion.div
            className="absolute inset-0 rounded-full bg-white/40"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </motion.div>
    );
  });

  // Handle auto-submit (optional, but keep for UX if it's 5 digits)
  useEffect(() => {
    if (password.length === DEFAULT_PIN_LENGTH && !loading && !revealed) {
      submit();
    }
  }, [password, loading, revealed]);

  return (
    <>
      {/* Floating lock button */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-5 z-30 w-14 h-14 rounded-full flex items-center justify-center text-white"
        style={{
          background: "var(--gradient-button)",
          boxShadow:
            "0 8px 24px -4px hsla(335, 90%, 50%, 0.6), 0 0 0 1px hsla(0,0%,100%,0.3) inset",
        }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1, type: "spring", stiffness: 200, damping: 15 }}
        whileHover={{ scale: 1.1, rotate: 8 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Open secret message"
      >
        <Lock size={20} strokeWidth={2.5} />
        <motion.span
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
          style={{ background: "hsl(345 100% 88%)" }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ background: "hsla(335, 60%, 8%, 0.72)", backdropFilter: "blur(14px)" }}
            onClick={close}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="relative w-full max-w-sm"
              initial={{ scale: 0.85, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Floating badge */}
              <motion.div
                className="absolute -top-7 left-1/2 -translate-x-1/2 z-10 w-[68px] h-[68px] rounded-full flex items-center justify-center"
                style={{
                  background: "var(--gradient-button)",
                  boxShadow:
                    "0 12px 32px -6px hsla(335, 90%, 50%, 0.7), 0 0 0 4px hsla(0,0%,100%,0.95)",
                }}
                animate={
                  revealed
                    ? { rotate: 0, scale: [1, 1.12, 1] }
                    : error
                      ? { x: [0, -8, 8, -6, 6, 0] }
                      : { rotate: [0, -6, 6, 0] }
                }
                transition={
                  revealed
                    ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
                    : error
                      ? { duration: 0.5 }
                      : { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }
              >
                <AnimatePresence mode="wait">
                  {revealed ? (
                    <motion.div
                      key="heart"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 16 }}
                    >
                      <Heart className="text-white" size={28} fill="currentColor" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="lock"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: "spring", stiffness: 260, damping: 16 }}
                    >
                      <Lock className="text-white" size={26} strokeWidth={2.5} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <div
                className="relative rounded-[28px] pt-14 pb-7 px-7 overflow-hidden"
                style={{
                  background:
                    "linear-gradient(160deg, hsla(0,0%,100%,0.98) 0%, hsla(350,100%,98%,0.98) 100%)",
                  boxShadow:
                    "0 30px 80px -20px hsla(335, 90%, 30%, 0.6), 0 0 0 1px hsla(0,0%,100%,0.5) inset",
                }}
              >
                {/* Soft kitty pattern background */}
                <KittyPattern opacity={0.06} tile={52} rounded={28} />

                <button
                  onClick={close}
                  className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-candy transition-colors"
                  style={{ boxShadow: "0 4px 12px -2px hsla(335, 60%, 50%, 0.2)" }}
                  aria-label="Close"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>

                <div className="relative z-10">
                  <AnimatePresence mode="wait">
                    {revealed ? (
                      <motion.div
                        key="reveal-stage"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.4 }}
                        className="text-center"
                      >
                          <motion.div 
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-[10px] font-bold text-pink-600 uppercase tracking-widest mb-4"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                          >
                            <Sparkles size={10} />
                            Revealed
                          </motion.div>

                        <motion.div
                          className="relative px-3 py-5 rounded-2xl mb-4"
                          style={{
                            background: "linear-gradient(160deg, hsl(350 100% 98%), hsl(345 100% 95%))",
                            border: "1.5px dashed hsl(345 90% 80%)",
                          }}
                          initial={{ scale: 0.96, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.25, type: "spring", stiffness: 180, damping: 18 }}
                        >
                          <motion.p
                            className="text-base font-display text-foreground leading-relaxed"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45, duration: 0.7 }}
                          >
                            {revealed}
                          </motion.p>
                        </motion.div>

                        <motion.div
                          className="flex items-center justify-center gap-2"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 }}
                        >
                          <button
                            onClick={copyMessage}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-candy bg-white/80 hover:bg-white transition-colors"
                            style={{ border: "1px solid hsl(350 80% 90%)" }}
                          >
                            <AnimatePresence mode="wait">
                              {copied ? (
                                <motion.span
                                  key="copied"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  className="flex items-center gap-1.5"
                                >
                                  <Check size={13} strokeWidth={3} />
                                </motion.span>
                              ) : (
                                <motion.span
                                  key="copy"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  className="flex items-center gap-1.5"
                                >
                                  <Copy size={13} />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </button>
                          <button
                            onClick={close}
                            className="px-4 py-2 rounded-full text-xs font-bold text-white candy-button"
                          >
                            <Heart size={16} fill="white" />
                          </button>
                        </motion.div>

                        {/* Floating sparkle confetti */}
                        <div className="pointer-events-none absolute inset-0 overflow-hidden">
                          {new Array(8).fill(null).map((_, i) => {
                            const getEmoji = () => {
                              if (i % 3 === 0) return "✨";
                              if (i % 3 === 1) return "💕";
                              return "🎀";
                            };
                            
                            return (
                              <motion.span
                                key={`confetti-${i}`}
                                className="absolute text-base"
                                style={{
                                  left: `${10 + i * 11}%`,
                                  top: "60%",
                                }}
                                initial={{ y: 0, opacity: 0, scale: 0.4 }}
                                animate={{
                                  y: [-10, -90 - i * 8],
                                  opacity: [0, 1, 0],
                                  scale: [0.4, 1, 0.6],
                                  rotate: [0, 180],
                                }}
                                transition={{
                                  duration: 2.4,
                                  delay: 0.4 + i * 0.08,
                                  repeat: Infinity,
                                  repeatDelay: 1.6,
                                }}
                              >
                                {getEmoji()}
                              </motion.span>
                            );
                          })}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="lock-stage"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="text-center mb-6">
                          <h2 
                            className="text-2xl font-extrabold mb-1.5"
                            style={{ color: "hsl(335 80% 45%)", fontFamily: "'Quicksand', sans-serif" }}
                          >
                            Secret Message
                          </h2>
                          <p className="text-[13px] text-pink-600/70 font-medium leading-relaxed">
                            Enter the secret word to reveal<br/>your hidden note 🎀
                          </p>
                        </div>

                        {/* PIN dots indicator */}
                        <div className="flex items-center justify-center gap-2.5 mb-4 h-3">
                          {dots}
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                          <input
                            ref={inputRef}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value.slice(0, 32))}
                            className={`w-full text-center text-lg tracking-[0.4em] py-3.5 outline-none transition-all duration-500 font-semibold ${error ? "animate-shake" : ""}`}
                            style={{
                              background: "rgba(255, 255, 255, 0.6)",
                              backdropFilter: "blur(4px)",
                              border: `1.5px solid ${error ? "hsl(0 80% 70%)" : "hsl(350 80% 92%)"}`,
                              borderRadius: 16,
                              color: "hsl(335 80% 45%)",
                              boxShadow: "inset 0 2px 8px hsla(335, 20%, 30%, 0.05)",
                            }}
                            placeholder="••••••"
                            autoComplete="off"
                            onFocus={(e) => {
                              if (error) return;
                              e.currentTarget.style.borderColor = "hsl(335 80% 70%)";
                              e.currentTarget.style.boxShadow = "0 0 0 4px hsla(340, 100%, 80%, 0.25), inset 0 2px 8px hsla(335, 20%, 30%, 0.05)";
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = "hsl(350 80% 92%)";
                              e.currentTarget.style.boxShadow = "inset 0 2px 8px hsla(335, 20%, 30%, 0.05)";
                            }}
                          />
                          <AnimatePresence>
                            {error && (
                              <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-center text-destructive text-sm font-semibold"
                              >
                                💔
                              </motion.p>
                            )}
                          </AnimatePresence>
                          <button
                            type="submit"
                            disabled={loading || !password.trim()}
                            className="candy-button w-full py-3.5 rounded-full text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {loading ? (
                              <motion.div
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                              />
                            ) : (
                              <Sparkles size={20} />
                            )}
                          </button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SecretLock;
