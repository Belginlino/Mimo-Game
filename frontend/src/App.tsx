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

const SPEECH_REACTIONS: Record<string, string[]> = {
  pat: ['Purr! Head pats are the best! 💖', 'Awww, that feels so soothing! ✨', 'You are my best friend! 🐾'],
  tickle: ['Hehehe, that tickles my tummy! 😆', 'Hahaha, stop it, too ticklish! 😂', 'Giggle giggle! You found the spot! 🌟'],
  feed: ['Nom nom! Yummy cookie treat! 🍪', 'Glitter cookies are my favorite! 🍰', 'So delicious! Energy restored! ⚡'],
  dance: ['Let\'s groove! 1, 2, 3 hop! 💃', 'Bust out the disco moves! 🎶', 'Dance party with Mimo! 🕺'],
  jump: ['Boing! High into the sky! 🚀', 'Super jump! Look how high! ✨', 'Hop, hop, hooray! 🐰'],
  sleep: ['A big yawn... cozy nap time! 💤', 'Drifting off to dreamland... 🌙', 'Zzz... so soft and sleepy... ☁️'],
  ears: ['Curious ear wiggle! 🐾', 'Did you hear that little chirp? 🎶', 'My ears are listening! ✨'],
};

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'playroom'>('playroom');
  const [characterState, setCharacterState] = useState<CharacterState>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechBubbleText, setSpeechBubbleText] = useState<string | null>(null);
  const [contextMessage, setContextMessage] = useState('Mimo is excited to see you!');
  const [petName, setPetName] = useState(() => localStorage.getItem('mimo_pet_name') || 'Mimo');

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
    affection: 35,
    happiness: 75,
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
  const speechBubbleTimer = useRef<number | null>(null);

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

  const showSpeechBubble = (text: string) => {
    setSpeechBubbleText(text);
    if (speechBubbleTimer.current) clearTimeout(speechBubbleTimer.current);
    speechBubbleTimer.current = window.setTimeout(() => {
      setSpeechBubbleText(null);
    }, 3200);
  };

  const triggerReaction = (state: CharacterState, soundType?: string) => {
    setCharacterState(state);

    if (resetStateTimer.current) clearTimeout(resetStateTimer.current);

    // Audio chimes
    if (soundType === 'pat') soundEngine.playPurr();
    else if (soundType === 'tickle' || state === 'laughing') soundEngine.playGiggle();
    else if (soundType === 'jump' || state === 'jumping') soundEngine.playBoing();
    else if (soundType === 'sleep' || state === 'sleeping') soundEngine.playYawn();
    else if (soundType === 'dance' || state === 'dancing') soundEngine.playGiggle();
    else if (soundType === 'feed') soundEngine.playTap();
    else soundEngine.playTap();

    // Trigger subtle celebratory confetti on happy / dance
    if ((state === 'happy' || state === 'dancing') && !settings.reducedMotion) {
      confetti({
        particleCount: 20,
        spread: 50,
        origin: { y: 0.65 },
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

    // Contextual message & speech bubble
    const phrases = SPEECH_REACTIONS[action] || ['*bounces playfully* ✨'];
    const chosenPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    showSpeechBubble(chosenPhrase);

    if (action === 'pat') setContextMessage(`${petName} loved that gentle head pat! 💖`);
    else if (action === 'tickle') setContextMessage(`${petName} is giggling like crazy! 😂`);
    else if (action === 'feed') setContextMessage(`${petName} enjoyed the tasty treat! 🍪`);
    else if (action === 'dance') setContextMessage(`${petName} is grooving to the rhythm! 💃`);
    else if (action === 'jump') setContextMessage(`${petName} hopped super high! 🚀`);
    else if (action === 'sleep') setContextMessage(`${petName} is having sweet dreams... 💤`);

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
      handleAction('ears', 'surprised');
    }
  };

  const handleUpdatePetName = (name: string) => {
    setPetName(name);
    localStorage.setItem('mimo_pet_name', name);
    showSpeechBubble(`Yaaay! My name is ${name}! 🐾`);
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
    showSpeechBubble('Look at my brand new style! 👗✨');
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
    setContextMessage(`${petName} was reset back to level 1.`);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col font-sans select-none">
      {/* Top Floating Navbar (Centered) */}
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
        <div className="w-full h-full overflow-y-auto">
          <WelcomeHero
            onPlayNow={() => setCurrentView('playroom')}
            onOpenStudio={() => setIsStudioOpen(true)}
            onOpenVoice={() => setIsVoiceOpen(true)}
            onOpenChat={() => setIsChatOpen(true)}
          />
        </div>
      ) : (
        <div className="relative w-full h-full overflow-hidden">
          {/* Full-Screen 3D Interactive Scene */}
          <MimoScene
            state={characterState}
            palette={settings.selectedPalette}
            accessory={settings.selectedAccessory}
            environment={settings.selectedEnvironment}
            onTapRegion={handleTapRegion}
            isSpeaking={isSpeaking}
          />

          {/* Floating Status Widget (Anchored top-left corner below navbar, clear of Mimo) */}
          <div className="absolute top-20 left-3 sm:left-6 z-20 pointer-events-none">
            <StatusBar
              progress={progress}
              contextMessage={contextMessage}
              petName={petName}
              onUpdatePetName={handleUpdatePetName}
            />
          </div>

          {/* Floating Speech/Reaction Bubble near Mimo */}
          {speechBubbleText && (
            <div
              className="speech-bubble font-fredoka"
              style={{
                top: '28%',
                left: '50%',
              }}
            >
              {speechBubbleText}
            </div>
          )}

          {/* Bottom Centered Interaction Dock */}
          <ActionToolbar
            onTriggerAction={handleAction}
            onOpenChat={() => setIsChatOpen(true)}
            currentState={characterState}
          />
        </div>
      )}

      {/* Mode Drawers and Modals */}
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
        onTriggerReaction={(reaction) => {
          triggerReaction(reaction);
        }}
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
