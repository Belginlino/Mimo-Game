import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Creates a canvas-generated procedural texture for the purple striped wallpaper
 * matching the authentic Talking Tom reference image.
 */
function createStripedWallpaperTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base lavender fill
  ctx.fillStyle = '#7a689d';
  ctx.fillRect(0, 0, 512, 512);

  const stripeWidth = 64;
  for (let x = 0; x < 512; x += stripeWidth) {
    const isAlternate = (x / stripeWidth) % 2 === 1;

    // Alternate stripe color
    if (isAlternate) {
      const grad = ctx.createLinearGradient(x, 0, x + stripeWidth, 0);
      grad.addColorStop(0, '#8e7db2');
      grad.addColorStop(0.5, '#9988bf');
      grad.addColorStop(1, '#8e7db2');
      ctx.fillStyle = grad;
      ctx.fillRect(x, 0, stripeWidth, 512);
    } else {
      const grad = ctx.createLinearGradient(x, 0, x + stripeWidth, 0);
      grad.addColorStop(0, '#736195');
      grad.addColorStop(0.5, '#7a689d');
      grad.addColorStop(1, '#736195');
      ctx.fillStyle = grad;
      ctx.fillRect(x, 0, stripeWidth, 512);
    }

    // Subtle dark pinstripe seam
    ctx.strokeStyle = 'rgba(70, 50, 100, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();

    // Subtle light edge highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 2, 0);
    ctx.lineTo(x + 2, 512);
    ctx.stroke();
  }

  // Soft vertical room ambient vignette
  const roomGrad = ctx.createLinearGradient(0, 0, 0, 512);
  roomGrad.addColorStop(0, 'rgba(30, 20, 50, 0.22)');
  roomGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.04)');
  roomGrad.addColorStop(1, 'rgba(20, 10, 35, 0.35)');
  ctx.fillStyle = roomGrad;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 1.8);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates a canvas-generated procedural texture for the rich dark wooden floorboards
 * matching the authentic Talking Tom reference image.
 */
function createWoodFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Warm dark wood base
  ctx.fillStyle = '#3a2313';
  ctx.fillRect(0, 0, 1024, 1024);

  const plankWidth = 128;
  const plankColors = [
    { base: '#4e331d', highlight: '#624227', dark: '#372212' },
    { base: '#432a17', highlight: '#563720', dark: '#2e1b0c' },
    { base: '#523720', highlight: '#69472b', dark: '#3b2514' },
    { base: '#3c2413', highlight: '#4f311c', dark: '#28170a' },
    { base: '#492f1b', highlight: '#5d3d24', dark: '#331f10' },
  ];

  for (let x = 0; x < 1024; x += plankWidth) {
    const palette = plankColors[(x / plankWidth) % plankColors.length];

    // Plank background gradient
    const grad = ctx.createLinearGradient(x, 0, x + plankWidth, 0);
    grad.addColorStop(0, palette.dark);
    grad.addColorStop(0.15, palette.base);
    grad.addColorStop(0.5, palette.highlight);
    grad.addColorStop(0.85, palette.base);
    grad.addColorStop(1, palette.dark);
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, plankWidth, 1024);

    // Wood grain lines
    ctx.strokeStyle = 'rgba(25, 12, 4, 0.28)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 28; i++) {
      const lineX = x + 4 + Math.random() * (plankWidth - 8);
      ctx.beginPath();
      ctx.moveTo(lineX, 0);
      ctx.bezierCurveTo(
        lineX + (Math.random() - 0.5) * 8, 300,
        lineX + (Math.random() - 0.5) * 8, 700,
        lineX + (Math.random() - 0.5) * 6, 1024
      );
      ctx.stroke();
    }

    // Subtle lighter wood fibers
    ctx.strokeStyle = 'rgba(255, 230, 200, 0.07)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 15; i++) {
      const lineX = x + 6 + Math.random() * (plankWidth - 12);
      ctx.beginPath();
      ctx.moveTo(lineX, 0);
      ctx.lineTo(lineX + (Math.random() - 0.5) * 4, 1024);
      ctx.stroke();
    }

    // Occasional subtle wood knot
    if ((x / plankWidth) % 3 === 1) {
      const knotY = 320 + (x * 7) % 400;
      const knotX = x + plankWidth * 0.45;
      ctx.save();
      ctx.fillStyle = 'rgba(20, 10, 4, 0.45)';
      ctx.beginPath();
      ctx.ellipse(knotX, knotY, 10, 22, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Deep plank seam groove (vertical)
    ctx.fillStyle = '#170b04';
    ctx.fillRect(x + plankWidth - 3, 0, 3, 1024);

    // Highlight on opposite seam edge
    ctx.fillStyle = 'rgba(255, 240, 220, 0.14)';
    ctx.fillRect(x + 1, 0, 1.5, 1024);
  }

  // Perspective sheen gradient (darker near back wall, lighter near front)
  const sheen = ctx.createLinearGradient(0, 0, 0, 1024);
  sheen.addColorStop(0, 'rgba(15, 8, 3, 0.45)');
  sheen.addColorStop(0.65, 'rgba(255, 255, 255, 0.05)');
  sheen.addColorStop(1, 'rgba(255, 245, 225, 0.12)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, 1024, 1024);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.5, 2.5);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates a canvas-generated texture for the garden window view (sunny day, green trees).
 */
function createWindowGardenTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 512);
  skyGrad.addColorStop(0, '#7ec2eb');
  skyGrad.addColorStop(0.45, '#c0e6f5');
  skyGrad.addColorStop(0.6, '#eef8fc');
  skyGrad.addColorStop(1, '#8bc34a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Soft distant sun glow
  const sunGrad = ctx.createRadialGradient(380, 100, 20, 380, 100, 220);
  sunGrad.addColorStop(0, 'rgba(255, 255, 230, 0.85)');
  sunGrad.addColorStop(0.5, 'rgba(255, 245, 200, 0.3)');
  sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = sunGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Distant green foliage hills
  ctx.fillStyle = '#619f39';
  ctx.beginPath();
  ctx.arc(150, 420, 220, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#4c862a';
  ctx.beginPath();
  ctx.arc(380, 440, 260, 0, Math.PI * 2);
  ctx.fill();

  // Closer leafy branches
  ctx.fillStyle = '#3c6e21';
  ctx.beginPath();
  ctx.arc(60, 360, 160, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#2f5b19';
  ctx.beginPath();
  ctx.arc(460, 380, 180, 0, Math.PI * 2);
  ctx.fill();

  // Gentle raindrop / glass glint streaks like reference
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 18; i++) {
    const rx = 40 + Math.random() * 430;
    const ry = 40 + Math.random() * 400;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx - 4, ry + 16);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function TalkingTomRoom3D() {
  const wallpaperTexture = useMemo(() => createStripedWallpaperTexture(), []);
  const floorTexture = useMemo(() => createWoodFloorTexture(), []);
  const windowGardenTexture = useMemo(() => createWindowGardenTexture(), []);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Purple Striped Back Wall */}
      <mesh position={[0, 2.5, -2.2]} receiveShadow>
        <planeGeometry args={[9, 6]} />
        <meshStandardMaterial
          map={wallpaperTexture}
          roughness={0.88}
          metalness={0.02}
        />
      </mesh>

      {/* 2. Wooden Baseboard / Skirting Board */}
      <group position={[0, 0.12, -2.18]}>
        <mesh receiveShadow>
          <boxGeometry args={[9, 0.24, 0.06]} />
          <meshStandardMaterial color="#422917" roughness={0.7} />
        </mesh>
        {/* Top beveled moulding trim */}
        <mesh position={[0, 0.12, 0.015]}>
          <boxGeometry args={[9, 0.03, 0.08]} />
          <meshStandardMaterial color="#54351f" roughness={0.65} />
        </mesh>
      </group>

      {/* 3. Dark Oak Wood Plank Floor */}
      <mesh
        position={[0, 0, 0.6]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[9, 6.2]} />
        <meshStandardMaterial
          map={floorTexture}
          roughness={0.45}
          metalness={0.08}
        />
      </mesh>

      {/* 4. Realistic Character Contact Shadow */}
      <mesh position={[0, 0.005, 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0, 0.68, 32]} />
        <meshBasicMaterial
          color="#0d0703"
          transparent
          opacity={0.52}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0.004, 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 1.05, 32]} />
        <meshBasicMaterial
          color="#150a04"
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>

      {/* 5. Left Wall Window (matching Talking Tom reference image) */}
      <group position={[-2.45, 2.7, -2.1]}>
        {/* Garden View Pane */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[1.5, 2.1]} />
          <meshBasicMaterial map={windowGardenTexture} />
        </mesh>

        {/* White Outer Window Frame */}
        {/* Top frame */}
        <mesh position={[0, 1.08, 0.03]}>
          <boxGeometry args={[1.68, 0.12, 0.08]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        {/* Bottom frame / sill */}
        <mesh position={[0, -1.08, 0.06]}>
          <boxGeometry args={[1.82, 0.14, 0.16]} />
          <meshStandardMaterial color="#f8f9fa" roughness={0.45} />
        </mesh>
        {/* Left frame */}
        <mesh position={[-0.78, 0, 0.03]}>
          <boxGeometry args={[0.12, 2.16, 0.08]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        {/* Right frame */}
        <mesh position={[0.78, 0, 0.03]}>
          <boxGeometry args={[0.12, 2.16, 0.08]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>

        {/* Cross Mullions (4 panes) */}
        {/* Horizontal bar */}
        <mesh position={[0, 0.05, 0.02]}>
          <boxGeometry args={[1.5, 0.06, 0.05]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        {/* Vertical bar */}
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[0.06, 2.1, 0.05]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>

        {/* Subtle glass reflection highlight */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[1.44, 2.05]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.12}
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>
      </group>

      {/* 6. Right Wall Doorframe / Side Cabinet Trim (matching reference) */}
      <group position={[2.85, 2.2, -2.1]}>
        <mesh>
          <boxGeometry args={[0.22, 4.4, 0.18]} />
          <meshStandardMaterial color="#4a2e19" roughness={0.65} />
        </mesh>
        <mesh position={[-0.1, 0, 0.04]}>
          <boxGeometry args={[0.04, 4.4, 0.1]} />
          <meshStandardMaterial color="#5d3c22" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}
