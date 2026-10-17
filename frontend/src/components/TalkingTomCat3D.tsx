import React, { useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

export type TomReactionType =
  | 'idle'
  | 'poke'
  | 'tickle'
  | 'jump'
  | 'dance'
  | 'bagpop'
  | 'treat'
  | 'drink'
  | 'pet'
  | 'phone'
  | 'feather'
  | 'talking';

interface TalkingTomCat3DProps {
  talking: boolean;
  reaction: TomReactionType;
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

export const TalkingTomCat3D: React.FC<TalkingTomCat3DProps> = ({
  talking,
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
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const leftEarRef = useRef<THREE.Group>(null);
  const rightEarRef = useRef<THREE.Group>(null);
  const jawRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftEyelidRef = useRef<THREE.Mesh>(null);
  const rightEyelidRef = useRef<THREE.Mesh>(null);

  // Blinking timer & state
  const [blinkProgress, setBlinkProgress] = useState(0);
  const blinkTimer = useRef(2 + Math.random() * 3);

  // Drag-to-pet tracking
  const isDragging = useRef(false);
  const lastPointerPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragDistance = useRef(0);

  // Authentic Talking Tom color palette
  const furColor = '#6b7078'; // Tabby slate grey fur
  const bellyColor = '#f2f4f8'; // White belly and chest patch
  const muzzleColor = '#e8ecf2'; // White cat muzzle
  const innerEarColor = '#f5a6b8'; // Soft pink inner ears
  const noseColor = '#e8728a'; // Rose pink cat nose
  const eyeColor = '#27ae60'; // Emerald green cat iris
  const eyeRimColor = '#1e824c'; // Dark green iris border
  const pupilColor = '#111512'; // Vertical slit pupil
  const whiskerColor = '#22252a'; // Whiskers

  useFrame((_, delta) => {
    // Blinking logic
    blinkTimer.current -= delta;
    if (blinkTimer.current <= 0) {
      setBlinkProgress(1);
      blinkTimer.current = 2.8 + Math.random() * 3.2;
    }
    if (blinkProgress > 0) {
      setBlinkProgress((prev) => Math.max(0, prev - delta * 9));
    }

    const t = performance.now() * 0.003;
    const elapsedSinceReaction = performance.now() * 0.001 - reactionStartTime;
    const isReacting = elapsedSinceReaction >= 0 && elapsedSinceReaction < 2.5;

    if (!rootRef.current) return;

    // Resting values
    let bodyY = Math.sin(t * 1.8) * 0.015;
    let bodyRotY = 0;
    let bodyRotZ = 0;
    let headRotX = Math.sin(t * 1.2) * 0.02;
    let headRotY = Math.sin(t * 0.7) * 0.04;
    let headRotZ = 0;
    let jawOpen = 0;
    let leftEarTwitch = Math.sin(t * 3.5) > 0.94 ? 0.16 : 0;
    let rightEarTwitch = Math.cos(t * 3.2) > 0.95 ? -0.16 : 0;
    let tailRotZ = Math.sin(t * 2.2) * 0.22;
    let tailRotY = Math.cos(t * 1.4) * 0.18;

    // Iconic Tom resting stance: hands behind back
    let leftArmRotX = 0.55;
    let leftArmRotY = -0.42;
    let leftArmRotZ = 0.05;
    let rightArmRotX = 0.55;
    let rightArmRotY = 0.42;
    let rightArmRotZ = -0.05;

    // Reaction Animation Overrides
    if (isReacting) {
      if (reaction === 'poke') {
        const decay = Math.exp(-elapsedSinceReaction * 2.2);
        const wobble = Math.sin(elapsedSinceReaction * 18) * decay;
        headRotX = -0.35 * decay;
        headRotZ = 0.28 * wobble;
        headRotY = 0.22 * wobble;
        bodyRotZ = 0.08 * wobble;
        leftArmRotZ = 0.5;
        rightArmRotZ = -0.5;
      } else if (reaction === 'tickle') {
        const giggleFreq = Math.sin(elapsedSinceReaction * 20);
        bodyY = Math.abs(giggleFreq) * 0.05;
        bodyRotZ = giggleFreq * 0.05;
        headRotX = -0.18 + giggleFreq * 0.07;
        jawOpen = 0.35 + Math.abs(giggleFreq) * 0.25;
        leftArmRotX = -0.6;
        leftArmRotY = 0.35;
        leftArmRotZ = 0.3;
        rightArmRotX = -0.6;
        rightArmRotY = -0.35;
        rightArmRotZ = -0.3;
      } else if (reaction === 'jump') {
        if (elapsedSinceReaction < 1.0) {
          const jumpArc = Math.sin((elapsedSinceReaction / 1.0) * Math.PI);
          bodyY = jumpArc * 0.5;
          headRotX = 0.12;
          leftArmRotZ = 1.1;
          rightArmRotZ = -1.1;
          jawOpen = 0.35;
        }
      } else if (reaction === 'dance') {
        const danceT = elapsedSinceReaction * 7;
        bodyY = Math.abs(Math.sin(danceT)) * 0.07;
        bodyRotY = Math.sin(danceT) * 0.32;
        bodyRotZ = Math.sin(danceT) * 0.14;
        headRotZ = -Math.sin(danceT) * 0.12;
        leftArmRotZ = Math.sin(danceT) * 0.7 + 0.35;
        rightArmRotZ = -Math.sin(danceT + Math.PI) * 0.7 - 0.35;
        tailRotZ = Math.sin(danceT * 2) * 0.45;
        jawOpen = 0.22;
      } else if (reaction === 'bagpop') {
        if (elapsedSinceReaction < 0.7) {
          const shockArc = Math.sin((elapsedSinceReaction / 0.7) * Math.PI);
          bodyY = shockArc * 0.38;
          headRotX = -0.32;
          leftArmRotX = -0.75;
          rightArmRotX = -0.75;
          leftArmRotZ = 1.25;
          rightArmRotZ = -1.25;
          jawOpen = 0.55;
        }
      } else if (reaction === 'treat') {
        jawOpen = Math.abs(Math.sin(elapsedSinceReaction * 14)) * 0.42;
        headRotX = 0.08 + Math.sin(elapsedSinceReaction * 8) * 0.05;
        leftArmRotX = -0.65;
        leftArmRotY = 0.2;
        leftArmRotZ = 0.35;
      } else if (reaction === 'drink') {
        jawOpen = Math.abs(Math.sin(elapsedSinceReaction * 10)) * 0.32;
        headRotX = 0.22 + Math.sin(elapsedSinceReaction * 6) * 0.04;
      } else if (reaction === 'pet') {
        headRotZ = 0.16;
        headRotX = 0.08;
        bodyRotZ = 0.04;
        tailRotZ = Math.sin(t * 3.8) * 0.35;
      } else if (reaction === 'feather') {
        if (elapsedSinceReaction < 0.8) {
          headRotX = -0.28;
          jawOpen = 0.25;
        } else if (elapsedSinceReaction < 1.4) {
          headRotX = 0.42;
          bodyY = -0.04;
          jawOpen = 0.55;
        }
      } else if (reaction === 'phone') {
        rightArmRotX = -1.15;
        rightArmRotY = -0.55;
        rightArmRotZ = -0.28;
        headRotZ = -0.14;
        jawOpen = Math.abs(Math.sin(elapsedSinceReaction * 8)) * 0.22;
      }
    }

    // Talking Speech Mouth Movement
    if (talking) {
      jawOpen = 0.12 + Math.abs(Math.sin(t * 15)) * 0.42;
      headRotX += Math.sin(t * 3.8) * 0.035;
      headRotY += Math.sin(t * 2.8) * 0.045;
    }

    // Apply transforms
    rootRef.current.position.y = bodyY;
    rootRef.current.rotation.y = bodyRotY;
    rootRef.current.rotation.z = bodyRotZ;

    if (headRef.current) {
      headRef.current.rotation.x = headRotX;
      headRef.current.rotation.y = headRotY;
      headRef.current.rotation.z = headRotZ;
    }

    if (jawRef.current) {
      jawRef.current.position.y = -0.22 - jawOpen * 0.06;
      jawRef.current.rotation.x = jawOpen * 0.42;
    }

    if (leftEarRef.current) leftEarRef.current.rotation.z = 0.12 + leftEarTwitch;
    if (rightEarRef.current) rightEarRef.current.rotation.z = -0.12 + rightEarTwitch;

    if (tailRef.current) {
      tailRef.current.rotation.z = tailRotZ;
      tailRef.current.rotation.y = tailRotY;
    }

    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = leftArmRotX;
      leftArmRef.current.rotation.y = leftArmRotY;
      leftArmRef.current.rotation.z = leftArmRotZ;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = rightArmRotX;
      rightArmRef.current.rotation.y = rightArmRotY;
      rightArmRef.current.rotation.z = rightArmRotZ;
    }

    // Eyelid Blinking Animation
    const isSleepingOrPurring = reaction === 'pet';
    const blinkVal = isSleepingOrPurring ? 0.95 : blinkProgress > 0 ? 0.95 : 0;
    if (leftEyelidRef.current) leftEyelidRef.current.scale.y = blinkVal;
    if (rightEyelidRef.current) rightEyelidRef.current.scale.y = blinkVal;
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    isDragging.current = true;
    lastPointerPos.current = { x: e.clientX, y: e.clientY };
    dragDistance.current = 0;
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPointerPos.current.x;
    const dy = e.clientY - lastPointerPos.current.y;
    dragDistance.current += Math.hypot(dx, dy);
    lastPointerPos.current = { x: e.clientX, y: e.clientY };

    if (dragDistance.current > 70) {
      onPet?.();
      dragDistance.current = 0;
    }
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  return (
    <group
      ref={rootRef}
      position={[0, 0, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* ============================================================ */}
      {/* 1. BODY & CHEST / BELLY                                     */}
      {/* ============================================================ */}
      <group
        ref={bodyRef}
        position={[0, 0.98, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onTickleBelly?.();
        }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        {/* Main Pear-Shaped Grey Body */}
        <mesh position={[0, 0, 0]} scale={[0.58, 0.74, 0.48]} castShadow receiveShadow>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color={furColor} roughness={0.7} metalness={0.04} />
        </mesh>

        {/* Big White Chest & Belly Patch (Matching Talking Tom Reference) */}
        <mesh position={[0, -0.04, 0.24]} scale={[0.42, 0.62, 0.26]} receiveShadow>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color={bellyColor} roughness={0.72} metalness={0.02} />
        </mesh>

        {/* Arms behind back in iconic Tom pose */}
        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.52, 0.28, 0]}>
          <mesh position={[-0.1, -0.26, 0]} rotation={[0, 0, 0.22]} castShadow>
            <cylinderGeometry args={[0.11, 0.1, 0.58, 16]} />
            <meshStandardMaterial color={furColor} roughness={0.7} />
          </mesh>
          <mesh position={[-0.18, -0.56, 0]} scale={[0.12, 0.12, 0.12]} castShadow>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color={bellyColor} roughness={0.65} />
          </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.52, 0.28, 0]}>
          <mesh position={[0.1, -0.26, 0]} rotation={[0, 0, -0.22]} castShadow>
            <cylinderGeometry args={[0.11, 0.1, 0.58, 16]} />
            <meshStandardMaterial color={furColor} roughness={0.7} />
          </mesh>
          <mesh position={[0.18, -0.56, 0]} scale={[0.12, 0.12, 0.12]} castShadow>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color={bellyColor} roughness={0.65} />
          </mesh>
        </group>

        {/* Cat Tail in Back */}
        <group ref={tailRef} position={[0, -0.4, -0.38]}>
          <mesh position={[0, 0.32, -0.14]} rotation={[-0.5, 0, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.08, 0.75, 16]} />
            <meshStandardMaterial color={furColor} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.7, -0.28]} scale={[0.075, 0.1, 0.075]} castShadow>
            <sphereGeometry args={[1, 12, 12]} />
            <meshStandardMaterial color={bellyColor} roughness={0.65} />
          </mesh>
        </group>
      </group>

      {/* ============================================================ */}
      {/* 2. LEGS & WHITE PAWS ON FLOOR                                */}
      {/* ============================================================ */}
      {/* Left Leg */}
      <group
        position={[-0.24, 0.24, 0.03]}
        onClick={(e) => {
          e.stopPropagation();
          onTapFeet?.();
        }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.13, 0.48, 16]} />
          <meshStandardMaterial color={furColor} roughness={0.7} />
        </mesh>
        {/* Left White Paw */}
        <mesh position={[0, -0.2, 0.1]} scale={[0.16, 0.1, 0.22]} castShadow receiveShadow>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={bellyColor} roughness={0.65} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group
        position={[0.24, 0.24, 0.03]}
        onClick={(e) => {
          e.stopPropagation();
          onTapFeet?.();
        }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.13, 0.48, 16]} />
          <meshStandardMaterial color={furColor} roughness={0.7} />
        </mesh>
        {/* Right White Paw */}
        <mesh position={[0, -0.2, 0.1]} scale={[0.16, 0.1, 0.22]} castShadow receiveShadow>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={bellyColor} roughness={0.65} />
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 3. HEAD & EXPRESSIVE TALKING TOM FACE                         */}
      {/* ============================================================ */}
      <group
        ref={headRef}
        position={[0, 1.82, 0.04]}
        onClick={(e) => {
          e.stopPropagation();
          onPokeHead?.();
        }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        {/* Main Cat Head (rounded with wide cheeks) */}
        <mesh position={[0, 0, 0]} scale={[0.62, 0.52, 0.5]} castShadow receiveShadow>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color={furColor} roughness={0.7} metalness={0.04} />
        </mesh>

        {/* Wide Chubby Lower Cheeks */}
        <mesh position={[-0.38, -0.1, 0.08]} scale={[0.28, 0.24, 0.28]} castShadow>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={furColor} roughness={0.7} />
        </mesh>
        <mesh position={[0.38, -0.1, 0.08]} scale={[0.28, 0.24, 0.28]} castShadow>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={furColor} roughness={0.7} />
        </mesh>

        {/* White Muzzle (Center lower face) */}
        <mesh position={[0, -0.12, 0.32]} scale={[0.42, 0.28, 0.24]}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshStandardMaterial color={muzzleColor} roughness={0.68} />
        </mesh>

        {/* Prominent Pink Cat Nose (Rose pink triangle) */}
        <mesh position={[0, 0.01, 0.54]} scale={[0.13, 0.09, 0.09]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[1, 1.2, 16]} />
          <meshStandardMaterial color={noseColor} roughness={0.35} />
        </mesh>

        {/* Nostrils */}
        <mesh position={[-0.035, -0.02, 0.55]} scale={[0.016, 0.025, 0.016]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color="#4a1520" />
        </mesh>
        <mesh position={[0.035, -0.02, 0.55]} scale={[0.016, 0.025, 0.016]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color="#4a1520" />
        </mesh>

        {/* Whiskers (3 left, 3 right) */}
        <group position={[-0.28, -0.12, 0.38]}>
          <mesh position={[-0.18, 0.04, 0]} rotation={[0, 0, 0.14]}>
            <cylinderGeometry args={[0.004, 0.004, 0.38, 8]} />
            <meshBasicMaterial color={whiskerColor} />
          </mesh>
          <mesh position={[-0.2, -0.01, 0]} rotation={[0, 0, 0.01]}>
            <cylinderGeometry args={[0.004, 0.004, 0.4, 8]} />
            <meshBasicMaterial color={whiskerColor} />
          </mesh>
          <mesh position={[-0.18, -0.05, 0]} rotation={[0, 0, -0.12]}>
            <cylinderGeometry args={[0.004, 0.004, 0.38, 8]} />
            <meshBasicMaterial color={whiskerColor} />
          </mesh>
        </group>
        <group position={[0.28, -0.12, 0.38]}>
          <mesh position={[0.18, 0.04, 0]} rotation={[0, 0, -0.14]}>
            <cylinderGeometry args={[0.004, 0.004, 0.38, 8]} />
            <meshBasicMaterial color={whiskerColor} />
          </mesh>
          <mesh position={[0.2, -0.01, 0]} rotation={[0, 0, -0.01]}>
            <cylinderGeometry args={[0.004, 0.004, 0.4, 8]} />
            <meshBasicMaterial color={whiskerColor} />
          </mesh>
          <mesh position={[0.18, -0.05, 0]} rotation={[0, 0, 0.12]}>
            <cylinderGeometry args={[0.004, 0.004, 0.38, 8]} />
            <meshBasicMaterial color={whiskerColor} />
          </mesh>
        </group>

        {/* ============================================================ */}
        {/* CAT EARS (Triangles with pink inner pads)                   */}
        {/* ============================================================ */}
        {/* Left Ear */}
        <group ref={leftEarRef} position={[-0.38, 0.4, 0]}>
          <mesh rotation={[0.04, 0.12, 0.38]} castShadow>
            <coneGeometry args={[0.24, 0.5, 4]} />
            <meshStandardMaterial color={furColor} roughness={0.7} />
          </mesh>
          <mesh position={[0.02, -0.02, 0.05]} rotation={[0.04, 0.12, 0.38]}>
            <coneGeometry args={[0.15, 0.38, 4]} />
            <meshStandardMaterial color={innerEarColor} roughness={0.65} />
          </mesh>
        </group>

        {/* Right Ear */}
        <group ref={rightEarRef} position={[0.38, 0.4, 0]}>
          <mesh rotation={[0.04, -0.12, -0.38]} castShadow>
            <coneGeometry args={[0.24, 0.5, 4]} />
            <meshStandardMaterial color={furColor} roughness={0.7} />
          </mesh>
          <mesh position={[-0.02, -0.02, 0.05]} rotation={[0.04, -0.12, -0.38]}>
            <coneGeometry args={[0.15, 0.38, 4]} />
            <meshStandardMaterial color={innerEarColor} roughness={0.65} />
          </mesh>
        </group>

        {/* ============================================================ */}
        {/* EXPRESSIVE EMERALD GREEN CAT EYES                            */}
        {/* ============================================================ */}
        {/* Left Eye */}
        <group position={[-0.22, 0.12, 0.38]}>
          {/* White sclera */}
          <mesh scale={[0.17, 0.2, 0.08]}>
            <sphereGeometry args={[1, 24, 24]} />
            <meshStandardMaterial color="#ffffff" roughness={0.15} />
          </mesh>
          {/* Emerald Green Iris */}
          <mesh position={[0.015, 0, 0.05]} scale={[0.125, 0.15, 0.05]}>
            <sphereGeometry args={[1, 24, 24]} />
            <meshStandardMaterial color={eyeColor} roughness={0.15} metalness={0.1} />
          </mesh>
          {/* Dark Green Iris Rim */}
          <mesh position={[0.015, 0, 0.06]} scale={[0.13, 0.155, 0.02]}>
            <torusGeometry args={[0.85, 0.08, 16, 32]} />
            <meshBasicMaterial color={eyeRimColor} />
          </mesh>
          {/* Vertical Slit Cat Pupil */}
          <mesh position={[0.015, 0, 0.08]} scale={[0.04, 0.12, 0.02]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color={pupilColor} />
          </mesh>
          {/* Specular Catchlight */}
          <mesh position={[0.05, 0.05, 0.095]} scale={[0.03, 0.03, 0.01]}>
            <sphereGeometry args={[1, 12, 12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Eyelid for Blinking */}
          <mesh
            ref={leftEyelidRef}
            position={[0, 0.16, 0.08]}
            scale={[0.18, 0, 0.09]}
          >
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color={furColor} roughness={0.7} />
          </mesh>
        </group>

        {/* Right Eye */}
        <group position={[0.22, 0.12, 0.38]}>
          {/* White sclera */}
          <mesh scale={[0.17, 0.2, 0.08]}>
            <sphereGeometry args={[1, 24, 24]} />
            <meshStandardMaterial color="#ffffff" roughness={0.15} />
          </mesh>
          {/* Emerald Green Iris */}
          <mesh position={[-0.015, 0, 0.05]} scale={[0.125, 0.15, 0.05]}>
            <sphereGeometry args={[1, 24, 24]} />
            <meshStandardMaterial color={eyeColor} roughness={0.15} metalness={0.1} />
          </mesh>
          {/* Dark Green Iris Rim */}
          <mesh position={[-0.015, 0, 0.06]} scale={[0.13, 0.155, 0.02]}>
            <torusGeometry args={[0.85, 0.08, 16, 32]} />
            <meshBasicMaterial color={eyeRimColor} />
          </mesh>
          {/* Vertical Slit Cat Pupil */}
          <mesh position={[-0.015, 0, 0.08]} scale={[0.04, 0.12, 0.02]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color={pupilColor} />
          </mesh>
          {/* Specular Catchlight */}
          <mesh position={[0.02, 0.05, 0.095]} scale={[0.03, 0.03, 0.01]}>
            <sphereGeometry args={[1, 12, 12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Eyelid for Blinking */}
          <mesh
            ref={rightEyelidRef}
            position={[0, 0.16, 0.08]}
            scale={[0.18, 0, 0.09]}
          >
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color={furColor} roughness={0.7} />
          </mesh>
        </group>

        {/* ============================================================ */}
        {/* ANIMATED TALKING JAW & MOUTH                                */}
        {/* ============================================================ */}
        <group ref={jawRef} position={[0, -0.24, 0.3]}>
          {/* White chin */}
          <mesh position={[0, -0.05, 0]} scale={[0.22, 0.12, 0.18]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color={muzzleColor} roughness={0.68} />
          </mesh>
          {/* Mouth interior */}
          <mesh position={[0, 0.015, 0.04]} scale={[0.18, 0.08, 0.08]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="#2a0a12" />
          </mesh>
          {/* Pink tongue */}
          <mesh position={[0, -0.01, 0.07]} scale={[0.1, 0.04, 0.1]}>
            <sphereGeometry args={[1, 12, 12]} />
            <meshStandardMaterial color="#f06292" roughness={0.3} />
          </mesh>
          {/* Tiny cat fangs */}
          <mesh position={[-0.1, 0.05, 0.08]} rotation={[Math.PI, 0, 0]} scale={[0.025, 0.05, 0.025]}>
            <coneGeometry args={[1, 1.2, 8]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          </mesh>
          <mesh position={[0.1, 0.05, 0.08]} rotation={[Math.PI, 0, 0]} scale={[0.025, 0.05, 0.025]}>
            <coneGeometry args={[1, 1.2, 8]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          </mesh>
        </group>

        {/* ============================================================ */}
        {/* SIGNATURE ACCESSORY: ROUND WIREFRAME SPECTACLES              */}
        {/* Delicate metallic rims & green tinted glass (exact reference) */}
        {/* ============================================================ */}
        {hasGlasses && (
          <group position={[0, 0.12, 0.48]}>
            {/* Left Wireframe Rim */}
            <mesh position={[-0.22, 0, 0]}>
              <torusGeometry args={[0.19, 0.013, 16, 48]} />
              <meshStandardMaterial color="#d1d5db" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Left Green Glass Lens */}
            <mesh position={[-0.22, 0, 0]}>
              <circleGeometry args={[0.18, 32]} />
              <meshPhysicalMaterial
                color="#2ecc71"
                transmission={0.88}
                opacity={0.32}
                transparent
                roughness={0.08}
                ior={1.45}
              />
            </mesh>

            {/* Right Wireframe Rim */}
            <mesh position={[0.22, 0, 0]}>
              <torusGeometry args={[0.19, 0.013, 16, 48]} />
              <meshStandardMaterial color="#d1d5db" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Right Green Glass Lens */}
            <mesh position={[0.22, 0, 0]}>
              <circleGeometry args={[0.18, 32]} />
              <meshPhysicalMaterial
                color="#2ecc71"
                transmission={0.88}
                opacity={0.32}
                transparent
                roughness={0.08}
                ior={1.45}
              />
            </mesh>

            {/* Nose Bridge Bar */}
            <mesh position={[0, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 0.12, 12]} />
              <meshStandardMaterial color="#d1d5db" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        )}

        {/* Cool Sunglasses option */}
        {hasSunglasses && (
          <group position={[0, 0.12, 0.5]}>
            <mesh position={[-0.22, 0, 0]} scale={[0.2, 0.16, 0.04]}>
              <boxGeometry />
              <meshStandardMaterial color="#111116" roughness={0.1} metalness={0.85} />
            </mesh>
            <mesh position={[0.22, 0, 0]} scale={[0.2, 0.16, 0.04]}>
              <boxGeometry />
              <meshStandardMaterial color="#111116" roughness={0.1} metalness={0.85} />
            </mesh>
            <mesh position={[0, 0.03, 0]} scale={[0.12, 0.025, 0.03]}>
              <boxGeometry />
              <meshStandardMaterial color="#111116" metalness={0.85} />
            </mesh>
          </group>
        )}

        {/* Party Hat option */}
        {hasPartyHat && (
          <group position={[0, 0.52, 0]} rotation={[0.08, 0, 0.08]}>
            <mesh castShadow>
              <coneGeometry args={[0.22, 0.58, 24]} />
              <meshStandardMaterial color="#ff0055" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.32, 0]}>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshStandardMaterial color="#ffcc00" roughness={0.5} />
            </mesh>
          </group>
        )}
      </group>

      {/* SIGNATURE ACCESSORY: BRIGHT RED BOWTIE */}
      {/* Prominently right below chin on chest in reference image */}
      {hasBowTie && (
        <group position={[0, 1.34, 0.44]}>
          {/* Knot */}
          <mesh castShadow>
            <sphereGeometry args={[0.075, 16, 16]} />
            <meshStandardMaterial color="#dc2626" roughness={0.35} />
          </mesh>
          {/* Left Wing */}
          <mesh position={[-0.14, 0, 0]} rotation={[0, 0.2, 0.12]} scale={[0.14, 0.11, 0.06]} castShadow>
            <boxGeometry />
            <meshStandardMaterial color="#b91c1c" roughness={0.35} />
          </mesh>
          {/* Right Wing */}
          <mesh position={[0.14, 0, 0]} rotation={[0, -0.2, -0.12]} scale={[0.14, 0.11, 0.06]} castShadow>
            <boxGeometry />
            <meshStandardMaterial color="#b91c1c" roughness={0.35} />
          </mesh>
        </group>
      )}
    </group>
  );
};
