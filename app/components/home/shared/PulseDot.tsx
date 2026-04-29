export function PulseDot({ color = "bg-pink-400" }: { color?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-2 w-2 rounded-full ${color}`}
      style={{ animation: "pulseDot 2s ease-in-out infinite" }}
    />
  );
}