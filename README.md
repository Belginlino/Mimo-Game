# Mimo — Your AI Playmate 🐾
### Real-Time 3D Interactive Virtual Pet Game with Voice Repeat & AI Chat

Mimo is an original, runnable browser-based 3D virtual pet game built with **React, Three.js (React Three Fiber), TypeScript, and Python FastAPI**. Users can interact with an adorable, animated 3D cartoon character, record voice phrases to hear funny transformed pitch effects (chipmunk, robot, deep voice), chat with an affectionate character AI, and style their companion or request personalized 3D avatar generation.

---

## 🌟 Major Features

1. **Playful 3D Character & Environment (React Three Fiber + Three.js)**
   - Original, procedural 3D cartoon mascot with articulated limbs, natural eye blinking, facial expressions (smile, laugh, surprised, sleepy), ear twitches, and particle reactions.
   - Interactive raycasted body hit-zones:
     - **Head Pat**: triggers affectionate purring chime, happy bouncing animation, and affection points.
     - **Tummy Tickle**: triggers giggling animation and sound effects.
     - **Paw Tap / Jump**: triggers bouncy hop-jump with procedural boing sound.
     - **Ear Wiggle**: triggers curious ear-twitch reaction.
   - Interactive action toolbar: *Pet Head*, *Tickle*, *Feed Treat*, *Dance*, *Jump*, *Cozy Nap*.
   - Dynamic 3D Room Environments: *Cozy Playroom*, *Sunny Meadow*, *Pastel Galaxy*.

2. **Voice Repeat Mode with Web Audio Pitch Shifter**
   - In-browser microphone audio recording using `MediaRecorder`.
   - Real-time animated canvas waveform visualizer.
   - Pitch shifting sound engine using Web Audio API:
     - 🐿️ **Cartoon Chipmunk** (1.48x pitch playback)
     - 🤖 **Robot Echo** (resonant bandpass filtering)
     - 🐻 **Deep Boomer** (0.72x deep pitch)
     - 🎵 **Normal Speed** (1.0x)
   - **Privacy First**: Voice audio is processed 100% locally in the browser and is never uploaded.

3. **Conversational AI Chat & Character Lip-Sync**
   - Natural language chat with Mimo's playful, kind virtual pet persona.
   - Dual-mode architecture:
     - **Live AI Mode**: Google Gemini (`gemini-1.5-flash`) or OpenAI (`gpt-4o-mini`) via backend adapters.
     - **Offline Demo Mode**: Rich local conversational playmate with contextual pattern matching and emotional reaction mapping—requires zero external API keys!
   - Speech-to-Text input via Web Speech API (`SpeechRecognition`).
   - Text-to-Speech playback via `SpeechSynthesis` with animated mouth movement during speech.
   - Transparent honesty badge showing `Offline Demo Mode` vs `Live AI`.

4. **Avatar Studio & Customizer**
   - Wardrobe styling: 5 candy color palettes (*Bubblegum, Sunny, Mint, Lilac, Coral*), 5 accessories (*Party Hat, Bowtie, Shades, Royal Crown, None*).
   - Camera snapshot & file drag-and-drop uploader (JPEG, PNG, WebP &le; 10MB) with client & server validation.
   - Asynchronous 3D generation job polling architecture with official **Meshy API** adapter.
   - Honest provider-unconfigured state: Explains setup requirements clearly without fake progress.

5. **Audio Engine & Game Progression**
   - Zero missing audio assets: Procedural sound effects synthesized entirely in code using Web Audio API oscillators (chimes, giggles, boings, purrs, yawns, fanfares).
   - Persistent affection, happiness, and energy tracking backed by SQLite.
   - Data privacy: User-controlled data reset and upload deletion endpoints.

---

## 🏗️ Repository Architecture

```text
/
├── frontend/
│   ├── src/
│   │   ├── components/         # Navbar, StatusBar, ActionToolbar
│   │   ├── features/
│   │   │   ├── game/           # MimoScene, MimoCharacter (3D procedural R3F)
│   │   │   ├── voice/          # VoiceRepeatModal (MediaRecorder + Web Audio)
│   │   │   ├── chat/           # ChatDrawer (AI dialogue + speech synthesis)
│   │   │   ├── avatar/         # AvatarStudioModal (styling + photo upload)
│   │   │   ├── settings/       # SettingsModal (audio, motion, privacy)
│   │   │   └── landing/        # WelcomeHero landing view
│   │   ├── lib/                # api.ts (typed client), soundEngine.ts (synthesizer)
│   │   ├── styles/             # index.css (tokens, glassmorphism, animations)
│   │   └── types/              # index.ts (TypeScript interfaces)
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── app/
│   │   ├── api/routes/         # health, config, chat, avatars, settings, progress
│   │   ├── core/               # config.py, database.py
│   │   ├── models/             # SQLAlchemy models (AvatarJob, UserSettings, GameProgress)
│   │   ├── schemas/            # Pydantic validation schemas
│   │   ├── services/
│   │   │   ├── ai/             # Gemini, OpenAI, Demo chat adapters
│   │   │   ├── avatar_generation/ # Meshy & Mock Image-to-3D adapters
│   │   │   └── storage/        # Local safe storage with path protection
│   │   └── main.py             # FastAPI entry point & CORS
│   ├── tests/                  # Pytest test suite (100% mocked, zero paid calls)
│   ├── requirements.txt
│   └── .venv/
├── .env.example                # Documented configuration template
└── README.md
```

---

## 🚀 How to Run Locally

### Prerequisites
- **Node.js**: v18+ (tested on v22.13.0)
- **Python**: v3.10+ (tested on v3.10.6)

### 1. Backend Setup & Run

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (if not already created)
python -m venv .venv

# Activate virtual environment
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# Linux / macOS:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI backend server (default port 8000)
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API docs will be available at: **http://127.0.0.1:8000/docs**

### 2. Frontend Setup & Run

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite dev server (default port 5173)
npm run dev
```
Open **http://localhost:5173** in your browser to meet Mimo!

---

## ⚙️ Environment Configuration

Copy `.env.example` to `backend/.env` to configure optional external services:

```ini
# AI Chat Provider ("demo", "gemini", or "openai")
AI_CHAT_PROVIDER="demo"
ENABLE_DEMO_FALLBACK="True"

# Optional: Google Gemini
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-1.5-flash"

# Optional: OpenAI
OPENAI_API_KEY="your-openai-api-key"
OPENAI_MODEL="gpt-4o-mini"

# 3D Avatar Generation ("mock" or "meshy")
IMAGE3D_PROVIDER="mock"
MESHY_API_KEY="your-meshy-api-key"
```

> **Security Note:** Secrets and API keys are stored strictly server-side. The public config endpoint (`GET /api/config/public`) reports safe booleans only (`chat_provider_configured: true/false`) and **never** leaks private API tokens to the browser.

---

## 🧪 Automated Testing & Verification

### Run Backend Tests (Pytest)
```bash
cd backend
.venv\Scripts\python -m pytest tests -v
```
**Results:** `9 passed in 0.24s`
- `test_health_endpoint` (HTTP 200, status "ok")
- `test_readiness_endpoint` (Database connection verified)
- `test_public_config_no_secrets` (Verified zero API keys or tokens leaked)
- `test_chat_interaction` (Verified responses and emotional reactions)
- `test_chat_empty_message_validation` (HTTP 422 on invalid payload)
- `test_avatar_invalid_extension` (HTTP 400 on disallowed extension)
- `test_avatar_valid_upload_and_status_poll` (Upload, status polling, and deletion)
- `test_game_progress_interaction` (Affection and happiness increment)
- `test_user_settings_persistence` (Preferences save & retrieval)

### Run Frontend Tests (Vitest)
```bash
cd frontend
npm test
```
**Results:** `4 passed in 0.19s`
- `SoundEngine Unit Tests`: Configuration updates, volume clamping within bounds.
- `Game State Transitions`: 8 character states validated.
- `Color Palettes`: Palette themes validated.
- `Progression Logic`: Interaction point calculations verified.

### Production Build Verification
```bash
cd frontend
npm run build
```
**Results:** Successful clean compilation with TypeScript `tsc` and Vite production bundling into `dist/`.

---

## 🔒 Security & Privacy Practices

- **Zero Tracking**: No analytics cookies or trackers.
- **Client-Side Voice Processing**: Voice recordings are processed in-memory using Web Audio API and discarded upon modal close. Audio is never transmitted to the server.
- **Upload Retention & Deletion**: Photo uploads are stored in an isolated storage directory with UUID filenames and size limits (10MB max). The `DELETE /api/avatars/{avatar_id}` endpoint enables instant, permanent deletion of images and models.
- **Path Traversal Protection**: Storage service enforces strict path containment checks before file operations.
- **Rate Limiting**: Backend applies sliding-window request throttling to chat and upload endpoints.

---

## 📋 Real vs Demo Capabilities Breakdown

| Feature | Local / Offline | Requires API Key |
| :--- | :--- | :--- |
| **3D Character Gameplay** | ✅ 100% Functional | None |
| **Touch Reactions & Hit Zones** | ✅ 100% Functional | None |
| **Voice Repeat & Pitch Shifting** | ✅ 100% Functional | None |
| **Procedural Sound Effects** | ✅ 100% Functional | None |
| **Conversational Chat** | ✅ Offline Demo Persona | Optional (`GEMINI_API_KEY` or `OPENAI_API_KEY`) |
| **Speech-to-Text & TTS** | ✅ Web Speech APIs | None |
| **Wardrobe & Customization** | ✅ 100% Functional | None |
| **Photo-to-3D Generation** | ⚠️ Mock mode for CI | `MESHY_API_KEY` (Official REST API) |

---

## 📄 License
MIT License. All assets, procedural geometries, and audio synthesize locally without copyrighted third-party media.
