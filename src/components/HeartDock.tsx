import React from 'react';
import { FixoProduct } from '../types/product';
import { Check } from 'lucide-react';

interface HeartDockProps {
  products: FixoProduct[];
  visitedIds: Set<string>;
  onSelect: (product: FixoProduct) => void;
}

export const HeartDock: React.FC<HeartDockProps> = ({ products, visitedIds, onSelect }) => {
  return (
    <nav 
      aria-label="快速前往政策島" 
      className="bg-[#fff8f4]/90 backdrop-blur-md border border-[#c5b5a7]/60 rounded-full px-3 py-2 shadow-2xl flex items-center gap-1.5 sm:gap-2 max-w-[95vw] overflow-x-auto select-none"
    >
      {products.map((p) => {
        const isVisited = visitedIds.has(p.id);
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p)}
            title={`${p.chapter} ${p.name}`}
            className="group relative flex flex-col items-center shrink-0 p-1 rounded-full transition-transform hover:-translate-y-1 active:translate-y-0 cursor-pointer focus:outline-none"
          >
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-md transition-all ${
                isVisited
                  ? 'ring-2 ring-emerald-500 bg-white text-slate-800'
                  : 'ring-1 ring-[#c5b5a7] bg-[#fff8f4] text-slate-700 hover:ring-[#db6a41]'
              }`}
            >
              <span className="text-base">{p.building.symbol}</span>
              {isVisited && (
                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </div>

            <span className="text-[10px] font-bold text-slate-700 font-mono mt-0.5 group-hover:text-[#db6a41] transition-colors">
              {p.code}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
