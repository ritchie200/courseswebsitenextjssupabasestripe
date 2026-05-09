export function ProgressBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="grid gap-2">
      <div className="h-2.5 overflow-hidden rounded-full bg-[#e7e0d5]">
        <div
          className="h-full rounded-full bg-[#137c70]"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="text-xs font-bold text-[#5f6864]">{clamped}% complete</span>
    </div>
  );
}
