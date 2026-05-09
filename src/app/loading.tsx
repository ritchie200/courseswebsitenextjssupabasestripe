export default function Loading() {
  return (
    <div className="shell page-section">
      <div className="surface grid gap-4 p-6">
        <div className="h-6 w-48 animate-pulse rounded bg-[#e7e0d5]" />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-[#e7e0d5]" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-[#e7e0d5]" />
      </div>
    </div>
  );
}
