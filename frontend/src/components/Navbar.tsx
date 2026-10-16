import React from 'react';
import { Home, Mic, MessageCircle, Palette, Settings as SettingsIcon, Volume2, VolumeX } from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'playroom';
  onNavigate: (view: 'home' | 'playroom') => void;
  onOpenVoice: () => void;
  onOpenChat: () => void;
  onOpenStudio: () => void;
  onOpenSettings: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenVoice,
  onOpenChat,
  onOpenStudio,
  onOpenSettings,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="centered-fixed-top pointer-events-auto">
      <div className="glass-panel px-3 sm:px-5 py-2.5 rounded-3xl shadow-lg flex items-center justify-between gap-2">
        {/* Brand */}
        <div
          onClick={() => onNavigate(currentView === 'home' ? 'playroom' : 'home')}
          className="flex items-center gap-2 cursor-pointer group shrink-0"
          title="Toggle Home / Playroom"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-400 to-amber-300 p-0.5 shadow-md shadow-pink-500/25 group-hover:scale-105 transition-all">
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center text-lg sm:text-xl">
              🐾
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-fredoka text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
                Mimo
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-600">
                3D Pet
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden sm:block">
              Your AI Playmate
            </p>
          </div>
        </div>

        {/* Main Nav Actions */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onNavigate('playroom')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              currentView === 'playroom'
                ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                : 'text-slate-600 hover:bg-pink-50 hover:text-pink-600'
            }`}
          >
            <Home size={15} />
            <span className="hidden md:inline">Play</span>
          </button>

          <button
            onClick={onOpenVoice}
            title="Voice Repeat Mode"
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold text-slate-600 hover:bg-pink-50 hover:text-pink-600 transition-all cursor-pointer"
          >
            <Mic size={15} className="text-pink-500" />
            <span className="hidden md:inline">Voice</span>
          </button>

          <button
            onClick={onOpenChat}
            title="AI Chat"
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold text-slate-600 hover:bg-pink-50 hover:text-pink-600 transition-all cursor-pointer"
          >
            <MessageCircle size={15} className="text-pink-500" />
            <span className="hidden md:inline">Chat</span>
          </button>

          <button
            onClick={onOpenStudio}
            title="Avatar Studio & Styling"
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold text-slate-600 hover:bg-pink-50 hover:text-pink-600 transition-all cursor-pointer"
          >
            <Palette size={15} className="text-pink-500" />
            <span className="hidden md:inline">Style</span>
          </button>

          <div className="h-5 w-px bg-slate-200 mx-0.5 hidden sm:block" />

          {/* Sound Mute */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Game Audio' : 'Unmute Audio'}
            className="p-2 rounded-2xl text-slate-500 hover:text-pink-600 hover:bg-pink-50 transition-all cursor-pointer"
          >
            {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} className="text-slate-400" />}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            title="Settings & Privacy"
            className="p-2 rounded-2xl text-slate-500 hover:text-pink-600 hover:bg-pink-50 transition-all cursor-pointer"
          >
            <SettingsIcon size={17} />
          </button>
        </nav>
      </div>
    </header>
  );
};
