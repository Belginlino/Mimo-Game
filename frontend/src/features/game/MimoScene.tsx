import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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

// Dynamic Responsive Camera Controller
const ResponsiveCameraController: React.FC = () => {
  const { camera, size } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    // Base distance is 2.7 for desktop; gracefully scale out for tall/narrow mobile portrait
    const targetDistance = aspect < 1.0 ? 2.7 * (0.85 / Math.max(0.48, aspect)) : 2.7;

    camera.position.set(0, 0.45, targetDistance);
    camera.lookAt(0, 0.35, 0);
    camera.updateProjectionMatrix();

    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0.35, 0);
      controlsRef.current.update();
    }
  }, [camera, size.width, size.height]);

  return (
    <OrbitControls
      ref={controlsRef}
      target={[0, 0.35, 0]}
      enablePan={false}
      minDistance={1.8}
      maxDistance={4.8}
      maxPolarAngle={Math.PI / 2 - 0.04}
      minPolarAngle={Math.PI / 4}
      dampingFactor={0.08}
    />
  );
};

const FloatingParticles: React.FC<{ state: CharacterState }> = ({ state }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  if (state === 'idle') return null;

  return (
    <group ref={groupRef} position={[0, 1.45, 0]}>
      {state === 'happy' && (
        <Float speed={4} rotationIntensity={0.6} floatIntensity={1.5}>
          <Text position={[-0.8, 0.3, 0.4]} fontSize={0.32} color="#FF006E">💖</Text>
          <Text position={[0.8, 0.5, -0.2]} fontSize={0.28} color="#FF758C">✨</Text>
          <Text position={[0, 0.7, 0.5]} fontSize={0.36} color="#FF006E">💖</Text>
        </Float>
      )}

      {state === 'laughing' && (
        <Float speed={5} rotationIntensity={1.2} floatIntensity={2}>
          <Text position={[-0.7, 0.4, 0.3]} fontSize={0.32}>😂</Text>
          <Text position={[0.7, 0.6, 0.2]} fontSize={0.32}>✨</Text>
          <Text position={[0, 0.8, 0.4]} fontSize={0.32}>⭐</Text>
        </Float>
      )}

      {state === 'dancing' && (
        <Float speed={6} rotationIntensity={1.5} floatIntensity={2.5}>
          <Text position={[-0.8, 0.4, 0.3]} fontSize={0.32}>🎵</Text>
          <Text position={[0.8, 0.7, 0.2]} fontSize={0.32}>🎶</Text>
          <Text position={[0.2, 0.9, 0.4]} fontSize={0.32}>⭐</Text>
        </Float>
      )}

      {state === 'sleeping' && (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
          <Text position={[0.4, 0.4, 0.3]} fontSize={0.24} color="#9D4EDD">Z</Text>
          <Text position={[0.6, 0.7, 0.2]} fontSize={0.32} color="#9D4EDD">Z</Text>
          <Text position={[0.8, 1.0, 0.1]} fontSize={0.42} color="#9D4EDD">Z</Text>
        </Float>
      )}

      {state === 'surprised' && (
        <Float speed={4} rotationIntensity={0.4} floatIntensity={1}>
          <Text position={[0, 0.9, 0.3]} fontSize={0.38} color="#FFB703">❗</Text>
        </Float>
      )}
    </group>
  );
};

// Immersive full-room environments
const RoomEnvironment: React.FC<{ environment: EnvironmentType }> = ({ environment }) => {
  if (environment === 'meadow') {
    return (
      <group position={[0, -0.96, 0]}>
        {/* Expansive Rolling Meadow Floor */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[14, 64]} />
          <meshStandardMaterial color="#86EFAC" roughness={0.7} />
        </mesh>
        {/* Outer Meadow Hill ring */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
          <ringGeometry args={[14, 22, 64]} />
          <meshStandardMaterial color="#4ADE80" roughness={0.8} />
        </mesh>
        {/* Gentle background hills */}
        <mesh position={[-6, 1.5, -9]} scale={[5, 3.5, 3]}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshStandardMaterial color="#6EE7B7" roughness={0.9} />
        </mesh>
        <mesh position={[5, 1.8, -10]} scale={[6, 4, 3]}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshStandardMaterial color="#A7F3D0" roughness={0.9} />
        </mesh>

        {/* Decorative Meadow Flowers */}
        {[
          [-1.8, 0, 1.2],
          [2.0, 0, 0.9],
          [-1.5, 0, -1.6],
          [1.7, 0, -1.4],
          [-2.8, 0, -0.5],
          [2.6, 0, -0.2],
        ].map((pos, idx) => (
          <group key={idx} position={pos as [number, number, number]}>
            <mesh position={[0, 0.06, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.12, 8]} />
              <meshBasicMaterial color="#22C55E" />
            </mesh>
            <mesh position={[0, 0.14, 0]}>
              <sphereGeometry args={[0.08, 12, 12]} />
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
        {/* Expansive Cosmic Platform */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[14, 64]} />
          <meshStandardMaterial color="#0F172A" roughness={0.25} metalness={0.6} />
        </mesh>
        {/* Glowing Neon Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[3.6, 3.8, 64]} />
          <meshBasicMaterial color="#A855F7" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
          <ringGeometry args={[7.0, 7.3, 64]} />
          <meshBasicMaterial color="#38BDF8" />
        </mesh>
        {/* Background Floating Orbs / Planets */}
        <mesh position={[-4, 2.5, -6]}>
          <sphereGeometry args={[0.7, 24, 24]} />
          <meshStandardMaterial color="#F472B6" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[4.5, 3.2, -7]}>
          <sphereGeometry args={[0.9, 24, 24]} />
          <meshStandardMaterial color="#818CF8" roughness={0.3} metalness={0.4} />
        </mesh>
      </group>
    );
  }

  // Default: Expansive Cozy Playroom
  return (
    <group position={[0, -0.96, 0]}>
      {/* Warm Room Floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[14, 64]} />
        <meshStandardMaterial color="#FDE68A" roughness={0.7} />
      </mesh>
      {/* Large Cozy Center Rug */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[3.2, 48]} />
        <meshStandardMaterial color="#FED7AA" roughness={0.8} />
      </mesh>
      {/* Rug border ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[3.0, 3.2, 48]} />
        <meshBasicMaterial color="#FB923C" />
      </mesh>
      {/* Curved Soft Pastel Back Wall */}
      <mesh position={[0, 4, -8]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[14, 14, 10, 32, 1, true, -Math.PI / 2.2, Math.PI / 1.1]} />
        <meshStandardMaterial color="#FFE4E6" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Decorative Playroom Objects */}
      {/* Building block tower */}
      <mesh position={[-2.4, 0.18, 0.8]} castShadow receiveShadow rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.38, 0.38, 0.38]} />
        <meshStandardMaterial color="#38BDF8" roughness={0.3} />
      </mesh>
      <mesh position={[-2.3, 0.52, 0.75]} castShadow receiveShadow rotation={[0, -0.2, 0]}>
        <boxGeometry args={[0.28, 0.28, 0.28]} />
        <meshStandardMaterial color="#F43F5E" roughness={0.3} />
      </mesh>
      {/* Cute toy ball */}
      <mesh position={[2.5, 0.22, 0.6]} castShadow receiveShadow>
        <sphereGeometry args={[0.24, 24, 24]} />
        <meshStandardMaterial color="#FACC15" roughness={0.25} />
      </mesh>
      {/* Star cushion */}
      <mesh position={[2.1, 0.1, -1.2]} rotation={[-Math.PI / 2, 0, 0.4]} castShadow receiveShadow>
        <cylinderGeometry args={[0.35, 0.4, 0.12, 5]} />
        <meshStandardMaterial color="#C084FC" roughness={0.6} />
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
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
      <Canvas
        shadows
        camera={{ position: [0, 0.45, 2.7], fov: 38 }}
        style={{ width: '100%', height: '100%', touchAction: 'none' }}
      >
        <ambientLight intensity={0.85} />
        <directionalLight
          position={[4, 7, 5]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-4, 3, -2]} intensity={0.5} color="#E0E7FF" />
        <hemisphereLight intensity={0.45} groundColor="#FED7AA" />

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
            opacity={0.55}
            scale={4}
            blur={2.2}
            far={3}
          />
        </Suspense>

        <ResponsiveCameraController />
      </Canvas>
    </div>
  );
};
