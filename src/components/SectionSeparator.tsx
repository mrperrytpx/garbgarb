interface ISectionSeparator {
  number: number;
  name: string;
  checkoutStep: number;
}

export const SectionSeparator = ({ number, name, checkoutStep }: ISectionSeparator) => {
  return (
    <div
      style={{
        opacity: number > checkoutStep ? "0.3" : "1",
      }}
      className="mt-2 flex w-full flex-col items-center justify-center gap-1 transition-all"
    >
      <div className="relative flex w-full items-center justify-center">
        <span
          style={{
            width: number <= checkoutStep ? "50%" : "0",
          }}
          className="absolute top-1/2 left-0 h-0.5 w-1/2 -translate-y-1/2 transform bg-slate-500 transition-all duration-300"
        />
        <span className="relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border bg-white text-lg font-bold sm:h-10 sm:w-10 ">
          {number}
        </span>
        <span
          style={{
            width: number <= checkoutStep ? "50%" : "0",
          }}
          className="absolute top-1/2 right-0 h-0.5 w-0 -translate-y-1/2 transform bg-slate-500 transition-all duration-300"
        />
      </div>
      <div className="text-xs font-bold capitalize sm:text-sm">{name}</div>
    </div>
  );
};
