interface AccessoriesProps {
  hasGlasses: boolean;
  hasBowTie: boolean;
  hasSunglasses?: boolean;
  hasPartyHat?: boolean;
}

export function Accessories3D({
  hasGlasses,
  hasBowTie,
  hasSunglasses,
  hasPartyHat,
}: AccessoriesProps) {
  return (
    <group position={[0, 0, 0]}>
      {/* 1. Round Wireframe Glasses (Accurately sized & positioned on face/eyes) */}
      {hasGlasses && !hasSunglasses && (
        <group position={[0, 1.905, 0.165]}>
          {/* Left Rim */}
          <mesh position={[-0.058, 0, 0]}>
            <torusGeometry args={[0.042, 0.0035, 12, 28]} />
            <meshStandardMaterial color="#2d3748" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Left Lens (subtle green tint like Talking Tom reference) */}
          <mesh position={[-0.058, 0, 0]}>
            <circleGeometry args={[0.04, 24]} />
            <meshStandardMaterial
              color="#22c55e"
              transparent
              opacity={0.25}
              roughness={0.1}
              metalness={0.2}
            />
          </mesh>

          {/* Right Rim */}
          <mesh position={[0.058, 0, 0]}>
            <torusGeometry args={[0.042, 0.0035, 12, 28]} />
            <meshStandardMaterial color="#2d3748" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Right Lens */}
          <mesh position={[0.058, 0, 0]}>
            <circleGeometry args={[0.04, 24]} />
            <meshStandardMaterial
              color="#22c55e"
              transparent
              opacity={0.25}
              roughness={0.1}
              metalness={0.2}
            />
          </mesh>

          {/* Nose Bridge */}
          <mesh position={[0, 0.006, -0.002]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.003, 0.003, 0.038, 8]} />
            <meshStandardMaterial color="#2d3748" metalness={0.7} roughness={0.3} />
          </mesh>

          {/* Left Temple Bar (toward ear) */}
          <mesh position={[-0.098, 0.004, -0.075]} rotation={[0.05, 0.22, 0]}>
            <cylinderGeometry args={[0.0025, 0.0025, 0.15, 8]} />
            <meshStandardMaterial color="#2d3748" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Right Temple Bar (toward ear) */}
          <mesh position={[0.098, 0.004, -0.075]} rotation={[0.05, -0.22, 0]}>
            <cylinderGeometry args={[0.0025, 0.0025, 0.15, 8]} />
            <meshStandardMaterial color="#2d3748" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      )}

      {/* 2. Cool Dark Sunglasses (alternative wardrobe option) */}
      {hasSunglasses && (
        <group position={[0, 1.905, 0.168]}>
          {/* Left Dark Lens */}
          <mesh position={[-0.058, 0, 0]}>
            <boxGeometry args={[0.078, 0.052, 0.012]} />
            <meshStandardMaterial color="#0a0a0c" roughness={0.15} metalness={0.9} />
          </mesh>
          {/* Right Dark Lens */}
          <mesh position={[0.058, 0, 0]}>
            <boxGeometry args={[0.078, 0.052, 0.012]} />
            <meshStandardMaterial color="#0a0a0c" roughness={0.15} metalness={0.9} />
          </mesh>
          {/* Bridge */}
          <mesh position={[0, 0.014, 0]}>
            <boxGeometry args={[0.04, 0.008, 0.012]} />
            <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.2} />
          </mesh>
        </group>
      )}

      {/* 3. Bright Red Bow Tie (Positioned right at the shirt collar) */}
      {hasBowTie && (
        <group position={[0, 1.76, 0.122]}>
          {/* Center Knot */}
          <mesh position={[0, 0, 0.012]}>
            <sphereGeometry args={[0.022, 16, 14]} />
            <meshStandardMaterial color="#d81b2a" roughness={0.35} />
          </mesh>

          {/* Left Bow Wing */}
          <mesh position={[-0.046, 0.002, 0.004]} rotation={[0, 0.14, 0.2]}>
            <coneGeometry args={[0.038, 0.072, 4]} />
            <meshStandardMaterial color="#e52332" roughness={0.35} />
          </mesh>

          {/* Right Bow Wing */}
          <mesh position={[0.046, 0.002, 0.004]} rotation={[0, -0.14, -0.2]}>
            <coneGeometry args={[0.038, 0.072, 4]} />
            <meshStandardMaterial color="#e52332" roughness={0.35} />
          </mesh>
        </group>
      )}

      {/* 4. Party Cone Hat (fun wardrobe accessory) */}
      {hasPartyHat && (
        <group position={[0, 2.05, 0.02]} rotation={[0.06, 0, -0.08]}>
          <mesh position={[0, 0.14, 0]}>
            <coneGeometry args={[0.11, 0.28, 20]} />
            <meshStandardMaterial color="#ffc107" roughness={0.3} metalness={0.1} />
          </mesh>
          {/* Hat Pom-pom */}
          <mesh position={[0, 0.29, 0]}>
            <sphereGeometry args={[0.035, 14, 12]} />
            <meshStandardMaterial color="#e91e63" roughness={0.5} />
          </mesh>
          {/* Hat Rim trim */}
          <mesh position={[0, 0.005, 0]}>
            <torusGeometry args={[0.11, 0.015, 8, 24]} />
            <meshStandardMaterial color="#00bcd4" roughness={0.4} />
          </mesh>
        </group>
      )}
    </group>
  );
}
