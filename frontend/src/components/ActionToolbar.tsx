import { CharacterState } from '../types';

interface ActionToolbarProps {
  onTriggerAction: (action: string, characterState: CharacterState) => void;
  currentState: CharacterState;
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  onTriggerAction,
  currentState,
}) => {
  const actions: {
    id: string;
    label: string;
    icon: string;
    state: CharacterState;
    color: string;
  }[] = [
    { id: 'pat', label: 'Pet Head', icon: '💖', state: 'happy', color: 'hover:border-pink-400' },
    { id: 'tickle', label: 'Tickle', icon: '🖐️', state: 'laughing', color: 'hover:border-amber-400' },
    { id: 'feed', label: 'Feed Treat', icon: '🍰', state: 'happy', color: 'hover:border-orange-400' },
    { id: 'dance', label: 'Dance', icon: '💃', state: 'dancing', color: 'hover:border-purple-400' },
    { id: 'jump', label: 'Jump', icon: '🚀', state: 'jumping', color: 'hover:border-blue-400' },
    { id: 'sleep', label: 'Nap', icon: '💤', state: 'sleeping', color: 'hover:border-indigo-400' },
  ];

  return (
    <div className="fixed bottom-4 inset-x-3 md:inset-x-6 z-30 max-w-xl mx-auto flex items-center justify-around p-2 rounded-3xl glass-panel shadow-xl shadow-pink-500/10">
      {actions.map((act) => {
        const isActive = currentState === act.state;
        return (
          <button
            key={act.id}
            onClick={() => onTriggerAction(act.id, act.state)}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 group ${
              isActive
                ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30 scale-105'
                : 'text-slate-700 hover:bg-pink-50/70 hover:scale-105 active:scale-95'
            }`}
          >
            <span className="text-xl sm:text-2xl transition-transform group-hover:scale-110">
              {act.icon}
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold mt-0.5">
              {act.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
