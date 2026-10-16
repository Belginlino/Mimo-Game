import React from 'react';
import { CharacterState } from '../types';

interface ActionToolbarProps {
  onTriggerAction: (action: string, characterState: CharacterState) => void;
  onOpenChat: () => void;
  currentState: CharacterState;
}

interface ActionItem {
  id: string;
  label: string;
  icon: string;
  state: CharacterState;
  tooltip: string;
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  onTriggerAction,
  onOpenChat,
  currentState,
}) => {
  const actions: ActionItem[] = [
    { id: 'pat', label: 'Pet', icon: '💖', state: 'happy', tooltip: 'Pet Head (+3 Affection)' },
    { id: 'tickle', label: 'Tickle', icon: '🖐️', state: 'laughing', tooltip: 'Tummy Tickle (+5 Happiness)' },
    { id: 'feed', label: 'Treat', icon: '🍪', state: 'happy', tooltip: 'Feed Cookie (+15 Energy)' },
    { id: 'dance', label: 'Dance', icon: '💃', state: 'dancing', tooltip: 'Party Dance (+8 Happiness)' },
    { id: 'jump', label: 'Jump', icon: '🚀', state: 'jumping', tooltip: 'High Hop (+4 Happiness)' },
    { id: 'sleep', label: 'Nap', icon: '💤', state: 'sleeping', tooltip: 'Cozy Nap (+30 Energy)' },
    { id: 'talk', label: 'Talk', icon: '💬', state: 'talking', tooltip: 'Chat with Mimo' },
  ];

  return (
    <div className="centered-fixed-bottom pointer-events-auto">
      <div className="glass-panel p-2 sm:p-2.5 rounded-3xl shadow-xl flex items-center justify-between sm:justify-around gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
        {actions.map((act) => {
          const isActive = currentState === act.state;
          return (
            <button
              key={act.id}
              onClick={() => {
                if (act.id === 'talk') {
                  onOpenChat();
                } else {
                  onTriggerAction(act.id, act.state);
                }
              }}
              title={act.tooltip}
              aria-label={act.label}
              className={`flex flex-col items-center justify-center py-2 px-2.5 sm:px-3 rounded-2xl transition-all duration-200 cursor-pointer min-w-[50px] sm:min-w-[64px] border ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent shadow-md shadow-pink-500/30 scale-105'
                  : 'border-transparent text-slate-700 hover:bg-pink-50/80 hover:border-pink-200 hover:scale-105 active:scale-95'
              }`}
            >
              <span className="text-xl sm:text-2xl transition-transform">{act.icon}</span>
              <span className="text-[11px] sm:text-xs font-bold mt-0.5 tracking-tight">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
