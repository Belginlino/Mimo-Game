export type CharacterState =
  | 'idle'
  | 'happy'
  | 'laughing'
  | 'surprised'
  | 'jumping'
  | 'dancing'
  | 'sleeping'
  | 'talking';

export type PaletteTheme = 'bubblegum' | 'sunny' | 'mint' | 'lilac' | 'coral';

export type AccessoryType = 'none' | 'hat' | 'bow' | 'sunglasses' | 'crown';

export type EnvironmentType = 'playroom' | 'meadow' | 'galaxy';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'mimo';
  text: string;
  reaction?: CharacterState;
  timestamp: string;
  isDemo?: boolean;
}

export interface GameProgressState {
  affection: number;
  happiness: number;
  energy: number;
  interactionsCount: number;
  lastAction?: string;
}

export interface UserSettingsState {
  soundEnabled: boolean;
  soundVolume: number;
  reducedMotion: boolean;
  selectedPalette: PaletteTheme;
  selectedAccessory: AccessoryType;
  selectedEnvironment: EnvironmentType;
}

export interface PublicConfig {
  project_name: string;
  version: string;
  chat_provider: string;
  chat_provider_configured: boolean;
  image3d_provider: string;
  image3d_provider_configured: boolean;
  enable_demo_fallback: boolean;
  max_upload_size_bytes: number;
  allowed_image_types: string[];
}

export interface AvatarJobState {
  job_id: string;
  status: 'queued' | 'processing' | 'succeeded' | 'failed';
  progress: number;
  model_url?: string;
  error_message?: string;
  provider: string;
}
