import React, { useState } from 'react';
import { Volume2, VolumeX, Shield, RotateCcw, X, Info } from 'lucide-react';
import { UserSettingsState } from '../../types';
import { soundEngine } from '../../lib/soundEngine';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettingsState;
  onUpdateSettings: (newSettings: UserSettingsState) => void;
  onResetAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetAllData,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleSoundToggle = (enabled: boolean) => {
    const updated = { ...settings, soundEnabled: enabled };
    soundEngine.setConfig(enabled, settings.soundVolume);
    onUpdateSettings(updated);
  };

  const handleVolumeChange = (vol: number) => {
    const updated = { ...settings, soundVolume: vol };
    soundEngine.setConfig(settings.soundEnabled, vol);
    onUpdateSettings(updated);
  };

  const handleReducedMotion = (enabled: boolean) => {
    const updated = { ...settings, reducedMotion: enabled };
    onUpdateSettings(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-200/50 dark:border-pink-900/30 text-slate-800 dark:text-slate-100 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            <div>
              <h2 className="text-xl font-bold font-fredoka text-pink-600 dark:text-pink-400">
                Settings & Privacy
              </h2>
              <p className="text-xs text-slate-500">Audio, preferences, and data privacy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Audio Controls */}
        <div className="space-y-3 p-3 bg-pink-50/60 dark:bg-slate-800/60 rounded-2xl border border-pink-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings.soundEnabled ? (
                <Volume2 size={18} className="text-pink-500" />
              ) : (
                <VolumeX size={18} className="text-slate-400" />
              )}
              <span className="text-sm font-semibold">Game Sound & Chimes</span>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => handleSoundToggle(e.target.checked)}
              className="toggle-checkbox w-5 h-5 accent-pink-500 rounded"
            />
          </div>

          {settings.soundEnabled && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Volume</span>
                <span>{Math.round(settings.soundVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.soundVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-pink-500"
              />
            </div>
          )}
        </div>

        {/* Accessibility & Motion */}
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div>
            <p className="text-sm font-semibold">Reduced Motion</p>
            <p className="text-xs text-slate-500">Softens rapid particle and camera animations</p>
          </div>
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(e) => handleReducedMotion(e.target.checked)}
            className="w-5 h-5 accent-pink-500 rounded"
          />
        </div>

        {/* Privacy Note */}
        <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <Shield size={14} />
            <span>Zero Tracking & Local Processing</span>
          </div>
          <p>
            Mimo collects zero advertising identifiers or tracking cookies. Voice repeat is synthesized
            entirely inside your browser, and uploaded photos are kept only temporarily for mesh processing.
          </p>
        </div>

        {/* Data Reset */}
        <div className="pt-2">
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full py-2.5 text-xs font-bold text-red-500 border border-red-200 dark:border-red-900 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={14} />
              <span>Reset Pet Progress & Preferences</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onResetAllData();
                  setConfirmReset(false);
                  onClose();
                }}
                className="flex-1 py-2 text-xs font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                Confirm Reset
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-4 py-2 text-xs font-bold bg-slate-200 dark:bg-slate-700 rounded-xl hover:bg-slate-300"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
