interface ISectionSeparator {
  number: string | number;
  name: string;
}

export const SectionSeparator = ({ number, name }: ISectionSeparator) => {
  return (
    <div className="mt-2 flex flex-col items-center justify-center gap-0.5">
      <div className="relative flex w-full items-center justify-center">
        <span className="absolute top-1/2 left-0 h-0.5 w-1/2 -translate-y-1/2 transform bg-slate-500"></span>
        <span className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white text-lg font-bold ">
          {number}
        </span>
        <span className="absolute top-1/2 right-0 h-0.5 w-1/2 -translate-y-1/2 transform bg-slate-500"></span>
      </div>
      <div className="text-sm font-bold capitalize">{name}</div>
    </div>
  );
};
