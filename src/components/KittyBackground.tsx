import ParticleCanvas from "./ParticleCanvas";
import NebulaBackground from "./NebulaBackground";

const KittyBackground = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden z-0"
    >
      {/* Procedural WebGL Nebula Background */}
      <NebulaBackground />

      {/* Soft pink overlay to keep card readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, hsla(335, 70%, 30%, 0.15) 0%, hsla(335, 80%, 18%, 0.45) 100%)",
        }}
      />

      <ParticleCanvas />

      {/* Subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, hsla(335, 90%, 12%, 0.45) 100%)",
        }}
      />
    </div>
  );
};

export default KittyBackground;
