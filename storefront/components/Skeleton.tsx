export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-sericia-paper-card ${className}`} aria-hidden />;
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-sericia-paper p-10">
      <Skeleton className="aspect-[4/5] mb-6" />
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-5 w-2/3 mb-3" />
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-4/5 mb-6" />
      <div className="flex items-center justify-between pt-4 border-t border-sericia-line">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-10" />
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid md:grid-cols-12 gap-12 md:gap-20">
      <div className="md:col-span-7">
        <Skeleton className="aspect-[4/5] w-full" />
      </div>
      <div className="md:col-span-5 space-y-6">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  );
}
