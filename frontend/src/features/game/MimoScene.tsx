import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import { MimoCharacter } from './MimoCharacter';
import { CharacterState, PaletteTheme, AccessoryType, EnvironmentType } from '../../types';

interface MimoSceneProps {
  state: CharacterState;
  palette: PaletteTheme;
  accessory: AccessoryType;
  environment: EnvironmentType;
  onTapRegion: (region: 'head' | 'belly' | 'feet' | 'ears') => void;
  isSpeaking?: boolean;
}

const FloatingParticles: React.FC<{ state: CharacterState }> = ({ state }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  if (state === 'idle') return null;

  return (
    <group ref={groupRef} position={[0, 1.2, 0]}>
      {state === 'happy' && (
        <Float speed={4} rotationIntensity={1} floatIntensity={2}>
          <Text position={[-0.8, 0.4, 0.5]} fontSize={0.35} color="#FF006E">
            💖
          </Text>
          <Text position={[0.8, 0.6, -0.2]} fontSize={0.3} color="#FF758C">
            ✨
          </Text>
          <Text position={[0, 0.9, 0.6]} fontSize={0.4} color="#FF006E">
            💖
          </Text>
        </Float>
      )}

      {state === 'laughing' && (
        <Float speed={5} rotationIntensity={1.5} floatIntensity={2}>
          <Text position={[-0.7, 0.5, 0.4]} fontSize={0.35}>
            😂
          </Text>
          <Text position={[0.7, 0.7, 0.3]} fontSize={0.35}>
            ✨
          </Text>
          <Text position={[0, 0.9, 0.5]} fontSize={0.35}>
            ⭐
          </Text>
        </Float>
      )}

      {state === 'dancing' && (
        <Float speed={6} rotationIntensity={2} floatIntensity={3}>
          <Text position={[-0.8, 0.5, 0.3]} fontSize={0.35}>
            🎵
          </Text>
          <Text position={[0.8, 0.8, 0.2]} fontSize={0.35}>
            🎶
          </Text>
          <Text position={[0.2, 1.0, 0.5]} fontSize={0.35}>
            ⭐
          </Text>
        </Float>
      )}

      {state === 'sleeping' && (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
          <Text position={[0.4, 0.5, 0.3]} fontSize={0.25} color="#9D4EDD">
            Z
          </Text>
          <Text position={[0.6, 0.8, 0.2]} fontSize={0.35} color="#9D4EDD">
            Z
          </Text>
          <Text position={[0.8, 1.1, 0.1]} fontSize={0.45} color="#9D4EDD">
            Z
          </Text>
        </Float>
      )}

      {state === 'surprised' && (
        <Float speed={4} rotationIntensity={0.5} floatIntensity={1}>
          <Text position={[0, 1.1, 0.3]} fontSize={0.4} color="#FFB703">
            ❗
          </Text>
        </Float>
      )}
    </group>
  );
};

const RoomEnvironment: React.FC<{ environment: EnvironmentType }> = ({ environment }) => {
  if (environment === 'meadow') {
    return (
      <group position={[0, -0.96, 0]}>
        {/* Soft grass meadow ground */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[5, 48]} />
          <meshStandardMaterial color="#A3E635" roughness={0.8} />
        </mesh>
        {/* Decorative flowers */}
        {[
          [-1.5, 0, 1.2],
          [1.8, 0, 0.8],
          [-1.2, 0, -1.4],
          [1.5, 0, -1.2],
        ].map((pos, idx) => (
          <group key={idx} position={pos as [number, number, number]}>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
              <meshBasicMaterial color="#65A30D" />
            </mesh>
            <mesh position={[0, 0.12, 0]}>
              <sphereGeometry args={[0.07, 12, 12]} />
              <meshBasicMaterial color={idx % 2 === 0 ? '#FB7185' : '#FBBF24'} />
            </mesh>
          </group>
        ))}
      </group>
    );
  }

  if (environment === 'galaxy') {
    return (
      <group position={[0, -0.96, 0]}>
        {/* Cosmic platform */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[4.5, 48]} />
          <meshStandardMaterial color="#1E1B4B" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* Cosmic ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[4.2, 4.4, 48]} />
          <meshBasicMaterial color="#818CF8" />
        </mesh>
      </group>
    );
  }

  // Default: Cozy Playroom
  return (
    <group position={[0, -0.96, 0]}>
      {/* Soft circular rug */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.8, 48]} />
        <meshStandardMaterial color="#FED7AA" roughness={0.7} />
      </mesh>
      {/* Rug border ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[3.6, 3.8, 48]} />
        <meshBasicMaterial color="#FB923C" />
      </mesh>
      {/* Playful wooden blocks */}
      <mesh position={[-1.8, 0.15, 0.8]} castShadow receiveShadow rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#38BDF8" roughness={0.4} />
      </mesh>
      <mesh position={[-1.7, 0.4, 0.75]} castShadow receiveShadow rotation={[0, -0.2, 0]}>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <meshStandardMaterial color="#F43F5E" roughness={0.4} />
      </mesh>
      <mesh position={[1.8, 0.12, 0.6]} castShadow receiveShadow>
        <sphereGeometry args={[0.18, 20, 20]} />
        <meshStandardMaterial color="#FACC15" roughness={0.3} />
      </mesh>
    </group>
  );
};

export const MimoScene: React.FC<MimoSceneProps> = ({
  state,
  palette,
  accessory,
  environment,
  onTapRegion,
  isSpeaking,
}) => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        shadows
        camera={{ position: [0, 0.8, 4.2], fov: 42 }}
        style={{ width: '100%', height: '100%', touchAction: 'none' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[4, 7, 5]}
          intensity={1.3}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-4, 3, -3]} intensity={0.5} color="#E0E7FF" />
        <hemisphereLight intensity={0.4} groundColor="#FED7AA" />

        <Suspense fallback={null}>
          <RoomEnvironment environment={environment} />
          <MimoCharacter
            state={state}
            palette={palette}
            accessory={accessory}
            onTapRegion={onTapRegion}
            isSpeaking={isSpeaking}
          />
          <FloatingParticles state={state} />
          <ContactShadows
            position={[0, -0.95, 0]}
            opacity={0.45}
            scale={4}
            blur={2}
            far={3}
          />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={2.5}
          maxDistance={6.0}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minPolarAngle={Math.PI / 4}
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  );
};
