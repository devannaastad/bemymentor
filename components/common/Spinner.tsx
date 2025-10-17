// components/common/Spinner.tsx
export default function Spinner({
  size = 20,
  stroke = 2,
}: { size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="animate-spin text-white/70"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        opacity="0.25"
      />
      <path
        d={`M ${size / 2} ${stroke / 2} A ${r} ${r} 0 1 1 ${size / 2 - 0.01} ${
          stroke / 2
        }`}
        stroke="currentColor"
        strokeWidth={stroke}
        fill="none"
      />
    </svg>
  );
}
