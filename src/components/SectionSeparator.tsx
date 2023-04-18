interface ISectionSeparator {
    number: number;
    name: string;
    checkoutStep: number;
}

export const SectionSeparator = ({ number, name, checkoutStep }: ISectionSeparator) => {
    return (
        <div className="mt-2 flex w-full flex-col items-center justify-center gap-1">
            <div className="relative flex w-full items-center justify-center bg-white">
                {/* <span
          style={{
            width: number <= checkoutStep ? "50%" : "0",
          }}
          className="absolute top-1/2 left-0 h-0.5 w-1/2 -translate-y-1/2 transform bg-slate-500 transition-all duration-300"
        /> */}
                <span
                    style={{
                        opacity: number > checkoutStep ? "0.3" : "1",
                        transitionDelay: number !== checkoutStep ? "150ms" : "0s",
                    }}
                    className="relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border bg-white text-lg font-bold transition-all sm:h-10 sm:w-10 "
                >
                    {number}
                </span>
                {/* <span
          style={{
            width: number <= checkoutStep ? "50%" : "0",
          }}
          className="absolute top-1/2 right-0 h-0.5 w-0 -translate-y-1/2 transform bg-slate-500 transition-all duration-300"
        /> */}
                <span
                    style={{
                        width: number <= checkoutStep ? "100%" : "0",
                    }}
                    className="absolute top-1/2 right-0 left-0 h-0.5 w-0 -translate-y-1/2 transform bg-slate-400 opacity-100 transition-all duration-300"
                />
            </div>
            <div
                style={{
                    opacity: number > checkoutStep ? "0.3" : "1",
                    transitionDelay: number !== checkoutStep ? "150ms" : "0s",
                }}
                className="text-xs font-bold capitalize transition-all sm:text-sm"
            >
                {name}
            </div>
        </div>
    );
};
