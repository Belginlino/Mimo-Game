import React from 'react';
import { Camera, Download, Sparkles, Volume2, VolumeX, X, Check, Heart, HelpCircle } from 'lucide-react';

export interface Particle {
  id: number;
  x: number; // percentage
  y: number; // percentage
  content: string;
  size: number;
  opacity: number;
}

interface TalkingTomOverlaysProps {
  particles: Particle[];
  cameraFlash: boolean;
  snapshotUrl: string | null;
  onCloseSnapshot: () => void;
  wardrobeOpen: boolean;
  onCloseWardrobe: () => void;
  infoOpen: boolean;
  onCloseInfo: () => void;
  hasGlasses: boolean;
  setHasGlasses: (val: boolean) => void;
  hasBowTie: boolean;
  setHasBowTie: (val: boolean) => void;
  hasSunglasses: boolean;
  setHasSunglasses: (val: boolean) => void;
  hasPartyHat: boolean;
  setHasPartyHat: (val: boolean) => void;
  clothingColor: string;
  setClothingColor: (val: string) => void;
  coins: number;
  isMuted: boolean;
  onToggleMute: () => void;
  speechBubbleText: string | null;
}

export const TalkingTomOverlays: React.FC<TalkingTomOverlaysProps> = ({
  particles,
  cameraFlash,
  snapshotUrl,
  onCloseSnapshot,
  wardrobeOpen,
  onCloseWardrobe,
  infoOpen,
  onCloseInfo,
  hasGlasses,
  setHasGlasses,
  hasBowTie,
  setHasBowTie,
  hasSunglasses,
  setHasSunglasses,
  hasPartyHat,
  setHasPartyHat,
  clothingColor,
  setClothingColor,
  coins,
  speechBubbleText,
}) => {
  return (
    <>
      {/* 1. Camera Flash Overlay */}
      {cameraFlash && <div className="camera-flash-screen" />}

      {/* 2. Floating Action Particles (Hearts, Stars, Laughs, Notes) */}
      <div className="particles-container" pointer-events="none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="floating-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              fontSize: `${p.size}px`,
              opacity: p.opacity,
            }}
          >
            {p.content}
          </div>
        ))}
      </div>

      {/* 3. Speech Bubble Directly Over Character's Head */}
      {speechBubbleText && (
        <div className="tom-speech-bubble" role="status" aria-live="polite">
          <span className="bubble-text">{speechBubbleText}</span>
          <div className="bubble-tail" />
        </div>
      )}

      {/* 4. Snapshot Polaroid Modal */}
      {snapshotUrl && (
        <div className="modal-backdrop" onClick={onCloseSnapshot}>
          <div className="polaroid-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={onCloseSnapshot} aria-label="Close snapshot">
              <X size={18} />
            </button>
            <div className="polaroid-photo">
              <img src={snapshotUrl} alt="Talking Mimo Snapshot" />
              <div className="polaroid-stamp">TALKING MIMO</div>
            </div>
            <div className="polaroid-caption">
              <span>Say Cheese! 📸</span>
              <a
                href={snapshotUrl}
                download="talking-mimo-snapshot.png"
                className="polaroid-download"
              >
                <Download size={15} /> Save Photo
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 5. Wardrobe / Closet Drawer Modal */}
      {wardrobeOpen && (
        <div className="modal-backdrop" onClick={onCloseWardrobe}>
          <div className="wardrobe-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wardrobe-header">
              <div className="wardrobe-title">
                <span className="wardrobe-icon">👔</span>
                <div>
                  <h3>Mimo's Wardrobe</h3>
                  <small>Customize your character</small>
                </div>
              </div>
              <div className="wardrobe-coins-badge">
                <span>{coins.toLocaleString()}</span>
                <span className="coin-icon">🪙</span>
              </div>
              <button className="modal-close-btn" onClick={onCloseWardrobe} aria-label="Close wardrobe">
                <X size={18} />
              </button>
            </div>

            <div className="wardrobe-body">
              <div className="wardrobe-section">
                <h4>Accessories (Classic Talking Tom Vibe)</h4>
                <div className="accessory-grid">
                  {/* Round Wireframe Glasses */}
                  <button
                    className={`accessory-card ${hasGlasses && !hasSunglasses ? 'equipped' : ''}`}
                    onClick={() => {
                      setHasSunglasses(false);
                      setHasGlasses(!hasGlasses);
                    }}
                  >
                    <span className="accessory-emoji">👓</span>
                    <span className="accessory-name">Round Glasses</span>
                    <span className="accessory-tag">
                      {hasGlasses && !hasSunglasses ? <><Check size={12} /> Wearing</> : 'Wear'}
                    </span>
                  </button>

                  {/* Red Bow Tie */}
                  <button
                    className={`accessory-card ${hasBowTie ? 'equipped' : ''}`}
                    onClick={() => setHasBowTie(!hasBowTie)}
                  >
                    <span className="accessory-emoji">🎀</span>
                    <span className="accessory-name">Red Bow Tie</span>
                    <span className="accessory-tag">
                      {hasBowTie ? <><Check size={12} /> Wearing</> : 'Wear'}
                    </span>
                  </button>

                  {/* Cool Sunglasses */}
                  <button
                    className={`accessory-card ${hasSunglasses ? 'equipped' : ''}`}
                    onClick={() => {
                      setHasGlasses(false);
                      setHasSunglasses(!hasSunglasses);
                    }}
                  >
                    <span className="accessory-emoji">🕶️</span>
                    <span className="accessory-name">Cool Shades</span>
                    <span className="accessory-tag">
                      {hasSunglasses ? <><Check size={12} /> Wearing</> : 'Wear'}
                    </span>
                  </button>

                  {/* Party Hat */}
                  <button
                    className={`accessory-card ${hasPartyHat ? 'equipped' : ''}`}
                    onClick={() => setHasPartyHat(!hasPartyHat)}
                  >
                    <span className="accessory-emoji">🎩</span>
                    <span className="accessory-name">Party Hat</span>
                    <span className="accessory-tag">
                      {hasPartyHat ? <><Check size={12} /> Wearing</> : 'Wear'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="wardrobe-section">
                <h4>Shirt Color</h4>
                <div className="color-palette-row">
                  {[
                    { color: '#5b6b55', name: 'Olive Green' },
                    { color: '#b91c1c', name: 'Ruby Red' },
                    { color: '#1d4ed8', name: 'Royal Blue' },
                    { color: '#18181b', name: 'Jet Black' },
                    { color: '#7e22ce', name: 'Plum Purple' },
                  ].map((item) => (
                    <button
                      key={item.color}
                      className={`color-chip ${clothingColor === item.color ? 'selected' : ''}`}
                      style={{ backgroundColor: item.color }}
                      title={item.name}
                      onClick={() => setClothingColor(item.color)}
                    >
                      {clothingColor === item.color && <Check size={14} color="#ffffff" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. How To Play Modal (Info button) */}
      {infoOpen && (
        <div className="modal-backdrop" onClick={onCloseInfo}>
          <div className="info-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={onCloseInfo} aria-label="Close info">
              <X size={18} />
            </button>
            <div className="info-header">
              <span className="info-badge">ℹ️</span>
              <h3>How to Play with Mimo</h3>
              <p>Just like the classic Talking Tom!</p>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-icon">👆</span>
                <div>
                  <strong>Poke Head</strong>
                  <p>Click his head to see him tilt and wobble!</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">🖐️</span>
                <div>
                  <strong>Tickle Tummy</strong>
                  <p>Click his belly to make him burst out laughing!</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">❤️</span>
                <div>
                  <strong>Pet Him</strong>
                  <p>Swipe or drag across his body to make him purr blissfully!</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">👟</span>
                <div>
                  <strong>Tap Feet</strong>
                  <p>Click his shoes to watch him hop with a boing!</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">🛍️</span>
                <div>
                  <strong>Paper Bag Prank</strong>
                  <p>Pop the paper bag with a loud surprise bang!</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">🎙️</span>
                <div>
                  <strong>Talking Tom Voice</strong>
                  <p>Turn on the mic or type to hear him repeat in his hilarious voice!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
