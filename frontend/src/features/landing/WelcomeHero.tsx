import React from 'react';
import { Play, Sparkles, Mic, MessageCircle, Palette, Shield, Heart } from 'lucide-react';

interface WelcomeHeroProps {
  onPlayNow: () => void;
  onOpenStudio: () => void;
  onOpenVoice: () => void;
  onOpenChat: () => void;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({
  onPlayNow,
  onOpenStudio,
  onOpenVoice,
  onOpenChat,
}) => {
  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 pt-20 pb-12 max-w-5xl mx-auto text-center">
      {/* Floating Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-pink-700 text-xs font-bold shadow-sm mb-6 animate-bounce-subtle">
        <Sparkles size={14} className="text-pink-500" />
        <span>Meet Mimo — Real-time 3D AI Virtual Pet Companion</span>
      </div>

      {/* Main Title */}
      <h1 className="font-fredoka text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 leading-tight mb-4">
        Your Adorable, Bouncy <br />
        <span className="bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
          3D AI Playmate
        </span>
      </h1>

      {/* Value Prop */}
      <p className="max-w-2xl text-base sm:text-lg text-slate-600 mb-8 leading-relaxed">
        Interact with Mimo in full 3D, record voice phrases with funny chipmunk pitch effects,
        chat with an affectionate AI playmate, and customize your companion with vibrant colors and accessories.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
        <button
          onClick={onPlayNow}
          className="flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-white font-bold text-base rounded-full shadow-xl shadow-pink-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Play size={20} className="fill-white" />
          <span>Enter Playroom & Play Now</span>
        </button>

        <button
          onClick={onOpenStudio}
          className="flex items-center gap-2 px-6 py-4 glass-panel text-slate-800 font-bold text-base rounded-full shadow-md hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Palette size={18} className="text-pink-500" />
          <span>Customize Avatar</span>
        </button>
      </div>

      {/* Core Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
        {/* Card 1 */}
        <div
          onClick={onPlayNow}
          className="p-6 rounded-3xl glass-panel hover:shadow-xl transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
            💖
          </div>
          <h3 className="font-fredoka text-lg font-bold text-slate-800 mb-1">
            Interactive 3D Reactions
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Pet Mimo's head, tickle its tummy, and tap its paws to trigger playful dances, giggles, and affection sparkles.
          </p>
        </div>

        {/* Card 2 */}
        <div
          onClick={onOpenVoice}
          className="p-6 rounded-3xl glass-panel hover:shadow-xl transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
            🎙️
          </div>
          <h3 className="font-fredoka text-lg font-bold text-slate-800 mb-1">
            Voice Repeat & Pitch Shifter
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Speak into your microphone and hear Mimo repeat your words with squeaky chipmunk and robot cartoon pitch effects.
          </p>
        </div>

        {/* Card 3 */}
        <div
          onClick={onOpenChat}
          className="p-6 rounded-3xl glass-panel hover:shadow-xl transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
            💬
          </div>
          <h3 className="font-fredoka text-lg font-bold text-slate-800 mb-1">
            Conversational AI & Lip-Sync
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Chat using text or voice! Mimo replies with cheerful character dialogue and synchronized mouth movements.
          </p>
        </div>
      </div>

      {/* Honest Transparency Footnote */}
      <div className="mt-12 p-3 bg-pink-50/70 border border-pink-100 rounded-2xl text-xs text-slate-500 flex items-center justify-center gap-2 max-w-xl">
        <Shield size={14} className="text-pink-500 shrink-0" />
        <span>
          100% playable locally without external API keys. Photo-to-3D neural generation requires optional backend provider configuration.
        </span>
      </div>
    </div>
  );
};
