import React from 'react';
import { Camera, Film, Info, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';

interface TalkingTomButtonsProps {
  onCameraClick: () => void;
  onReplayClick: () => void;
  onInfoClick: () => void;
  onDanceClick: () => void;
  onBagPopClick: () => void;
  onFeedCookieClick: () => void;
  onDrinkMilkClick: () => void;
  onWardrobeClick: () => void;
  onMysteryClick: () => void;
  onTickleFeatherClick: () => void;
  onPhoneClick: () => void;
  coins: number;
  onBonusCoins: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSettings?: () => void;
  listening: boolean;
  talking: boolean;
  onToggleListening: () => void;
  speechStatus: string;
}

export const TalkingTomButtons: React.FC<TalkingTomButtonsProps> = ({
  onCameraClick,
  onReplayClick,
  onInfoClick,
  onDanceClick,
  onBagPopClick,
  onFeedCookieClick,
  onDrinkMilkClick,
  onWardrobeClick,
  onMysteryClick,
  onTickleFeatherClick,
  onPhoneClick,
  coins,
  onBonusCoins,
  isMuted,
  onToggleMute,
  onOpenSettings,
  listening,
  talking,
  onToggleListening,
  speechStatus,
}) => {
  return (
    <div className="tom-ui-overlay" pointer-events="none">
      {/* 1. TOP BAR */}
      <header className="tom-topbar">
        <div className="tom-topbar-left">
          {/* 🎥 Snapshot Camera */}
          <button
            className="tom-circle-btn top-btn"
            onClick={onCameraClick}
            title="Take Photo Snapshot"
            aria-label="Camera Snapshot"
          >
            <span className="btn-icon camera-icon">🎥</span>
          </button>

          {/* 🎬 Film / Replay Catchphrase */}
          <button
            className="tom-circle-btn top-btn"
            onClick={onReplayClick}
            title="Replay Voice / Catchphrase"
            aria-label="Replay Voice"
          >
            <span className="btn-icon film-icon">🎬</span>
          </button>
        </div>

        <div className="tom-topbar-right">
          {/* ℹ️ Info / Guide */}
          <button
            className="tom-circle-btn top-btn info-btn"
            onClick={onInfoClick}
            title="How to Play"
            aria-label="Game Info"
          >
            <span className="btn-icon">ℹ️</span>
          </button>

          {/* 🔥 Fire / AD Mini-Game Badge (Exact match to top right in reference) */}
          <button
            className="tom-circle-btn top-btn fire-ad-btn"
            onClick={onBonusCoins}
            title="Fire Breath Mini-Game & Bonus Coins!"
            aria-label="Fire Breath Mini-Game"
          >
            <span className="btn-icon fire-icon">🔥</span>
            <span className="ad-badge-tag">AD</span>
          </button>

          {/* 🔊 / 🔇 Sound Toggle */}
          <button
            className="tom-circle-btn top-btn"
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            aria-label="Sound Toggle"
          >
            <span className="btn-icon">{isMuted ? '🔇' : '🔊'}</span>
          </button>

          {/* ⚙️ Customize / Setup */}
          {onOpenSettings && (
            <button
              className="tom-circle-btn top-btn"
              onClick={onOpenSettings}
              title="Customize Character & Setup"
              aria-label="Settings"
            >
              <span className="btn-icon">⚙️</span>
            </button>
          )}

          {/* 🪙 Golden Coins Badge */}
          <button
            className="tom-coins-badge"
            onClick={onBonusCoins}
            title="Get Bonus Coins!"
            aria-label="Coins balance"
          >
            <span className="coin-glow">🪙</span>
            <span className="coin-val">{(coins / 1000).toFixed(1)}k</span>
            <span className="coin-plus">+</span>
          </button>
        </div>
      </header>

      {/* 2. LEFT ACTION DOCK (Vertical) */}
      <aside className="tom-dock dock-left">
        {/* 🎮 Mini-game / Party Dance */}
        <button
          className="tom-circle-btn side-btn"
          onClick={onDanceClick}
          title="Party Dance!"
          aria-label="Dance"
        >
          <span className="btn-icon">🎮</span>
        </button>

        {/* 🛍️ Paper Bag Pop Prank */}
        <button
          className="tom-circle-btn side-btn bag-btn"
          onClick={onBagPopClick}
          title="Paper Bag Pop Prank!"
          aria-label="Pop Paper Bag"
        >
          <span className="btn-icon">🛍️</span>
        </button>

        {/* 🍪 Treat / Cookie Feed */}
        <button
          className="tom-circle-btn side-btn"
          onClick={onFeedCookieClick}
          title="Feed Cookie"
          aria-label="Feed Cookie"
        >
          <span className="btn-icon">🍪</span>
        </button>

        {/* 🥛 Milk / Drink */}
        <button
          className="tom-circle-btn side-btn"
          onClick={onDrinkMilkClick}
          title="Drink Milk"
          aria-label="Drink Milk"
        >
          <span className="btn-icon">🥛</span>
        </button>
      </aside>

      {/* 3. RIGHT ACTION DOCK (Vertical) */}
      <aside className="tom-dock dock-right">
        {/* 👔 Wardrobe (with golden coins tag badge matching reference) */}
        <div className="wardrobe-btn-wrapper">
          <button
            className="tom-circle-btn side-btn wardrobe-btn"
            onClick={onWardrobeClick}
            title="Open Wardrobe & Accessories"
            aria-label="Wardrobe"
          >
            <span className="btn-icon">👔</span>
          </button>
          <div className="wardrobe-coin-tag">
            <span>{(coins / 1000).toFixed(1)}k</span>
            <span className="mini-coin">🪙</span>
          </div>
        </div>

        {/* ❓ Mystery / Surprise Trick */}
        <button
          className="tom-circle-btn side-btn"
          onClick={onMysteryClick}
          title="Surprise Trick!"
          aria-label="Mystery Prank"
        >
          <span className="btn-icon mystery-q">❓</span>
        </button>

        {/* 🪶 Tickle Feather */}
        <button
          className="tom-circle-btn side-btn"
          onClick={onTickleFeatherClick}
          title="Tickle Belly with Feather"
          aria-label="Tickle Feather"
        >
          <span className="btn-icon">🪶</span>
        </button>

        {/* 📱 Smartphone / Talk */}
        <button
          className="tom-circle-btn side-btn phone-btn"
          onClick={onPhoneClick}
          title="Answer Phone Call"
          aria-label="Phone Call"
        >
          <span className="btn-icon">📱</span>
        </button>
      </aside>

      {/* 4. BOTTOM TALKING MIC DOCK */}
      <footer className="tom-bottom-dock">
        <div className="tom-mic-cluster">
          <button
            className={`tom-mic-btn ${listening ? 'listening' : ''} ${talking ? 'talking' : ''}`}
            onClick={onToggleListening}
            aria-label={listening ? 'Stop Listening' : 'Start Talking with Mimo'}
            title={listening ? 'Click to pause mic' : 'Click to talk (repeats in Tom voice!)'}
          >
            {listening ? <Mic size={26} /> : <MicOff size={26} />}
            <span className="mic-pulse-ring" />
          </button>
          <div className="tom-status-badge">
            <span className={`status-indicator-dot ${listening || talking ? 'active' : ''}`} />
            <span>{speechStatus}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
