import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Volume2, Trash2, X, Sparkles, Bot, AlertTriangle } from 'lucide-react';
import { ChatMessage, CharacterState } from '../../types';
import { sendChatMessage } from '../../lib/api';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerReaction: (reaction: CharacterState) => void;
  onAvatarTalk: (speaking: boolean) => void;
  soundEnabled: boolean;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  onTriggerReaction,
  onAvatarTalk,
  soundEnabled,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'mimo',
      text: "Yaaay, hello! I'm Mimo, your 3D cartoon virtual pet! What fun things do you want to talk about?",
      reaction: 'happy',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isDemo: true,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeProviderBadge, setActiveProviderBadge] = useState<{ isDemo: boolean; name: string }>({
    isDemo: true,
    name: 'Offline Demo Mode',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakText = (text: string) => {
    if (!soundEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.6; // cute higher pitch cartoon voice!
    utterance.rate = 1.1;

    utterance.onstart = () => onAvatarTalk(true);
    utterance.onend = () => onAvatarTalk(false);
    utterance.onerror = () => onAvatarTalk(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsSending(true);

    try {
      const response = await sendChatMessage(text);
      setActiveProviderBadge({
        isDemo: response.isDemo,
        name: response.isDemo ? 'Offline Demo Mode' : `Live AI (${response.provider})`,
      });

      const mimoMsg: ChatMessage = {
        id: `mimo-${Date.now()}`,
        sender: 'mimo',
        text: response.reply,
        reaction: response.reaction,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDemo: response.isDemo,
      };

      setMessages((prev) => [...prev, mimoMsg]);
      onTriggerReaction(response.reaction);
      speakText(response.reply);
    } catch (err: unknown) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'mimo',
        text: "Oopsie! My brain had a little hiccup, but I still love you! Let's try again! 💖",
        reaction: 'surprised',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDemo: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
      onTriggerReaction('surprised');
    } finally {
      setIsSending(false);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your message!');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        if (transcript) {
          setInputValue(transcript);
          handleSend(transcript);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl border-l border-pink-200/60 dark:border-slate-800 flex flex-col animate-slide-left">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-pink-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white text-lg shadow-md shadow-pink-500/20">
            🐾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold font-fredoka text-slate-800 dark:text-slate-100 text-lg">
                Chat with Mimo
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeProviderBadge.isDemo
                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300/40'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40'
                }`}
              >
                {activeProviderBadge.name}
              </span>
            </div>
            <p className="text-xs text-slate-500">Your kind, cheerful 3D companion</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setMessages([])}
            title="Clear Chat"
            className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages Viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-pink-100 dark:border-slate-700 rounded-bl-xs'
              }`}
            >
              <p className="leading-relaxed">{msg.text}</p>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isSending && (
          <div className="flex items-center gap-2 p-3 bg-pink-50 dark:bg-slate-800/60 rounded-2xl w-fit text-xs text-pink-600 dark:text-pink-400 animate-pulse">
            <Sparkles size={14} />
            <span>Mimo is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-pink-50 dark:border-slate-800">
        {[
          'Tell me a silly joke! 😂',
          'Do a victory dance! 💃',
          'What is your favorite snack? 🍰',
          'Sing a little song! 🎵',
        ].map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-pink-50 dark:bg-slate-800 text-pink-600 dark:text-pink-300 border border-pink-200/60 dark:border-slate-700 hover:bg-pink-100 dark:hover:bg-slate-700 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="p-3 border-t border-pink-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={startVoiceInput}
            title="Speech to Text"
            className={`p-2.5 rounded-full transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-pink-100 hover:text-pink-600'
            }`}
          >
            <Mic size={18} />
          </button>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message to Mimo..."
            maxLength={400}
            className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm rounded-full outline-none focus:ring-2 focus:ring-pink-400 border border-transparent transition-all"
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isSending}
            className="p-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full shadow-md shadow-pink-500/20 disabled:opacity-40 hover:scale-105 active:scale-95 transition-all"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
