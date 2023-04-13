import { AxiosError } from "axios";

export const PageError = ({ error }: { error: any }) => {
  return (
    <div className="m-auto flex flex-1 flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center justify-center">
        <p>Well that's interesting... 🤔🤔</p>
        <p>Looks like there seems to be just sort of a kind of error.</p>
        <p>Let me know!</p>
      </div>
      <button className="rounded-md border border-slate-200 px-4 py-2" type="button">
        Report
      </button>
    </div>
  );
};
