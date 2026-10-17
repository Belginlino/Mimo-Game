# CODEX CORRECTION PROMPT — Mimo Personal Human Avatar + Automatic Talking

You are Codex inside VS Code with access to the existing Mimo repository. The current app is wrong: it shows a generic sample human, the label “ORIGINAL 3D HUMAN SAMPLES,” status cards, preset chips (“Kind words,” “Celebrate,” “Quick question,” “Chat”), and one microphone button. Do not merely redesign this screen. Correct the existing app in place.

## Actual product
I want a personalized human-looking 3D avatar created from the user's own photo. No animal, pet, mascot, or cartoon character.

First launch must show:
1. Upload a photo OR open camera and take a selfie.
2. Preview, retake/change/remove image.
3. Show a clear privacy notice.
4. User explicitly confirms “Create my avatar.”
5. Send that photo to a real configured image-to-3D HUMAN avatar provider through the backend.
6. Show genuine job states (queued/processing/ready/failed).
7. Only after successful generation, load the returned human 3D model into the Talking Room.

If the provider/API key is missing, show a clear setup-needed message. Never present a generic sample model as if it was created from the user's photo. A sample model may only appear as a clearly labelled optional sample, not as the main product.

## Automatic talking behavior
After a generated avatar is ready, show a full-screen talking room with the human avatar large and well-framed. The user clicks “Start talking” once and grants microphone permission. Then the app must automatically:
- Listen for speech.
- Detect/finalize each phrase.
- Repeat it using a generic playful TTS voice or implemented audio effect.
- Animate the avatar's mouth during playback.
- Pause/stop recognition while the avatar speaks to prevent an infinite echo loop.
- Resume listening after playback until the user presses “Stop listening.”

There must be NO separate repeat button for each phrase and no microphone auto-start on page load. “Stop listening” must immediately stop recognition, media tracks, audio playback, and mouth animation. Explain honestly that TTS repeats recognized words in a generic voice; it does not reproduce the user's exact original voice. Do not add voice cloning.

## UI changes required
Remove these from the primary experience:
- “ORIGINAL 3D HUMAN SAMPLES”
- Generic human sample presented as the user's avatar
- “Kind words,” “Celebrate,” “Quick question,” “Chat” preset chips
- Pet-like energy/connection gameplay UI that distracts from the core product

Create two clear stages:
### Stage A — Create your avatar
- Prominent Upload Photo and Open Camera buttons.
- Camera preview with capture/retake; request permission only after user action.
- Preview and explicit confirmation before upload.
- Client/server image type and size validation.
- Stop camera tracks on capture, close, error, and unmount.
- Real generation status and retryable errors.
- Clear privacy disclosure and deletion behavior.

### Stage B — Talking Room
- Immersive full-screen 3D room.
- The generated personal human model is the focal point, centered and correctly framed.
- Minimal Start Talking/Stop Listening, sound/mute, recreate-avatar and settings controls.
- Listening/processing/repeating/error status and optional transcript.
- No generic sample gallery or unrelated preset interaction chips.

## Critical engineering instructions
1. Inspect the current repository, app routes, frontend framework, 3D setup, current model assets, backend/provider code, and tests before modifying anything.
2. Preserve useful existing work; update the current project, do not create a disconnected demo.
3. Determine why the current app shows a generic sample and fix the actual flow/data source.
4. Verify the chosen image-to-human-3D provider against current official documentation if web access is available. Do not invent endpoints, SDK calls, capabilities, pricing, or output formats.
5. Keep provider API keys on the backend only. Never expose secrets in frontend code or `VITE_*` variables.
6. Implement a provider adapter and async job lifecycle. Validate returned GLB/glTF content, size, type, and compatibility. Do not fetch arbitrary client-provided URLs from the backend.
7. If credentials are missing, show “Human avatar generation is not configured yet” and document the exact environment variables/setup. Do not fake success or fake progress.
8. Do not promise perfect likeness from one image. Verify whether the provider returns a rigged model, static mesh, morph targets, or visemes. Handle limitations honestly.
9. Use model bounds (Box3 or equivalent) to fit the camera. Do not hardcode scale so the face/body gets cropped. Prefer face/upper-body framing for the talking experience.
10. Detect `SpeechRecognition` / `webkitSpeechRecognition` at runtime. Browser support varies. If unsupported, provide a clearly labelled typed or configured speech-to-text fallback; do not pretend continuous recognition works.
11. Handle permission denial, no speech, network errors, recognition restarts, page hidden, stop/start races, and TTS cancellation.
12. Pause recognition during playback or otherwise prevent the avatar hearing itself and causing endless repeat loops.
13. Use browser speech synthesis or a verified configured TTS provider. Use a generic voice; no voice cloning.
14. Use provider-provided visemes if available; otherwise implement a simple honest mouth animation during playback if the model supports it. Stop animation when audio ends.
15. Reuse the current backend if present. If FastAPI exists, extend it rather than creating another service. Add/adjust endpoints such as `POST /api/avatar/generations`, `GET /api/avatar/generations/{job_id}`, `GET /api/avatar/{avatar_id}`, and `DELETE /api/avatar/{avatar_id}` as appropriate.
16. Add upload limits, file signature validation where possible, timeouts, safe errors, CORS configuration, rate limits, minimal retention and deletion controls. Do not log photos, recordings or secrets.
17. Keep the current stack where reasonable (React/Vite/TypeScript/Three.js/R3F if present). Do not introduce Unity into this browser app.
18. No dead buttons, placeholder success, fake AI, fake generation progress, or unsafe HTML injection.
19. After implementing, run available lint, typecheck, tests, and production build; fix failures. Do not claim checks passed unless they ran.

## Acceptance tests
- No saved valid generated avatar: first screen is photo upload/camera onboarding.
- Camera permission is only requested after click; tracks are cleaned up.
- Invalid/oversized images are rejected.
- Selected photo is submitted to the configured provider.
- Missing provider config produces a clear unavailable state, not a fake avatar.
- The generated result model, not a hardcoded sample, loads after success.
- One Start Talking action enables repeated phrases until Stop Listening.
- Recognition pauses during avatar speech and resumes afterwards.
- No infinite echo/repeat loop.
- Stop Listening cancels microphone/recognition/audio/animation.
- Primary UI has no old preset conversation chips or generic-sample-first layout.
- Provider secrets never reach the frontend.
- Run and report exact build/test commands and results.

## Final handoff
Report why the previous app showed a generic sample, files changed, whether real photo-to-human-3D generation is configured and verified, speech API/browser limitations, commands and test results, and remaining blockers.

Now inspect and correct the existing repository. Do not return only a plan, and do not create another UI mockup. The priority is: user's photo → real human 3D avatar → automatic talking repeat.
