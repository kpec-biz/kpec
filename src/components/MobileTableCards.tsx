"use client";

import { useState } from "react";

interface Props {
  headers: string[];
  rows: string[][];
}

export default function MobileTableCards({ headers, rows }: Props) {
  const [active, setActive] = useState(0);
  const row = rows[active];

  return (
    <div className="sm:hidden">
      <div className="flex flex-wrap gap-1.5 mb-0">
        {rows.map((r, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`px-3 py-2 rounded-t-lg text-[11px] font-semibold transition-all ${
              active === i
                ? "bg-primary-60 text-white shadow-md relative z-10 -mb-px"
                : "bg-gray-5 border border-gray-10 border-b-0 text-gray-50 hover:bg-gray-10"
            }`}
          >
            {r[0]}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-10 rounded-b-xl rounded-tr-xl overflow-hidden shadow-sm">
        {headers.slice(1).map((h, hi) => (
          <div
            key={hi}
            className={`flex items-start gap-2 px-3.5 py-2 ${hi % 2 === 1 ? "bg-gray-5" : ""}`}
          >
            <span className="text-[10px] font-semibold text-gray-50 w-14 flex-shrink-0 pt-0.5">
              {h}
            </span>
            <span className="text-[12px] text-gray-80">
              {row[hi + 1] || "-"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
