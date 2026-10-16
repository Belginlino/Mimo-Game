import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { MimoScene } from './features/game/MimoScene';
import { Navbar } from './components/Navbar';
import { StatusBar } from './components/StatusBar';
import { ActionToolbar } from './components/ActionToolbar';
import { WelcomeHero } from './features/landing/WelcomeHero';
import { VoiceRepeatModal } from './features/voice/VoiceRepeatModal';
import { ChatDrawer } from './features/chat/ChatDrawer';
import { AvatarStudioModal } from './features/avatar/AvatarStudioModal';
import { SettingsModal } from './features/settings/SettingsModal';
import { soundEngine } from './lib/soundEngine';
import {
  CharacterState,
  PaletteTheme,
  AccessoryType,
  EnvironmentType,
  UserSettingsState,
  GameProgressState,
  PublicConfig,
} from './types';
import {
  fetchPublicConfig,
  fetchUserSettings,
  saveUserSettings,
  fetchGameProgress,
  recordInteraction,
  resetGameProgress,
} from './lib/api';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'playroom'>('playroom');
  const [characterState, setCharacterState] = useState<CharacterState>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // User Settings
  const [settings, setSettings] = useState<UserSettingsState>({
    soundEnabled: true,
    soundVolume: 0.8,
    reducedMotion: false,
    selectedPalette: 'bubblegum',
    selectedAccessory: 'none',
    selectedEnvironment: 'playroom',
  });

  // Game Progression
  const [progress, setProgress] = useState<GameProgressState>({
    affection: 25,
    happiness: 70,
    energy: 90,
    interactionsCount: 0,
  });

  const [publicConfig, setPublicConfig] = useState<PublicConfig | null>(null);

  // Modals
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const resetStateTimer = useRef<number | null>(null);

  // Initialize data
  useEffect(() => {
    soundEngine.setConfig(settings.soundEnabled, settings.soundVolume);

    fetchPublicConfig()
      .then(setPublicConfig)
      .catch((err) => console.log('Config fetch notice (offline/mock):', err));

    fetchUserSettings()
      .then((loaded) => {
        setSettings(loaded);
        soundEngine.setConfig(loaded.soundEnabled, loaded.soundVolume);
      })
      .catch(() => {});

    fetchGameProgress()
      .then(setProgress)
      .catch(() => {});
  }, []);

  const triggerReaction = (state: CharacterState, soundType?: string) => {
    setCharacterState(state);

    if (resetStateTimer.current) clearTimeout(resetStateTimer.current);

    // Audio chimes
    if (soundType === 'pat') soundEngine.playPurr();
    else if (soundType === 'tickle' || state === 'laughing') soundEngine.playGiggle();
    else if (soundType === 'jump' || state === 'jumping') soundEngine.playBoing();
    else if (soundType === 'sleep' || state === 'sleeping') soundEngine.playYawn();
    else if (soundType === 'dance' || state === 'dancing') soundEngine.playGiggle();
    else soundEngine.playTap();

    // Trigger subtle confetti burst on happy/dance
    if ((state === 'happy' || state === 'dancing') && !settings.reducedMotion) {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FF758C', '#FFB703', '#06D6A0', '#A259FF'],
      });
    }

    // Auto reset to idle unless sleeping
    if (state !== 'sleeping') {
      resetStateTimer.current = window.setTimeout(() => {
        setCharacterState('idle');
      }, 3500);
    }
  };

  const handleAction = async (action: string, reactionState: CharacterState) => {
    triggerReaction(reactionState, action);
    try {
      const updated = await recordInteraction(action);
      setProgress(updated);
    } catch {
      // Local fallback progress update
      setProgress((prev) => ({
        ...prev,
        interactionsCount: prev.interactionsCount + 1,
        happiness: Math.min(100, prev.happiness + 5),
        affection: Math.min(100, prev.affection + 2),
      }));
    }
  };

  const handleTapRegion = (region: 'head' | 'belly' | 'feet' | 'ears') => {
    if (region === 'head') {
      handleAction('pat', 'happy');
    } else if (region === 'belly') {
      handleAction('tickle', 'laughing');
    } else if (region === 'feet') {
      handleAction('jump', 'jumping');
    } else if (region === 'ears') {
      handleAction('pat', 'surprised');
    }
  };

  const handleUpdateAppearance = (
    palette: PaletteTheme,
    accessory: AccessoryType,
    environment: EnvironmentType
  ) => {
    const updated = {
      ...settings,
      selectedPalette: palette,
      selectedAccessory: accessory,
      selectedEnvironment: environment,
    };
    setSettings(updated);
    saveUserSettings(updated).catch(() => {});
  };

  const handleUpdateSettings = (newSettings: UserSettingsState) => {
    setSettings(newSettings);
    soundEngine.setConfig(newSettings.soundEnabled, newSettings.soundVolume);
    saveUserSettings(newSettings).catch(() => {});
  };

  const handleResetAllData = async () => {
    await resetGameProgress().catch(() => {});
    setProgress({ affection: 15, happiness: 60, energy: 90, interactionsCount: 0 });
    const defaultSettings: UserSettingsState = {
      soundEnabled: true,
      soundVolume: 0.8,
      reducedMotion: false,
      selectedPalette: 'bubblegum',
      selectedAccessory: 'none',
      selectedEnvironment: 'playroom',
    };
    setSettings(defaultSettings);
    saveUserSettings(defaultSettings).catch(() => {});
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col font-sans select-none">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenStudio={() => setIsStudioOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => {
          const updated = !settings.soundEnabled;
          handleUpdateSettings({ ...settings, soundEnabled: updated });
        }}
      />

      {/* Main View Area */}
      {currentView === 'home' ? (
        <div className="flex-1 overflow-y-auto">
          <WelcomeHero
            onPlayNow={() => setCurrentView('playroom')}
            onOpenStudio={() => setIsStudioOpen(true)}
            onOpenVoice={() => setIsVoiceOpen(true)}
            onOpenChat={() => setIsChatOpen(true)}
          />
        </div>
      ) : (
        <div className="relative flex-1 w-full h-full">
          {/* Status Bar */}
          <div className="absolute top-20 inset-x-4 z-20 flex justify-center pointer-events-none">
            <div className="pointer-events-auto">
              <StatusBar progress={progress} />
            </div>
          </div>

          {/* 3D Interactive Viewport */}
          <div className="w-full h-full">
            <MimoScene
              state={characterState}
              palette={settings.selectedPalette}
              accessory={settings.selectedAccessory}
              environment={settings.selectedEnvironment}
              onTapRegion={handleTapRegion}
              isSpeaking={isSpeaking}
            />
          </div>

          {/* Bottom Action Toolbar */}
          <ActionToolbar
            onTriggerAction={handleAction}
            currentState={characterState}
          />
        </div>
      )}

      {/* Modals & Drawers */}
      <VoiceRepeatModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onAvatarTalk={(speaking) => {
          setIsSpeaking(speaking);
          if (speaking) setCharacterState('talking');
          else setCharacterState('idle');
        }}
      />

      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onTriggerReaction={(reaction) => triggerReaction(reaction)}
        onAvatarTalk={(speaking) => {
          setIsSpeaking(speaking);
          if (speaking) setCharacterState('talking');
          else setCharacterState('idle');
        }}
        soundEnabled={settings.soundEnabled}
      />

      <AvatarStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        currentPalette={settings.selectedPalette}
        currentAccessory={settings.selectedAccessory}
        currentEnvironment={settings.selectedEnvironment}
        onUpdateAppearance={handleUpdateAppearance}
        image3dConfigured={Boolean(publicConfig?.image3d_provider_configured)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetAllData={handleResetAllData}
      />
    </div>
  );
};
