import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CharacterState, PaletteTheme, AccessoryType } from '../../types';

interface MimoCharacterProps {
  state: CharacterState;
  palette: PaletteTheme;
  accessory: AccessoryType;
  onTapRegion: (region: 'head' | 'belly' | 'feet' | 'ears') => void;
  isSpeaking?: boolean;
}

const PALETTES: Record<PaletteTheme, { body: string; belly: string; cheeks: string; ears: string }> = {
  bubblegum: { body: '#FF758C', belly: '#FFF0F5', cheeks: '#FF4D6D', ears: '#FF5E7E' },
  sunny: { body: '#FFB703', belly: '#FEFAE0', cheeks: '#FB8500', ears: '#FFA200' },
  mint: { body: '#2EC4B6', belly: '#E8F8F5', cheeks: '#FF9F1C', ears: '#25A195' },
  lilac: { body: '#A259FF', belly: '#F5EEFD', cheeks: '#F24E1E', ears: '#8C3BE2' },
  coral: { body: '#FF6B6B', belly: '#FFE3E3', cheeks: '#EE5253', ears: '#FA5252' },
};

export const MimoCharacter: React.FC<MimoCharacterProps> = ({
  state,
  palette,
  accessory,
  onTapRegion,
  isSpeaking = false,
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const leftEarRef = useRef<THREE.Group>(null);
  const rightEarRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Group>(null);
  const rightEyeRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Group>(null);

  const colors = PALETTES[palette] || PALETTES.bubblegum;

  // Blinking logic
  const [blinkProgress, setBlinkProgress] = useState(0);
  const blinkTimer = useRef(2 + Math.random() * 3);

  useFrame((_, delta) => {
    // Handle blinking
    blinkTimer.current -= delta;
    if (blinkTimer.current <= 0) {
      setBlinkProgress(1);
      blinkTimer.current = 2.5 + Math.random() * 3;
    }
    if (blinkProgress > 0) {
      setBlinkProgress((prev) => Math.max(0, prev - delta * 8));
    }

    const t = performance.now() * 0.003;

    if (!rootRef.current) return;

    // Base animation states
    if (state === 'idle') {
      rootRef.current.position.y = Math.sin(t * 2) * 0.06;
      rootRef.current.rotation.y = Math.sin(t) * 0.05;
      rootRef.current.rotation.z = Math.sin(t * 1.5) * 0.02;

      if (leftEarRef.current) leftEarRef.current.rotation.z = Math.sin(t * 3) * 0.08;
      if (rightEarRef.current) rightEarRef.current.rotation.z = -Math.sin(t * 3) * 0.08;
      if (leftArmRef.current) leftArmRef.current.rotation.z = 0.2 + Math.sin(t * 2) * 0.05;
      if (rightArmRef.current) rightArmRef.current.rotation.z = -0.2 - Math.sin(t * 2) * 0.05;
    } else if (state === 'happy') {
      rootRef.current.position.y = Math.abs(Math.sin(t * 5)) * 0.25;
      rootRef.current.rotation.z = Math.sin(t * 5) * 0.1;
      if (leftArmRef.current) leftArmRef.current.rotation.z = 0.8 + Math.sin(t * 8) * 0.3;
      if (rightArmRef.current) rightArmRef.current.rotation.z = -0.8 - Math.sin(t * 8) * 0.3;
      if (leftEarRef.current) leftEarRef.current.rotation.z = 0.3 + Math.sin(t * 8) * 0.2;
      if (rightEarRef.current) rightEarRef.current.rotation.z = -0.3 - Math.sin(t * 8) * 0.2;
    } else if (state === 'laughing') {
      rootRef.current.position.y = Math.sin(t * 15) * 0.08;
      rootRef.current.rotation.x = 0.15 + Math.sin(t * 12) * 0.05;
      rootRef.current.rotation.z = Math.sin(t * 14) * 0.08;
      if (leftArmRef.current) leftArmRef.current.rotation.z = 0.5 + Math.sin(t * 12) * 0.2;
      if (rightArmRef.current) rightArmRef.current.rotation.z = -0.5 - Math.sin(t * 12) * 0.2;
    } else if (state === 'jumping') {
      const jumpY = Math.abs(Math.sin(t * 6)) * 0.6;
      rootRef.current.position.y = jumpY;
      rootRef.current.rotation.x = Math.sin(t * 6) * 0.1;
      if (leftArmRef.current) leftArmRef.current.rotation.z = 1.3;
      if (rightArmRef.current) rightArmRef.current.rotation.z = -1.3;
    } else if (state === 'dancing') {
      rootRef.current.position.y = Math.abs(Math.sin(t * 5)) * 0.15;
      rootRef.current.rotation.y = Math.sin(t * 4) * 0.4;
      rootRef.current.rotation.z = Math.sin(t * 5) * 0.15;
      if (leftArmRef.current) leftArmRef.current.rotation.z = Math.sin(t * 5) * 0.8 + 0.5;
      if (rightArmRef.current) rightArmRef.current.rotation.z = -Math.sin(t * 5 + Math.PI) * 0.8 - 0.5;
    } else if (state === 'sleeping') {
      rootRef.current.position.y = -0.15 + Math.sin(t) * 0.02;
      rootRef.current.rotation.z = 0.15;
      rootRef.current.rotation.x = 0.1;
      if (leftArmRef.current) leftArmRef.current.rotation.z = 0.1;
      if (rightArmRef.current) rightArmRef.current.rotation.z = -0.1;
    } else if (state === 'surprised') {
      rootRef.current.position.y = 0.15;
      rootRef.current.scale.set(0.9, 1.15, 0.9);
      if (leftEarRef.current) leftEarRef.current.rotation.z = 0.4;
      if (rightEarRef.current) rightEarRef.current.rotation.z = -0.4;
      if (leftArmRef.current) leftArmRef.current.rotation.z = 1.0;
      if (rightArmRef.current) rightArmRef.current.rotation.z = -1.0;
    } else if (state === 'talking' || isSpeaking) {
      rootRef.current.position.y = Math.sin(t * 3) * 0.05;
      rootRef.current.rotation.y = Math.sin(t * 2) * 0.1;
      if (leftArmRef.current) leftArmRef.current.rotation.z = 0.4 + Math.sin(t * 4) * 0.2;
      if (rightArmRef.current) rightArmRef.current.rotation.z = -0.4 - Math.sin(t * 4) * 0.2;
    }

    // Mouth animation during speech
    if (mouthRef.current) {
      if (state === 'talking' || isSpeaking) {
        const mouthOpen = 0.2 + Math.abs(Math.sin(t * 14)) * 0.35;
        mouthRef.current.scale.set(1.1, mouthOpen * 3, 1);
      } else if (state === 'laughing') {
        mouthRef.current.scale.set(1.3, 1.4, 1);
      } else if (state === 'surprised') {
        mouthRef.current.scale.set(0.8, 1.5, 1);
      } else if (state === 'sleeping') {
        mouthRef.current.scale.set(0.6, 0.2, 1);
      } else {
        mouthRef.current.scale.set(1, 1, 1);
      }
    }

    // Eye scale during blink
    const eyeScaleY = state === 'sleeping' ? 0.1 : blinkProgress > 0 ? 0.1 : 1.0;
    if (leftEyeRef.current) leftEyeRef.current.scale.y = eyeScaleY;
    if (rightEyeRef.current) rightEyeRef.current.scale.y = eyeScaleY;
  });

  return (
    <group ref={rootRef} position={[0, -0.2, 0]}>
      {/* --- BODY GROUP --- */}
      <group
        ref={bodyRef}
        onClick={(e) => {
          e.stopPropagation();
          onTapRegion('belly');
        }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        {/* Main plump pear body */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.9, 36, 36]} />
          <meshStandardMaterial
            color={colors.body}
            roughness={0.4}
            metalness={0.05}
          />
        </mesh>

        {/* Soft belly patch */}
        <mesh position={[0, -0.05, 0.55]} scale={[0.8, 0.9, 0.5]} receiveShadow>
          <sphereGeometry args={[0.65, 32, 32]} />
          <meshStandardMaterial color={colors.belly} roughness={0.5} />
        </mesh>
      </group>

      {/* --- HEAD GROUP --- */}
      <group
        ref={headRef}
        position={[0, 0.85, 0.05]}
        onClick={(e) => {
          e.stopPropagation();
          onTapRegion('head');
        }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        {/* Head Sphere */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.82, 36, 36]} />
          <meshStandardMaterial color={colors.body} roughness={0.4} />
        </mesh>

        {/* Blush Cheeks */}
        <mesh position={[-0.48, -0.15, 0.58]} scale={[0.2, 0.14, 0.1]}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshBasicMaterial color={colors.cheeks} opacity={0.65} transparent />
        </mesh>
        <mesh position={[0.48, -0.15, 0.58]} scale={[0.2, 0.14, 0.1]}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshBasicMaterial color={colors.cheeks} opacity={0.65} transparent />
        </mesh>

        {/* Cute Button Nose */}
        <mesh position={[0, -0.05, 0.78]} scale={[1, 0.7, 0.8]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#2B2D42" roughness={0.2} />
        </mesh>

        {/* Left Eye */}
        <group ref={leftEyeRef} position={[-0.26, 0.1, 0.72]}>
          <mesh castShadow>
            <sphereGeometry args={[0.11, 24, 24]} />
            <meshStandardMaterial color="#1E202A" roughness={0.1} />
          </mesh>
          {/* Eye shine reflection */}
          <mesh position={[0.03, 0.03, 0.09]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>

        {/* Right Eye */}
        <group ref={rightEyeRef} position={[0.26, 0.1, 0.72]}>
          <mesh castShadow>
            <sphereGeometry args={[0.11, 24, 24]} />
            <meshStandardMaterial color="#1E202A" roughness={0.1} />
          </mesh>
          {/* Eye shine reflection */}
          <mesh position={[0.03, 0.03, 0.09]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>

        {/* Mouth */}
        <group ref={mouthRef} position={[0, -0.22, 0.74]}>
          <mesh>
            <torusGeometry args={[0.12, 0.025, 12, 24, Math.PI]} />
            <meshStandardMaterial color="#2B2D42" roughness={0.3} />
          </mesh>
        </group>

        {/* Ears */}
        <group
          ref={leftEarRef}
          position={[-0.55, 0.65, -0.05]}
          onClick={(e) => {
            e.stopPropagation();
            onTapRegion('ears');
          }}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
          {/* Outer Ear */}
          <mesh castShadow>
            <sphereGeometry args={[0.3, 24, 24]} />
            <meshStandardMaterial color={colors.ears} roughness={0.4} />
          </mesh>
          {/* Inner Ear */}
          <mesh position={[0.03, -0.02, 0.1]} scale={[0.7, 0.7, 0.4]}>
            <sphereGeometry args={[0.25, 20, 20]} />
            <meshStandardMaterial color={colors.belly} roughness={0.6} />
          </mesh>
        </group>

        <group
          ref={rightEarRef}
          position={[0.55, 0.65, -0.05]}
          onClick={(e) => {
            e.stopPropagation();
            onTapRegion('ears');
          }}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
          <mesh castShadow>
            <sphereGeometry args={[0.3, 24, 24]} />
            <meshStandardMaterial color={colors.ears} roughness={0.4} />
          </mesh>
          <mesh position={[-0.03, -0.02, 0.1]} scale={[0.7, 0.7, 0.4]}>
            <sphereGeometry args={[0.25, 20, 20]} />
            <meshStandardMaterial color={colors.belly} roughness={0.6} />
          </mesh>
        </group>

        {/* ACCESSORIES */}
        {accessory === 'hat' && (
          <group position={[0, 0.78, 0]}>
            {/* Party Cone Hat */}
            <mesh position={[0, 0.35, 0]} rotation={[0, 0, 0.1]} castShadow>
              <coneGeometry args={[0.3, 0.7, 24]} />
              <meshStandardMaterial color="#FFD166" roughness={0.3} />
            </mesh>
            {/* Pompom on top */}
            <mesh position={[0.04, 0.72, 0]}>
              <sphereGeometry args={[0.09, 16, 16]} />
              <meshStandardMaterial color="#06D6A0" />
            </mesh>
          </group>
        )}

        {accessory === 'bow' && (
          <group position={[0, -0.65, 0.7]}>
            {/* Bow center */}
            <mesh>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color="#FF006E" />
            </mesh>
            {/* Bow left wing */}
            <mesh position={[-0.15, 0, 0]} rotation={[0, 0, 0.3]}>
              <coneGeometry args={[0.13, 0.22, 16]} />
              <meshStandardMaterial color="#FF006E" />
            </mesh>
            {/* Bow right wing */}
            <mesh position={[0.15, 0, 0]} rotation={[0, 0, -0.3]}>
              <coneGeometry args={[0.13, 0.22, 16]} />
              <meshStandardMaterial color="#FF006E" />
            </mesh>
          </group>
        )}

        {accessory === 'sunglasses' && (
          <group position={[0, 0.1, 0.8]}>
            <mesh position={[-0.26, 0, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.04, 24]} />
              <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.1} />
            </mesh>
            <mesh position={[0.26, 0, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.04, 24]} />
              <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.1} />
            </mesh>
            {/* Bridge */}
            <mesh position={[0, 0.02, 0]}>
              <boxGeometry args={[0.2, 0.04, 0.03]} />
              <meshStandardMaterial color="#E0AAFF" metalness={0.6} />
            </mesh>
          </group>
        )}

        {accessory === 'crown' && (
          <group position={[0, 0.82, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.35, 0.3, 0.25, 5]} />
              <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Ruby Gem */}
            <mesh position={[0, 0.05, 0.32]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial color="#D90429" roughness={0.1} />
            </mesh>
          </group>
        )}
      </group>

      {/* --- ARMS & PAWS --- */}
      <group ref={leftArmRef} position={[-0.85, 0.2, 0]}>
        <mesh position={[-0.15, -0.15, 0]} rotation={[0, 0, 0.4]} castShadow>
          <capsuleGeometry args={[0.16, 0.38, 16, 16]} />
          <meshStandardMaterial color={colors.body} roughness={0.4} />
        </mesh>
      </group>

      <group ref={rightArmRef} position={[0.85, 0.2, 0]}>
        <mesh position={[0.15, -0.15, 0]} rotation={[0, 0, -0.4]} castShadow>
          <capsuleGeometry args={[0.16, 0.38, 16, 16]} />
          <meshStandardMaterial color={colors.body} roughness={0.4} />
        </mesh>
      </group>

      {/* --- FEET --- */}
      <group
        position={[0, -0.75, 0.1]}
        onClick={(e) => {
          e.stopPropagation();
          onTapRegion('feet');
        }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <mesh position={[-0.38, 0, 0.2]} scale={[1, 0.6, 1.4]} castShadow>
          <sphereGeometry args={[0.26, 20, 20]} />
          <meshStandardMaterial color={colors.ears} roughness={0.5} />
        </mesh>
        <mesh position={[0.38, 0, 0.2]} scale={[1, 0.6, 1.4]} castShadow>
          <sphereGeometry args={[0.26, 20, 20]} />
          <meshStandardMaterial color={colors.ears} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
};
