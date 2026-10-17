# CODEX FIX PROMPT — Default Human Avatar + Face-to-3D in Edit Options

You are Codex working in the existing Mimo repository in VS Code. The app currently shows a blocking “Connect a human avatar provider” modal because no provider is configured. Fix this in the existing project, not in a separate demo.

## Required outcome
The app must work immediately without an external API key:
- On first launch, show a locally available default human-like 3D avatar.
- Do not show a blocking provider-setup modal during startup.
- The default avatar must be usable in the talking room with no provider credentials.
- Add a dedicated “Face to 3D” / “Create avatar from photo” feature inside Edit/Customize.
- The photo-to-3D feature must allow upload or camera capture, preview, confirmation, and real generation status.
- If a real provider is configured, send the confirmed photo through the backend and load the actual returned model.
- If no provider is configured, show setup instructions inline only after the user opens Face to 3D. Keep the default avatar working.
- Never pretend the default model was generated from the user's photo.

## 1. Default human avatar
Inspect the repository for an existing licensed local human GLB/GLTF asset. If one exists, use it and document its license. Otherwise, create an original procedural stylized human model with the existing Three.js/React Three Fiber setup. It must visibly read as a human: head, neck, torso, shoulders, arms, legs, hair, eyes, nose and mouth, with suitable proportions, clothing, materials and lighting. It must not be an animal, pet, robot, blob or floating sphere.

The default model must:
- Load without network access and without API keys.
- Have a front-facing pose with the face clearly visible.
- Be centered and correctly framed using model bounds; do not crop the head/body.
- Include idle movement, blinking and a basic talking-mouth animation where feasible.
- Have a fallback/error boundary so provider or model errors never crash the app.
- Be labelled honestly as “Default human avatar” until a personalized model is successfully generated.

Do not hotlink unknown assets or use copyrighted Talking Tom/Angela assets.

## 2. Remove the blocking modal
- A missing optional provider must never block startup or the talking room.
- Make provider readiness checks non-fatal.
- Move setup instructions into Edit/Customize > Face to 3D, or Settings > Avatar Provider.
- If provider configuration is missing, show a compact inline message and exact setup steps. Do not upload the photo until the provider is ready.
- Keep the default avatar available after any generation failure.

## 3. Add Face to 3D under Edit/Customize
Implement this actual flow:
1. User opens Edit/Customize.
2. Selects “Face to 3D” / “Create avatar from photo.”
3. Uploads a photo or explicitly opens the camera.
4. Sees preview, retake/change/remove options.
5. Reads a short privacy notice and explicitly confirms.
6. If provider is configured, submit the image to the backend.
7. Show real queued/processing/ready/failed status; do not invent percentage progress.
8. On successful generation, validate and load the returned GLB/glTF, then provide “Use this avatar.”
9. If provider is not configured, show inline instructions and do not upload the photo.
10. Include Cancel, Retry and Use default avatar actions.

Camera requirements:
- Request camera permission only after a button click.
- Stop all camera tracks on capture, close, error or unmount.
- Validate image type, size and image decoding on client and server.
- Do not log or retain source photos unnecessarily.

## 4. Honest provider integration
Inspect the existing backend/provider adapter. Verify current official documentation if web access is available; do not invent endpoints or assume a generic image-to-3D API guarantees human likeness, facial animation or rigging.
- Keep API keys on the backend only; never use frontend `VITE_*` secrets.
- Use asynchronous generation jobs where needed.
- Validate output type, size, loadability and available rig/morph metadata.
- Return a typed `provider_not_configured` state when missing.
- Never fabricate successful generation or pretend a sample is personalized.
- Add verified setup details to `.env.example` and README.

## 5. Edit/customize options
Add real, functional controls:
- Choose Default human or a successfully generated personalized model.
- Edit avatar display name.
- Supported skin/hair/clothing color presets if the model actually supports them.
- Background/room theme.
- Face to 3D photo upload/camera flow.
- Reset to default avatar.
- Persist settings locally or through the existing backend.
Do not display controls that do nothing.

## 6. Talking room
- Show the default human avatar immediately.
- Preserve automatic voice repeat: user presses Start Talking once; each recognized phrase is repeated automatically until Stop Listening.
- Pause recognition while TTS plays, then resume to prevent feedback loops.
- Animate the mouth during playback where model capabilities permit.
- Face-to-3D provider setup must not be required for voice repeat.
- Handle unsupported browser speech APIs honestly.
- Stop recognition, audio, media tracks and animation when stopped.

## 7. Engineering and testing
- Inspect and preserve existing code; do not rewrite unrelated areas.
- Use typed state for avatar source, provider status, generation status and errors.
- Clean up camera/microphone streams, audio nodes, listeners, timers, object URLs and WebGL resources.
- No dead buttons, fake progress or fake success.
- Test: fresh launch without API keys; default model loads; missing provider does not crash; Edit/Customize and Face to 3D work; photo/camera preview; no upload when provider is missing; successful configured provider model loads only after success; generation failure preserves default model; talking loop stops reliably.
- Run available tests, lint/typecheck and production build, fix failures, and report exact results. Do not claim tests passed unless they ran.

## Final handoff
Explain why the modal appeared, whether the default avatar is a local procedural model or licensed asset, how to configure real Face to 3D generation, and exact build/test results.

Now implement this in the existing repository. Priority: **default human avatar works immediately; Face to 3D is in Edit/Customize; missing provider never breaks the app; personalized generation is never faked.**
