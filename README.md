# Mimo

Mimo is a browser app with a locally rendered default human avatar, an optional Face to 3D flow for provider-backed photo generation, and automatic spoken phrase repeat in a talking room. It uses React, Three.js and FastAPI. Generated avatars are shown only after the backend reports successful generation and returns a valid model.

## Run locally

Backend (from `backend/`):

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Frontend (from `frontend/`):

```powershell
npm install
npm run dev
```

Open `http://localhost:5173` (or the configured Vite port). The Vite server proxies `/api` to port 8000.

## Human avatar generation

The room starts with a bundled GLB human avatar (`frontend/public/mimo-human.glb`). The local builder uses the supplied multi-view turnaround sheet to wrap front, profile, and back head and shirt crops around 3D meshes. The head and torso therefore retain distinct photographed views while orbiting; limbs, trousers, and shoes are modeled geometry with approximate materials. The original reference sheet is not copied into the repository or sent to a service by the builder. Recreate the asset offline with `npm run create:model -- "<path-to-multi-view-reference-sheet>"` from `frontend/`. The avatar idles, blinks, and animates its mouth during speech. If the GLB cannot load, the app shows a visible model-load error instead of presenting a demo character. Edit / Customize includes display name, supported appearance colors, room themes, reset-to-default, and **Face to 3D · Create avatar from photo**. The optional provider flow stays disabled until a verified provider is configured; the backend validates image extension, MIME type, file signature and size, and removes its temporary source photo after provider submission.

Copy `backend/.env.example` to `backend/.env`, then configure the real provider values. A Meshy adapter is present for the provider's general image-to-3D API:

```ini
APP_ENV="development"
IMAGE3D_PROVIDER="meshy"
MESHY_API_KEY="your-server-side-key"
HUMAN_AVATAR_PROVIDER_VERIFIED="True"
```

`HUMAN_AVATAR_PROVIDER_VERIFIED` is a deliberate operator gate. Meshy documents a general [Image to 3D API](https://docs.meshy.ai/en/api/image-to-3d) and a separate [Rigging API](https://docs.meshy.ai/en/api/rigging), which works best with clearly structured humanoid models. The current adapter only calls Image to 3D; it does not call the Rigging API or establish facial animation/viseme support. Do not enable the gate until you have reviewed the provider's capabilities and terms and verified that its output is suitable for this product. The current provider cannot guarantee a likeness or a facial rig from one photo. Never put provider keys in `VITE_*` variables. The backend deletes its temporary source-photo file immediately after provider submission; users can delete a generated model from the room settings. GLB download is limited to HTTPS provider and Amazon S3 hosts, capped at 250 MB, and checked for the GLB signature.

`IMAGE3D_PROVIDER="mock"` works only with `APP_ENV="test"`; it cannot be enabled as a normal development or production success path.

## Talking room behavior

The microphone is requested only after the user presses **Start talking**. Chrome and Edge commonly expose `SpeechRecognition` / `webkitSpeechRecognition`; support varies by browser and may depend on browser services. Unsupported browsers and microphone or recognition errors get a clearly labeled typed-text fallback. The app pauses recognition and stops its microphone stream while browser speech synthesis repeats each recognized phrase, then resumes listening. This repeats recognized text using a generic browser text-to-speech voice; it does not transform or preserve the user's voice. Speech recognition and synthesis are browser provided, and recognition may process audio according to browser settings. **Stop listening** aborts recognition, cancels synthesis, and stops the microphone stream.

Models without mouth morph targets can be viewed, but have no facial lip-sync. If a supported `mouthOpen`, `jawOpen`, or `viseme_aa` morph target exists, the viewer animates it during playback. The default model has a simple procedural mouth movement; it is not phoneme accurate. A personalized model can replace the default only after generation succeeds and the GLB loads.

## Checks

```powershell
# frontend/
npm run build
npm test

# backend/
python -m pytest tests -v
```

No API key is needed to run the checks. Backend tests explicitly select the mock provider under the test environment.
