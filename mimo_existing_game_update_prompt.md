# MIMO — EXISTING GAME UPGRADE PROMPT
## Turn the current prototype into a polished, full-screen personalized 3D AI virtual pet game

Act as a senior browser-game engineer, Three.js/React Three Fiber specialist, product designer, UI/UX designer, animation engineer, audio engineer, accessibility specialist, and QA engineer.

I already have an existing Mimo project running locally at `http://localhost:5174`. The current screenshot shows:
- A tiny turquoise 3D character and a small ground/platform near the top center.
- A large mostly empty pink/cream gradient background.
- A compact floating header at the top-left with Mimo branding and Home, Voice Repeat, Chat, Styling, sound, and settings controls.
- A small row of interaction buttons at the bottom-left: Pet Head, Tickle, Feed Treat, Dance, Jump, Nap.

The current game is NOT yet the experience I want. Upgrade the existing project in place. **Do not just give me advice, a design description, or a mockup. Inspect the codebase, implement the changes, run the app/build/tests, and fix issues.**

The goal is a beautiful, responsive, immersive, full-screen browser game where the character is the focus and the user can play, speak, personalize an avatar, and chat with it.

## 1. Critical first step: inspect before changing

1. Inspect the current repository, running app structure, package.json, components, styles, Three.js/React Three Fiber setup, character model, animation logic, and existing button handlers.
2. Identify why the 3D scene appears tiny and why the viewport is mostly empty. Check canvas sizing, parent/container height, camera position/FOV, camera target, model bounding box/scale, platform size, CSS layout, and overflow.
3. Preserve and improve existing working functionality. Do not replace the entire project with a static design or delete useful features.
4. Make changes directly in the existing project. Do not create a separate disconnected demo.
5. After inspecting, implement immediately. Do not stop after reporting a plan.

## 2. Main visual goal

Make Mimo feel like a polished mobile-quality virtual pet game in the browser, not a web dashboard with a tiny 3D model.

### Full-screen game scene
- The game viewport must occupy nearly all available space below/behind the floating top navigation. The 3D character should be the clear visual focus.
- Fix the current tiny scene. Make the character large enough to be recognizable and expressive at normal desktop resolution, roughly 35–55% of viewport height depending on the model and screen. It must remain fully visible, not cropped at the head or feet.
- Center the character horizontally and place it around the visual center of the usable game area, leaving room for the header and bottom interaction dock.
- Correct camera framing dynamically for desktop, tablet, and mobile. Use the actual model bounds when possible. Do not solve the issue by arbitrarily increasing scale until the character is clipped.
- Ensure the canvas and all parents have correct `width: 100%`, `height: 100%`, `min-height: 0`, and positioning. Remove unintended margins and fixed tiny canvas dimensions.
- Keep the environment visually intentional: a large ground/platform or small cozy playroom/garden, soft shadows if performant, subtle decorative objects, gentle background gradients, and depth. Avoid a tiny floating disc in an otherwise empty screen.
- Use responsive camera position/FOV and resize handling. Verify at 1920×1080, 1366×768, tablet portrait, and mobile portrait dimensions.
- Keep the character and all interactive controls visible without horizontal scrolling.
- Add subtle background motion or environmental details only if performance remains good. Do not add distracting particles everywhere.

### Visual direction
- Original, cute, colorful 3D virtual-pet aesthetic with polished game UI.
- Keep the existing Mimo identity, but refine typography, spacing, shadows, borders, colors, and interaction states.
- Use a warm, friendly palette with turquoise/teal character accents, coral, lavender, cream, and soft blue accents.
- UI must feel cohesive and intentionally designed, with proper hierarchy, consistent icon sizing, tooltips or labels, and visible focus states.
- Avoid the current tiny cramped controls. Give buttons sufficient spacing and usable hit targets.
- Avoid covering the character with panels. Use floating translucent/pill-shaped controls and compact collapsible panels.
- Support reduced-motion preferences and smaller screens.

## 3. Game screen layout

Implement a layout with these regions:

### A. Top navigation
- Left: Mimo logo/wordmark and small tagline “Your AI Playmate”.
- Main navigation: Play, Voice, Chat, Style.
- Right: sound toggle, settings.
- On narrow screens, collapse navigation into an accessible compact menu while keeping the main game visible.
- Clearly indicate the active mode.
- Every button must perform its stated action; no decorative dead controls.

### B. Character status area
Place a compact floating status widget near a corner, not over the character's face:
- Character name (editable, default “Mimo”).
- Happiness/affection meter.
- Energy meter.
- Optional short contextual message such as “Mimo is excited to see you!”
- Status values must update from actual game interactions, not random numbers that change without cause.
- Add a “reset progress” action in settings with confirmation.

### C. Main character scene
- Render the character large and centrally framed.
- The character should have an idle animation and respond visibly to interactions.
- If the current model supports animations, inspect and reuse them correctly.
- If it does not, implement procedural reactions through safe transforms (body bounce, head tilt, blink, mouth/eye changes) rather than showing inert buttons.
- Use an explicit state machine such as `idle`, `happy`, `surprised`, `laughing`, `jumping`, `dancing`, `sleeping`, `talking`, and `eating`.
- Avoid overlapping conflicting animations. Interactions should transition predictably and return to idle.
- Add a short speech/reaction bubble near the character for selected actions, with brief original phrases.
- Add subtle feedback for successful interactions, such as a small heart or sparkle, without overwhelming the scene.
- Add sound effects only when sound is enabled, and provide safe fallbacks if assets are missing.

### D. Bottom interaction dock
Replace the tiny cramped bottom-left button strip with a polished, responsive bottom dock centered near the bottom of the game area:
- Pet
- Tickle
- Treat
- Dance
- Jump
- Sleep/Nap
- Talk
- Optional More menu for additional actions
- Use icon + short label on desktop; on mobile use compact icons with accessible labels and horizontal scroll or a tidy two-row layout.
- Buttons must have appropriate hit targets, hover/focus/pressed/disabled states, and short tooltips where useful.
- Each action must visibly affect the character and update a relevant status value.
- Keep the dock clear of the browser safe area on mobile and do not obscure the character's feet excessively.
- Ensure the dock does not extend outside the viewport.

### E. Mode panels
The top navigation should open functional panels/drawers without destroying the game scene.

**Voice panel**
- Start/stop recording with explicit microphone permission.
- Show recording status, elapsed time and playback controls.
- Record a short phrase and replay it with a funny pitch/voice effect using Web Audio where supported.
- Local repeat must work without uploading the recording to a backend.
- Add discard/re-record and mute controls.
- Handle denied permissions, unsupported APIs, empty recordings and errors gracefully.
- Do not claim to clone the user's voice. Use local audio effects for this feature.

**Chat panel**
- A polished chat drawer/panel with message bubbles, input, send button, pending state and retry.
- Text chat should remain usable without microphone support.
- Use the existing FastAPI/AI integration if present. Inspect current configuration before modifying it.
- If no real provider is configured, label local sample responses as “Demo mode”; do not pretend they are live AI responses.
- When a real AI provider is configured, route requests through the backend and never expose API keys in the frontend.
- Use a friendly, playful, concise original Mimo personality.
- Add clear conversation reset and safe rendering of messages.

**Style panel**
- Working options for character color/palette where technically supported, environment/background theme, and available accessories/outfits.
- Only show an option if it truly changes the model or scene.
- Save selected settings locally or through the existing backend.
- If the model cannot change outfits, implement real supported alternatives such as environment color and character palette, and label unsupported customization honestly.
- Keep the default style cute and polished.

**Settings panel**
- Sound toggle, reduced-motion setting, privacy information, delete/reset options, and available language options if already supported.
- Do not add fake switches that have no effect.
- Ask for confirmation before destructive reset/delete actions.

## 4. Fix the 3D camera, model and rendering correctly

The most visible current issue is the tiny character/scene. Diagnose the cause rather than guessing.

1. Inspect the loaded model dimensions and origin. Use `Box3` or equivalent bounds measurement where appropriate.
2. Confirm the model is not nested under an unexpectedly scaled parent.
3. Check camera position, target, FOV, near/far planes, orthographic-vs-perspective configuration, and whether the model sits outside the camera's intended target.
4. Fit the camera to the model bounds with suitable padding. If using perspective camera, derive a safe camera distance from model size and FOV; recalculate on viewport resize where needed.
5. Ensure the character's feet rest on the ground plane and the camera target is aligned to the character's torso/center of mass.
6. Make the floor/platform large enough to read as a real environment, with appropriate perspective and lighting.
7. Use proper renderer settings and color management for a pleasant result, without unnecessarily expensive post-processing.
8. Add an error boundary and a fallback character if the model fails to load.
9. Verify canvas parent sizing and avoid CSS rules that collapse the canvas.
10. Avoid continuously rerendering expensive effects when the tab is hidden or reduced motion is enabled, where practical.

If the existing character model is broken or unsuitable, do not hotlink a random asset. Use a locally available licensed model if one exists; otherwise improve the existing character or create an original stylized procedural character. Do not use Talking Tom or other copyrighted character assets.

## 5. Functional requirements

All existing and new controls must be tested:
- Home/Play navigates to the game view.
- Voice opens the voice panel and supports record, stop, playback, discard.
- Chat opens chat and can submit a message.
- Style opens customization and applies real settings.
- Sound toggles all applicable game audio.
- Settings opens the settings panel.
- Pet, Tickle, Treat, Dance, Jump and Nap each trigger different visible character reactions.
- Character status updates consistently.
- Chat pending/error/retry states work.
- Camera/microphone permission failures show useful guidance.
- Layout adapts to resizing and orientation changes.
- No buttons are inert.
- No runtime errors, missing imports, unhandled promise rejections, or console errors are left in key flows where the environment allows checking.

## 6. Engineering requirements

- Keep the existing stack and conventions when reasonable.
- If the current app uses React + Vite + TypeScript + Three.js/R3F, continue using it.
- Do not add Unity to the browser app.
- Reuse current API services and components where appropriate.
- Use TypeScript types for character states, action definitions, settings and API responses.
- Keep game state in a predictable source of truth.
- Avoid duplicating state across unrelated components.
- Clean up event listeners, animation loops, audio nodes, media tracks and object URLs on unmount/stop.
- Add sensible error boundaries and loading/error states.
- Use accessible button semantics and labels.
- Keep performance acceptable on common laptops and mobile devices.
- Do not add dependencies unless needed. Check the installed versions and APIs.
- Do not rewrite unrelated parts of the application.

## 7. Testing and verification

After implementation:
1. Run the existing project tests, if any.
2. Run lint and TypeScript checks, if configured.
3. Run the production build.
4. Start the application using the correct existing command.
5. Use browser preview/automation if available to inspect the actual running UI.
6. Check at least desktop and mobile-sized viewports.
7. Verify character framing, button functionality, panel opening/closing, audio permission errors, and chat error/demo states.
8. Fix all errors discovered.
9. If a check cannot be run in this environment, state that accurately. Never invent a passing test.

### Definition of done
- The 3D scene fills the available game area intentionally.
- The character is large, centered, fully visible and expressive.
- The environment no longer looks like a tiny island floating at the top of an empty screen.
- The top navigation and bottom dock are polished and responsive.
- Every core interaction visibly works.
- Voice repeat works locally where browser APIs permit.
- Chat and customization have real configured/demo states.
- Mobile layout is usable.
- Existing useful functionality is preserved.
- Build and tests pass where available, or remaining failures are clearly reported.

## 8. Final response

When finished, report:
1. Root cause of the tiny scene and how you fixed it.
2. Main files/components changed.
3. Features now implemented and verified.
4. Commands run and exact build/test results.
5. Any remaining feature that requires a provider key or cannot be verified.
6. How to run the updated app.

**Now inspect the current project and implement this upgrade directly. Do not merely return another plan or just modify a screenshot.**
