export const AllOrdersSkeleton = () => {
    return (
        <div className="mt-2 flex w-full flex-col items-start gap-2 p-4 shadow-md">
            <div className="flex w-full items-center justify-between gap-4">
                <div className="relative  h-6 w-24 animate-pulse bg-slate-200"></div>
                <div className="h-6 w-24 animate-pulse  bg-slate-200"></div>
            </div>
            <div className="flex w-full items-center justify-between gap-2">
                <div className="h-5 w-36 animate-pulse bg-slate-200"></div>
                <div className="h-5 w-24 animate-pulse  bg-slate-200"></div>
            </div>
        </div>
    );
};
