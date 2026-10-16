import { Heart, Smile, Zap, Sparkles } from 'lucide-react';
import { GameProgressState } from '../types';

interface StatusBarProps {
  progress: GameProgressState;
}

export const StatusBar: React.FC<StatusBarProps> = ({ progress }) => {
  return (
    <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-2 rounded-2xl glass-panel shadow-sm text-xs font-bold text-slate-700">
      {/* Affection */}
      <div className="flex items-center gap-1.5 min-w-[70px] sm:min-w-[90px]">
        <Heart size={14} className="text-pink-500 fill-pink-500 animate-pulse" />
        <div className="flex-1">
          <div className="flex justify-between text-[10px] text-slate-500 font-semibold mb-0.5">
            <span>Affection</span>
            <span>{progress.affection}%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-400 to-rose-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progress.affection}%` }}
            />
          </div>
        </div>
      </div>

      {/* Happiness */}
      <div className="flex items-center gap-1.5 min-w-[70px] sm:min-w-[90px]">
        <Smile size={14} className="text-amber-500" />
        <div className="flex-1">
          <div className="flex justify-between text-[10px] text-slate-500 font-semibold mb-0.5">
            <span>Happiness</span>
            <span>{progress.happiness}%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-400 to-yellow-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progress.happiness}%` }}
            />
          </div>
        </div>
      </div>

      {/* Energy */}
      <div className="flex items-center gap-1.5 min-w-[70px] sm:min-w-[90px]">
        <Zap size={14} className="text-emerald-500 fill-emerald-500" />
        <div className="flex-1">
          <div className="flex justify-between text-[10px] text-slate-500 font-semibold mb-0.5">
            <span>Energy</span>
            <span>{progress.energy}%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progress.energy}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
