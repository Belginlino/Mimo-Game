# CODEX MASTER PROMPT — Upgrade Existing Mimo into a Personalized Human 3D Avatar Talking Game

You are Codex working inside Visual Studio Code with access to the existing Mimo application repository. Act as a senior full-stack engineer, browser 3D graphics engineer, real-time audio engineer, AI/avatar integration engineer, product designer, security engineer, and QA engineer.

## THE ACTUAL PRODUCT I WANT

I do **not** want a cute animal, pet, mascot, or cartoon character. I want a **human-looking 3D avatar based on the user's own face**.

When the application opens, the very first experience must be an avatar creation/onboarding screen:
1. The user can upload a photo from their device OR open the camera and capture a photo.
2. The app previews the selected image and asks the user to confirm they want to use it.
3. The app sends the image to a configured, real image-to-3D human avatar provider through the backend.
4. The provider generates a human-like 3D model resembling the user as closely as the provider supports.
5. The app shows real generation progress and then loads the resulting human 3D avatar into the game.
6. If no provider is configured, explain that clearly and provide a functional setup path or a clearly labelled temporary preview/demo option. Never pretend a cartoon mascot or fake model is the user's generated human avatar.

After avatar creation, the user enters a full-screen “Talking Room”:
- The human 3D avatar is large, centered, properly framed, and visually prominent.
- The user can speak naturally into the microphone.
- The avatar repeats what the user said in a funny/altered playback voice, similar in broad interaction concept to a talking-back game.
- **There must not be a separate “Voice Repeat” button that the user has to press for each utterance.** The main interaction is automatic listening and repeating while the user has enabled the microphone.
- Show clear microphone/listening status and a stop/mute control, because the browser must not secretly record people.
- The avatar's mouth should move while repeating speech. Use a simple audio-amplitude-driven mouth animation if phoneme/viseme data is unavailable.
- Add only a small set of secondary interactions if they support the experience; do not let pet-care controls dominate the product.
- The current app has a cartoon turquoise character and a mostly empty screen. Replace the current core experience with this human-avatar journey while preserving useful code, project setup, and existing components that can be reused safely.

The application is currently running locally at `http://localhost:5174`. Update the existing repository in place. Do not create a separate unrelated demo, and do not merely return a plan.

## NON-NEGOTIABLE EXECUTION RULES

1. Inspect the current repository before changing code: package files, app routes/components, styling, Three.js/R3F setup, model assets, API services, backend, existing tests, and Git status if available.
2. Preserve useful existing work and working commands. Do not blindly overwrite files or rewrite unrelated areas.
3. Implement the changes directly in the current project. After a brief implementation checklist, continue coding without waiting for confirmation.
4. Use real APIs only when their current official documentation, request format, authentication and output format can be verified. Never invent endpoints, SDK methods, or provider capabilities.
5. Never claim that a real photo-to-human-3D generation works unless it is integrated and verified. If credentials or provider access are missing, implement the adapter, configuration, validation and honest unavailable state; continue making all other parts work.
6. Do not expose API keys in browser code. All provider secrets and provider API calls belong on the backend.
7. Run available lint/typecheck/tests/production build and fix errors. Report exact results; do not fabricate passing checks.
8. No dead buttons, fake progress, fake AI, fake “avatar generated” success, or placeholder UI presented as production functionality.
9. Do not use copyrighted Talking Tom/Angela assets, likenesses, branding, UI, or sounds. Use a human avatar provider or a licensed neutral human model for fallback.
10. Do not stop after describing the plan. Implement, verify, and document the outcome.

## 1. REQUIRED USER EXPERIENCE

### Screen A — First launch: “Create your human avatar”

This must be the default initial screen when no avatar exists. Do not start users directly in the old pet game.

Design a premium, welcoming avatar onboarding page with:
- Heading: “Create your 3D avatar”
- Supporting text: “Upload a photo or take a selfie to create your own human avatar.”
- Two prominent options:
  - “Upload a photo”
  - “Open camera”
- A clear photo preview after selection/capture.
- Retake, choose another photo, and remove photo actions.
- A “Create my avatar” button enabled only after a valid photo is selected and the user confirms.
- Short privacy disclosure explaining whether the photo is sent to an external avatar provider and that the user can delete it.
- Loading/progress screen with real task status from the backend: queued, processing, downloading, validating, ready, failed.
- Error details that are understandable and retryable.
- If provider configuration is absent, explain that real human 3D generation needs a configured API provider. Provide a link or instruction to configure it; do not quietly substitute the old cartoon character.
- Keep a “Try the sample human model” option only if an actual licensed human model exists in the repository or can be added lawfully. Label it as a sample, not the user's avatar.

#### Image input requirements
- Use `<input type="file" accept="image/*">` for file selection.
- Use `navigator.mediaDevices.getUserMedia({ video: ... })` only after the user explicitly clicks “Open camera.”
- Show a live camera preview and a capture button.
- Stop every camera media track when the camera closes, a photo is captured, the component unmounts, or an error occurs.
- Use a `video` element and canvas capture safely.
- Validate file type, size and image decode on the client, and validate again on the server.
- Show the image preview before upload; do not upload the photo until the user clicks “Create my avatar.”
- Support JPG, PNG and WebP where supported.
- Set a reasonable maximum upload size (for example, 10 MB), configurable if appropriate.
- Provide a helpful message if camera access is denied or unsupported.
- Do not log photo bytes or store uploaded images indefinitely.

### Screen B — Human avatar generation

The generated result must be a human-looking 3D model, not an animal, toy, blob, mascot, or cartoon pet.

Implementation requirements:
- Inspect existing backend and choose an image-to-human-3D provider that can produce human models from a single photo, if one can be verified and configured.
- Research/verify the provider's current official API docs and terms before integrating it if web access is available.
- Confirm whether the provider produces a rigged/animated human mesh, a static mesh, or both. Do not assume it automatically creates facial blend shapes or a skeleton.
- Isolate provider-specific logic in a backend adapter such as `HumanAvatarProvider`.
- Read provider API key, endpoint, model and settings from backend environment variables.
- Implement asynchronous generation jobs; the frontend should poll job status with bounded retry/backoff or use a verified event mechanism.
- Status should move through meaningful states. Do not show invented percentage progress unless the provider returns actual progress. If only status is available, use indeterminate progress with text.
- Validate provider result, download safely, verify allowed model format (prefer GLB/glTF), size and response type, and store in a controlled asset storage location.
- Avoid server-side request forgery: never let the client submit an arbitrary download URL for the backend to fetch. Only fetch URLs from the trusted provider response and validate host/scheme.
- If the model is static or incompatible with facial animation, still allow a valid 3D preview, but clearly report the limitation and use the best safe talking animation available.
- Add a camera-framing helper based on model bounds so different body/face model sizes appear correctly.
- Never claim exact likeness or guaranteed quality from a single image. Display the generated model as an AI approximation.

### Screen C — Talking Room (main game)

After a valid avatar is ready, transition to a full-screen talking room.

#### Visual design
- Full-viewport 3D scene with a tasteful studio/room environment, soft lighting, large but fully visible human avatar, floor/ground, subtle shadows and a well-framed camera.
- The human avatar should be the focal point and should occupy a substantial portion of the viewport. Use the actual model bounds to fit the camera; do not hardcode a scale that crops the face or body.
- Prefer a portrait/upper-body camera for the talking experience if the provider produces a full-body model. The face must be visible enough to understand the mouth movement.
- Add responsive camera framing for desktop and mobile.
- Keep the UI minimal and do not cover the avatar's face with panels.
- If no generated model exists, return to the onboarding flow or show a clearly labelled sample-human model only if one is genuinely available.
- Do not display the old turquoise cartoon pet in the main talking room.

#### Main controls
- A prominent microphone toggle: “Start talking” / “Stop listening” (or equivalent).
- A visible state indicator: microphone off, requesting permission, listening, processing speech, repeating, error.
- Optional mute/sound toggle.
- A small text status/subtitle area showing the recognized words or phrase being repeated, if speech recognition provides text.
- A reset/recreate-avatar option in settings.
- Do not include a separate “Repeat” button for every utterance.
- Do not auto-enable the microphone on page load. Browser security and privacy require explicit user action. Once the user clicks “Start talking,” listen and repeat subsequent utterances until the user stops listening or the session ends.

#### Automatic speech-repeat behavior
The target behavior is:
1. User explicitly clicks “Start talking” and grants microphone permission.
2. The app begins listening.
3. Detect a speech utterance using browser speech recognition where supported OR use a configured backend speech-to-text service.
4. When a phrase is finalized, automatically speak/replay it using a playful voice effect or configured text-to-speech voice.
5. Animate the avatar's mouth while audio plays.
6. Return to listening and repeat automatically until the user stops listening.
7. Handle silence, recognition restarts, unsupported browsers, permission denial, no speech, network failures and stop/start races.
8. Never play the user's microphone input directly back with a dangerous feedback loop. Prefer a final recognized phrase converted to speech, or record a bounded utterance and play it only after recording has stopped. Do not echo live microphone input through speakers.
9. Avoid endless repeat loops: synthesized speech must not be mistaken for new user speech. Prefer pausing/stopping recognition while the avatar is speaking, then resuming after playback finishes, or use a robust echo-cancellation strategy.
10. Provide a “Stop listening” control that immediately stops recognition, media tracks, pending audio and mouth animation.
11. Use a concise, clear privacy message: microphone access is active only after user permission and can be stopped at any time.

#### Important browser API design
- Detect `SpeechRecognition` / `webkitSpeechRecognition` at runtime; do not assume every browser supports it.
- If speech recognition is unavailable, provide a functional fallback:
  - Use `MediaRecorder` to capture a short utterance and stop after silence where technically feasible, then send it to a configured backend speech-to-text provider; OR
  - Clearly state that continuous automatic speech recognition is unsupported in this browser and provide a push-to-talk/typed fallback.
- Do not pretend the Web Speech API works universally.
- Speech synthesis through `speechSynthesis` may be used where supported. Use a generic voice and a suitable rate/pitch. A speech-synthesis pitch parameter is not guaranteed to sound like the user's voice.
- If using TTS text generated from recognized speech, the avatar repeats the words, not the exact original acoustic voice. Explain this accurately. If an actual recorded-voice transformation is implemented, label it accordingly.
- Do not implement voice cloning in this version.
- Add a configurable speech language setting if the existing app supports it; otherwise default sensibly and document how to change it.
- Add cleanup for recognition instances, timers, media streams, audio nodes, speech synthesis, and event listeners.

#### Mouth animation
- Prefer provider-provided visemes/blend shapes if present and verified.
- Otherwise implement a simple mouth-open/mouth-close animation synchronized to the playback lifecycle or audio amplitude.
- If the model has no mouth morph targets or facial rig, use a safe supported approximation (for example, animate a separate mouth mesh if the model structure allows it) and disclose the limitation.
- Do not claim phoneme-perfect lip-sync when only a simple talking animation is implemented.
- Ensure mouth animation stops immediately when playback stops.

### Screen D — Avatar settings
- Show avatar preview and model-generation status.
- Allow “Create a new avatar” to return to photo upload/camera capture.
- Allow user to delete the current avatar and associated stored asset.
- Keep only useful options such as voice pitch/speed, language if supported, and background theme.
- Do not keep pet-care UI such as feeding/treats/affection meters as the main product. The product is a human-avatar talking experience.

## 2. TECHNICAL IMPLEMENTATION

### First inspect the current app
Find the actual frontend framework, current 3D library, existing API client/backend, routes, styles, avatar assets and controls. Keep the current stack where reasonable. Do not blindly assume the repository exactly matches the previous prompt.

### Frontend
- Use the current React/Vite/TypeScript and Three.js/R3F stack if present.
- Build clean components for onboarding, camera capture, image preview, generation status, human model viewer, talking room, microphone state and settings.
- Use an explicit typed state machine for onboarding/generation/listening/recognizing/repeating/error.
- Prevent duplicate requests and race conditions.
- Use accessible labels, focus states, keyboard support and responsive layout.
- Handle all loading, empty, error and unavailable-provider states.
- Do not show fake progress or fake generation results.
- Keep API calls in a typed service module.

### Backend
- Inspect the current backend before adding one. If FastAPI exists, extend it. If not, add a minimal FastAPI service only if the repository architecture supports it.
- Use Pydantic schemas, safe error responses, timeouts and structured logs.
- Add endpoints similar to:
  - `GET /api/health`
  - `GET /api/avatar/provider-status` (only safe public status; no secrets)
  - `POST /api/avatar/generations` — accept validated image and create generation job
  - `GET /api/avatar/generations/{job_id}` — retrieve job status
  - `GET /api/avatar/{avatar_id}` — metadata and safe asset reference
  - `DELETE /api/avatar/{avatar_id}` — delete avatar and private assets
  - Optional speech-to-text endpoint only if a real configured provider is implemented
- Use background jobs for long-running generation.
- Keep provider API keys exclusively in backend environment variables.
- Validate file type using actual content/signature where possible, not only filename.
- Set upload limits and provider timeouts.
- Restrict CORS in production.
- Do not persist raw photos unnecessarily. Delete temporary source images after generation unless the user explicitly opts into storage.
- If the current app has no backend, keep the frontend usable with clear provider-not-configured states rather than pretending a backend exists.

### Provider integration
- Do not invent an API provider or endpoints.
- If web access is available, verify official current documentation for a provider that genuinely supports image-to-human-3D generation.
- Confirm accepted image formats, authentication, job status schema, model download schema, pricing/credits and licensing/usage restrictions.
- Implement the real adapter only from verified docs.
- If provider integration cannot be completed because credentials are missing, implement a provider interface and setup documentation. The app must report “Human avatar generation provider is not configured” rather than showing a fake generated avatar.
- Keep the provider replaceable through environment configuration.
- Add a mock provider only for automated tests and never enable it as a production success path.

### Environment and docs
- Update `.env.example` with placeholders for the chosen provider key and settings; never add real keys.
- Document setup, run commands, provider configuration, file retention, known model limitations, browser compatibility and exact tested flows.
- Do not expose secrets through a frontend `VITE_*` variable.

## 3. SECURITY AND PRIVACY

- The user must deliberately choose/capture and confirm a photo before upload.
- Request camera and microphone access only after the corresponding user action.
- Show a clear privacy notice before sending a face photo to an external provider.
- Stop camera/microphone tracks when no longer needed.
- Do not log photos, voice recordings, secrets or tokens.
- Use bounded uploads, safe file validation, rate limiting, timeouts and safe errors.
- Do not let a client-supplied arbitrary URL trigger backend downloads.
- Provide delete/reset controls and delete associated private assets.
- Do not add voice cloning or identity impersonation.
- Do not claim regulatory compliance without a real legal/security review.

## 4. TESTING AND ACCEPTANCE CRITERIA

Run and fix the relevant checks:
- Frontend lint/typecheck and production build.
- Backend unit tests and API tests if a backend exists.
- Photo upload validation tests: valid image, unsupported file, oversized image, decode failure.
- Generation status tests: queued, processing, ready, failed, provider not configured.
- Tests ensuring provider keys are never returned to public endpoints.
- Voice-state tests for start, recognition result, speaking, resume listening, stop, permission denial and unsupported API.
- Verify speech playback does not trigger an infinite recognition/replay loop.
- Verify stop listening immediately stops audio/recognition/animation.
- Verify responsive layout and human model camera framing at desktop and mobile sizes.
- Verify there is no cartoon pet in the primary avatar flow.
- Use mocks in tests; do not require paid API keys for the test suite.
- Do not claim tests passed unless they actually ran.

## 5. DEFINITION OF DONE

The upgrade is complete only when:
- The first screen asks the user to upload a photo or capture one with the camera.
- The intended avatar is a human-looking 3D model, not the turquoise pet or any animal/cartoon mascot.
- The app attempts genuine photo-to-human-3D generation when a verified provider is configured.
- If provider credentials are missing, it clearly says so and never fakes success.
- Once an avatar is available, the talking room fills the viewport and frames the human avatar well.
- After one explicit “Start talking” action, the app automatically repeats recognized phrases without requiring a separate repeat button each time.
- Recognition stops while synthesized speech plays, or another reliable approach prevents feedback loops.
- The mouth animates while the avatar speaks, within the model's capabilities.
- Stop listening reliably stops the microphone/speech loop.
- The UI handles browser support and permissions honestly.
- Existing useful code is preserved.
- Build/tests are run and results are reported accurately.

## 6. FINAL HANDOFF

When finished, report:
1. What changed in the existing codebase.
2. The actual root route/screen now shown on first launch.
3. Whether real image-to-human-3D generation is configured and verified; if not, exactly what provider configuration is missing.
4. How automatic speech repeat works, which browsers/APIs it relies on, and its limitations.
5. Exact run, lint, test and build commands and results.
6. Files changed and any remaining blockers.

**Now inspect the existing repository and implement this product update in place. Do not return only a plan, do not build another cartoon pet, and do not fake photo-to-human-3D generation.**
