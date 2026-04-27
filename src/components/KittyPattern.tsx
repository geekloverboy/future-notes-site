/**
 * Tiny Hello Kitty silhouette tile used as a soft repeating background pattern.
 * Pure SVG, no animation — kept ultra-simple for visual rhythm at small sizes.
 */
interface Props {
  className?: string;
  /** Base color used for the kitty silhouette (CSS color, supports alpha). */
  color?: string;
  /** Bow accent color. */
  bowColor?: string;
  /** Tile size in px (controls density). */
  tile?: number;
  /** Overall opacity of the pattern layer. */
  opacity?: number;
  /** Optional rounded corners to clip the pattern. */
  rounded?: number;
}

const KittyPattern = ({
  className = "",
  color = "hsl(335 80% 70%)",
  bowColor = "hsl(345 90% 75%)",
  tile = 56,
  opacity = 0.12,
  rounded = 32,
}: Props) => {
  const id = "kitty-tile";
  return (
    <svg
      aria-hidden
      className={`pointer-events-none absolute inset-0 w-full h-full ${className}`}
      style={{ opacity, borderRadius: rounded }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id={id} x="0" y="0" width={tile} height={tile} patternUnits="userSpaceOnUse">
          {/* Kitty face */}
          <g transform={`translate(${tile / 2}, ${tile / 2 + 2})`}>
            {/* ears */}
            <path
              d="M-13,-9 L-17,-17 L-7,-13 Z M13,-9 L17,-17 L7,-13 Z"
              fill={color}
            />
            {/* head */}
            <ellipse cx="0" cy="0" rx="14" ry="12" fill={color} />
            {/* eyes */}
            <circle cx="-5" cy="0" r="1.4" fill="white" />
            <circle cx="5" cy="0" r="1.4" fill="white" />
            {/* nose */}
            <ellipse cx="0" cy="3.5" rx="1.6" ry="1" fill="white" />
            {/* whiskers */}
            <line x1="-7" y1="3" x2="-13" y2="2" stroke="white" strokeWidth="0.6" strokeLinecap="round" />
            <line x1="-7" y1="5" x2="-13" y2="6" stroke="white" strokeWidth="0.6" strokeLinecap="round" />
            <line x1="7" y1="3" x2="13" y2="2" stroke="white" strokeWidth="0.6" strokeLinecap="round" />
            <line x1="7" y1="5" x2="13" y2="6" stroke="white" strokeWidth="0.6" strokeLinecap="round" />
            {/* bow */}
            <g transform="translate(8, -8)">
              <path d="M0,0 L-4,-3 L-4,3 Z" fill={bowColor} />
              <path d="M0,0 L4,-3 L4,3 Z" fill={bowColor} />
              <circle cx="0" cy="0" r="1.4" fill={bowColor} />
            </g>
          </g>

          {/* offset second kitty for staggered tile */}
          <g transform={`translate(${tile}, ${tile}) translate(-${tile / 2 + 2}, -${tile / 2 - 4})`}>
            <ellipse cx="0" cy="0" rx="9" ry="7.5" fill={color} opacity="0.7" />
            <path d="M-8,-5 L-11,-11 L-4,-8 Z M8,-5 L11,-11 L4,-8 Z" fill={color} opacity="0.7" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
};

export default KittyPattern;
