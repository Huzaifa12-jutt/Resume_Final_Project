export function Spinner({ label = 'Loading' }) { return <div className="flex items-center gap-2 text-sm text-slate-500"><span className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-950" />{label}</div>; }
export function Skeleton({ className = '' }) { return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />; }
