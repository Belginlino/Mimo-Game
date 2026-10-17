import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export type UserReactionType =
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

interface UserModelFBXProps {
  talking: boolean;
  reaction?: UserReactionType;
  reactionStartTime?: number;
  hasGlasses?: boolean;
  hasBowTie?: boolean;
  hasSunglasses?: boolean;
  hasPartyHat?: boolean;
  onPokeHead?: () => void;
  onTickleBelly?: () => void;
  onTapFeet?: () => void;
  onPet?: () => void;
  onLoaded?: () => void;
}

export const UserModelFBX: React.FC<UserModelFBXProps> = ({
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
  onLoaded,
}) => {
  const rootGroup = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Animation and bone refs
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const headBone = useRef<THREE.Bone | null>(null);
  const spineBone = useRef<THREE.Bone | null>(null);
  const leftArmBone = useRef<THREE.Bone | null>(null);
  const rightArmBone = useRef<THREE.Bone | null>(null);
  const leftForeArmBone = useRef<THREE.Bone | null>(null);
  const rightForeArmBone = useRef<THREE.Bone | null>(null);

  // Morph targets (blend shapes)
  const morphMeshes = useRef<THREE.Mesh[]>([]);
  const mouthMorphs = useRef<Array<{ mesh: THREE.Mesh; index: number }>>([]);
  const eyeCloseMorphs = useRef<Array<{ mesh: THREE.Mesh; index: number }>>([]);
  const smileMorphs = useRef<Array<{ mesh: THREE.Mesh; index: number }>>([]);

  // Head/Accessories anchor position calculated from model bounds
  const [headPos, setHeadPos] = useState<[number, number, number]>([0, 1.88, 0.12]);
  const [neckPos, setNeckPos] = useState<[number, number, number]>([0, 1.68, 0.12]);

  // Touch drag for petting
  const isDragging = useRef(false);
  const lastPointer = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragDist = useRef(0);

  useEffect(() => {
    let alive = true;
    const loader = new FBXLoader();

    loader.load(
      '/model.fbx',
      (fbx) => {
        if (!alive) return;

        // Reset transforms before measuring
        fbx.position.set(0, 0, 0);
        fbx.rotation.set(0, 0, 0);
        fbx.scale.set(1, 1, 1);
        fbx.updateMatrixWorld(true);

        // Find bounding box to normalize scale
        const box = new THREE.Box3().setFromObject(fbx);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Target height ~2.05 units for perfect room framing
        const targetHeight = 2.05;
        const scaleFactor = targetHeight / Math.max(size.y, 0.001);
        fbx.scale.setScalar(scaleFactor);

        // Center horizontally and place feet firmly at floor level y = 0
        const posY = -box.min.y * scaleFactor;
        const posX = -center.x * scaleFactor;
        const posZ = -center.z * scaleFactor;
        fbx.position.set(posX, posY, posZ);

        // Inspect bones, morph targets, and materials
        const morphsFound: THREE.Mesh[] = [];
        const mouthList: Array<{ mesh: THREE.Mesh; index: number }> = [];
        const eyeList: Array<{ mesh: THREE.Mesh; index: number }> = [];
        const smileList: Array<{ mesh: THREE.Mesh; index: number }> = [];

        const allBones: Array<{ name: string; type: string; rot: [number, number, number] }> = [];
        fbx.traverse((child) => {
          if (child.name) {
            allBones.push({
              name: child.name,
              type: child.type,
              rot: [child.rotation.x, child.rotation.y, child.rotation.z],
            });
          }

          // Find Bones
          const isBoneNode = (child as any).isBone || child.type === 'Bone' || child.name.toLowerCase().includes('arm') || child.name.toLowerCase().includes('head');
          if (isBoneNode) {
            const bone = child as THREE.Bone;
            const nameLower = bone.name.toLowerCase();
            if (nameLower.includes('head') && !nameLower.includes('end') && !headBone.current) {
              headBone.current = bone;
            } else if (nameLower.includes('spine') && !spineBone.current) {
              spineBone.current = bone;
            } else if (nameLower.includes('arm') && !nameLower.includes('fore') && !nameLower.includes('shoulder')) {
              if (nameLower.includes('left') || nameLower.includes('.l') || nameLower.startsWith('l_')) {
                leftArmBone.current = bone;
              } else if (nameLower.includes('right') || nameLower.includes('.r') || nameLower.startsWith('r_')) {
                rightArmBone.current = bone;
              }
            } else if (nameLower.includes('forearm')) {
              if (nameLower.includes('left') || nameLower.includes('.l') || nameLower.startsWith('l_')) {
                leftForeArmBone.current = bone;
              } else if (nameLower.includes('right') || nameLower.includes('.r') || nameLower.startsWith('r_')) {
                rightForeArmBone.current = bone;
              }
            }
          }

          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            // Ensure materials render cleanly (two-sided for hair and clothes)
            if (mesh.material) {
              const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              mats.forEach((m) => {
                m.side = THREE.DoubleSide;
                if (m instanceof THREE.MeshStandardMaterial || m instanceof THREE.MeshPhysicalMaterial) {
                  m.roughness = Math.min(m.roughness, 0.85);
                  m.envMapIntensity = 1.0;
                }
                m.needsUpdate = true;
              });
            }

            // Inspect Morph Targets
            if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
              morphsFound.push(mesh);
              const dict = mesh.morphTargetDictionary;
              Object.keys(dict).forEach((key) => {
                const k = key.toLowerCase();
                const idx = dict[key];
                if (k.includes('mouth') || k.includes('jaw') || k.includes('open') || k.includes('aa') || k.includes('viseme')) {
                  mouthList.push({ mesh, index: idx });
                }
                if (k.includes('eye') && (k.includes('close') || k.includes('blink'))) {
                  eyeList.push({ mesh, index: idx });
                }
                if (k.includes('smile') || k.includes('happy')) {
                  smileList.push({ mesh, index: idx });
                }
              });
            }
          }
        });

        morphMeshes.current = morphsFound;
        mouthMorphs.current = mouthList;
        eyeCloseMorphs.current = eyeList;
        smileMorphs.current = smileList;

        // Set exact accessories anchor positions based on skeleton measurements
        setHeadPos([0, 1.902, 0.118]);
        setNeckPos([0, 1.708, 0.096]);

        // Animations in FBX
        if (fbx.animations && fbx.animations.length > 0) {
          console.log('FBX Animations found:', fbx.animations.map(a => a.name));
          const mixer = new THREE.AnimationMixer(fbx);
          const clip = fbx.animations[0];
          const action = mixer.clipAction(clip);
          action.play();
          mixerRef.current = mixer;
        }

        (window as any).__MIMO_FBX_DEBUG__ = {
          allBones,
          animationsCount: fbx.animations?.length || 0,
          animationNames: fbx.animations?.map(a => a.name) || [],
          head: headBone.current?.name,
          spine: spineBone.current?.name,
          leftArm: leftArmBone.current?.name,
          rightArm: rightArmBone.current?.name,
          leftForeArm: leftForeArmBone.current?.name,
          rightForeArm: rightForeArmBone.current?.name,
          morphCount: morphsFound.length,
          mouthCount: mouthList.length,
          eyeCount: eyeList.length,
          smileCount: smileList.length,
        };
        console.log('__MIMO_FBX_DEBUG__', (window as any).__MIMO_FBX_DEBUG__);

        setModel(fbx);
        onLoaded?.();
      },
      undefined,
      (err) => {
        if (!alive) return;
        console.error('FBXLoader error:', err);
        setLoadingError('Failed to load model.fbx');
      }
    );

    return () => {
      alive = false;
      mixerRef.current?.stopAllAction();
    };
  }, [onLoaded]);

  // Frame animation loop
  useFrame((_, delta) => {
    // 1. Advance embedded animation mixer if present
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }

    if (!rootGroup.current) return;

    const t = performance.now() * 0.003;
    const elapsedSinceReaction = performance.now() * 0.001 - reactionStartTime;
    const isReacting = elapsedSinceReaction >= 0 && elapsedSinceReaction < 2.5;

    // Resting idle breathing and posture
    let targetPosY = Math.sin(t * 1.6) * 0.012;
    let targetRotY = Math.sin(t * 0.5) * 0.025;
    let headX = Math.sin(t * 1.1) * 0.012;
    let headY = Math.sin(t * 0.6) * 0.02;
    let headZ = 0;
    let spineX = Math.sin(t * 1.6) * 0.01;
    let smileVal = 0.15;
    let mouthChew = 0;
    let eyesClosed = 0;

    // Blinking
    const blinkCycle = (performance.now() * 0.001) % 4.0;
    if (blinkCycle > 3.82) {
      eyesClosed = Math.sin(((blinkCycle - 3.82) / 0.18) * Math.PI);
    }

    // Reaction Animation Overrides
    if (isReacting) {
      if (reaction === 'poke') {
        const decay = Math.exp(-elapsedSinceReaction * 2.2);
        const wobble = Math.sin(elapsedSinceReaction * 18) * decay;
        headX = -0.32 * decay;
        headZ = 0.22 * wobble;
        headY = 0.16 * wobble;
        smileVal = 0;
      } else if (reaction === 'tickle') {
        const giggle = Math.sin(elapsedSinceReaction * 20);
        targetPosY = Math.abs(giggle) * 0.045;
        spineX = giggle * 0.05;
        headX = -0.12 + giggle * 0.06;
        smileVal = 0.85;
        mouthChew = 0.35 + Math.abs(giggle) * 0.25;
      } else if (reaction === 'jump') {
        if (elapsedSinceReaction < 0.9) {
          targetPosY = Math.sin((elapsedSinceReaction / 0.9) * Math.PI) * 0.45;
        }
        smileVal = 0.7;
      } else if (reaction === 'dance') {
        targetRotY = Math.sin(elapsedSinceReaction * 7) * 0.32;
        targetPosY = Math.abs(Math.sin(elapsedSinceReaction * 7)) * 0.06;
        headZ = Math.sin(elapsedSinceReaction * 7) * 0.12;
        smileVal = 0.8;
      } else if (reaction === 'bagpop') {
        if (elapsedSinceReaction < 0.65) {
          targetPosY = Math.sin((elapsedSinceReaction / 0.65) * Math.PI) * 0.35;
          headX = -0.25;
        }
      } else if (reaction === 'treat') {
        mouthChew = Math.abs(Math.sin(elapsedSinceReaction * 14)) * 0.42;
        headX = Math.sin(elapsedSinceReaction * 8) * 0.06;
        smileVal = 0.65;
      } else if (reaction === 'drink') {
        headX = -0.18 + Math.sin(elapsedSinceReaction * 6) * 0.04;
        mouthChew = Math.abs(Math.sin(elapsedSinceReaction * 10)) * 0.35;
      } else if (reaction === 'pet') {
        headZ = 0.14;
        headX = 0.08;
        smileVal = 0.9;
        eyesClosed = 0.88;
      } else if (reaction === 'feather') {
        if (elapsedSinceReaction < 0.8) {
          headX = -0.22;
        } else if (elapsedSinceReaction < 1.4) {
          headX = 0.38;
          targetPosY = -0.03;
          mouthChew = 0.5;
        }
      } else if (reaction === 'phone') {
        headZ = -0.14;
        smileVal = 0.6;
        mouthChew = Math.abs(Math.sin(elapsedSinceReaction * 8)) * 0.25;
      }
    }

    // Speech mouth movement
    const finalMouthOpen = talking
      ? 0.15 + Math.abs(Math.sin(t * 15)) * 0.45
      : mouthChew;

    // Apply Root Motion
    rootGroup.current.position.y = targetPosY;
    rootGroup.current.rotation.y = targetRotY;

    // Natural arm pose: lower arms from T-pose to resting sides
    // Rest LeftArm: [0.1036, -0.0109, -0.2092], Rest RightArm: [0.1036, 0.0109, 0.2092]
    // Rotating around X by +1.25 lowers arms straight down by the hips
    const breatheSway = Math.sin(t * 1.5) * 0.02;
    let lArmX = 1.35 + breatheSway;
    let lArmY = -0.011;
    let lArmZ = -0.21;
    let rArmX = 1.35 + breatheSway;
    let rArmY = 0.011;
    let rArmZ = 0.21;
    let lForeX = -0.10 + 0.18;
    let lForeY = -0.016;
    let lForeZ = 0.296;
    let rForeX = -0.10 + 0.18;
    let rForeY = 0.015;
    let rForeZ = -0.296;

    if (isReacting) {
      if (reaction === 'dance') {
        const danceT = elapsedSinceReaction * 7;
        lArmX = 1.35 - Math.sin(danceT) * 0.95;
        rArmX = 1.35 - Math.sin(danceT + Math.PI) * 0.95;
        lArmZ = -0.21 - Math.abs(Math.sin(danceT)) * 0.35;
        rArmZ = 0.21 + Math.abs(Math.sin(danceT)) * 0.35;
        lForeX = 0.08 + Math.abs(Math.cos(danceT)) * 0.5;
        rForeX = 0.08 + Math.abs(Math.sin(danceT)) * 0.5;
      } else if (reaction === 'jump' || reaction === 'bagpop') {
        lArmX = 0.10 - 0.75;
        rArmX = 0.10 - 0.75;
        lArmZ = -0.45;
        rArmZ = 0.45;
      } else if (reaction === 'tickle') {
        lArmX = 1.15;
        rArmX = 1.15;
        lArmZ = -0.15;
        rArmZ = 0.15;
        lForeX = 0.65;
        rForeX = 0.65;
      } else if (reaction === 'phone') {
        rArmX = -0.65;
        rArmZ = 0.32;
        rForeX = 1.25;
      } else if (reaction === 'treat' || reaction === 'drink') {
        lArmX = -0.45;
        lArmZ = -0.25;
        lForeX = 1.15;
      }
    }

    if (leftArmBone.current) {
      leftArmBone.current.rotation.set(lArmX, lArmY, lArmZ);
    }
    if (rightArmBone.current) {
      rightArmBone.current.rotation.set(rArmX, rArmY, rArmZ);
    }
    if (leftForeArmBone.current) {
      leftForeArmBone.current.rotation.set(lForeX, lForeY, lForeZ);
    }
    if (rightForeArmBone.current) {
      rightForeArmBone.current.rotation.set(rForeX, rForeY, rForeZ);
    }

    if (headBone.current) {
      headBone.current.rotation.set(-0.122 + headX, headY, headZ);
    }
    if (spineBone.current) {
      spineBone.current.rotation.set(0.017 + spineX, 0, 0);
    }

    // Apply Morph Targets
    mouthMorphs.current.forEach(({ mesh, index }) => {
      if (mesh.morphTargetInfluences) {
        mesh.morphTargetInfluences[index] = finalMouthOpen;
      }
    });
    eyeCloseMorphs.current.forEach(({ mesh, index }) => {
      if (mesh.morphTargetInfluences) {
        mesh.morphTargetInfluences[index] = eyesClosed;
      }
    });
    smileMorphs.current.forEach(({ mesh, index }) => {
      if (mesh.morphTargetInfluences) {
        mesh.morphTargetInfluences[index] = smileVal;
      }
    });
  });

  // Touch zones and Petting drag handlers
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    isDragging.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    dragDist.current = 0;
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    dragDist.current += Math.hypot(dx, dy);
    lastPointer.current = { x: e.clientX, y: e.clientY };
    if (dragDist.current > 75) {
      onPet?.();
      dragDist.current = 0;
    }
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  return (
    <group
      ref={rootGroup}
      position={[0, 0, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* 1. Loaded FBX Model */}
      {model && <primitive object={model} />}

      {/* 2. Interactive Raycast Hitboxes for Touch/Tap */}
      {/* Head Poke Target */}
      <mesh
        position={[0, headPos[1] + 0.02, 0.04]}
        onClick={(e) => {
          e.stopPropagation();
          onPokeHead?.();
        }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[0.26, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Belly Tickle Target */}
      <mesh
        position={[0, 1.22, 0.08]}
        onClick={(e) => {
          e.stopPropagation();
          onTickleBelly?.();
        }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <cylinderGeometry args={[0.28, 0.28, 0.55, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Feet Tap Target */}
      <mesh
        position={[0, 0.16, 0.06]}
        onClick={(e) => {
          e.stopPropagation();
          onTapFeet?.();
        }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <boxGeometry args={[0.55, 0.32, 0.4]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 3. Signature Talking Tom Accessories */}
      {/* Round Wireframe Green-Tinted Spectacles */}
      {hasGlasses && (
        <group position={[0, headPos[1], headPos[2]]}>
          {/* Left Wireframe Rim */}
          <mesh position={[0.0365, 0, 0]}>
            <torusGeometry args={[0.033, 0.003, 16, 36]} />
            <meshStandardMaterial color="#e5e7eb" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Left Green Glass Lens */}
          <mesh position={[0.0365, 0, 0]}>
            <circleGeometry args={[0.031, 32]} />
            <meshPhysicalMaterial
              color="#2ecc71"
              transmission={0.88}
              opacity={0.35}
              transparent
              roughness={0.08}
              ior={1.45}
            />
          </mesh>

          {/* Right Wireframe Rim */}
          <mesh position={[-0.0365, 0, 0]}>
            <torusGeometry args={[0.033, 0.003, 16, 36]} />
            <meshStandardMaterial color="#e5e7eb" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Right Green Glass Lens */}
          <mesh position={[-0.0365, 0, 0]}>
            <circleGeometry args={[0.031, 32]} />
            <meshPhysicalMaterial
              color="#2ecc71"
              transmission={0.88}
              opacity={0.35}
              transparent
              roughness={0.08}
              ior={1.45}
            />
          </mesh>

          {/* Nose Bridge */}
          <mesh position={[0, 0.004, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.0025, 0.0025, 0.024, 12]} />
            <meshStandardMaterial color="#e5e7eb" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Left Temple Bar */}
          <mesh position={[0.068, 0, -0.045]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.002, 0.002, 0.09, 8]} />
            <meshStandardMaterial color="#e5e7eb" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Right Temple Bar */}
          <mesh position={[-0.068, 0, -0.045]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.002, 0.002, 0.09, 8]} />
            <meshStandardMaterial color="#e5e7eb" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      )}

      {/* Bright Red Bow Tie on Collar */}
      {hasBowTie && (
        <group position={[0, neckPos[1], neckPos[2]]}>
          {/* Knot */}
          <mesh castShadow>
            <sphereGeometry args={[0.018, 16, 16]} />
            <meshStandardMaterial color="#dc2626" roughness={0.35} />
          </mesh>
          {/* Left Wing */}
          <mesh position={[-0.036, 0, 0]} rotation={[0, 0.18, 0.1]} scale={[0.036, 0.028, 0.014]} castShadow>
            <boxGeometry />
            <meshStandardMaterial color="#b91c1c" roughness={0.35} />
          </mesh>
          {/* Right Wing */}
          <mesh position={[0.036, 0, 0]} rotation={[0, -0.18, -0.1]} scale={[0.036, 0.028, 0.014]} castShadow>
            <boxGeometry />
            <meshStandardMaterial color="#b91c1c" roughness={0.35} />
          </mesh>
        </group>
      )}

      {/* Sunglasses Option */}
      {hasSunglasses && (
        <group position={[0, headPos[1], headPos[2]]}>
          <mesh position={[0.0365, 0, 0]} scale={[0.038, 0.028, 0.012]}>
            <boxGeometry />
            <meshStandardMaterial color="#111116" roughness={0.1} metalness={0.85} />
          </mesh>
          <mesh position={[-0.0365, 0, 0]} scale={[0.038, 0.028, 0.012]}>
            <boxGeometry />
            <meshStandardMaterial color="#111116" roughness={0.1} metalness={0.85} />
          </mesh>
          <mesh position={[0, 0.006, 0]} scale={[0.018, 0.005, 0.005]}>
            <boxGeometry />
            <meshStandardMaterial color="#111116" roughness={0.1} metalness={0.85} />
          </mesh>
        </group>
      )}

      {/* Party Cone Hat Option */}
      {hasPartyHat && (
        <group position={[0, 2.05, -0.02]} rotation={[-0.08, 0, 0.1]}>
          <mesh castShadow position={[0, 0.12, 0]}>
            <coneGeometry args={[0.085, 0.24, 20]} />
            <meshStandardMaterial color="#ec4899" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <sphereGeometry args={[0.025, 12, 12]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.3} />
          </mesh>
        </group>
      )}
    </group>
  );
};
