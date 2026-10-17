import React, { useRef, useState } from 'react';

interface InteractiveZonesProps {
  onPokeHead: () => void;
  onTickleBelly: () => void;
  onTapFeet: () => void;
  onPet: () => void;
}

export const InteractiveZones3D: React.FC<InteractiveZonesProps> = ({
  onPokeHead,
  onTickleBelly,
  onTapFeet,
  onPet,
}) => {
  const isDragging = useRef(false);
  const dragDistance = useRef(0);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [hoverArea, setHoverArea] = useState<string | null>(null);

  const handlePointerDown = (area: string, e: any) => {
    e.stopPropagation();
    isDragging.current = true;
    dragDistance.current = 0;
    lastPos.current = { x: e.clientX || 0, y: e.clientY || 0 };
  };

  const handlePointerMove = (_area: string, e: any) => {
    if (!isDragging.current) return;
    const curX = e.clientX || 0;
    const curY = e.clientY || 0;
    if (lastPos.current) {
      const dx = curX - lastPos.current.x;
      const dy = curY - lastPos.current.y;
      dragDistance.current += Math.hypot(dx, dy);
      if (dragDistance.current > 35) {
        onPet();
        dragDistance.current = 0;
      }
    }
    lastPos.current = { x: curX, y: curY };
  };

  const handlePointerUp = (area: string, e: any) => {
    e.stopPropagation();
    if (dragDistance.current < 25) {
      if (area === 'head') onPokeHead();
      else if (area === 'belly') onTickleBelly();
      else if (area === 'feet') onTapFeet();
    }
    isDragging.current = false;
    dragDistance.current = 0;
    lastPos.current = null;
  };

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Head Touch Zone (Aligned with face/head at y=1.90) */}
      <mesh
        position={[0, 1.90, 0.08]}
        onPointerDown={(e) => handlePointerDown('head', e)}
        onPointerMove={(e) => handlePointerMove('head', e)}
        onPointerUp={(e) => handlePointerUp('head', e)}
        onPointerOver={() => setHoverArea('head')}
        onPointerOut={() => setHoverArea(null)}
      >
        <sphereGeometry args={[0.22, 16, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 2. Belly / Torso Touch Zone (Aligned with belly at y=1.25) */}
      <mesh
        position={[0, 1.25, 0.08]}
        onPointerDown={(e) => handlePointerDown('belly', e)}
        onPointerMove={(e) => handlePointerMove('belly', e)}
        onPointerUp={(e) => handlePointerUp('belly', e)}
        onPointerOver={() => setHoverArea('belly')}
        onPointerOut={() => setHoverArea(null)}
      >
        <cylinderGeometry args={[0.26, 0.28, 0.55, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 3. Feet / Shoes Touch Zone (Aligned with shoes at y=0.12) */}
      <mesh
        position={[0, 0.12, 0.08]}
        onPointerDown={(e) => handlePointerDown('feet', e)}
        onPointerMove={(e) => handlePointerMove('feet', e)}
        onPointerUp={(e) => handlePointerUp('feet', e)}
        onPointerOver={() => setHoverArea('feet')}
        onPointerOut={() => setHoverArea(null)}
      >
        <boxGeometry args={[0.55, 0.26, 0.4]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Hover cursor hint */}
      {hoverArea && (
        <mesh position={[0, hoverArea === 'head' ? 2.14 : hoverArea === 'belly' ? 1.54 : 0.32, 0.2]}>
          <ringGeometry args={[0.045, 0.065, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
};
