import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { Mail, Calendar as CalendarIcon, Send } from "lucide-react";
import { format, addDays } from "date-fns";
import KittyBackground from "@/components/KittyBackground";
import EnvelopeFlight from "@/components/EnvelopeFlight";
import SecretLock from "@/components/SecretLock";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import KittyFrame from "@/components/KittyFrame";


const MOODS = [
  { key: "happy", emoji: "😊", label: "Happy" },
  { key: "sad", emoji: "💔", label: "Sad" },
  { key: "love", emoji: "💕", label: "In love" },
];

type Stage = "form" | "flying" | "success";

const Index = () => {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState(format(addDays(new Date(), 30), "yyyy-MM-dd"));
  const [mood, setMood] = useState<string>("love");
  const [stage, setStage] = useState<Stage>("form");
  const [submitting, setSubmitting] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);


  const minDate = useMemo(() => format(addDays(new Date(), 1), "yyyy-MM-dd"), []);

  const handleType = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (taRef.current) {
      taRef.current.style.height = "auto";
      taRef.current.style.height = Math.min(taRef.current.scrollHeight, 320) + "px";
    }
  };

  const validate = () => {
    if (message.trim().length < 5) {
      toast.error("Write at least a few words 💭");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Enter a valid email 💌");
      return false;
    }
    const d = new Date(date);
    if (Number.isNaN(d.getTime()) || d <= new Date()) {
      toast.error("Pick a future date ✨");
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validate() || submitting) return;
    setSubmitting(true);
    try {
      const deliverAt = new Date(date);
      deliverAt.setHours(9, 0, 0, 0);
      const { error } = await supabase.from("letters").insert({
        email: email.trim().toLowerCase(),
        message: message.trim(),
        mood,
        deliver_at: deliverAt.toISOString(),
      });
      if (error) throw error;

      // Send confirmation email via Resend edge function
      await supabase.functions.invoke("send-confirmation", {
        body: {
          email: email.trim().toLowerCase(),
          deliverAt: format(deliverAt, "MMMM d, yyyy")
        }
      });

      setStage("flying");
    } catch (err) {
      console.error(err);
      toast.error("Couldn't send. Try again 💕");
      setSubmitting(false);
    }
  };

  const onFlightDone = () => {
    setStage("success");
    setSubmitting(false);
  };

  const reset = () => {
    setMessage("");
    setEmail("");
    setMood("love");
    setDate(format(addDays(new Date(), 30), "yyyy-MM-dd"));
    setStage("form");
  };



  return (
    <main className="relative min-h-[100dvh] w-full overflow-x-hidden">
      <KittyBackground />
      <SecretLock />

      <AnimatePresence mode="wait">
        {stage === "form" && (
          <motion.div
            key="form"
            className="relative z-10 mx-auto w-full max-w-md px-5 pt-8 pb-32"
            style={{ willChange: "transform, opacity" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8 px-4">
              <motion.h1 
                className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3"
                style={{ 
                  color: "white", 
                  fontFamily: "'Quicksand', sans-serif",
                  textShadow: "0 2px 10px rgba(255, 105, 180, 0.5), 0 0 40px rgba(255, 105, 180, 0.3)"
                }}
              >
                Letters to the Future
              </motion.h1>
              <motion.p 
                className="text-lg font-medium"
                style={{ 
                  color: "hsla(340, 100%, 94%, 0.9)",
                  textShadow: "0 1px 4px rgba(0,0,0,0.1)"
                }}
              >
                Capture a moment, seal it with love ✨
              </motion.p>
            </div>

            <KittyFrame>
              <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5">
                {/* Letter section */}
                <div className="relative">
                  <div className="flex items-baseline justify-between mb-1.5 px-1">
                    <label 
                      htmlFor="msg" 
                      className="text-[13px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                      style={{ color: "hsl(335 80% 45%)" }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                      Your Message
                    </label>
                    <span 
                      className="text-[11px] font-bold tabular-nums px-2 py-0.5 rounded-full"
                      style={{ background: "hsla(335, 80%, 90%, 0.5)", color: "hsl(335 80% 45%)" }}
                    >
                      {message.length}
                    </span>
                  </div>
                  <textarea
                    id="msg"
                    ref={taRef}
                    value={message}
                    onChange={handleType}
                    placeholder="What do you want to remember?"
                    rows={4}
                    className="w-full resize-none text-[16px] leading-relaxed outline-none transition-all duration-300 px-4 py-3 min-h-[120px] placeholder:text-pink-900/50"
                    style={{
                      background: "rgba(255, 255, 255, 0.7)",
                      border: "1px solid hsla(335, 80%, 85%, 0.5)",
                      borderRadius: 20,
                      fontFamily: "'Quicksand', sans-serif",
                      color: "hsl(340 50% 15%)", // Very dark readable magenta
                      boxShadow: "inset 0 2px 4px rgba(0,0,0,0.03)",
                    }}
                  />
                </div>

                {/* Email row */}
                <div className="relative">
                  <label 
                    htmlFor="email" 
                    className="text-[13px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 px-1"
                    style={{ color: "hsl(335 80% 45%)" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                    Where to send?
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "hsl(335 80% 45%)" }} />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full pl-11 pr-4 py-3.5 text-[16px] font-semibold outline-none transition-all duration-300 placeholder:text-pink-900/50"
                      style={{
                        background: "rgba(255, 255, 255, 0.7)",
                        border: "1px solid hsla(335, 80%, 85%, 0.5)",
                        borderRadius: 16,
                        color: "hsl(340 50% 15%)",
                        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.03)",
                      }}
                    />
                  </div>
                </div>

                {/* Date row */}
                <div className="relative">
                  <label 
                    htmlFor="date" 
                    className="text-[13px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 px-1"
                    style={{ color: "hsl(335 80% 45%)" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                    When to deliver?
                  </label>
                  <div className="relative">
                    <CalendarIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "hsl(335 80% 45%)" }} />
                    <input
                      id="date"
                      type="date"
                      value={date}
                      min={minDate}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 text-[16px] font-semibold outline-none transition-all duration-300"
                      style={{
                        background: "rgba(255, 255, 255, 0.7)",
                        border: "1px solid hsla(335, 80%, 85%, 0.5)",
                        borderRadius: 16,
                        color: "hsl(340 50% 15%)",
                        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.03)",
                      }}
                    />
                  </div>
                </div>

                {/* Mood */}
                <div className="relative">
                  <label 
                    className="text-[13px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 px-1"
                    style={{ color: "hsl(335 80% 45%)" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                    Current Mood
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {MOODS.map((m) => {
                      const active = mood === m.key;
                      return (
                        <motion.button
                          key={m.key}
                          onClick={() => setMood(m.key)}
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.94 }}
                          className="rounded-2xl py-3 px-1 text-center transition-all duration-300 relative shadow-sm"
                          style={{
                            background: active
                              ? "linear-gradient(160deg, hsla(345, 100%, 92%, 0.9) 0%, hsla(340, 90%, 85%, 0.9) 100%)"
                              : "rgba(255, 255, 255, 0.5)",
                            border: active ? "2px solid hsl(335 80% 60%)" : "1px solid hsla(335, 80%, 85%, 0.3)",
                          }}
                          type="button"
                        >
                          <div className="text-2xl leading-none mb-1">{m.emoji}</div>
                          <div 
                            className="text-[11px] font-bold uppercase tracking-tighter"
                            style={{ color: active ? "hsl(335 80% 35%)" : "hsl(335 40% 50%)" }}
                          >
                            {m.label}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </KittyFrame>
          </motion.div>
        )}

        {stage === "flying" && <EnvelopeFlight key="flight" message={message} onComplete={onFlightDone} />}

        {stage === "success" && (
          <motion.div
            key="success"
            className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="text-7xl mb-6"
              animate={{ y: [0, -16, 0], rotate: [-6, 6, -6] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              💌
            </motion.div>
            <motion.h2 
              className="text-4xl font-extrabold mb-2"
              style={{ 
                color: "white", 
                textShadow: "0 2px 15px rgba(255,105,180,0.6)" 
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Letter Sealed!
            </motion.h2>
            <motion.p 
              className="text-lg mb-10 max-w-[280px] leading-relaxed font-medium"
              style={{ color: "hsla(340, 100%, 94%, 0.9)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Your future self will be so happy to hear from you. ✨
            </motion.p>
            <motion.button
              onClick={reset}
              className="candy-button px-8 py-3.5 rounded-full text-base"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Send size={20} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky bottom CTA */}
      {stage === "form" && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-20 px-5 pb-5 pt-6 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, hsla(335, 60%, 12%, 0.9) 20%, hsla(335, 60%, 12%, 0))",
          }}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="mx-auto max-w-md pointer-events-auto">
            <div className="relative w-full h-[64px]">
              {/* Hardware-accelerated animated glow */}
              <motion.div
                className="absolute inset-0 rounded-full bg-candy"
                style={{ filter: "blur(16px)", willChange: "opacity" }}
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.button
                onClick={submit}
                disabled={submitting}
                className="candy-button absolute inset-0 w-full rounded-full text-lg font-bold flex items-center justify-center gap-3 disabled:opacity-60 overflow-hidden"
                style={{
                  textShadow: "0 1px 4px rgba(0,0,0,0.2)"
                }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                {submitting ? "..." : <Send size={20} strokeWidth={3} />}

                {/* Magic sweep animation */}
                <motion.span
                  aria-hidden
                  className="absolute inset-y-0 w-1/3"
                  style={{ background: "linear-gradient(90deg, transparent, hsla(0,0%,100%,0.5), transparent)", willChange: "transform" }}
                  animate={{ x: ["-100%", "350%"] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6 }}
                />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 🌌 Full-screen Cosmic Seal Burst */}
      <AnimatePresence>
        {submitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 4], opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="w-40 h-40 rounded-full"
              style={{
                background: "radial-gradient(circle, white, hsla(335, 100%, 80%, 0.8), transparent 70%)",
                boxShadow: "0 0 100px 50px hsla(335, 100%, 85%, 0.4)",
              }}
            />
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={`burst-p-${i}`}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{
                  x: (Math.random() - 0.5) * window.innerWidth,
                  y: (Math.random() - 0.5) * window.innerHeight,
                  opacity: [0, 1, 0],
                  scale: [0, Math.random() * 2, 0],
                }}
                transition={{ duration: 1 + Math.random(), delay: Math.random() * 0.2 }}
                className="absolute text-2xl"
              >
                {["✨", "💕", "💖", "⭐"][i % 4]}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Index;
