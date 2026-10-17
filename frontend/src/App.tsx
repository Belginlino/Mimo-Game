import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { Camera, Check, CircleHelp, LoaderCircle, Mic, MicOff, RotateCcw, Settings2, ShieldCheck, Sparkles, Trash2, Upload, Volume2, X, Palette, UserRound } from 'lucide-react';
import type * as THREE from 'three';
import { deleteAvatarJob, pollAvatarStatus, uploadAvatarPhoto } from './lib/api';
import type { AvatarJobState } from './types';
import { TalkingTomRoom3D } from './components/TalkingTomRoom3D';
import { Accessories3D } from './components/Accessories3D';
import { InteractiveZones3D } from './components/InteractiveZones3D';
import { TalkingTomButtons } from './components/TalkingTomButtons';
import { TalkingTomOverlays, type Particle } from './components/TalkingTomOverlays';
import { TalkingTomCat3D } from './components/TalkingTomCat3D';
import { UserModelFBX } from './components/UserModelFBX';
import { soundEngine } from './lib/soundEngine';

type Mode = 'onboarding' | 'generating' | 'room';
type ReactionType = 'idle' | 'poke' | 'tickle' | 'jump' | 'dance' | 'bagpop' | 'treat' | 'drink' | 'pet' | 'phone' | 'feather';
type SpeechRecognitionResult = { isFinal: boolean; 0: { transcript: string } };
type SpeechRecognitionEvent = { resultIndex: number; results: ArrayLike<SpeechRecognitionResult> };
type Recognition = {
  continuous: boolean; interimResults: boolean; lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void; stop(): void; abort(): void;
};
type RecognitionConstructor = new () => Recognition;
declare global { interface Window { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor } }

function savedModel(): { url: string; jobId: string } | null {
  const url = localStorage.getItem('mimo_avatar_model') || '';
  const jobId = localStorage.getItem('mimo_avatar_job_id') || '';
  // Clear the earlier local-photo/sample path. Only backend-generated GLBs may enter the room.
  if (!url || !jobId || !url.includes(`/api/avatars/${jobId}/model.glb`)) {
    localStorage.removeItem('mimo_avatar_model');
    localStorage.removeItem('mimo_avatar_job_id');
    return null;
  }
  return { url, jobId };
}

function GeneratedModel({ url, talking, onFailure }: { url: string; talking: boolean; onFailure: () => void }) {
  const [scene, setScene] = useState<THREE.Object3D | null>(null);
  useEffect(() => {
    let alive = true;
    let loadedScene: THREE.Object3D | null = null;
    void import('three').then(async (THREE) => {
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      new GLTFLoader().load(url, (gltf) => {
        if (!alive) return;
        const root = gltf.scene;
        const bounds = new THREE.Box3().setFromObject(root);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const height = Math.max(size.y, 0.01);
        // Normalize every provider model by its measured bounds and frame the upper body.
        const scale = 2 / height;
        root.scale.setScalar(scale);
        root.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
        loadedScene = root;
        setScene(root);
      }, undefined, () => { if (alive) onFailure(); });
    }).catch(() => { if (alive) onFailure(); });
    return () => { alive = false; if (loadedScene) loadedScene.traverse((node) => {
      const mesh = node as THREE.Mesh;
      mesh.geometry?.dispose();
      const material = mesh.material;
      if (Array.isArray(material)) material.forEach((item) => item.dispose()); else material?.dispose();
    }); };
  }, [url, onFailure]);
  useFrame(({ clock }) => {
    if (!scene) return;
    scene.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
      const index = mesh.morphTargetDictionary.mouthOpen ?? mesh.morphTargetDictionary.jawOpen ?? mesh.morphTargetDictionary.viseme_aa;
      if (index !== undefined) mesh.morphTargetInfluences[index] = talking ? 0.08 + Math.max(0, Math.sin(clock.elapsedTime * 13)) * 0.42 : 0;
    });
  });
  return scene ? <primitive object={scene} /> : null;
}

interface BundledHumanProps {
  talking: boolean;
  skinTone: string;
  hairColor: string;
  clothingColor: string;
  reaction?: ReactionType;
  reactionStartTime?: number;
  hasGlasses?: boolean;
  hasBowTie?: boolean;
  hasSunglasses?: boolean;
  hasPartyHat?: boolean;
  onPokeHead?: () => void;
  onTickleBelly?: () => void;
  onTapFeet?: () => void;
  onPet?: () => void;
}

function BundledHuman({
  talking,
  skinTone,
  hairColor,
  clothingColor,
  reaction = 'idle',
  reactionStartTime = 0,
  hasGlasses = true,
  hasBowTie = true,
  hasSunglasses = false,
  hasPartyHat = false,
  onPokeHead,
  onTickleBelly,
  onTapFeet,
  onPet,
}: BundledHumanProps) {
  const [scene, setScene] = useState<THREE.Object3D | null>(null);
  const [failed, setFailed] = useState(false);
  const group = useRef<THREE.Group>(null);
  const headMesh = useRef<THREE.Mesh | null>(null);
  const teethMesh = useRef<THREE.Mesh | null>(null);
  const rightArm = useRef<THREE.Bone | null>(null);
  const leftArm = useRef<THREE.Bone | null>(null);
  const rightForeArm = useRef<THREE.Bone | null>(null);
  const leftForeArm = useRef<THREE.Bone | null>(null);
  const spine = useRef<THREE.Bone | null>(null);
  const head = useRef<THREE.Bone | null>(null);
  const mouthOpenIdx = useRef<number>(-1);
  const teethMouthOpenIdx = useRef<number>(-1);
  const rEyeCloseIdx = useRef<number>(-1);
  const lEyeCloseIdx = useRef<number>(-1);
  const smileIdx = useRef<number>(-1);

  useEffect(() => {
    let alive = true;
    void import('three').then(async (THREE) => {
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      new GLTFLoader().load('/mimo-human.glb', (gltf) => {
        if (!alive) return;
        const root = gltf.scene;

        // Find bones and morph targets
        root.traverse((node) => {
          if (node.name === 'RightArm') {
            rightArm.current = node as THREE.Bone;
            node.rotation.x = -0.21 + 1.22; // Natural arm lowered by side
          }
          if (node.name === 'LeftArm') {
            leftArm.current = node as THREE.Bone;
            node.rotation.x = -0.21 + 1.22;
          }
          if (node.name === 'RightForeArm') {
            rightForeArm.current = node as THREE.Bone;
            node.rotation.z = -0.12; // Natural elbow curve
          }
          if (node.name === 'LeftForeArm') {
            leftForeArm.current = node as THREE.Bone;
            node.rotation.z = 0.12;
          }
          if (node.name === 'Spine' || node.name === 'Spine1') spine.current = node as THREE.Bone;
          if (node.name === 'Head') head.current = node as THREE.Bone;

          const mesh = node as THREE.Mesh;
          if (mesh.isMesh) {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.morphTargetDictionary) {
              const dict = mesh.morphTargetDictionary;
              if (mesh.name === 'H_DDS_HighRes') {
                headMesh.current = mesh;
                mouthOpenIdx.current = dict['h_expressions.MouthOpen_h'] ?? -1;
                rEyeCloseIdx.current = dict['h_expressions.ReyeClose_h'] ?? -1;
                lEyeCloseIdx.current = dict['h_expressions.LeyeClose_h'] ?? -1;
                smileIdx.current = dict['h_expressions.RsmileClose_h'] ?? -1;
              }
              if (mesh.name === 'h_TeethDown') {
                teethMesh.current = mesh;
                teethMouthOpenIdx.current = dict['t_MouthOpen_h'] ?? -1;
              }
            }
          }
        });

        root.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(root);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const targetHeight = 2.05;
        const scale = targetHeight / Math.max(size.y, 0.01);
        root.scale.setScalar(scale);
        root.position.set(-center.x * scale, -bounds.min.y * scale + 0.05, -center.z * scale);

        setScene(root);
      }, undefined, () => { if (alive) setFailed(true); });
    }).catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [clothingColor, hairColor, skinTone]);

  useFrame(({ clock }) => {
    const elapsedSinceReaction = clock.elapsedTime - reactionStartTime;
    const isReacting = elapsedSinceReaction >= 0 && elapsedSinceReaction < 2.4;

    let targetPosY = Math.sin(clock.elapsedTime * 1.6) * 0.012;
    let targetRotY = Math.sin(clock.elapsedTime * 0.45) * 0.025;
    let targetSpineX = Math.sin(clock.elapsedTime * 1.6) * 0.012;
    let targetHeadX = Math.sin(clock.elapsedTime * 1.1) * 0.01;
    let targetHeadY = Math.sin(clock.elapsedTime * 0.6) * 0.02;
    let targetHeadZ = 0;
    let targetSmile = 0.22;
    let targetEyesClosed = 0;
    let mouthChew = 0;

    if (isReacting) {
      if (reaction === 'poke') {
        const wobble = Math.sin(elapsedSinceReaction * 16) * Math.exp(-elapsedSinceReaction * 2.2);
        targetHeadX = -0.22 * wobble;
        targetHeadZ = 0.16 * wobble;
        targetSmile = 0.0;
      } else if (reaction === 'tickle') {
        targetPosY = Math.abs(Math.sin(elapsedSinceReaction * 16)) * 0.045;
        targetSpineX = Math.sin(elapsedSinceReaction * 16) * 0.06;
        targetHeadX = -0.12 + Math.sin(elapsedSinceReaction * 16) * 0.05;
        targetSmile = 0.88;
        mouthChew = 0.35 + Math.sin(elapsedSinceReaction * 20) * 0.25;
      } else if (reaction === 'jump') {
        if (elapsedSinceReaction < 0.9) {
          targetPosY = Math.sin((elapsedSinceReaction / 0.9) * Math.PI) * 0.35;
        }
        targetSmile = 0.65;
      } else if (reaction === 'dance') {
        targetRotY = Math.sin(elapsedSinceReaction * 8) * 0.35;
        targetPosY = Math.abs(Math.sin(elapsedSinceReaction * 8)) * 0.06;
        targetHeadZ = Math.sin(elapsedSinceReaction * 8) * 0.12;
        targetSmile = 0.75;
      } else if (reaction === 'bagpop') {
        if (elapsedSinceReaction < 0.6) {
          targetPosY = Math.sin((elapsedSinceReaction / 0.6) * Math.PI) * 0.24;
          targetHeadX = -0.18;
        }
      } else if (reaction === 'treat') {
        mouthChew = Math.abs(Math.sin(elapsedSinceReaction * 14)) * 0.45;
        targetHeadX = Math.sin(elapsedSinceReaction * 8) * 0.08;
        targetSmile = 0.65;
      } else if (reaction === 'drink') {
        targetHeadX = -0.22 + Math.sin(elapsedSinceReaction * 6) * 0.04;
        mouthChew = Math.abs(Math.sin(elapsedSinceReaction * 10)) * 0.35;
      } else if (reaction === 'pet') {
        targetHeadZ = 0.14;
        targetHeadX = 0.08;
        targetSmile = 0.88;
        targetEyesClosed = 0.85;
      }
    }

    if (group.current) {
      group.current.position.y = targetPosY;
      group.current.rotation.y = targetRotY;
    }
    if (spine.current) {
      spine.current.rotation.x = targetSpineX;
    }
    if (head.current) {
      head.current.rotation.x = targetHeadX;
      head.current.rotation.y = targetHeadY;
      head.current.rotation.z = targetHeadZ;
    }

    // Blinking animation
    const blinkCycle = clock.elapsedTime % 4.2;
    const isBlinking = blinkCycle > 4.02;
    const blink = isBlinking ? Math.sin(((blinkCycle - 4.02) / 0.18) * Math.PI) : 0;
    const eyeCloseVal = Math.max(blink, targetEyesClosed);

    if (headMesh.current?.morphTargetInfluences) {
      if (rEyeCloseIdx.current >= 0) headMesh.current.morphTargetInfluences[rEyeCloseIdx.current] = eyeCloseVal;
      if (lEyeCloseIdx.current >= 0) headMesh.current.morphTargetInfluences[lEyeCloseIdx.current] = eyeCloseVal;
      if (smileIdx.current >= 0) headMesh.current.morphTargetInfluences[smileIdx.current] = targetSmile;
    }

    // Talking / Chewing mouth animation
    const mouthOpen = talking
      ? 0.18 + Math.max(0, Math.sin(clock.elapsedTime * 14)) * 0.45
      : mouthChew;

    if (headMesh.current?.morphTargetInfluences && mouthOpenIdx.current >= 0) {
      headMesh.current.morphTargetInfluences[mouthOpenIdx.current] = mouthOpen;
    }
    if (teethMesh.current?.morphTargetInfluences && teethMouthOpenIdx.current >= 0) {
      teethMesh.current.morphTargetInfluences[teethMouthOpenIdx.current] = mouthOpen;
    }
  });

  if (failed) return <Html center><div className="avatar-load-error" role="status">Character avatar could not be loaded.</div></Html>;
  return (
    <group ref={group} position={[0, 0, 0]}>
      {scene && <primitive object={scene} />}

      {/* 3D Accessories (Round Glasses, Red Bow Tie, etc.) */}
      <Accessories3D
        hasGlasses={hasGlasses}
        hasBowTie={hasBowTie}
        hasSunglasses={hasSunglasses}
        hasPartyHat={hasPartyHat}
      />

      {/* 3D Raycast Interactive Touch Zones */}
      {onPokeHead && onTickleBelly && onTapFeet && onPet && (
        <InteractiveZones3D
          onPokeHead={onPokeHead}
          onTickleBelly={onTickleBelly}
          onTapFeet={onTapFeet}
          onPet={onPet}
        />
      )}
    </group>
  );
}

function DefaultHuman({ talking, skinTone, hairColor, clothingColor }: { talking: boolean; skinTone: string; hairColor: string; clothingColor: string }) {
  const group = useRef<THREE.Group>(null);
  const mouth = useRef<THREE.Mesh>(null);
  const leftEye = useRef<THREE.Mesh>(null);
  const rightEye = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (group.current) {
      group.current.position.y = Math.sin(clock.elapsedTime * 1.7) * 0.018;
      group.current.rotation.y = Math.sin(clock.elapsedTime * 0.55) * 0.035;
    }
    if (mouth.current) mouth.current.scale.y = talking ? 0.12 + Math.abs(Math.sin(clock.elapsedTime * 11)) * 0.62 : 0.12;
    const blinkCycle = clock.elapsedTime % 4.3;
    const blinkScale = blinkCycle > 4.12 ? 0.12 : 1;
    if (leftEye.current) leftEye.current.scale.y = 0.045 * blinkScale;
    if (rightEye.current) rightEye.current.scale.y = 0.045 * blinkScale;
  });
  const skin = <meshStandardMaterial color={skinTone} roughness={0.76} />;
  const fabric = <meshStandardMaterial color={clothingColor} roughness={0.86} />;
  const hair = <meshStandardMaterial color={hairColor} roughness={0.9} />;
  const eye = <meshStandardMaterial color="#17221f" roughness={0.32} />;
  const white = <meshStandardMaterial color="#fffaf0" roughness={0.28} />;
  return <group ref={group} position={[0, 0.66, 0]}>
    {/* Original, locally modeled stylized human. The assembled silhouette spans roughly 2.45 units. */}
    <mesh position={[0, 1.62, 0]} scale={[0.43, 0.53, 0.39]}><sphereGeometry args={[1, 32, 24]} />{skin}</mesh>
    <mesh position={[0, 2.02, -0.035]} scale={[0.445, 0.25, 0.42]}><sphereGeometry args={[1, 28, 20]} />{hair}</mesh>
    <mesh position={[-0.43, 1.57, 0]} scale={[0.095, 0.17, 0.08]}><sphereGeometry args={[1, 20, 16]} />{skin}</mesh><mesh position={[0.43, 1.57, 0]} scale={[0.095, 0.17, 0.08]}><sphereGeometry args={[1, 20, 16]} />{skin}</mesh>
    <mesh position={[-0.16, 1.69, 0.347]} scale={[0.09, 0.07, 0.045]}><sphereGeometry args={[1, 20, 16]} />{white}</mesh><mesh position={[0.16, 1.69, 0.347]} scale={[0.09, 0.07, 0.045]}><sphereGeometry args={[1, 20, 16]} />{white}</mesh>
    <mesh ref={leftEye} position={[-0.15, 1.685, 0.388]} scale={[0.035, 0.045, 0.025]}><sphereGeometry args={[1, 16, 12]} />{eye}</mesh><mesh ref={rightEye} position={[0.17, 1.685, 0.388]} scale={[0.035, 0.045, 0.025]}><sphereGeometry args={[1, 16, 12]} />{eye}</mesh>
    <mesh position={[0, 1.55, 0.39]} scale={[0.07, 0.11, 0.075]}><sphereGeometry args={[1, 20, 16]} />{skin}</mesh>
    <mesh ref={mouth} position={[0, 1.39, 0.363]} scale={[0.12, 0.12, 0.035]}><sphereGeometry args={[1, 20, 12]} /><meshStandardMaterial color="#713b3c" roughness={0.6} /></mesh>
    <mesh position={[0, 1.28, 0.33]} scale={[0.27, 0.085, 0.12]}><sphereGeometry args={[1, 20, 14]} />{skin}</mesh>
    <mesh position={[0, 0.89, 0]} scale={[0.64, 0.57, 0.31]}><sphereGeometry args={[1, 28, 20]} />{fabric}</mesh>
    <mesh position={[0, 1.13, 0]} scale={[0.16, 0.34, 0.18]}><cylinderGeometry args={[0.15, 0.14, 0.52, 20]} />{skin}</mesh>
    <mesh position={[-0.69, 0.91, 0]} rotation={[0, 0, -0.12]} scale={[1, 1, 1]}><capsuleGeometry args={[0.14, 0.58, 6, 14]} />{fabric}</mesh><mesh position={[0.69, 0.91, 0]} rotation={[0, 0, 0.12]} scale={[1, 1, 1]}><capsuleGeometry args={[0.14, 0.58, 6, 14]} />{fabric}</mesh>
    <mesh position={[-0.7, 0.28, 0.015]} scale={[0.135, 0.17, 0.14]}><sphereGeometry args={[1, 18, 14]} />{skin}</mesh><mesh position={[0.7, 0.28, 0.015]} scale={[0.135, 0.17, 0.14]}><sphereGeometry args={[1, 18, 14]} />{skin}</mesh>
    <mesh position={[-0.26, -0.01, 0]} scale={[1, 1, 1]}><capsuleGeometry args={[0.2, 0.72, 6, 14]} />{fabric}</mesh><mesh position={[0.26, -0.01, 0]} scale={[1, 1, 1]}><capsuleGeometry args={[0.2, 0.72, 6, 14]} />{fabric}</mesh>
    <mesh position={[-0.26, -0.52, 0.04]} scale={[0.25, 0.15, 0.38]}><sphereGeometry args={[1, 18, 14]} />{eye}</mesh><mesh position={[0.26, -0.52, 0.04]} scale={[0.25, 0.15, 0.38]}><sphereGeometry args={[1, 18, 14]} />{eye}</mesh>
  </group>;
}

const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];
const defaultMaxPhotoBytes = 10 * 1024 * 1024;

function hasSupportedSignature(bytes: Uint8Array, mime: string) {
  if (mime === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === 'image/png') return [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value);
  if (mime === 'image/webp') return String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  return false;
}

export function App() {
  const initialSaved = useRef(savedModel()).current;
  const [mode, setMode] = useState<Mode>('room');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [providerReady, setProviderReady] = useState(false);
  const [providerChecked, setProviderChecked] = useState(false);
  const [maxPhotoBytes, setMaxPhotoBytes] = useState(defaultMaxPhotoBytes);
  const [providerError, setProviderError] = useState('');
  const [faceStudioOpen, setFaceStudioOpen] = useState(false);
  const [job, setJob] = useState<AvatarJobState | null>(null);
  const [jobId, setJobId] = useState(initialSaved?.jobId || '');
  const [error, setError] = useState('');
  const [consented, setConsented] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(initialSaved?.url || '');
  const [usePersonalized, setUsePersonalized] = useState(Boolean(initialSaved && localStorage.getItem('mimo_avatar_source') === 'personalized'));
  const [listening, setListening] = useState(false);
  const [speechStatus, setSpeechStatus] = useState('Microphone off');
  const [transcript, setTranscript] = useState('');
  const [typedText, setTypedText] = useState('');
  const [talking, setTalking] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [avatarName, setAvatarName] = useState(localStorage.getItem('mimo_avatar_name') || 'My Mimo');
  const [skinTone, setSkinTone] = useState(localStorage.getItem('mimo_skin_tone') || '#c98b67');
  const [hairColor, setHairColor] = useState(localStorage.getItem('mimo_hair_color') || '#30231e');
  const [clothingColor, setClothingColor] = useState(localStorage.getItem('mimo_clothing_color') || '#62766c');
  const [roomTheme, setRoomTheme] = useState(localStorage.getItem('mimo_room_theme') || 'sage');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<Recognition | null>(null);
  const listeningRef = useRef(false);
  const talkingRef = useRef(false);
  const speechSessionRef = useRef(0);
  const resumeTimer = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectionRef = useRef(0);

  // Character model selection (Default: User's model.fbx)
  const [characterType, setCharacterType] = useState<'fbx' | 'tom' | 'human'>(
    (localStorage.getItem('mimo_character_type') as 'fbx' | 'tom' | 'human') || 'fbx'
  );

  // Talking Tom Interactive States
  const [reaction, setReaction] = useState<ReactionType>('idle');
  const [reactionStartTime, setReactionStartTime] = useState(0);
  const [hasGlasses, setHasGlasses] = useState(true);
  const [hasBowTie, setHasBowTie] = useState(true);
  const [hasSunglasses, setHasSunglasses] = useState(false);
  const [hasPartyHat, setHasPartyHat] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [cameraFlash, setCameraFlash] = useState(false);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const [wardrobeOpen, setWardrobeOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [coins, setCoins] = useState(195500);
  const [isMuted, setIsMuted] = useState(false);
  const [speechBubbleText, setSpeechBubbleText] = useState<string | null>(null);
  const bubbleTimerRef = useRef<number | null>(null);
  const reactionTimerRef = useRef<number | null>(null);

  const showBubble = useCallback((text: string, durationMs: number = 3200) => {
    setSpeechBubbleText(text);
    if (bubbleTimerRef.current) window.clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = window.setTimeout(() => {
      setSpeechBubbleText(null);
      bubbleTimerRef.current = null;
    }, durationMs);
  }, []);

  const triggerReaction = useCallback((type: ReactionType, bubbleText?: string, durationMs: number = 2200) => {
    setReaction(type);
    setReactionStartTime(performance.now() / 1000);
    if (bubbleText) showBubble(bubbleText, durationMs);
    if (reactionTimerRef.current) window.clearTimeout(reactionTimerRef.current);
    reactionTimerRef.current = window.setTimeout(() => {
      setReaction('idle');
      reactionTimerRef.current = null;
    }, durationMs);
  }, [showBubble]);

  const spawnParticles = useCallback((content: string, count: number = 4, startY: number = 40) => {
    const newItems: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + Math.random() + i,
      x: 48 + (Math.random() - 0.5) * 22,
      y: startY + (Math.random() - 0.5) * 14,
      content,
      size: 22 + Math.random() * 12,
      opacity: 1,
    }));
    setParticles((prev) => [...prev, ...newItems]);
    window.setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newItems.some((n) => n.id === p.id)));
    }, 1600);
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      soundEngine.setConfig(!next, 0.8);
      return next;
    });
  }, []);

  const handlePokeHead = useCallback(() => {
    soundEngine.playTap();
    triggerReaction('poke', 'Ouch! My head! 😵', 1800);
    spawnParticles('⭐', 5, 26);
  }, [triggerReaction, spawnParticles]);

  const handleTickleBelly = useCallback(() => {
    soundEngine.playGiggle();
    triggerReaction('tickle', 'Hahaha, that tickles! 😆', 2400);
    spawnParticles('😆', 4, 50);
  }, [triggerReaction, spawnParticles]);

  const handleTapFeet = useCallback(() => {
    soundEngine.playBoing();
    triggerReaction('jump', 'Boing! Watch my toes! 🦘', 1600);
    spawnParticles('👟', 3, 76);
  }, [triggerReaction, spawnParticles]);

  const handlePet = useCallback(() => {
    soundEngine.playPurr();
    triggerReaction('pet', 'Awww, that feels so nice... ❤️', 2000);
    spawnParticles('❤️', 4, 38);
  }, [triggerReaction, spawnParticles]);

  const handleCameraClick = useCallback(() => {
    soundEngine.playCamera();
    setCameraFlash(true);
    window.setTimeout(() => setCameraFlash(false), 550);

    const canvas = document.querySelector('.tom-stage-canvas canvas') as HTMLCanvasElement;
    if (canvas) {
      try {
        const dataUrl = canvas.toDataURL('image/png');
        setSnapshotUrl(dataUrl);
      } catch {
        // Continue if canvas capture is blocked
      }
    }
  }, []);

  const speakPhrase = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !window.speechSynthesis) return;
    setTranscript(trimmed);
    showBubble(`"${trimmed}"`, 3600);
    setSpeechStatus('Repeating');
    setTalking(true);
    talkingRef.current = true;
    const utterance = new SpeechSynthesisUtterance(trimmed);
    utterance.lang = language;
    utterance.pitch = 1.35; // Iconic Talking Tom high pitch
    utterance.rate = 1.15;  // Fast playful speed
    const finish = () => {
      talkingRef.current = false;
      setTalking(false);
      setSpeechStatus(listeningRef.current ? 'Listening' : 'Microphone off');
    };
    utterance.onend = finish;
    utterance.onerror = finish;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [language, showBubble]);

  const handleReplayClick = useCallback(() => {
    if (transcript) {
      speakPhrase(transcript);
    } else {
      const phrases = [
        'Hey there! I am Mimo! Talk to me!',
        'You are awesome! Check out my moves!',
        'Ready to chat! Press the mic and say something!',
      ];
      const pick = phrases[Math.floor(Math.random() * phrases.length)];
      speakPhrase(pick);
    }
  }, [transcript, speakPhrase]);

  const handleDanceClick = useCallback(() => {
    soundEngine.playFanfare();
    triggerReaction('dance', 'Dance party time! 🕺🎶', 3000);
    spawnParticles('🎵', 6, 42);
  }, [triggerReaction, spawnParticles]);

  const handleBagPopClick = useCallback(() => {
    showBubble('Blowing into paper bag... 🛍️', 800);
    window.setTimeout(() => {
      soundEngine.playPop();
      triggerReaction('bagpop', 'BANG! Haha, gotcha! 💥😆', 1800);
      spawnParticles('💥', 6, 46);
    }, 700);
  }, [showBubble, triggerReaction, spawnParticles]);

  const handleFeedCookieClick = useCallback(() => {
    soundEngine.playCrunch();
    triggerReaction('treat', 'Crunch crunch! Delicious cookie! 🍪😋', 2400);
    spawnParticles('🍪', 4, 34);
  }, [triggerReaction, spawnParticles]);

  const handleDrinkMilkClick = useCallback(() => {
    soundEngine.playDrink();
    triggerReaction('drink', 'Slurp! Fresh cold milk! 🥛😋', 2200);
    spawnParticles('🥛', 4, 36);
  }, [triggerReaction, spawnParticles]);

  const handleMysteryClick = useCallback(() => {
    const tricks = ['sneeze', 'gift', 'burp'];
    const trick = tricks[Math.floor(Math.random() * tricks.length)];
    if (trick === 'gift') {
      soundEngine.playCoin();
      setCoins((c) => c + 250);
      showBubble('Surprise gift box! +250 Coins! 🎁🪙', 2200);
      spawnParticles('🎁', 5, 42);
    } else if (trick === 'sneeze') {
      soundEngine.playBoing();
      triggerReaction('poke', 'A-a-a-CHOO! 🤧', 1800);
      spawnParticles('💨', 4, 32);
    } else {
      soundEngine.playGiggle();
      triggerReaction('tickle', 'Burp! Excuse me! 🤭', 2000);
      spawnParticles('✨', 4, 46);
    }
  }, [triggerReaction, showBubble, spawnParticles]);

  const handleTickleFeatherClick = useCallback(() => {
    soundEngine.playGiggle();
    triggerReaction('feather', 'A-a-a-CHOO! The feather tickles! 🪶🤣', 2600);
    spawnParticles('🪶', 5, 48);
  }, [triggerReaction, spawnParticles]);

  const handleBonusCoins = useCallback(() => {
    soundEngine.playCoin();
    setCoins((c) => c + 500);
    showBubble('+500 Bonus Coins! 🪙✨', 1800);
    spawnParticles('🪙', 5, 18);
  }, [showBubble, spawnParticles]);

  useEffect(() => {
    let active = true;
    fetch('/api/config/public').then((response) => {
      if (!response.ok) throw new Error('The backend could not be reached. Start the backend and refresh this page.');
      return response.json();
    }).then((data) => {
      if (!active) return;
      setProviderReady(Boolean(data?.image3d_provider_configured && data?.image3d_provider !== 'mock'));
      if (Number.isFinite(data?.max_upload_size_bytes) && data.max_upload_size_bytes > 0) setMaxPhotoBytes(data.max_upload_size_bytes);
      setProviderChecked(true);
    }).catch((cause: unknown) => {
      if (!active) return;
      setProviderError(cause instanceof Error ? cause.message : 'Avatar provider status could not be checked.');
      setProviderChecked(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => { if (cameraOpen && streamRef.current && videoRef.current) videoRef.current.srcObject = streamRef.current; }, [cameraOpen]);

  const closeCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }, []);

  const stopListening = useCallback(() => {
    speechSessionRef.current += 1;
    listeningRef.current = false;
    talkingRef.current = false;
    setListening(false);
    setTalking(false);
    setSpeechStatus('Microphone off');
    if (resumeTimer.current !== null) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = null;
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    window.speechSynthesis?.cancel();
    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    micStreamRef.current = null;
  }, []);

  useEffect(() => () => { closeCamera(); stopListening(); }, [closeCamera, stopListening]);
  useEffect(() => {
    const onVisibilityChange = () => { if (document.hidden) stopListening(); };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [stopListening]);

  const setSelectedPhoto = async (file: File | null) => {
    const selectionId = ++selectionRef.current;
    setError('');
    setConsented(false);
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(null);
    setPreview('');
    if (!file) return;
    if (!acceptedTypes.includes(file.type)) { setError('Choose a JPG, PNG or WebP image.'); return; }
    if (file.size > maxPhotoBytes) { setError(`That image is over ${(maxPhotoBytes / 1024 / 1024).toFixed(0)} MB. Choose a smaller photo.`); return; }
    try {
      const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
      if (selectionId !== selectionRef.current) return;
      if (!hasSupportedSignature(bytes, file.type)) { setError('The file contents do not match a JPG, PNG or WebP image.'); return; }
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        if (selectionId !== selectionRef.current) { URL.revokeObjectURL(url); return; }
        setPhoto(file);
        setPreview(url);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        if (selectionId === selectionRef.current) setError('This image could not be opened. Try another file.');
      };
      image.src = url;
    } catch {
      if (selectionId === selectionRef.current) setError('This image could not be read. Try another file.');
    }
  };

  const openCamera = async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) { setError('Camera access is not available in this browser. You can upload a photo instead.'); return; }
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      setCameraOpen(true);
    } catch {
      setError('Camera access was denied or unavailable. You can upload a photo instead.');
      closeCamera();
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video?.videoWidth) { setError('Camera is still starting. Try again in a moment.'); return; }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) { setError('Could not capture a photo from this camera.'); closeCamera(); return; }
    context.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      closeCamera();
      if (blob) void setSelectedPhoto(new File([blob], 'selfie.jpg', { type: 'image/jpeg' }));
      else setError('Could not capture a photo from this camera.');
    }, 'image/jpeg', 0.92);
  };

  const enterRoom = (next: AvatarJobState) => {
    if (next.status !== 'succeeded' || !next.model_url) return;
    const url = next.model_url.startsWith('http') ? next.model_url : `${window.location.origin}${next.model_url}`;
    setJob(next);
    setAvatarUrl(url);
    setUsePersonalized(true);
    localStorage.setItem('mimo_avatar_source', 'personalized');
    setJobId(next.job_id);
    localStorage.setItem('mimo_avatar_model', url);
    localStorage.setItem('mimo_avatar_job_id', next.job_id);
    setMode('room');
    void setSelectedPhoto(null);
  };

  const createAvatar = async () => {
    if (!providerReady) { setError('A photo cannot be sent until a verified avatar provider is configured. Your photo remains on this device.'); return; }
    if (!photo || !consented) return;
    setError('');
    setJob(null);
    setMode('generating');
    try {
      const response = await uploadAvatarPhoto(photo);
      setJobId(response.jobId);
      localStorage.setItem('mimo_avatar_job_id', response.jobId);
      const initial = await pollAvatarStatus(response.jobId);
      setJob(initial);
      if (initial.status === 'failed') setError(initial.error_message || response.message || 'Avatar generation failed.');
      else if (initial.status === 'succeeded') enterRoom(initial);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not start avatar generation.');
    }
  };

  useEffect(() => {
    if (!jobId || mode !== 'generating' || job?.status === 'failed' || job?.status === 'succeeded') return;
    let active = true;
    let delay = 1200;
    let timer = 0;
    const poll = async () => {
      try {
        const next = await pollAvatarStatus(jobId);
        if (!active) return;
        setJob(next);
        if (next.status === 'succeeded') { enterRoom(next); return; }
        if (next.status === 'failed') { setError(next.error_message || 'Avatar generation failed.'); return; }
        timer = window.setTimeout(poll, delay);
        delay = Math.min(5000, Math.round(delay * 1.4));
      } catch {
        if (active) {
          setError('Connection interrupted while checking generation. Retrying…');
          timer = window.setTimeout(poll, delay);
          delay = Math.min(8000, delay * 2);
        }
      }
    };
    timer = window.setTimeout(poll, delay);
    return () => { active = false; window.clearTimeout(timer); };
  }, [jobId, mode, job?.status]);

  const startListening = async () => {
    const RecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!RecognitionAPI) { setSpeechStatus('Automatic speech recognition is not supported here. Type a phrase below.'); return; }
    if (!window.speechSynthesis) { setSpeechStatus('Speech playback is not supported in this browser.'); return; }
    if (!navigator.mediaDevices?.getUserMedia) { setSpeechStatus('Microphone access is not available. Type a phrase below.'); return; }
    const session = ++speechSessionRef.current;
    listeningRef.current = true;
    setListening(true);
    setSpeechStatus('Requesting microphone');
    let micStream: MediaStream;
    try { micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false }); }
    catch {
      setSpeechStatus('Microphone permission denied. You can type a phrase instead.');
      stopListening();
      setSpeechStatus('Microphone permission denied. You can type a phrase instead.');
      return;
    }
    if (!listeningRef.current || session !== speechSessionRef.current) {
      micStream.getTracks().forEach((track) => track.stop());
      return;
    }
    micStreamRef.current = micStream;
    const recognition = new RecognitionAPI();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.onresult = (event) => {
      if (session !== speechSessionRef.current) return;
      let result = event.results[event.results.length - 1];
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        if (event.results[index]?.isFinal) result = event.results[index];
      }
      const words = result?.[0]?.transcript?.trim();
      if (!words) return;
      setTranscript(words);
      if (!result.isFinal) { setSpeechStatus('Listening'); return; }
      setSpeechStatus('Repeating in Tom Voice');
      talkingRef.current = true;
      setTalking(true);
      showBubble(`"${words}"`, 3600);
      recognition.stop();
      micStreamRef.current?.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(words);
      utterance.lang = language;
      utterance.pitch = 1.35; // Iconic Talking Tom pitch
      utterance.rate = 1.15;  // Fast playful speed
      utterance.onend = () => {
        if (session !== speechSessionRef.current) return;
        talkingRef.current = false;
        setTalking(false);
        if (listeningRef.current) {
          setSpeechStatus('Listening');
          resumeTimer.current = window.setTimeout(() => { resumeTimer.current = null; void startListening(); }, 450);
        }
      };
      utterance.onerror = () => {
        if (session !== speechSessionRef.current) return;
        talkingRef.current = false;
        setTalking(false);
        if (listeningRef.current) {
          setSpeechStatus('Speech playback failed. Listening again…');
          resumeTimer.current = window.setTimeout(() => { resumeTimer.current = null; void startListening(); }, 450);
        }
      };
      window.speechSynthesis.speak(utterance);
    };
    recognition.onerror = (event) => {
      if (session !== speechSessionRef.current) return;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        stopListening();
        setSpeechStatus('Microphone permission denied. You can type a phrase instead.');
      } else if (event.error === 'no-speech') setSpeechStatus('No speech detected. Keep speaking or try again.');
      else if (event.error !== 'aborted' && listeningRef.current) setSpeechStatus(`Speech recognition error (${event.error}).`);
    };
    recognition.onend = () => {
      if (session !== speechSessionRef.current) return;
      if (listeningRef.current && !talkingRef.current && !window.speechSynthesis.speaking && resumeTimer.current === null) {
        resumeTimer.current = window.setTimeout(() => {
          resumeTimer.current = null;
          if (session === speechSessionRef.current && listeningRef.current) void startListening();
        }, 400);
      }
    };
    try { recognition.start(); setSpeechStatus('Listening'); }
    catch {
      stopListening();
      setSpeechStatus('Could not start speech recognition. Type a phrase below.');
    }
  };

  const handlePhoneClick = useCallback(() => {
    soundEngine.playPhone();
    triggerReaction('phone', 'Ring ring... Hello? Talking Tom here! 📱🐱', 3200);
    if (!listening && !talking) {
      void startListening();
    }
  }, [listening, talking, triggerReaction]);

  const speakTypedText = () => {
    const text = typedText.trim();
    if (!text) return;
    speakPhrase(text);
    setTypedText('');
  };

  const resetAvatar = async () => {
    stopListening();
    if (jobId) await deleteAvatarJob(jobId).catch(() => undefined);
    localStorage.removeItem('mimo_avatar_model');
    localStorage.removeItem('mimo_avatar_source');
    localStorage.removeItem('mimo_avatar_job_id');
    setAvatarUrl('');
    setUsePersonalized(false);
    setJob(null);
    setJobId('');
    setPhoto(null);
    setPreview('');
    setConsented(false);
    setError('');
    setMode('room');
    setFaceStudioOpen(false);
    setSettingsOpen(false);
  };

  const modelFailure = useCallback(() => {
    localStorage.removeItem('mimo_avatar_model');
    localStorage.removeItem('mimo_avatar_source');
    setAvatarUrl('');
    setUsePersonalized(false);
    localStorage.removeItem('mimo_avatar_job_id');
    setJobId('');
    setJob(null);
    setError('The personalized model could not be loaded. Your default human avatar is still available.');
  }, []);
  const setPreference = (key: string, value: string, setter: (value: string) => void) => { localStorage.setItem(key, value); setter(value); };
  const needsTypedFallback = !(window.SpeechRecognition || window.webkitSpeechRecognition) || /denied|error|unsupported|failed|not available/i.test(speechStatus);

  return <main className="mimo-app">
    {mode !== 'room' && (
      <header className="topbar">
        <a className="brand" href="#home" onClick={(event) => event.preventDefault()}><span className="brand-mark"><Sparkles size={17} /></span><span>MIMO</span></a>
        <div className="topbar-center"><span className="topbar-note">YOUR PRIVATE PHOTO AVATAR</span></div>
        <span className="secure-note"><ShieldCheck size={15} /> PRIVATE BY DESIGN</span>
      </header>
    )}

    {mode === 'onboarding' && <section className="onboarding">
      <div className="onboarding-copy">
        <div className="eyebrow"><span /> CREATE YOUR AVATAR</div>
        <h1>Make it <em>you.</em></h1>
        <p className="intro">Upload a clear photo or take a selfie. After you confirm, it will be sent to the configured avatar provider to create your human 3D model.</p>
        <div className="upload-actions">
          <button className="primary-button" onClick={() => fileInputRef.current?.click()}><Upload size={18} /> Upload a photo</button>
          <button className="secondary-button" onClick={() => void openCamera()}><Camera size={18} /> Open camera</button>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(event) => { void setSelectedPhoto(event.target.files?.[0] || null); event.currentTarget.value = ''; }} />
        </div>
        <div className="format-note"><span>JPG</span><span>PNG</span><span>WEBP</span><i /> UP TO {(maxPhotoBytes / 1024 / 1024).toFixed(0)} MB</div>
        {error && mode === 'onboarding' && <div className="inline-error" role="alert">{error}</div>}
        {cameraOpen && <div className="camera-card"><video ref={videoRef} autoPlay muted playsInline /><div className="camera-actions"><button className="secondary-button small" onClick={closeCamera}><X size={16} /> Close camera</button><button className="primary-button small" onClick={capturePhoto}><Camera size={16} /> Take photo</button></div></div>}
        {preview && !cameraOpen && <div className="preview-card"><img src={preview} alt="Selected portrait preview" /><div className="preview-caption"><Check size={16} /><span>Photo ready to review</span></div><button className="remove-photo" aria-label="Remove photo" onClick={() => void setSelectedPhoto(null)}><Trash2 size={16} /></button></div>}
        {photo && providerReady && <div className="consent-row"><label><input type="checkbox" checked={consented} onChange={(event) => setConsented(event.target.checked)} /><span>I agree to send this photo to the avatar provider to create my model.</span></label><p>Your photo is sent only after you confirm. You can delete the generated model from this device.</p></div>}
        {providerChecked && !providerReady && <div className="provider-notice" role="status"><CircleHelp size={17} /><div><strong>Human avatar generation is not configured yet</strong><p>{providerError || 'Your photo stays on this device. Configure a verified human-avatar provider on the backend before creating your model.'}</p></div></div>}
        {!providerChecked && <div className="provider-notice" role="status"><LoaderCircle size={17} className="spin" /><div><strong>Checking avatar setup</strong><p>Your photo will stay on this device until you confirm creation.</p></div></div>}
        {providerReady && <div className="provider-notice"><ShieldCheck size={17} /><div><strong>Private until you confirm</strong><p>Generation may not perfectly match one photo. Mouth animation depends on the model's facial rig.</p></div></div>}
        <button className="create-button" disabled={!providerChecked || (providerReady && (!photo || !consented))} onClick={() => void createAvatar()}>{providerReady ? 'Create my avatar' : 'View setup steps'} <span>→</span></button>
        <p className="privacy-line onboarding-privacy"><ShieldCheck size={13} /> No photo is sent without your confirmation. Remove it any time before creating.</p>
      </div>
      <div className="onboarding-art"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="portrait-frame"><div className="portrait-placeholder"><div className="model-placeholder-orbit"><span /><span /><i /></div><strong>YOUR 3D MODEL</strong><small>appears here after generation</small></div><div className="frame-top"><span>PORTRAIT STUDIO</span><span>01 — 01</span></div><div className="frame-bottom"><span>YOUR PHOTO BECOMES YOUR AVATAR</span><Sparkles size={15} /></div></div><div className="art-caption"><span>ONE PHOTO.</span><span>YOUR OWN HUMAN 3D AVATAR.</span></div><div className="float-card"><span className="float-icon"><Volume2 size={16} /></span><span>It repeats you.<br /><b>In a playful voice.</b></span></div></div>
    </section>}

    {mode === 'generating' && <section className="generation-screen"><div className="generation-orb"><span /><span /><span /><LoaderCircle className="spin" size={26} /></div><p className="eyebrow centered">AVATAR STUDIO</p><h1>{job?.status === 'failed' || error ? 'Generation needs attention.' : 'Building your avatar.'}</h1><p className="generation-copy">{job?.status === 'failed' || error ? (error || job?.error_message) : 'Your confirmed photo is being processed by the configured provider.'}</p><div className="status-list">{(['queued', 'processing', 'ready'] as const).map((step, index) => <div key={step} className={`status-step ${job?.status === step || (step === 'ready' && job?.status === 'succeeded') ? 'active' : index === 0 && !job ? 'active' : ''}`}><span>{index + 1}</span>{step}</div>)}</div><div className="generation-buttons">{(job?.status === 'failed' || error) ? <><button className="primary-button" onClick={() => { setMode('room'); setSettingsOpen(true); setFaceStudioOpen(true); setError(''); }}>Back to photo</button><button className="secondary-button" onClick={() => void createAvatar()} disabled={!photo || !consented}><RotateCcw size={16} /> Try again</button><button className="text-button" onClick={() => { setMode('room'); setAvatarUrl(''); setUsePersonalized(false); localStorage.removeItem('mimo_avatar_model'); localStorage.removeItem('mimo_avatar_source'); localStorage.removeItem('mimo_avatar_job_id'); setJob(null); setJobId(''); setError(''); }}>Use default avatar</button></> : <p className="generation-wait-note">Keep this page open while generation runs. The room opens only after a model is ready.</p>}</div></section>}

    {/* TALKING TOM MODE */}
    {mode === 'room' && <section className="talking-room talking-tom-mode">
      {/* 3D Scene Stage (Full Room) */}
      <div className="tom-stage-canvas">
        <Canvas
          camera={{ position: [0, 1.06, 4.9], fov: 34 }}
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          fallback={<div className="avatar-render-fallback" role="status">3D display is unavailable in this browser. Voice repeat and avatar customization are still available.</div>}
        >
          <ambientLight intensity={0.75} />
          <directionalLight position={[-3, 4.5, 2.5]} intensity={2.2} castShadow />
          <directionalLight position={[3, 2, -1]} intensity={0.6} />
          <hemisphereLight args={['#fff8ef', '#5a4968', 1.1]} />

          {/* Talking Tom 3D Room Environment (Purple Striped Wallpaper, Wood Floor, Window) */}
          <TalkingTomRoom3D />

          {/* 3D Character Model (model.fbx by default, or Talking Tom / Bundled Human / Personalized) */}
          {usePersonalized && avatarUrl ? (
            <GeneratedModel url={avatarUrl} talking={talking} onFailure={modelFailure} />
          ) : characterType === 'tom' ? (
            <TalkingTomCat3D
              talking={talking}
              reaction={reaction}
              reactionStartTime={reactionStartTime}
              hasGlasses={hasGlasses}
              hasBowTie={hasBowTie}
              hasSunglasses={hasSunglasses}
              hasPartyHat={hasPartyHat}
              onPokeHead={handlePokeHead}
              onTickleBelly={handleTickleBelly}
              onTapFeet={handleTapFeet}
              onPet={handlePet}
            />
          ) : characterType === 'human' ? (
            <BundledHuman
              talking={talking}
              skinTone={skinTone}
              hairColor={hairColor}
              clothingColor={clothingColor}
              reaction={reaction}
              reactionStartTime={reactionStartTime}
              hasGlasses={hasGlasses}
              hasBowTie={hasBowTie}
              hasSunglasses={hasSunglasses}
              hasPartyHat={hasPartyHat}
              onPokeHead={handlePokeHead}
              onTickleBelly={handleTickleBelly}
              onTapFeet={handleTapFeet}
              onPet={handlePet}
            />
          ) : (
            <UserModelFBX
              talking={talking}
              reaction={reaction}
              reactionStartTime={reactionStartTime}
              hasGlasses={hasGlasses}
              hasBowTie={hasBowTie}
              hasSunglasses={hasSunglasses}
              hasPartyHat={hasPartyHat}
              onPokeHead={handlePokeHead}
              onTickleBelly={handleTickleBelly}
              onTapFeet={handleTapFeet}
              onPet={handlePet}
            />
          )}

          <OrbitControls
            enablePan={false}
            enableRotate={false}
            enableZoom={false}
            target={[0, 1.02, 0]}
          />
        </Canvas>
      </div>

      {/* Iconic Talking Tom Circular Buttons */}
      <TalkingTomButtons
        onCameraClick={handleCameraClick}
        onReplayClick={handleReplayClick}
        onInfoClick={() => setInfoOpen(true)}
        onDanceClick={handleDanceClick}
        onBagPopClick={handleBagPopClick}
        onFeedCookieClick={handleFeedCookieClick}
        onDrinkMilkClick={handleDrinkMilkClick}
        onWardrobeClick={() => setWardrobeOpen(true)}
        onMysteryClick={handleMysteryClick}
        onTickleFeatherClick={handleTickleFeatherClick}
        onPhoneClick={handlePhoneClick}
        coins={coins}
        onBonusCoins={handleBonusCoins}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenSettings={() => setSettingsOpen(true)}
        listening={listening}
        talking={talking}
        onToggleListening={() => listening || talking ? stopListening() : void startListening()}
        speechStatus={speechStatus}
      />

      {/* Floating Particles, Speech Bubble, Flash, Polaroid Snapshot, Wardrobe, Info Modals */}
      <TalkingTomOverlays
        particles={particles}
        cameraFlash={cameraFlash}
        snapshotUrl={snapshotUrl}
        onCloseSnapshot={() => setSnapshotUrl(null)}
        wardrobeOpen={wardrobeOpen}
        onCloseWardrobe={() => setWardrobeOpen(false)}
        infoOpen={infoOpen}
        onCloseInfo={() => setInfoOpen(false)}
        hasGlasses={hasGlasses}
        setHasGlasses={setHasGlasses}
        hasBowTie={hasBowTie}
        setHasBowTie={setHasBowTie}
        hasSunglasses={hasSunglasses}
        setHasSunglasses={setHasSunglasses}
        hasPartyHat={hasPartyHat}
        setHasPartyHat={setHasPartyHat}
        clothingColor={clothingColor}
        setClothingColor={(c) => setPreference('mimo_clothing_color', c, setClothingColor)}
        coins={coins}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        speechBubbleText={speechBubbleText}
      />

      {/* Typed Input Fallback Pill if mic is off */}
      {needsTypedFallback && (
        <div className="typed-fallback" style={{ position: 'absolute', bottom: '96px', left: '50%', transform: 'translateX(-50%)', zIndex: 14 }}>
          <input
            aria-label="Type a phrase for the avatar to repeat"
            placeholder="Type a phrase to repeat in Tom voice..."
            value={typedText}
            onChange={(event) => setTypedText(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') speakTypedText(); }}
          />
          <button className="typed-fallback-submit" onClick={speakTypedText} disabled={!typedText.trim()}>
            Repeat
          </button>
        </div>
      )}

      {/* Settings Panel */}
      {settingsOpen && <aside className="settings-panel">
        <button className="panel-close" aria-label="Close settings" onClick={() => { closeCamera(); setSettingsOpen(false); }}><X size={17} /></button>
        <h2><Palette size={19} /> Edit / Customize</h2>
        <label className="setting-label">Character Model</label>
        <div className="avatar-choice" style={{ marginBottom: '12px' }}>
          <button
            className="text-button"
            aria-pressed={characterType === 'fbx'}
            onClick={() => { setCharacterType('fbx'); localStorage.setItem('mimo_character_type', 'fbx'); }}
          >
            ⭐ model.fbx
          </button>
          <button
            className="text-button"
            aria-pressed={characterType === 'tom'}
            onClick={() => { setCharacterType('tom'); localStorage.setItem('mimo_character_type', 'tom'); }}
          >
            🐱 Talking Tom Cat
          </button>
          <button
            className="text-button"
            aria-pressed={characterType === 'human'}
            onClick={() => { setCharacterType('human'); localStorage.setItem('mimo_character_type', 'human'); }}
          >
            👤 Human Model
          </button>
        </div>
        <div className="avatar-choice"><button className="text-button" aria-pressed={!usePersonalized} onClick={() => { setUsePersonalized(false); localStorage.setItem('mimo_avatar_source', 'default'); }}>Default character</button>{avatarUrl ? <button className="text-button" aria-pressed={usePersonalized} onClick={() => { setUsePersonalized(true); localStorage.setItem('mimo_avatar_source', 'personalized'); }}>Use this avatar</button> : <span>Personalized avatar not created yet</span>}</div>
        {!usePersonalized && <div className="color-grid"><label className="setting-label">Skin tone<select value={skinTone} onChange={(event) => setPreference('mimo_skin_tone', event.target.value, setSkinTone)}><option value="#c98b67">Warm tan</option><option value="#f0c7a5">Light</option><option value="#8b573d">Deep</option></select></label><label className="setting-label">Hair color<select value={hairColor} onChange={(event) => setPreference('mimo_hair_color', event.target.value, setHairColor)}><option value="#30231e">Dark brown</option><option value="#181818">Black</option><option value="#80522f">Chestnut</option></select></label><label className="setting-label">Clothing<select value={clothingColor} onChange={(event) => setPreference('mimo_clothing_color', event.target.value, setClothingColor)}><option value="#62766c">Sage</option><option value="#5b6b55">Olive</option><option value="#435a77">Blue</option><option value="#805869">Plum</option></select></label></div>}
        <label className="setting-label">Speech language<select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="en-US">English (US)</option><option value="en-GB">English (UK)</option><option value="hi-IN">Hindi</option></select></label>
        <button className="customize-face-button" onClick={() => setFaceStudioOpen((open) => !open)}><Sparkles size={16} /> Face to 3D · Create avatar from photo <span>{faceStudioOpen ? '−' : '+'}</span></button>
        {faceStudioOpen && <div className="face-studio"><p className="face-studio-intro">Upload a clear face photo or take a selfie. Review it before sending it to the configured provider.</p><div className="upload-actions face-upload-actions"><button className="primary-button small" onClick={() => fileInputRef.current?.click()}><Upload size={15} /> Upload photo</button><button className="secondary-button small" onClick={() => void openCamera()}><Camera size={15} /> Take photo</button><input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(event) => { void setSelectedPhoto(event.target.files?.[0] || null); event.currentTarget.value = ''; }} /></div>
          {cameraOpen && <div className="camera-card"><video ref={videoRef} autoPlay muted playsInline /><div className="camera-actions"><button className="secondary-button small" onClick={closeCamera}>Close camera</button><button className="primary-button small" onClick={capturePhoto}>Capture photo</button></div></div>}
          {preview && !cameraOpen && <div className="preview-card face-preview"><img src={preview} alt="Preview of photo for avatar generation" /><button className="remove-photo" aria-label="Remove photo" onClick={() => void setSelectedPhoto(null)}><Trash2 size={15} /></button></div>}
          <p className="privacy-line">Your photo stays on this device until a provider is ready and you confirm generation.</p><label className="consent-inline"><input type="checkbox" checked={consented} onChange={(event) => setConsented(event.target.checked)} /><span>I agree to send this photo to the configured avatar provider.</span></label>
          {providerChecked && !providerReady && <div className="inline-provider-note" role="status"><strong>Face to 3D provider not configured</strong><p>{providerError || 'Your photo will not be uploaded. Add provider credentials to backend/.env and restart the backend.'}</p><pre><code>IMAGE3D_PROVIDER="meshy"<br />MESHY_API_KEY="your-provider-key"<br />HUMAN_AVATAR_PROVIDER_VERIFIED="True"</code></pre><p>Keep the key on the backend. Meshy image-to-3D does not guarantee an accurate face likeness or facial animation.</p></div>}
          {!providerChecked && <p className="inline-provider-note" role="status">Checking provider setup. Your photo remains local.</p>}{providerReady && <p className="inline-provider-note" role="status">Provider ready. Your photo is sent only after you select Create avatar.</p>}
          {error && <div className="inline-error" role="alert">{error}</div>}<button className="create-button face-create-button" disabled={!photo || !consented || !providerReady || !providerChecked} onClick={() => void createAvatar()}>{providerReady ? 'Create avatar' : 'Provider setup required'} <span>→</span></button><button className="text-button" onClick={() => { closeCamera(); void setSelectedPhoto(null); setConsented(false); setError(''); }}>Cancel / remove photo</button></div>}
        <p className="panel-note">Speech recognition availability depends on your browser. Replayed speech uses browser text-to-speech with Talking Tom pitch shifting.</p><button className="delete-avatar" onClick={() => void resetAvatar()}><RotateCcw size={15} /> Reset to default avatar</button>
      </aside>}
    </section>}

    {mode !== 'room' && <footer className="footer-note">MIMO <span>·</span> TALKING ROOM</footer>}
  </main>;
}
