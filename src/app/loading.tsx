import React from "react";

export default function Loader() {
  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-full bg-[#f9fbfd]/80 z-50 flex justify-center items-center">
      <div className="w-16 h-16 border-4 border-[#6B9CCE] border-dashed rounded-full animate-spin"></div>
    </div>
  );
}
