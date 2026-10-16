import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Camera,
  Check,
  AlertCircle,
  Sparkles,
  X,
  Palette,
  Crown,
  Layers,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { PaletteTheme, AccessoryType, EnvironmentType, AvatarJobState } from '../../types';
import { uploadAvatarPhoto, pollAvatarStatus, deleteAvatarJob } from '../../lib/api';
import { soundEngine } from '../../lib/soundEngine';

interface AvatarStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPalette: PaletteTheme;
  currentAccessory: AccessoryType;
  currentEnvironment: EnvironmentType;
  onUpdateAppearance: (
    palette: PaletteTheme,
    accessory: AccessoryType,
    environment: EnvironmentType
  ) => void;
  image3dConfigured: boolean;
}

export const AvatarStudioModal: React.FC<AvatarStudioModalProps> = ({
  isOpen,
  onClose,
  currentPalette,
  currentAccessory,
  currentEnvironment,
  onUpdateAppearance,
  image3dConfigured,
}) => {
  const [activeTab, setActiveTab] = useState<'wardrobe' | 'photo3d'>('wardrobe');

  // Wardrobe state
  const [palette, setPalette] = useState<PaletteTheme>(currentPalette);
  const [accessory, setAccessory] = useState<AccessoryType>(currentAccessory);
  const [environment, setEnvironment] = useState<EnvironmentType>(currentEnvironment);

  // Photo-to-3D state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [jobState, setJobState] = useState<AvatarJobState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pollingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setPalette(currentPalette);
    setAccessory(currentAccessory);
    setEnvironment(currentEnvironment);
  }, [currentPalette, currentAccessory, currentEnvironment]);

  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      stopCamera();
    };
  }, []);

  const handleApplyWardrobe = () => {
    onUpdateAppearance(palette, accessory, environment);
    soundEngine.playFanfare();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMessage('Please upload a valid JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size must be 10MB or smaller.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const startCamera = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch {
      setErrorMessage('Camera access was denied or is unavailable.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera_avatar.jpg', { type: 'image/jpeg' });
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(blob));
        stopCamera();
      }
    }, 'image/jpeg');
  };

  const handleSubmitPhoto = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const res = await uploadAvatarPhoto(selectedFile);
      setJobState({
        job_id: res.jobId,
        status: res.status as 'queued' | 'processing' | 'succeeded' | 'failed',
        progress: 10,
        provider: 'meshy',
      });

      // Start polling
      pollingTimerRef.current = window.setInterval(async () => {
        try {
          const status = await pollAvatarStatus(res.jobId);
          setJobState(status);
          if (status.status === 'succeeded' || status.status === 'failed') {
            if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          }
        } catch {
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
        }
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Photo upload failed';
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteJob = async () => {
    if (jobState?.job_id) {
      await deleteAvatarJob(jobState.job_id);
    }
    setJobState(null);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-200/50 dark:border-pink-900/30 text-slate-800 dark:text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎨</span>
            <div>
              <h2 className="text-xl font-bold font-fredoka text-pink-600 dark:text-pink-400">
                Avatar Studio & Customizer
              </h2>
              <p className="text-xs text-slate-500">Style Mimo or create a personalized 3D model</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 my-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            onClick={() => setActiveTab('wardrobe')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'wardrobe'
                ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            👗 Wardrobe & Environment
          </button>
          <button
            onClick={() => setActiveTab('photo3d')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'photo3d'
                ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            📸 Photo to 3D Generation
          </button>
        </div>

        {/* Tab 1: Wardrobe */}
        {activeTab === 'wardrobe' && (
          <div className="flex-1 overflow-y-auto space-y-4 py-2">
            {/* Color Palette */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Palette size={14} /> Color Palette
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { id: 'bubblegum', label: 'Bubblegum', color: '#FF758C' },
                  { id: 'sunny', label: 'Sunny', color: '#FFB703' },
                  { id: 'mint', label: 'Mint', color: '#2EC4B6' },
                  { id: 'lilac', label: 'Lilac', color: '#A259FF' },
                  { id: 'coral', label: 'Coral', color: '#FF6B6B' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPalette(item.id as PaletteTheme)}
                    className={`flex flex-col items-center p-2 rounded-2xl border transition-all ${
                      palette === item.id
                        ? 'border-pink-500 ring-2 ring-pink-400/30 bg-pink-50 dark:bg-pink-950/40'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span
                      className="w-7 h-7 rounded-full shadow-inner mb-1"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[11px] font-bold">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accessories */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Crown size={14} /> Accessories
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { id: 'none', label: 'None', icon: '❌' },
                  { id: 'hat', label: 'Party Hat', icon: '🎉' },
                  { id: 'bow', label: 'Bowtie', icon: '🎀' },
                  { id: 'sunglasses', label: 'Shades', icon: '🕶️' },
                  { id: 'crown', label: 'Crown', icon: '👑' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setAccessory(item.id as AccessoryType)}
                    className={`flex flex-col items-center p-2.5 rounded-2xl border transition-all ${
                      accessory === item.id
                        ? 'border-pink-500 ring-2 ring-pink-400/30 bg-pink-50 dark:bg-pink-950/40 text-pink-600'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xl mb-1">{item.icon}</span>
                    <span className="text-[11px] font-bold">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Environments */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers size={14} /> Room Environment
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'playroom', label: '🧸 Cozy Playroom' },
                  { id: 'meadow', label: '🌸 Sunny Meadow' },
                  { id: 'galaxy', label: '🚀 Pastel Galaxy' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setEnvironment(item.id as EnvironmentType)}
                    className={`py-2.5 px-2 text-xs font-bold rounded-2xl border text-center transition-all ${
                      environment === item.id
                        ? 'border-pink-500 ring-2 ring-pink-400/30 bg-pink-50 dark:bg-pink-950/40 text-pink-600'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleApplyWardrobe}
              className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-pink-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Check size={18} />
              <span>Apply & Save Styling</span>
            </button>
          </div>
        )}

        {/* Tab 2: Photo to 3D */}
        {activeTab === 'photo3d' && (
          <div className="flex-1 overflow-y-auto space-y-3 py-2">
            {/* Privacy notice */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 rounded-2xl text-xs text-blue-700 dark:text-blue-300">
              <p className="font-bold flex items-center gap-1 mb-1">
                <Sparkles size={14} /> Privacy & Data Transparency
              </p>
              <p>
                Your photo is processed solely to build your 3D avatar mesh. It is never sold,
                shared, or used for biometric tracking, and you can delete it at any time with one click.
              </p>
            </div>

            {/* Provider availability honest card */}
            {!image3dConfigured && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-500" />
                <div>
                  <p className="font-bold">Image-to-3D Provider Setup Required</p>
                  <p className="mt-0.5">
                    To generate custom neural 3D meshes from photos, configure{' '}
                    <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded font-mono">
                      MESHY_API_KEY
                    </code>{' '}
                    in your backend environment. In the meantime, you can customize Mimo's appearance in the
                    Wardrobe tab!
                  </p>
                </div>
              </div>
            )}

            {/* Camera Viewport or Preview */}
            {isCameraActive ? (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <button
                  onClick={capturePhoto}
                  className="absolute bottom-3 px-4 py-2 bg-pink-500 text-white text-xs font-bold rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  Snap Photo 📸
                </button>
              </div>
            ) : previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-pink-200 dark:border-slate-700 aspect-video flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-pink-300 dark:border-slate-700 rounded-2xl hover:bg-pink-50/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <Upload size={24} className="text-pink-500 mb-2" />
                  <span className="text-xs font-bold">Upload Photo</span>
                  <span className="text-[10px] text-slate-400">JPG, PNG, WebP &le;10MB</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <button
                  onClick={startCamera}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-pink-300 dark:border-slate-700 rounded-2xl hover:bg-pink-50/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <Camera size={24} className="text-pink-500 mb-2" />
                  <span className="text-xs font-bold">Take Snapshot</span>
                  <span className="text-[10px] text-slate-400">Use browser webcam</span>
                </button>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <p className="text-xs text-red-500 font-semibold">{errorMessage}</p>
            )}

            {/* Job Status Banner */}
            {jobState && (
              <div className="p-3 bg-pink-50 dark:bg-slate-800 rounded-2xl border border-pink-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Generation Status: {jobState.status.toUpperCase()}</span>
                  <span>{jobState.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-pink-500 h-full transition-all duration-500"
                    style={{ width: `${jobState.progress}%` }}
                  />
                </div>
                {jobState.status === 'succeeded' && (
                  <p className="text-xs text-emerald-600 font-semibold">
                    🎉 Model ready! Note: Generated meshes preview as static models. Mimo remains your primary animated playmate.
                  </p>
                )}
                {jobState.status === 'failed' && (
                  <p className="text-xs text-red-500">
                    {jobState.error_message || 'Generation failed'}
                  </p>
                )}
                <button
                  onClick={handleDeleteJob}
                  className="flex items-center gap-1 text-[11px] text-red-500 hover:underline pt-1"
                >
                  <Trash2 size={12} />
                  <span>Delete photo & generation record</span>
                </button>
              </div>
            )}

            {selectedFile && !jobState && (
              <button
                onClick={handleSubmitPhoto}
                disabled={isUploading}
                className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-pink-500/25 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Sparkles size={18} />
                <span>{isUploading ? 'Submitting...' : 'Generate 3D Avatar'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
