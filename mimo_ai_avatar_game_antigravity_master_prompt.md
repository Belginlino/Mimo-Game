# MASTER BUILD PROMPT --- Personalized AI Avatar Game

## Antigravity Full-Stack Product Engineering Challenge

You are an elite cross-functional product team operating as one
autonomous engineering agent: senior product manager, UX/UI designer,
game developer, Three.js/WebGL engineer, React/TypeScript engineer,
Python/FastAPI backend engineer, AI/audio integration engineer, database
engineer, security engineer, QA automation engineer, DevOps engineer,
and technical writer.

Your mission is to **build a real, runnable, polished browser-based 3D
AI avatar game**, not merely describe it, scaffold an empty project,
create a static mockup, or stop after a plan.

Product concept: users create a cute cartoon 3D avatar inspired by the
*genre* of playful virtual-pet games. They can interact with the avatar,
record speech and hear a funny transformed repeat, and chat with an AI
character that replies with speech and animated reactions. Users can
optionally upload a photo and, when a configured image-to-3D provider is
available, request a personalized 3D model.

The product must have its own original name, visual identity, character
designs, interface, animations, copy, and sound design. Do not copy
Talking Tom, Talking Angela, their characters, artwork, UI, sounds,
branding, or other copyrighted assets. Use original generic cartoon
styling and properly licensed assets only.

## 0. Non-negotiable execution rules

1.  **Work directly in the current Antigravity workspace/repository.**
    First inspect all existing files, package manifests, Git status,
    environment files, and current architecture. Preserve useful
    existing work. Do not overwrite working code blindly.
2.  Start with a short internal implementation plan, then immediately
    implement. Do not stop to ask questions unless blocked by a
    genuinely essential missing decision. Use sensible defaults from
    this brief.
3.  Build the application end-to-end: frontend, backend, data model,
    integrations, error states, tests, documentation, and local run
    instructions.
4.  Run available checks throughout: install dependencies when possible,
    lint/type-check, unit tests, backend tests, production build, and
    browser/e2e checks if the environment supports them. Fix errors
    rather than merely reporting them.
5.  Never claim a feature works unless it has actually been implemented
    and verified. Never claim tests passed unless they ran and passed.
    At the end, report exact commands run, results, remaining
    limitations, and anything that could not be verified.
6.  Do not leave TODOs, placeholder buttons, fake progress, dead links,
    or buttons that do nothing in core flows. For optional external
    integrations requiring API keys, implement a real provider
    interface, useful setup instructions, validation, and an honest
    unavailable state. A clearly labelled local/demo mode is acceptable;
    pretending a mock result is real AI generation is not.
7.  Do not expose API keys or secrets to browser code. All paid AI
    provider calls must be made through the backend. Provide
    `.env.example` with placeholders only; never put real secrets in
    source control.
8.  Prefer stable, maintained libraries and simple architecture. Check
    installed versions and current package APIs rather than inventing
    imports. Avoid unnecessary complexity, microservices, and unneeded
    dependencies.
9.  If internet access or external APIs are unavailable in this
    environment, continue building the parts that can be completed
    locally, add graceful fallbacks, and document exactly what requires
    credentials or a network.
10. Treat this as a startup MVP: the first launch should be delightful,
    usable, responsive, safe, and maintainable---not an overengineered
    science project.

## 1. Product definition

Working title: **Mimo --- Your AI Playmate**. Keep the product name
configurable and easy to replace. Use original branding and a friendly,
modern visual identity.

### Core user journey

1.  User opens the website and sees a polished landing/home experience.
2.  User chooses "Play now" or "Create my avatar."
3.  User enters the game room and sees a 3D cartoon character.
4.  User taps/clicks different body regions and triggers funny, distinct
    reactions.
5.  User records a short voice sample/phrase and plays it back with a
    playful pitch effect.
6.  User opens AI chat, types or speaks a message, and gets a
    character-consistent response. If speech synthesis is supported, the
    character speaks it.
7.  User can upload a photo and start personalized avatar generation. If
    no provider credentials are configured, explain this honestly and
    keep the playable default avatar available.
8.  User can customize supported options, save preferences, reset/delete
    data, and return to the game.

### Product principles

-   Browser-first, desktop and mobile responsive.
-   Fast first load and a useful playable state even if AI services are
    unavailable.
-   Original cute 3D cartoon aesthetic; warm, playful, polished, not a
    generic admin dashboard.
-   The game should be fun without requiring sign-in or paid AI APIs.
-   Clearly distinguish local demo capabilities from externally powered
    AI features.
-   Gracefully handle denied microphone/camera permissions, unsupported
    browsers, offline mode, network errors, slow generation, and invalid
    files.
-   No dark patterns, hidden spending, or surprise uploads.
-   Do not claim a single photo guarantees an exact likeness or a
    perfect animation-ready 3D model.

## 2. Required technology architecture

### Frontend

-   React + Vite + TypeScript.
-   Three.js through React Three Fiber; use `@react-three/drei` where
    helpful and compatible.
-   A clean component architecture, typed API client, predictable state
    management, and accessible UI.
-   Use CSS modules, Tailwind, or the styling system already established
    in the repository. Do not introduce a second styling system without
    a clear need.
-   Use browser APIs for microphone recording, Web Audio effects, and
    speech synthesis/recognition where supported.
-   Do not require Unity for the browser MVP. Unity WebGL may be a
    future alternative, but the initial implementation must use the web
    stack.

### Backend

-   Python + FastAPI.
-   Pydantic request/response schemas.
-   SQLAlchemy or SQLModel with a sensible relational database. Use
    SQLite by default for easy local setup; make the configuration
    compatible with PostgreSQL for deployment.
-   CORS restricted through configuration.
-   Health/readiness endpoint.
-   Structured logging, consistent errors, request validation, file
    size/type validation, rate limiting or a clear configurable MVP
    limiter, and safe timeouts.
-   Use async/background job patterns for long-running image-to-3D
    tasks. Do not keep a request open while an external provider renders
    a model.
-   Backend provider adapters for AI chat, speech, and 3D generation.
    Keep provider-specific code isolated behind interfaces.
-   Keep API secrets exclusively in server-side environment variables.

### Storage and persistence

-   Store durable app data in the backend database where configured.
-   Provide a development-safe local asset storage implementation or a
    clear storage abstraction. Keep generated assets outside public
    source directories.
-   If using local storage for development, document its limitations and
    how to replace it with private object storage.
-   Do not store raw photos or voice recordings longer than necessary.
    Default to minimal retention and user-controlled deletion.
-   Persist user settings and avatar metadata. Authentication may be
    optional for the local MVP; if authentication is implemented, do it
    securely and completely, not as a fake login.

### Suggested repository layout

Adapt to the current repo if it already has a sensible structure.

``` text
/
  frontend/
    src/
      app/
      components/
      features/
        avatar/
        game/
        voice/
        chat/
      hooks/
      lib/
      styles/
      types/
    public/
  backend/
    app/
      api/
      core/
      models/
      schemas/
      services/
        ai/
        voice/
        avatar_generation/
        storage/
      tests/
    requirements.txt or pyproject.toml
  docs/
  .env.example
  README.md
```

If the repository already uses a monorepo structure, preserve it and
adapt these boundaries rather than moving files unnecessarily.

## 3. Frontend product experience

Build a complete interface with these screens or sections:

### A. Home / welcome

-   Original product logo/wordmark and concise value proposition.
-   Primary CTA: "Meet your avatar" / "Play now."
-   Secondary CTA: "Create an avatar."
-   Show a preview of the 3D character if feasible.
-   Clear note that photo-based generation may require an external
    service.
-   No fake customer reviews, fake usage metrics, or invented
    testimonials.

### B. Main game room

This is the core screen and should feel like a real game: - Large,
responsive 3D viewport with a friendly cartoon character. - Original,
colorful environment with soft lighting, ground plane, shadows where
performant, and subtle environmental decoration. - A small set of
distinct character animations: idle, happy, surprised, laugh, sad, jump,
dance, sleep, and talk. Reuse/compose animations where appropriate, but
ensure each control has a visible effect. - Click/tap interaction using
raycasting or equivalent. Different regions should trigger different
reactions; if precise mesh hit regions are not feasible with the chosen
model, use transparent interactive hit zones or clearly implemented
controls. - Floating reaction feedback, playful particles or emojis, and
sound effects only when enabled. - Controls for sound on/off,
reset/recenter, and return to home. - Accessible labels and
keyboard-operable controls. Do not make critical actions hover-only. -
The game must remain usable on narrow mobile screens and touch devices.

### C. Avatar creator

-   Camera capture and file upload flows with clear permission prompts.
-   Validate image type and size on both client and server.
-   Show preview and explicit confirmation before upload.
-   Include a clear privacy notice: why the image is needed, where it is
    processed, retention, and deletion.
-   Show generation states: queued, processing, succeeded, failed,
    cancelled.
-   Poll the backend job status with bounded retry/backoff, or use a
    suitable real-time approach if already available.
-   If the image-to-3D API is not configured, show a friendly
    explanation and let the user continue with a built-in avatar. Never
    fabricate a generated model.
-   Validate the returned model file type, size, and safe loading path
    before rendering.
-   Offer an avatar preview and a "Use this avatar" action only when a
    valid compatible model is ready.
-   A generated mesh may not be animation-ready. Implement a clear
    compatibility check and fallback to the default character if
    rigging/animation is unsupported.

### D. Customization

Implement a small but real selection of options, such as: - Character
color/palette or a small set of supported appearance presets. -
Accessory or outfit selection if the available model supports it. -
Background/environment selection. - Save and restore settings. - Do not
show controls that imply mesh/face modification if they do not actually
modify the model.

### E. Voice repeat mode

-   Request microphone permission only after the user clicks the record
    control.
-   Provide recording state, elapsed time, stop, replay, and discard.
-   Use MediaRecorder where supported, with MIME-type detection and
    graceful fallback.
-   Use Web Audio API for a basic funny pitch/tempo effect when
    supported. If a true pitch-preserving algorithm is not available,
    describe it accurately as a pitch/voice effect rather than claiming
    professional voice transformation.
-   Do not upload the recording for local repeat mode unless the user
    explicitly opts into a feature that requires upload.
-   Make playback volume safe and provide mute.
-   Ensure audio resources and object URLs are cleaned up.
-   If microphone access is denied or unsupported, explain how to
    proceed with typed text or the built-in demo.

### F. AI conversation

-   Text chat must work even if browser speech APIs are unavailable.
-   Character personality should be friendly, playful, kind, and
    concise. It must not pretend to be a human or claim real
    emotions/relationships.
-   Add a short system prompt on the server for character behavior.
    Never trust a system prompt supplied by the browser.
-   Add a conversation reset/clear option.
-   Add pending, success, and error states; prevent duplicate
    submissions; allow retry.
-   Keep chat history short and under configured limits.
-   Add backend rate limits and maximum input/output sizes.
-   If no AI provider key is configured, use an explicitly labelled
    local sample-response mode for testing. Make it obvious this is not
    a live AI response. Do not silently fall back to fake AI.
-   Sanitize/render user and model content safely; do not use unsafe
    HTML injection.
-   If streaming is practical and supported by the provider, implement
    it only if it improves UX without destabilizing the MVP.

### G. Speech input and output

-   Speech recognition: use browser Web Speech API when supported, with
    feature detection and a typed-input fallback. Do not assume it
    exists in every browser.
-   Text-to-speech: use SpeechSynthesis where available, with voice
    selection and cancellation when a new utterance starts.
-   Optional backend TTS provider adapter can be configured via
    environment variables.
-   Animate the avatar's mouth while speaking. Prefer audio amplitude or
    phoneme/viseme timing if available. A simple amplitude-driven mouth
    movement is acceptable for the MVP if labelled and implemented
    honestly.
-   Ensure stopping audio also stops the associated animation.
-   Provide voice settings and respect mute.
-   Do not clone a user's voice in the MVP. Use a generic voice for AI
    replies.

### H. Game progression (small but real)

-   Add lightweight interaction tracking such as happiness/energy or
    affection points.
-   Interactions should update state consistently and visibly.
-   Persist settings/progress locally or through the backend as
    appropriate.
-   Keep it simple: avoid building a large economy or complex inventory
    before validating the core loop.
-   Include a reset option.

### I. Settings and privacy

-   Sound toggle, reduced-motion preference, optional language selection
    if feasible, data/privacy information, and delete/reset controls.
-   Explain that camera/microphone access is browser-controlled.
-   Do not collect analytics or tracking by default. If analytics are
    added, make them opt-in and document what is collected.
-   Do not claim regulatory compliance without a real review.

## 4. 3D character requirements

### Primary goal

Create a delightful original cartoon character that works immediately,
even without any external asset or AI provider.

1.  Inspect the repo for an existing suitable, licensed `.glb`/`.gltf`
    model before searching for another.
2.  If a suitable model is already present, use it and document its
    license/source.
3.  Otherwise, create an original stylized character using procedural
    Three.js/R3F geometry (for example, rounded head/body, expressive
    eyes, mouth, arms, feet, and simple accessories). It must look
    intentional and polished, not like a collection of random
    primitives.
4.  Do not hotlink unknown model files or download copyrighted
    characters. Do not assume a URL or asset exists.
5.  Keep polygon counts, texture sizes, lights and shadows appropriate
    for mobile browsers.
6.  Use animation code or a verified animation asset for idle, happy,
    surprised, laugh, jump, dance, sleep and talking states. Ensure the
    model has visible mouth/eye reactions if no rig is available.
7.  Implement an explicit character state machine (for example: `idle`,
    `happy`, `surprised`, `laughing`, `jumping`, `dancing`, `sleeping`,
    `talking`) so reactions do not conflict unpredictably.
8.  Respect reduced-motion settings. Avoid continuous expensive
    rendering when the tab is hidden or the game is idle, where
    practical.
9.  Handle model load failures with a graceful fallback character and a
    visible, non-alarming message.
10. Add unit tests for important game-state transitions if practical.

### Model compatibility

-   Support `.glb`/`.gltf` safely and document any limits.
-   Detect whether an imported model has skeletons, animations, morph
    targets or expected nodes where feasible.
-   Do not promise that any arbitrary image-to-3D output can
    automatically lip-sync or use all game animations.
-   If the generated model is not rig-compatible, display it as a static
    preview or keep the default animated avatar in gameplay. Tell the
    user which behavior is supported.

## 5. AI provider integration design

Implement typed provider interfaces and separate adapters. Select
providers through environment configuration rather than hard-coding one
provider throughout the codebase.

### AI chat

-   Implement a real backend chat provider adapter for a documented API
    compatible with the chosen configured provider.
-   Read API keys and model names from environment variables.
-   Validate provider response shape and timeouts.
-   Return typed, minimal response data to the frontend.
-   Add an explicit provider-not-configured response and a separate
    local test/demo mode.
-   Include unit tests using mocked HTTP responses; never require paid
    API calls for the test suite.

### Speech

-   Prefer local browser recording/playback and audio effects for the
    first voice-repeat experience.
-   Use browser speech recognition/synthesis where supported.
-   Add an optional backend TTS adapter only if it can be implemented
    with verified current provider APIs and clear configuration.
-   Do not claim that generic pitch shifting is equivalent to cloning
    the user's voice.

### Photo-to-3D generation

-   Implement a provider adapter for an image-to-3D API only after
    checking its current official documentation, API request format,
    authentication, task lifecycle, download format, and pricing/credit
    behavior.
-   If web access is available, verify current official docs rather than
    inventing endpoints or request schemas.
-   Store the API key server-side.
-   Use asynchronous jobs and status polling.
-   Handle failed, expired, cancelled and rate-limited tasks.
-   Keep generated model downloads on the backend or a controlled
    storage path; validate content and avoid unsafe arbitrary URL
    fetching.
-   If exact provider integration cannot be verified, build the adapter
    interface and explicit configuration path, but do not pretend
    generation is operational.
-   Include a mock provider for automated tests only, clearly separated
    from production mode.

## 6. Backend API and data model

Create a clean, documented API. Adapt names if an existing codebase
already uses a consistent convention.

### Suggested endpoints

-   `GET /api/health` --- service health.
-   `GET /api/config/public` --- safe public feature flags only; never
    return secrets.
-   `POST /api/avatars` --- accept an authorized upload and create a
    generation job.
-   `GET /api/avatars/{avatar_id}/status` --- generation status.
-   `GET /api/avatars/{avatar_id}` --- metadata and authorized asset
    reference.
-   `DELETE /api/avatars/{avatar_id}` --- delete metadata and associated
    private assets.
-   `POST /api/chat` --- validate input and return a character response.
-   Optional `POST /api/voice/tts` --- server-backed TTS if configured.
-   `GET /api/settings` and `PUT /api/settings` --- only if
    persistence/auth strategy supports them safely.
-   `GET /api/progress` and `PUT /api/progress` --- lightweight game
    progress if supported.
-   `GET /api/health/ready` --- readiness, with no secrets in output.

### Data model

Use only fields that are needed: - Avatar: ID, display name,
owner/session reference where applicable, provider, status, safe asset
key, created timestamp, error code, and metadata required for
compatibility. - User settings/progress: sound, selected appearance,
selected environment, basic interaction score, and timestamps. - Chat:
do not persist by default. If persistence is implemented, explain it and
provide deletion. - Generation job: ID, provider task ID, status,
timestamps, bounded error information and safe result reference.

Do not store raw image bytes in database columns. Do not expose
filesystem paths or private storage keys to unauthenticated users.

### Authentication decision

For a no-friction local MVP, support anonymous sessions with
server-generated random IDs and local progress where reasonable. Do not
implement fake authentication. If multi-user cloud persistence is added,
use a proven authentication provider or a correctly implemented secure
session system, protect every private endpoint, and verify resource
ownership. Do not use a user-supplied ID as proof of ownership.

## 7. Security, privacy and abuse prevention

Implement appropriate safeguards for a public product: - Strict request
and upload size limits. - Validate image MIME type and file signature
where possible; do not trust filename extensions. - Reject unexpected
file types and suspicious URLs. - Never fetch arbitrary user-supplied
URLs from the backend. - Keep secrets out of logs, errors, frontend
bundles and Git. - Configure CORS to known frontend origins outside
development. - Add reasonable per-IP/session rate limits to expensive
endpoints. - Set timeouts and bounded retries for provider requests. -
Limit chat input and output size. - Avoid HTML injection and unsafe
dynamic evaluation. - Add clear upload consent and delete controls. -
Minimize retention of biometric-adjacent material such as face photos
and voice samples. - Do not create voice clones or identity
impersonation features. - If children may use the product, use
age-appropriate design, minimize data collection, avoid targeted
advertising, and review applicable consent and child-safety obligations
before public launch. - Add an error boundary in the frontend and safe,
user-friendly error messages. - Never print raw user photos, recordings,
tokens or API keys to logs.

## 8. UI/UX quality bar

Create a coherent design system: - Playful, premium visual style with
soft gradients, rounded cards, tasteful shadows, expressive
illustrations and clear typography. - Strong visual hierarchy and a
game-like main screen, not a generic SaaS dashboard. - Consistent
spacing, color tokens, typography, button states, loading states and
focus states. - Responsive layout for desktop, tablet and mobile. -
Accessible contrast, labels, keyboard navigation and visible focus
rings. - Support reduced motion. - Use loading skeletons or progress
indicators only when they reflect real work. - Add empty, loading,
success, error, permission-denied and provider-unavailable states. -
Provide toast/inline feedback for actions. - No dead buttons, dummy
links, unexplained icons or fake analytics. - Do not use copyrighted
character assets or imitate a named game's exact interface.

## 9. Testing requirements

Create a practical automated test suite.

### Frontend

-   Unit tests for character state transitions, settings, API error
    handling and key utilities.
-   Component tests for game controls, recording states, chat
    submission, and avatar generation states.
-   Verify no unhandled promise rejections in key flows.
-   If browser automation is available, run an end-to-end happy path and
    at least one error path.

### Backend

-   Test health endpoints.
-   Test validation for invalid uploads, unsupported MIME types and
    oversized files.
-   Test chat provider success, timeout, rate-limit and
    provider-not-configured states using mocks.
-   Test avatar generation job creation, status updates and failures
    using a mock provider.
-   Test delete behavior and ownership checks where auth exists.
-   Test that secrets are never returned by public config or error
    responses.
-   Tests must not require paid provider credentials or live AI
    requests.

### Build verification

-   Run frontend lint, typecheck and production build.
-   Run backend tests and static checks available in the repo.
-   Check for dependency conflicts and missing environment variables.
-   If browser tests are unavailable, state that clearly rather than
    claiming a browser test was completed.
-   Fix all failures that are reasonably fixable within the task.

## 10. Deployment and developer experience

Provide: - `.env.example` with every required variable and a short
explanation. - A root README with architecture, prerequisites, exact
installation commands, local run commands, test commands, provider
setup, privacy behavior, deployment options, known limitations and
troubleshooting. - Backend dependency lock/version constraints where
practical. - Clear frontend and backend scripts. - CORS configuration
for local development and production. - A development mode that works
without paid API keys and still demonstrates the game, touch reactions,
and local voice repeat. - Optional Docker Compose only if it materially
improves the repo and can be tested. - Do not include secrets or
production credentials. - Add a concise architecture diagram in Markdown
or Mermaid if useful. - Document how to configure a real AI provider and
image-to-3D provider separately.

## 11. Implementation order

Follow this sequence, but keep working after the plan is written:

### Phase 1 --- Inspect and plan

-   Inspect repository, package managers, existing code and available
    tooling.
-   Identify the current app entry point and avoid destructive rewrites.
-   Write a concise task checklist in the workspace if useful.

### Phase 2 --- Build the playable game first

-   Implement the polished responsive UI.
-   Build or load the original cartoon avatar.
-   Implement the character state machine and touch reactions.
-   Implement local voice recording, playback and audio effect.
-   Make this path work without API keys.

### Phase 3 --- Build the backend

-   Add FastAPI, schemas, database setup, health endpoints and provider
    interfaces.
-   Add secure configuration, validation, limits, errors and tests.

### Phase 4 --- Connect AI conversation

-   Add real provider adapter and clearly separated demo mode.
-   Add chat UI, speech input/output fallbacks and talking animation.
-   Test configured and unconfigured states.

### Phase 5 --- Integrate photo-to-3D

-   Verify official provider documentation and API behavior.
-   Implement generation jobs and status handling.
-   Validate model assets and animation compatibility.
-   Keep the game playable if the provider is unavailable.

### Phase 6 --- Polish and verify

-   Improve responsive design, loading, accessibility and error states.
-   Run automated tests, lint, typecheck and production build.
-   Fix issues and update README.
-   Review security and ensure no secrets are exposed.

Do not spend the entire task writing documentation before implementing
the product. Do not stop at Phase 1. If context or execution time is
limited, prioritize a working playable frontend and backend foundation,
then continue through the most valuable integrations and document the
remaining verified gaps.

## 12. Definition of done

The product is ready for a private MVP demo only when all feasible
checks below are true:

-   [ ] App launches locally using documented commands.
-   [ ] Home screen and game room are polished and responsive.
-   [ ] A 3D character appears even without external API keys.
-   [ ] Character reacts to touch/click using implemented animations or
    clear visible reactions.
-   [ ] Microphone recording, playback, and available audio effect work
    with permission handling.
-   [ ] Text chat UI works and has honest
    provider-configured/unconfigured behavior.
-   [ ] Real AI calls work when a valid provider key is configured, if
    integration was implemented and tested.
-   [ ] Avatar upload validates input and explains privacy.
-   [ ] Photo-to-3D generation either works through a verified
    configured provider or clearly reports that setup is required. It
    must never fake success.
-   [ ] Avatar generation states and failures are handled.
-   [ ] Model loading errors fall back gracefully.
-   [ ] No core button is dead.
-   [ ] No secrets are shipped to the browser.
-   [ ] Backend and frontend tests run; results are documented
    accurately.
-   [ ] Production frontend build succeeds.
-   [ ] README and `.env.example` are complete.
-   [ ] Known limitations, provider costs, privacy behavior, and
    deployment steps are documented.

## 13. Final response format

After implementation, provide a concise engineering handoff with:

1.  **What was built** --- major features and key files.
2.  **How to run it** --- exact commands for frontend and backend.
3.  **Environment setup** --- which keys are optional/required and where
    to set them.
4.  **Verification** --- exact tests, lint/typecheck/build commands and
    pass/fail results.
5.  **Real versus demo features** --- explicitly list what works
    locally, what requires API keys, and what is not yet supported.
6.  **Security/privacy notes** --- upload retention, microphone
    behavior, and deployment configuration.
7.  **Known limitations and next steps** --- only truthful, actionable
    items.

Be proactive, technically rigorous, and product-minded. Make the best
reasonable decisions yourself. Build the application, verify it, fix
what fails, and report the truth. The goal is a genuinely useful,
runnable MVP---not a claim of "100% perfect" software.
