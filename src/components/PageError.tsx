import { AxiosError } from "axios";

export const PageError = ({ error }: { error: any }) => {
    return (
        <div className="m-auto flex flex-1 flex-col items-center justify-center gap-4 p-4 text-gray-200">
            <div className="flex flex-col items-center justify-center text-center">
                <p>Well that's interesting... 🤔🤔</p>
                <p>Looks like is appears there seems to be just sort of a kind of error.</p>
                <p>Let me know!</p>
            </div>
            <button
                className="rounded-md border border-slate-500 px-4 py-2 font-semibold shadow-sm shadow-slate-500 hover:bg-slate-200 hover:text-black focus:bg-slate-200 focus:text-black"
                type="button"
            >
                Report
            </button>
        </div>
    );
};
