import Link from "next/link";
import { IoArrowBackSharp } from "react-icons/io5";

export const OrderDataSkeleton = () => {
    return (
        <div className="mx-auto mb-2 mt-4 flex w-full max-w-screen-sm flex-1 flex-col gap-2">
            <div className="flex items-center justify-between px-2">
                <Link className="rounded-lg p-2 shadow" href="/my_orders">
                    <IoArrowBackSharp size="28" />
                </Link>
                <div className="h-[28px] w-36 animate-pulse bg-gray-800"></div>
            </div>
            <div className="mb-10 mt-4 flex flex-col gap-4 px-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="h-5 w-32 animate-pulse bg-gray-800"></div>
                    <div className="h-5 w-24 animate-pulse bg-gray-800"></div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="h-5 w-32 animate-pulse bg-gray-800"></div>
                    <div className="h-5 w-36 animate-pulse bg-gray-800"></div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="h-[38px] w-full animate-pulse bg-gray-800"></div>
                    <div className="h-[38px] w-full animate-pulse bg-gray-800"></div>
                    <div className="h-[38px] w-full animate-pulse bg-gray-800"></div>
                    <div className="h-[38px] w-full animate-pulse bg-gray-800"></div>
                </div>
            </div>
            <div className="flex w-full  flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="mt-auto  h-10 w-full animate-pulse rounded-lg bg-gray-800 p-2 text-center font-bold uppercase shadow disabled:opacity-30 xs:w-32 sm:m-0 sm:w-auto sm:min-w-[120px]"></div>
                <div className="mt-auto  h-10 w-full animate-pulse rounded-lg bg-gray-800 p-2 text-center font-bold uppercase shadow disabled:opacity-30 xs:w-32 sm:m-0 sm:w-auto sm:min-w-[120px]"></div>
            </div>
        </div>
    );
};
