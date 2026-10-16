import React, { useState } from 'react';
import { Heart, Zap, Sparkles, Edit2, Check } from 'lucide-react';
import { GameProgressState } from '../types';

interface StatusBarProps {
  progress: GameProgressState;
  contextMessage?: string;
  petName?: string;
  onUpdatePetName?: (name: string) => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  progress,
  contextMessage = 'Mimo is happy to see you!',
  petName = 'Mimo',
  onUpdatePetName,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(petName);

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed && onUpdatePetName) {
      onUpdatePetName(trimmed);
    }
    setIsEditing(false);
  };

  return (
    <div className="glass-panel p-3 sm:p-4 rounded-3xl shadow-lg border border-white/80 max-w-xs sm:max-w-sm pointer-events-auto transition-all">
      {/* Pet Name Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-base sm:text-lg">🐾</span>
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={16}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                className="px-2 py-0.5 text-xs font-bold text-slate-800 bg-white/90 rounded-lg outline-none border border-pink-300 w-24"
              />
              <button
                onClick={handleSaveName}
                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
              >
                <Check size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => setIsEditing(true)}>
              <span className="font-fredoka text-sm sm:text-base font-bold text-slate-800">
                {petName}
              </span>
              <button
                title="Edit pet name"
                className="opacity-40 group-hover:opacity-100 text-slate-500 hover:text-pink-600 transition-opacity"
              >
                <Edit2 size={12} />
              </button>
            </div>
          )}
        </div>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
          Level {Math.floor(progress.interactionsCount / 5) + 1}
        </span>
      </div>

      {/* Meters */}
      <div className="space-y-1.5">
        {/* Affection / Happiness */}
        <div>
          <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-0.5">
            <span className="flex items-center gap-1">
              <Heart size={12} className="text-pink-500 fill-pink-500" />
              Affection
            </span>
            <span>{progress.affection}%</span>
          </div>
          <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-500 to-rose-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progress.affection}%` }}
            />
          </div>
        </div>

        {/* Energy */}
        <div>
          <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-0.5">
            <span className="flex items-center gap-1">
              <Zap size={12} className="text-amber-500 fill-amber-500" />
              Energy
            </span>
            <span>{progress.energy}%</span>
          </div>
          <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-400 to-yellow-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progress.energy}%` }}
            />
          </div>
        </div>
      </div>

      {/* Contextual Status Message */}
      <div className="mt-2.5 pt-2 border-t border-pink-100/60 flex items-center gap-1.5 text-[11px] text-pink-700 font-medium">
        <Sparkles size={13} className="text-pink-500 shrink-0" />
        <span className="truncate">{contextMessage}</span>
      </div>
    </div>
  );
};
