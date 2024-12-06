export function PoolsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-[68px] rounded-lg bg-gradient-to-r from-zinc-900 to-zinc-800 animate-pulse"
        />
      ))}
    </div>
  )
}

