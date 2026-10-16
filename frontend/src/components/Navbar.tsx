import React from 'react';
import { Sparkles, MessageCircle, Mic, Palette, Settings as SettingsIcon, Volume2, VolumeX, Home } from 'lucide-react';

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
    <header className="fixed top-3 inset-x-3 md:inset-x-6 z-30 max-w-6xl mx-auto flex items-center justify-between px-4 py-2.5 rounded-3xl glass-panel shadow-lg shadow-pink-500/5">
      {/* Brand */}
      <div
        onClick={() => onNavigate('home')}
        className="flex items-center gap-2.5 cursor-pointer group"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-400 to-amber-300 p-0.5 shadow-md shadow-pink-500/25 group-hover:scale-105 transition-all">
          <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center text-xl">
            🐾
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-fredoka text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
              Mimo
            </h1>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-300">
              3D AI
            </span>
          </div>
          <p className="text-[11px] text-slate-500 -mt-0.5 font-medium hidden sm:block">
            Your AI Playmate
          </p>
        </div>
      </div>

      {/* Action Navigation */}
      <nav className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => onNavigate(currentView === 'home' ? 'playroom' : 'home')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all ${
            currentView === 'home'
              ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
              : 'text-slate-600 hover:bg-pink-50 hover:text-pink-600'
          }`}
        >
          <Home size={16} />
          <span className="hidden md:inline">{currentView === 'home' ? 'Playroom' : 'Home'}</span>
        </button>

        <button
          onClick={onOpenVoice}
          title="Voice Repeat Mode"
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold text-slate-600 hover:bg-pink-50 hover:text-pink-600 transition-all"
        >
          <Mic size={16} className="text-pink-500" />
          <span className="hidden md:inline">Voice Repeat</span>
        </button>

        <button
          onClick={onOpenChat}
          title="AI Chat"
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold text-slate-600 hover:bg-pink-50 hover:text-pink-600 transition-all"
        >
          <MessageCircle size={16} className="text-pink-500" />
          <span className="hidden md:inline">Chat</span>
        </button>

        <button
          onClick={onOpenStudio}
          title="Avatar Studio & Styling"
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold text-slate-600 hover:bg-pink-50 hover:text-pink-600 transition-all"
        >
          <Palette size={16} className="text-pink-500" />
          <span className="hidden md:inline">Styling</span>
        </button>

        <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute Game Audio' : 'Unmute Audio'}
          className="p-2 rounded-2xl text-slate-500 hover:text-pink-600 hover:bg-pink-50 transition-all"
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} className="text-slate-400" />}
        </button>

        <button
          onClick={onOpenSettings}
          title="Settings & Privacy"
          className="p-2 rounded-2xl text-slate-500 hover:text-pink-600 hover:bg-pink-50 transition-all"
        >
          <SettingsIcon size={18} />
        </button>
      </nav>
    </header>
  );
};
