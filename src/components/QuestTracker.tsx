import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Compass, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface QuestTrackerProps {
  visitedCount: number;
  totalCount: number;
}

export const QuestTracker: React.FC<QuestTrackerProps> = ({ visitedCount, totalCount }) => {
  const percentage = Math.round((visitedCount / totalCount) * 100);
  const isComplete = visitedCount >= totalCount && totalCount > 0;

  useEffect(() => {
    if (isComplete) {
      sound.playAchievement();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [isComplete]);

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/70 rounded-2xl p-3 shadow-xl flex items-center gap-3 select-none">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
        isComplete ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-bounce' : 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
      }`}>
        {isComplete ? <Trophy className="w-5 h-5 text-amber-400" /> : <Compass className="w-5 h-5" />}
      </div>

      <div className="flex flex-col min-w-[130px]">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-semibold text-slate-200 flex items-center gap-1">
            {isComplete ? '全島產品探索達成！🎉' : 'FiXo 探索進度'}
          </span>
          <span className="font-mono font-bold text-sky-400">
            {visitedCount}/{totalCount}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700/50">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isComplete ? 'bg-gradient-to-r from-amber-400 to-emerald-400' : 'bg-gradient-to-r from-sky-400 to-blue-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {isComplete && (
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-1 rounded-lg font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          全產品解鎖
        </div>
      )}
    </div>
  );
};
