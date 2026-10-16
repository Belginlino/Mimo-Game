import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, RotateCcw, Volume2, AlertCircle, Sparkles, X } from 'lucide-react';
import { soundEngine } from '../../lib/soundEngine';

interface VoiceRepeatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarTalk: (speaking: boolean) => void;
}

type PitchPreset = 'chipmunk' | 'robot' | 'deep' | 'normal';

export const VoiceRepeatModal: React.FC<VoiceRepeatModalProps> = ({
  isOpen,
  onClose,
  onAvatarTalk,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pitchPreset, setPitchPreset] = useState<PitchPreset>('chipmunk');
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    return () => {
      stopPlaying();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const startRecording = async () => {
    setPermissionError(null);
    setAudioBlob(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Determine supported MIME type
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
        else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
        else mimeType = '';
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      // AudioContext & Analyser for visualizer
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      drawWaveform();

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setAudioBlob(finalBlob);
        stream.getTracks().forEach((track) => track.stop());
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };

      recorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= 15) {
            stopRecording();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Microphone access denied.';
      setPermissionError(msg);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      analyserRef.current?.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = `rgb(${255}, ${117 - dataArray[i] * 0.2}, ${140})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
        x += barWidth;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
  };

  const playTransformedAudio = async () => {
    if (!audioBlob) return;
    stopPlaying();

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      currentSourceRef.current = source;

      // Apply pitch shift transformation
      let rate = 1.45;
      if (pitchPreset === 'chipmunk') rate = 1.48;
      else if (pitchPreset === 'deep') rate = 0.72;
      else if (pitchPreset === 'normal') rate = 1.0;
      else if (pitchPreset === 'robot') rate = 1.15;

      source.playbackRate.value = rate;

      // If robot mode, add resonant bandpass filter
      if (pitchPreset === 'robot') {
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 5.0;
        source.connect(filter);
        filter.connect(ctx.destination);
      } else {
        source.connect(ctx.destination);
      }

      setIsPlaying(true);
      onAvatarTalk(true);

      source.onended = () => {
        setIsPlaying(false);
        onAvatarTalk(false);
      };

      source.start();
    } catch (e) {
      console.error('Audio playback error', e);
      setIsPlaying(false);
      onAvatarTalk(false);
    }
  };

  const stopPlaying = () => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch {}
      currentSourceRef.current = null;
    }
    setIsPlaying(false);
    onAvatarTalk(false);
  };

  const playDemoSample = () => {
    soundEngine.playGiggle();
    onAvatarTalk(true);
    setTimeout(() => onAvatarTalk(false), 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-200/50 dark:border-pink-900/30 text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎙️</span>
            <div>
              <h2 className="text-xl font-bold font-fredoka text-pink-600 dark:text-pink-400">
                Voice Repeat Mode
              </h2>
              <p className="text-xs text-slate-500">Record a phrase & hear Mimo's funny voice!</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopPlaying();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Privacy Note */}
        <div className="my-3 px-3 py-2 bg-pink-50 dark:bg-pink-950/40 rounded-xl text-xs text-pink-700 dark:text-pink-300 flex items-center gap-2">
          <Sparkles size={14} className="shrink-0 text-pink-500" />
          <span>Your voice is processed 100% locally in your browser and is never uploaded.</span>
        </div>

        {/* Waveform Visualizer */}
        <div className="relative h-28 my-4 rounded-2xl bg-gradient-to-b from-pink-50 to-pink-100/60 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center overflow-hidden border border-pink-200/60 dark:border-slate-700">
          <canvas ref={canvasRef} width={340} height={100} className="w-full h-full" />
          {!isRecording && !audioBlob && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
              <Mic size={28} className="mb-1 text-pink-400 opacity-60" />
              <span>Tap the microphone to start recording</span>
            </div>
          )}
          {isRecording && (
            <div className="absolute top-2 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>REC 0:{recordingDuration.toString().padStart(2, '0')}</span>
            </div>
          )}
        </div>

        {/* Permission Error State */}
        {permissionError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl text-xs text-red-600 dark:text-red-300 flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Microphone unavailable</p>
              <p>{permissionError}</p>
              <button
                onClick={playDemoSample}
                className="mt-2 text-xs font-bold text-pink-600 underline hover:text-pink-700"
              >
                Play built-in demo giggle instead!
              </button>
            </div>
          </div>
        )}

        {/* Pitch Effect Selector */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
            Voice Effect
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'chipmunk', label: '🐿️ Chipmunk' },
              { id: 'robot', label: '🤖 Robot' },
              { id: 'deep', label: '🐻 Deep' },
              { id: 'normal', label: '🎵 Normal' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPitchPreset(p.id as PitchPreset)}
                className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all text-center ${
                  pitchPreset === p.id
                    ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-500/25'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center justify-center gap-4 py-2">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-full shadow-lg shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Mic size={20} />
              <span>Record Voice</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-3.5 bg-red-600 text-white font-bold rounded-full shadow-lg shadow-red-500/30 hover:scale-105 active:scale-95 transition-all animate-bounce"
            >
              <Square size={18} />
              <span>Stop Recording</span>
            </button>
          )}

          {audioBlob && !isRecording && (
            <>
              <button
                onClick={isPlaying ? stopPlaying : playTransformedAudio}
                className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold rounded-full shadow-lg shadow-amber-400/30 hover:scale-105 active:scale-95 transition-all"
              >
                {isPlaying ? <Square size={18} /> : <Play size={18} />}
                <span>{isPlaying ? 'Stop' : 'Replay Voice'}</span>
              </button>

              <button
                onClick={() => {
                  stopPlaying();
                  setAudioBlob(null);
                }}
                title="Discard recording"
                className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
