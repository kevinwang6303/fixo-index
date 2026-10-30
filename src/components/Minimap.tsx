import React from 'react';
import { FixoProduct } from '../types/product';
import { MapPin, Navigation } from 'lucide-react';

interface MinimapProps {
  products: FixoProduct[];
  playerPos: { x: number; z: number };
  visitedIds: Set<string>;
  onTeleport: (product: FixoProduct) => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  products,
  playerPos,
  visitedIds,
  onTeleport
}) => {
  const mapWidth = 200;
  const mapHeight = 150;
  const bound = 42; // Coordinates range -42 to +42

  const toMapX = (wx: number) => ((wx + bound) / (bound * 2)) * mapWidth;
  const toMapY = (wz: number) => ((wz + bound) / (bound * 2)) * mapHeight;

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/70 rounded-2xl p-2.5 shadow-2xl flex flex-col gap-1.5 select-none">
      <div className="flex items-center justify-between px-1 text-[11px] font-mono font-semibold text-slate-300">
        <span className="flex items-center gap-1">
          <Navigation className="w-3 h-3 text-sky-400" />
          全島 3D 雷達
        </span>
        <span className="text-[10px] text-slate-400">點擊地標傳送</span>
      </div>

      <div 
        className="relative bg-slate-950/90 rounded-xl overflow-hidden border border-slate-800"
        style={{ width: `${mapWidth}px`, height: `${mapHeight}px` }}
      >
        {/* Island outline visual */}
        <div 
          className="absolute inset-2 rounded-full border border-sky-500/30 bg-sky-950/20 pointer-events-none shadow-[inset_0_0_15px_rgba(56,189,248,0.1)]"
        />

        {/* Central Plaza marker */}
        <div 
          className="absolute w-3 h-3 rounded-full border border-sky-400/50 bg-sky-400/20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `${mapWidth / 2}px`, top: `${mapHeight / 2}px` }}
        />

        {/* Grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf815_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

        {/* Buildings markers */}
        {products.map((p) => {
          const mx = toMapX(p.building.pos3D.x);
          const my = toMapY(p.building.pos3D.z);
          const isVisited = visitedIds.has(p.id);

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onTeleport(p)}
              title={`${p.name} (${isVisited ? '已探索' : '未探索'})`}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-150 cursor-pointer z-10 group"
              style={{ left: `${mx}px`, top: `${my}px` }}
            >
              <div 
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold shadow-md transition-all ${
                  isVisited 
                    ? 'ring-2 ring-emerald-400 bg-emerald-500 text-slate-950' 
                    : 'ring-1 ring-sky-400 bg-slate-800 text-sky-300'
                }`}
                style={{ backgroundColor: isVisited ? '#10b981' : p.color.primary }}
              >
                {p.code.slice(0, 1)}
              </div>
            </button>
          );
        })}

        {/* Sean player avatar icon marker */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
          style={{
            left: `${toMapX(playerPos.x)}px`,
            top: `${toMapY(playerPos.z)}px`
          }}
        >
          <div className="relative flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-amber-400/30 animate-ping absolute" />
            <img 
              src="./sean.png" 
              alt="Sean" 
              className="w-5 h-5 object-contain rounded-full border border-amber-300 bg-amber-400/20 shadow-[0_0_8px_#f59e0b]"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-mono">
        <span className="flex items-center gap-1">
          <MapPin className="w-2.5 h-2.5 text-amber-400" />
          Sean: {Math.round(playerPos.x)}, {Math.round(playerPos.z)}
        </span>
        <span className="text-emerald-400 font-semibold">
          {visitedIds.size}/{products.length} 已發掘
        </span>
      </div>
    </div>
  );
};
