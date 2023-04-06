import React from "react";

export const LoadingSpinner = ({ size = 32 }: { size?: number }) => {
  return (
    <div className="flex items-center justify-center">
      <div
        className="inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
        role="status"
        style={{
          width: size + "px",
          height: size + "px",
        }}
      >
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Loading...
        </span>
      </div>
    </div>
  );
};
