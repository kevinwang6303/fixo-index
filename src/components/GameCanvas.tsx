import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FixoProduct } from '../types/product';
import { sound } from '../utils/audio';

interface GameCanvasProps {
  products: FixoProduct[];
  activeProduct: FixoProduct | null;
  onOpenProduct: (product: FixoProduct) => void;
  playerPos: { x: number; y: number };
  setPlayerPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  joystickVector: { x: number; y: number };
  teleportTarget: { x: number; y: number } | null;
  clearTeleport: () => void;
}

const WORLD_WIDTH = 2400;
const WORLD_HEIGHT = 1750;
const INTERACTION_DIST = 115;

// Star field data generated once for consistent cosmos
interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  speed: number;
  color: string;
}

const STARS: Star[] = Array.from({ length: 320 }, (_, i) => ({
  x: (i * 137.5) % (WORLD_WIDTH + 600) - 300,
  y: (i * 89.3) % (WORLD_HEIGHT + 600) - 300,
  size: (i % 5 === 0 ? 2.5 : (i % 3 === 0 ? 1.8 : 1.0)),
  baseAlpha: 0.3 + (i % 7) * 0.1,
  speed: 0.02 + (i % 5) * 0.015,
  color: i % 8 === 0 ? '#67e8f9' : (i % 11 === 0 ? '#fde047' : (i % 13 === 0 ? '#c084fc' : '#ffffff'))
}));

// Floating particle for jetpack thrusters
interface ThrustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  products,
  activeProduct,
  onOpenProduct,
  playerPos,
  setPlayerPos,
  joystickVector,
  teleportTarget,
  clearTeleport
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const clickTargetRef = useRef<{ x: number; y: number } | null>(null);

  const [nearbyProduct, setNearbyProduct] = useState<FixoProduct | null>(null);

  // Astronaut Zero-G Physics & Floating State
  const playerRef = useRef({
    x: playerPos.x,
    y: playerPos.y,
    vx: 0,
    vy: 0,
    dir: 'down' as 'down' | 'up' | 'left' | 'right',
    flightTilt: 0,
    isMoving: false,
    thrusterTimer: 0
  });

  const particlesRef = useRef<ThrustParticle[]>([]);

  // Camera state
  const cameraRef = useRef({
    x: playerPos.x,
    y: playerPos.y
  });

  // Handle teleportation target
  useEffect(() => {
    if (teleportTarget) {
      playerRef.current.x = teleportTarget.x;
      playerRef.current.y = teleportTarget.y;
      playerRef.current.vx = 0;
      playerRef.current.vy = 0;
      clickTargetRef.current = null;
      setPlayerPos({ x: teleportTarget.x, y: teleportTarget.y });
      sound.playTeleport();
      clearTeleport();
    }
  }, [teleportTarget, clearTeleport, setPlayerPos]);

  // Key listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (activeProduct) return;

      const k = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(k)) {
        keysRef.current[k] = true;
      }

      if ((e.key === ' ' || k === 'e') && nearbyProduct) {
        e.preventDefault();
        sound.playInteract();
        onOpenProduct(nearbyProduct);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [nearbyProduct, activeProduct, onOpenProduct]);

  // Canvas click to fly there / interact
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeProduct) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const worldX = screenX + cameraRef.current.x - canvas.width / 2;
    const worldY = screenY + cameraRef.current.y - canvas.height / 2;

    // Direct room click
    for (const prod of products) {
      const bx = prod.building.x;
      const by = prod.building.y;
      const dist = Math.hypot(worldX - bx, worldY - by);
      if (dist < 90) {
        sound.playInteract();
        onOpenProduct(prod);
        return;
      }
    }

    // Set flight target
    clickTargetRef.current = {
      x: Math.max(120, Math.min(WORLD_WIDTH - 120, worldX)),
      y: Math.max(140, Math.min(WORLD_HEIGHT - 140, worldY))
    };
  }, [activeProduct, products, onOpenProduct]);

  // Main Render & Zero-G Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let ticks = 0;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const loop = () => {
      ticks++;
      const p = playerRef.current;
      const keys = keysRef.current;

      // 1. Calculate Thrust Input
      let thrustX = 0;
      let thrustY = 0;

      if (!activeProduct) {
        if (keys['w'] || keys['arrowup']) thrustY -= 1;
        if (keys['s'] || keys['arrowdown']) thrustY += 1;
        if (keys['a'] || keys['arrowleft']) thrustX -= 1;
        if (keys['d'] || keys['arrowright']) thrustX += 1;

        // Joystick override
        if (joystickVector.x !== 0 || joystickVector.y !== 0) {
          thrustX = joystickVector.x;
          thrustY = joystickVector.y;
          clickTargetRef.current = null;
        }

        // Click-to-move handling
        if (clickTargetRef.current && thrustX === 0 && thrustY === 0) {
          const dx = clickTargetRef.current.x - p.x;
          const dy = clickTargetRef.current.y - p.y;
          const dist = Math.hypot(dx, dy);

          if (dist > 8) {
            thrustX = dx / dist;
            thrustY = dy / dist;
          } else {
            clickTargetRef.current = null;
          }
        }
      }

      const hasThrust = thrustX !== 0 || thrustY !== 0;
      p.isMoving = hasThrust;

      // Zero-G Physics: Smooth Acceleration & Inertia Drift
      const ACCEL = 0.55;
      const MAX_SPEED = 4.8;
      const DAMPING = 0.88; // Microgravity smooth damping

      if (hasThrust) {
        const len = Math.hypot(thrustX, thrustY);
        const normX = thrustX / len;
        const normY = thrustY / len;

        p.vx += normX * ACCEL;
        p.vy += normY * ACCEL;

        // Cap speed
        const currentSpeed = Math.hypot(p.vx, p.vy);
        if (currentSpeed > MAX_SPEED) {
          p.vx = (p.vx / currentSpeed) * MAX_SPEED;
          p.vy = (p.vy / currentSpeed) * MAX_SPEED;
        }

        // Direction determination
        if (Math.abs(normX) > Math.abs(normY)) {
          p.dir = normX > 0 ? 'right' : 'left';
        } else {
          p.dir = normY > 0 ? 'down' : 'up';
        }

        // Flight tilt angle
        p.flightTilt = p.flightTilt * 0.8 + (normX * 0.25) * 0.2;

        // Spawn Jetpack Thruster Particles
        if (ticks % 2 === 0) {
          const particleCount = 2;
          for (let i = 0; i < particleCount; i++) {
            const spread = (Math.random() - 0.5) * 6;
            particlesRef.current.push({
              x: p.x + (p.dir === 'right' ? -12 : (p.dir === 'left' ? 12 : spread)),
              y: p.y + 10 + (p.dir === 'up' ? 12 : -4),
              vx: -normX * (1.5 + Math.random() * 2) + (Math.random() - 0.5) * 0.6,
              vy: -normY * (1.5 + Math.random() * 2) + (Math.random() - 0.5) * 0.6,
              life: 1.0,
              maxLife: 18 + Math.random() * 10,
              size: 2.5 + Math.random() * 2,
              color: Math.random() > 0.4 ? '#38bdf8' : '#a855f7'
            });
          }
        }

        // Thruster sound
        p.thrusterTimer++;
        if (p.thrusterTimer % 20 === 0) {
          sound.playStep();
        }
      } else {
        // Microgravity gradual coasting
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.flightTilt *= 0.85;

        // Idle RCS micro puffs occasionally
        if (ticks % 60 === 0 && Math.random() > 0.5) {
          particlesRef.current.push({
            x: p.x + (Math.random() > 0.5 ? -10 : 10),
            y: p.y + 6,
            vx: (Math.random() - 0.5) * 0.8,
            vy: 0.5 + Math.random() * 0.5,
            life: 1.0,
            maxLife: 14,
            size: 2,
            color: 'rgba(255, 255, 255, 0.7)'
          });
        }
      }

      // Update position
      p.x = Math.max(120, Math.min(WORLD_WIDTH - 120, p.x + p.vx));
      p.y = Math.max(140, Math.min(WORLD_HEIGHT - 140, p.y + p.vy));

      // Periodic state sync
      if (ticks % 6 === 0) {
        setPlayerPos({ x: p.x, y: p.y });
      }

      // Update particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const pt = particlesRef.current[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 1 / pt.maxLife;
        if (pt.life <= 0) {
          particlesRef.current.splice(i, 1);
        }
      }

      // 2. Camera Smooth Follow
      cameraRef.current.x += (p.x - cameraRef.current.x) * 0.08;
      cameraRef.current.y += (p.y - cameraRef.current.y) * 0.08;

      // 3. Proximity Check
      let foundNearby: FixoProduct | null = null;
      for (const prod of products) {
        const dist = Math.hypot(p.x - prod.building.x, p.y - prod.building.y);
        if (dist < INTERACTION_DIST) {
          foundNearby = prod;
          break;
        }
      }
      setNearbyProduct(foundNearby);

      // 4. Render Pipeline
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      const offsetX = canvas.width / 2 - cameraRef.current.x;
      const offsetY = canvas.height / 2 - cameraRef.current.y;
      ctx.translate(offsetX, offsetY);

      // --- A. Deep Space, Planetary Limb, Nebulae, Stars ---
      drawCosmosBackground(ctx, ticks);

      // --- B. Space Shuttle / Orbital Station Outer Hull & Solar Wings ---
      drawSpaceShuttleHull(ctx, ticks);

      // --- C. Pressurized Connecting Corridors & Airlock Tubes ---
      drawCorridors(ctx, products, ticks);

      // --- D. Click Target Marker ---
      if (clickTargetRef.current) {
        drawClickTarget(ctx, clickTargetRef.current.x, clickTargetRef.current.y, ticks);
      }

      // --- E. Central Command Bridge (KSP Starship Flight Deck) ---
      drawCommandBridge(ctx, ticks);

      // --- F. 10 Product Space Capsules (太空艙室) ---
      for (const prod of products) {
        drawSpaceCapsule(ctx, prod, ticks, foundNearby?.id === prod.id);
      }

      // --- G. Jetpack Thruster Particles ---
      drawParticles(ctx, particlesRef.current);

      // --- H. Zero-G Floating Astronaut (腳完全不著地) ---
      drawFloatingAstronaut(ctx, p, ticks);

      // --- I. Interaction Prompt ---
      if (foundNearby) {
        drawInteractionPrompt(ctx, foundNearby, p, ticks);
      }

      ctx.restore();

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [products, activeProduct, joystickVector, setPlayerPos]);

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      className="absolute inset-0 cursor-crosshair touch-none"
    />
  );
};

// ==================== RENDERING ENGINE ====================

/**
 * A. Deep Space Background: Cosmic Nebulae, Starfield, Planet Limb
 */
function drawCosmosBackground(ctx: CanvasRenderingContext2D, ticks: number) {
  // 1. Deep Space Void
  const bgGrad = ctx.createLinearGradient(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  bgGrad.addColorStop(0, '#020617');
  bgGrad.addColorStop(0.5, '#050c24');
  bgGrad.addColorStop(1, '#020410');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(-600, -600, WORLD_WIDTH + 1200, WORLD_HEIGHT + 1200);

  // 2. Deep Nebulae Clouds
  ctx.save();
  // Cyan Nebula (Top-Right)
  const neb1 = ctx.createRadialGradient(1800, 400, 50, 1800, 400, 700);
  neb1.addColorStop(0, 'rgba(6, 182, 212, 0.12)');
  neb1.addColorStop(0.5, 'rgba(14, 116, 144, 0.05)');
  neb1.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = neb1;
  ctx.fillRect(1000, -200, 1500, 1200);

  // Purple / Violet Nebula (Left-Center)
  const neb2 = ctx.createRadialGradient(500, 1000, 80, 500, 1000, 800);
  neb2.addColorStop(0, 'rgba(168, 85, 247, 0.12)');
  neb2.addColorStop(0.6, 'rgba(88, 28, 135, 0.04)');
  neb2.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = neb2;
  ctx.fillRect(-200, 400, 1400, 1200);

  // 3. Twinkling Stars
  for (const s of STARS) {
    const twinkle = Math.sin(ticks * s.speed + s.x) * 0.35 + 0.65;
    ctx.fillStyle = s.color;
    ctx.globalAlpha = Math.max(0.1, Math.min(1.0, s.baseAlpha * twinkle));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  // 4. Gigantic Curved Planetary Horizon (Earth / Kaohsiung Bay Orbit)
  // Positioned across the lower-left horizon
  const planetCenterX = -100;
  const planetCenterY = WORLD_HEIGHT + 800;
  const planetRadius = 1350;

  // Outer atmospheric Rayleigh scattering glow
  const atmoGrad = ctx.createRadialGradient(
    planetCenterX, planetCenterY, planetRadius - 60,
    planetCenterX, planetCenterY, planetRadius + 140
  );
  atmoGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
  atmoGrad.addColorStop(0.3, 'rgba(14, 165, 233, 0.22)');
  atmoGrad.addColorStop(0.7, 'rgba(3, 105, 161, 0.08)');
  atmoGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = atmoGrad;
  ctx.beginPath();
  ctx.arc(planetCenterX, planetCenterY, planetRadius + 140, 0, Math.PI * 2);
  ctx.fill();

  // Planet Body
  const planetGrad = ctx.createRadialGradient(
    planetCenterX + 200, planetCenterY - 400, 100,
    planetCenterX, planetCenterY, planetRadius
  );
  planetGrad.addColorStop(0, '#0284c7');
  planetGrad.addColorStop(0.35, '#0369a1');
  planetGrad.addColorStop(0.7, '#075985');
  planetGrad.addColorStop(1, '#0c2340');

  ctx.fillStyle = planetGrad;
  ctx.beginPath();
  ctx.arc(planetCenterX, planetCenterY, planetRadius, 0, Math.PI * 2);
  ctx.fill();

  // Planet continent & cloud bands
  ctx.save();
  ctx.beginPath();
  ctx.arc(planetCenterX, planetCenterY, planetRadius, 0, Math.PI * 2);
  ctx.clip();

  // Swirling atmosphere cloud wisps
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 18;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    const cy = planetCenterY - planetRadius + 80 + i * 90;
    ctx.arc(planetCenterX, cy, 750, 0.1, 1.2);
    ctx.stroke();
  }
  ctx.restore();

  ctx.restore();
}

/**
 * B. Space Shuttle / Space Station Hull & Solar Array Wings
 */
function drawSpaceShuttleHull(ctx: CanvasRenderingContext2D, ticks: number) {
  ctx.save();

  // 1. Massive Photovoltaic Solar Array Wings (Left & Right)
  const drawSolarWing = (baseX: number, isRight: boolean) => {
    const width = 280;
    const startY = 480;
    const height = 820;
    const dir = isRight ? 1 : -1;

    // Truss armature connecting to main hull
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(isRight ? 1700 : 700, 880);
    ctx.lineTo(baseX, 880);
    ctx.stroke();

    // Central structural spar
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(baseX + dir * (width / 2), startY);
    ctx.lineTo(baseX + dir * (width / 2), startY + height);
    ctx.stroke();

    // Solar panels (8 massive blue photovoltaic segments)
    const segments = 6;
    const segHeight = height / segments;

    for (let s = 0; s < segments; s++) {
      const sy = startY + s * segHeight + 8;
      const sh = segHeight - 16;
      const sx = isRight ? baseX : baseX - width;

      // Panel background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(sx, sy, width, sh);

      // Photovoltaic cell deep cyan / blue glow
      const cellGrad = ctx.createLinearGradient(sx, sy, sx + width, sy + sh);
      cellGrad.addColorStop(0, '#0369a1');
      cellGrad.addColorStop(0.5, '#0284c7');
      cellGrad.addColorStop(1, '#075985');
      ctx.fillStyle = cellGrad;
      ctx.fillRect(sx + 4, sy + 4, width - 8, sh - 8);

      // Grid lines inside solar panel
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1;
      // Horizontal cell divisions
      for (let gy = sy + 14; gy < sy + sh - 4; gy += 16) {
        ctx.beginPath();
        ctx.moveTo(sx + 4, gy);
        ctx.lineTo(sx + width - 4, gy);
        ctx.stroke();
      }
      // Vertical cell divisions
      for (let gx = sx + 25; gx < sx + width - 4; gx += 25) {
        ctx.beginPath();
        ctx.moveTo(gx, sy + 4);
        ctx.lineTo(gx, sy + sh - 4);
        ctx.stroke();
      }

      // Panel frame
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(sx, sy, width, sh);
    }

    // Solar array status beacon
    const blink = Math.sin(ticks * 0.1 + (isRight ? 2 : 0)) > 0;
    ctx.fillStyle = blink ? '#38bdf8' : '#0369a1';
    ctx.beginPath();
    ctx.arc(baseX + dir * (width / 2), startY - 8, 4, 0, Math.PI * 2);
    ctx.fill();
  };

  // Draw Port (Left) and Starboard (Right) Solar Wings
  drawSolarWing(650, false);
  drawSolarWing(1750, true);

  // 2. Streamlined Space Shuttle / Starship Main Hull Outer Armor Plating
  ctx.beginPath();
  // Nose Cone (Front Airlock Docking Port)
  ctx.moveTo(1200, 160);
  // Forward Upper Nose Slope
  ctx.bezierCurveTo(1260, 160, 1340, 240, 1370, 320);
  // Starboard Upper Hull
  ctx.bezierCurveTo(1420, 440, 1720, 560, 1750, 720);
  // Starboard Midship Wing Expansion
  ctx.bezierCurveTo(1780, 850, 1760, 1200, 1740, 1420);
  // Starboard Engine Bay Stern
  ctx.bezierCurveTo(1720, 1540, 1560, 1600, 1420, 1610);
  // Stern Thruster Deck
  ctx.lineTo(980, 1610);
  // Port Engine Bay Stern
  ctx.bezierCurveTo(840, 1600, 680, 1540, 660, 1420);
  // Port Midship Wing
  ctx.bezierCurveTo(640, 1200, 620, 850, 650, 720);
  // Port Upper Hull
  ctx.bezierCurveTo(680, 560, 980, 440, 1030, 320);
  // Port Nose Slope
  ctx.bezierCurveTo(1060, 240, 1140, 160, 1200, 160);
  ctx.closePath();

  // Hull Armor Plate Fill
  const hullGrad = ctx.createLinearGradient(600, 160, 1800, 1610);
  hullGrad.addColorStop(0, '#091224');
  hullGrad.addColorStop(0.5, '#0f1d38');
  hullGrad.addColorStop(1, '#0a1428');
  ctx.fillStyle = hullGrad;
  ctx.fill();

  // Hull Edge Titanium Armor Bevel
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Outer Neon Energy Conduit Line
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 3. Thermal Heat Shield Tile Texture Lines (Black underside tiles)
  ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
  ctx.lineWidth = 1;
  for (let y = 260; y < 1560; y += 70) {
    ctx.beginPath();
    ctx.moveTo(760, y);
    ctx.lineTo(1640, y);
    ctx.stroke();
  }

  // 4. Starship Stern Main Rocket Thruster Bells (3 Giant Nozzles)
  const thrusters = [1060, 1200, 1340];
  for (const tx of thrusters) {
    // Engine Cowling
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(tx - 32, 1605, 64, 30);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.strokeRect(tx - 32, 1605, 64, 30);

    // Rocket Nozzle Bell
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(tx - 26, 1635);
    ctx.lineTo(tx + 26, 1635);
    ctx.lineTo(tx + 36, 1675);
    ctx.lineTo(tx - 36, 1675);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Idle Plasma Glow inside nozzle
    const plasmaPuff = Math.sin(ticks * 0.1 + tx) * 4;
    const plasmaGrad = ctx.createRadialGradient(tx, 1650, 4, tx, 1655, 28 + plasmaPuff);
    plasmaGrad.addColorStop(0, '#67e8f9');
    plasmaGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.6)');
    plasmaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = plasmaGrad;
    ctx.fillRect(tx - 38, 1640, 76, 50);
  }

  // Hull Foxconn Mission Marking
  ctx.font = '900 16px monospace';
  ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.textAlign = 'center';
  ctx.fillText('FOXCONN STARSHIP ENTERPRISE // FIXO ORBITAL DECK', 1200, 245);

  ctx.restore();
}

/**
 * C. Pressurized Connecting Corridors & Airlock Tubes
 */
function drawCorridors(ctx: CanvasRenderingContext2D, products: FixoProduct[], ticks: number) {
  ctx.save();

  const centerX = 1200;
  const centerY = 830; // Command Bridge center

  // 1. Broad Pressurized Corridor Base (Titanium Tube Interior)
  ctx.lineWidth = 42;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.95)';

  for (const prod of products) {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    const midY = (centerY + prod.building.y) / 2;
    ctx.lineTo(centerX, midY);
    ctx.lineTo(prod.building.x, midY);
    ctx.lineTo(prod.building.x, prod.building.y);
    ctx.stroke();
  }

  // 2. Corridor Floor Walkway Surface
  ctx.lineWidth = 32;
  ctx.strokeStyle = '#1e293b';
  for (const prod of products) {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    const midY = (centerY + prod.building.y) / 2;
    ctx.lineTo(centerX, midY);
    ctx.lineTo(prod.building.x, midY);
    ctx.lineTo(prod.building.x, prod.building.y);
    ctx.stroke();
  }

  // 3. Corridor Neon Floor Guidance Rails
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  for (const prod of products) {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    const midY = (centerY + prod.building.y) / 2;
    ctx.lineTo(centerX, midY);
    ctx.lineTo(prod.building.x, midY);
    ctx.lineTo(prod.building.x, prod.building.y);
    ctx.stroke();
  }

  // 4. Dynamic Energy / Oxygen Data Pulses traveling along tubes
  const pulseSpeed = (ticks * 2.5) % 100;
  for (let i = 0; i < products.length; i++) {
    const prod = products[i];
    const t = ((pulseSpeed + i * 22) % 100) / 100;
    const midY = (centerY + prod.building.y) / 2;

    let px = centerX;
    let py = centerY;
    if (t < 0.33) {
      py = centerY + (midY - centerY) * (t / 0.33);
    } else if (t < 0.66) {
      py = midY;
      px = centerX + (prod.building.x - centerX) * ((t - 0.33) / 0.33);
    } else {
      px = prod.building.x;
      py = midY + (prod.building.y - midY) * ((t - 0.66) / 0.34);
    }

    ctx.fillStyle = prod.color.primary;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();

    // Pulse Halo
    ctx.fillStyle = `${prod.color.primary}33`;
    ctx.beginPath();
    ctx.arc(px, py, 9, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * E. Central Command Bridge (鴻海高軟旗艦指揮橋)
 */
function drawCommandBridge(ctx: CanvasRenderingContext2D, ticks: number) {
  const cx = 1200;
  const cy = 830;
  const radius = 95;

  ctx.save();
  ctx.translate(cx, cy);

  // Outer Hexagonal Command Bulkhead
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = Math.cos(angle) * (radius + 8);
    const y = Math.sin(angle) * (radius + 8);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Inner Deck Floor
  ctx.fillStyle = '#09132b';
  ctx.beginPath();
  ctx.arc(0, 0, radius - 4, 0, Math.PI * 2);
  ctx.fill();

  // Concentric Navigation Rings
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 70, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 45, 0, Math.PI * 2);
  ctx.stroke();

  // Rotating Holographic Radar Sweep
  ctx.save();
  ctx.rotate(ticks * 0.025);
  const sweepGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 68);
  sweepGrad.addColorStop(0, 'rgba(56, 189, 248, 0.5)');
  sweepGrad.addColorStop(0.8, 'rgba(14, 165, 233, 0.1)');
  sweepGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = sweepGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, 68, 0, Math.PI / 3);
  ctx.closePath();
  ctx.fill();

  // Rotating holographic crosshair
  ctx.strokeStyle = '#67e8f9';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-45, 0);
  ctx.lineTo(45, 0);
  ctx.moveTo(0, -45);
  ctx.lineTo(0, 45);
  ctx.stroke();
  ctx.restore();

  // Central Hologram Sphere
  const corePulse = Math.sin(ticks * 0.08) * 3 + 12;
  const coreGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, corePulse);
  coreGrad.addColorStop(0, '#ffffff');
  coreGrad.addColorStop(0.4, '#38bdf8');
  coreGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 0, corePulse, 0, Math.PI * 2);
  ctx.fill();

  // Bridge Station Header Plate
  ctx.fillStyle = '#020617';
  ctx.fillRect(-85, -radius - 18, 170, 22);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-85, -radius - 18, 170, 22);

  ctx.font = 'bold 11px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.textAlign = 'center';
  ctx.fillText('COMMAND BRIDGE 00', 0, -radius - 4);

  // Deck Label
  ctx.font = '900 12px "Noto Sans TC", sans-serif';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText('鴻海高軟旗艦指揮橋', 0, radius - 16);

  ctx.restore();
}

/**
 * F. Space Capsule Module (太空艙室)
 */
function drawSpaceCapsule(
  ctx: CanvasRenderingContext2D,
  prod: FixoProduct,
  ticks: number,
  isNearby: boolean
) {
  const { x, y, width, height, symbol, name } = prod.building;
  const primaryColor = prod.color.primary;

  ctx.save();
  ctx.translate(x, y);

  // 1. Module Chamber Foundation Plating
  const r = 20; // Chamfer radius
  const hw = width / 2;
  const hh = height / 2;

  // Outer Armor Shell
  ctx.beginPath();
  ctx.moveTo(-hw + r, -hh);
  ctx.lineTo(hw - r, -hh);
  ctx.lineTo(hw, -hh + r);
  ctx.lineTo(hw, hh - r);
  ctx.lineTo(hw - r, hh);
  ctx.lineTo(-hw + r, hh);
  ctx.lineTo(-hw, hh - r);
  ctx.lineTo(-hw, -hh + r);
  ctx.closePath();

  ctx.fillStyle = '#0a1226';
  ctx.fill();

  // Module Border & Glow
  const pulse = isNearby ? Math.sin(ticks * 0.12) * 0.3 + 0.9 : 0.6;
  ctx.lineWidth = isNearby ? 4 * pulse : 2.5;
  ctx.strokeStyle = isNearby ? '#38bdf8' : primaryColor;
  ctx.shadowColor = primaryColor;
  ctx.shadowBlur = isNearby ? 22 * pulse : 10;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 2. Reinforced Space Viewport Observation Windows (Looking out into deep space)
  ctx.fillStyle = '#020617';
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 1;
  // Left Port Viewport
  ctx.fillRect(-hw + 8, -18, 14, 36);
  ctx.strokeRect(-hw + 8, -18, 14, 36);
  // Right Port Viewport
  ctx.fillRect(hw - 22, -18, 14, 36);
  ctx.strokeRect(hw - 22, -18, 14, 36);

  // Viewport starry glass shine
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(-hw + 11, -12, 3, 24);
  ctx.fillRect(hw - 17, -12, 3, 24);

  // 3. Module Interior Deck Plating & Glowing Circuits
  const deckGrad = ctx.createLinearGradient(0, -hh, 0, hh);
  deckGrad.addColorStop(0, `${primaryColor}22`);
  deckGrad.addColorStop(0.5, `${primaryColor}0d`);
  deckGrad.addColorStop(1, `${primaryColor}26`);
  ctx.fillStyle = deckGrad;
  ctx.fillRect(-hw + 26, -hh + 12, width - 52, height - 24);

  // Interior cyber circuit line
  ctx.strokeStyle = `${primaryColor}40`;
  ctx.lineWidth = 1;
  ctx.strokeRect(-hw + 28, -hh + 14, width - 56, height - 28);

  // 4. Capsule Equipment: Blinking Server Rack / Cryo Unit
  const blinkA = (ticks % 30) < 15;
  const blinkB = (ticks % 40) < 20;
  // Left equipment rack
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-hw + 32, -hh + 20, 16, 32);
  ctx.fillStyle = blinkA ? '#22c55e' : '#15803d';
  ctx.fillRect(-hw + 34, -hh + 24, 4, 4);
  ctx.fillStyle = blinkB ? primaryColor : '#334155';
  ctx.fillRect(-hw + 40, -hh + 24, 4, 4);

  // Right equipment rack
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(hw - 48, -hh + 20, 16, 32);
  ctx.fillStyle = blinkB ? '#38bdf8' : '#0369a1';
  ctx.fillRect(hw - 46, -hh + 24, 4, 4);
  ctx.fillStyle = blinkA ? '#eab308' : '#713f12';
  ctx.fillRect(hw - 40, -hh + 24, 4, 4);

  // 5. Central Capsule Symbol & Docking Ring
  const ringRadius = 26;
  ctx.strokeStyle = isNearby ? '#38bdf8' : `${primaryColor}66`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, -4, ringRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Floating Symbol
  const iconFloat = Math.sin(ticks * 0.08 + x) * 2;
  ctx.font = '32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, 0, -4 + iconFloat);

  // 6. Capsule Header Designation Badge
  ctx.fillStyle = '#020617';
  ctx.fillRect(-55, 24, 110, 20);
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-55, 24, 110, 20);

  ctx.font = 'bold 11px monospace';
  ctx.fillStyle = primaryColor;
  ctx.fillText(prod.code, 0, 34);

  // 7. Space Capsule Name Title Plate (Above Chamber)
  ctx.font = 'bold 13px "Noto Sans TC", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(name, 0, -hh - 12);

  // 8. Pressurized Airlock Threshold with Hazard Stripes (At Entrance)
  const stripeWidth = 56;
  const stripeHeight = 6;
  const stripeY = hh - 6;

  ctx.save();
  ctx.beginPath();
  ctx.rect(-stripeWidth / 2, stripeY, stripeWidth, stripeHeight);
  ctx.clip();
  ctx.fillStyle = '#eab308'; // Warning yellow
  ctx.fillRect(-stripeWidth / 2, stripeY, stripeWidth, stripeHeight);

  // Diagonal black hazard stripes
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 4;
  for (let s = -stripeWidth / 2 - 10; s < stripeWidth / 2 + 10; s += 8) {
    ctx.beginPath();
    ctx.moveTo(s, stripeY);
    ctx.lineTo(s + 6, stripeY + stripeHeight);
    ctx.stroke();
  }
  ctx.restore();

  // Airlock status indicator LED (Green: Pressurized)
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(stripeWidth / 2 + 8, stripeY + 3, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * G. Jetpack Thruster Plasma Particles
 */
function drawParticles(ctx: CanvasRenderingContext2D, particles: ThrustParticle[]) {
  ctx.save();
  for (const pt of particles) {
    ctx.fillStyle = pt.color;
    ctx.globalAlpha = Math.max(0, Math.min(1.0, pt.life));
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.size * pt.life, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * H. Zero-G Floating Astronaut (腳完全不著地，微重力漂浮姿態)
 */
function drawFloatingAstronaut(
  ctx: CanvasRenderingContext2D,
  player: { x: number; y: number; dir: string; isMoving: boolean; flightTilt: number },
  ticks: number
) {
  ctx.save();
  ctx.translate(player.x, player.y);

  // 1. Zero-G Floating Bobbing & Micro-Drift (腳完全懸空)
  const zeroGBob = Math.sin(ticks * 0.08) * 4.5;
  const zeroGRot = Math.sin(ticks * 0.04) * 0.04 + player.flightTilt;

  // 2. Soft Floating Shadow on the floor below
  // Offset downwards by +26px so there is a clearly visible gap between feet and floor!
  ctx.save();
  ctx.translate(0, 26);
  ctx.scale(1, 0.45);
  const shadowAlpha = 0.35 - (zeroGBob * 0.015);
  ctx.fillStyle = `rgba(0, 0, 0, ${Math.max(0.15, shadowAlpha)})`;
  ctx.beginPath();
  ctx.arc(0, 0, 16 - zeroGBob * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Apply Zero-G Floating translation & tilt to the astronaut's body
  ctx.translate(0, zeroGBob);
  ctx.rotate(zeroGRot);

  // 3. EVA Jetpack (Manned Maneuvering Unit - MMU) mounted on the back
  const isMoving = player.isMoving;

  // Jetpack main backpack body
  ctx.fillStyle = '#334155';
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-15, -12, 30, 24, 4);
  ctx.fill();
  ctx.stroke();

  // Thruster Nozzles (Port & Starboard)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-14, 10, 7, 8);
  ctx.fillRect(7, 10, 7, 8);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1;
  ctx.strokeRect(-14, 10, 7, 8);
  ctx.strokeRect(7, 10, 7, 8);

  // 4. Active Jetpack Thruster Flames (when moving/flying)
  if (isMoving) {
    const flameFlicker = Math.sin(ticks * 0.6) * 3 + 14;

    // Dual Ion Plasma Thruster Flames
    const drawFlame = (fx: number) => {
      const flameGrad = ctx.createLinearGradient(fx, 18, fx, 18 + flameFlicker);
      flameGrad.addColorStop(0, '#ffffff');
      flameGrad.addColorStop(0.3, '#38bdf8');
      flameGrad.addColorStop(0.7, '#6366f1');
      flameGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
      ctx.fillStyle = flameGrad;

      ctx.beginPath();
      ctx.moveTo(fx - 4, 18);
      ctx.lineTo(fx + 4, 18);
      ctx.lineTo(fx, 18 + flameFlicker);
      ctx.closePath();
      ctx.fill();
    };

    drawFlame(-10.5);
    drawFlame(10.5);
  }

  // 5. Astronaut Space Suit Body (Foxconn EVA White Suit)
  ctx.fillStyle = '#f8fafc'; // White EVA suit
  ctx.beginPath();
  ctx.roundRect(-10, -6, 20, 19, 5);
  ctx.fill();

  // Suit titanium joint seams & Foxconn patch
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Chest Life-Support Control Pack
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-6, -2, 12, 11);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1;
  ctx.strokeRect(-6, -2, 12, 11);

  // Life-support LEDs (O2 Oxygen green, Power cyan)
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(-4, 0, 3, 3);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(1, 0, 3, 3);

  // 6. Zero-G Floating Dangling Legs (腳不著地，微彎放鬆懸浮姿態)
  const legSway = Math.sin(ticks * 0.06) * 0.08;

  // Left Leg (Zero-G floating bent)
  ctx.save();
  ctx.translate(-5, 12);
  ctx.rotate(-0.15 + legSway);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(-3, 0, 6, 9);
  // Left Magnetic Boot (Hovering in air)
  ctx.fillStyle = '#475569';
  ctx.fillRect(-4, 9, 8, 4);
  ctx.restore();

  // Right Leg (Zero-G floating bent)
  ctx.save();
  ctx.translate(5, 12);
  ctx.rotate(0.15 - legSway);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(-3, 0, 6, 9);
  // Right Magnetic Boot (Hovering in air)
  ctx.fillStyle = '#475569';
  ctx.fillRect(-4, 9, 8, 4);
  ctx.restore();

  // 7. Astronaut Helmet
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, -12, 12.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 8. Curved Reflective Visor (Gold / Tinted Blue Mirror)
  ctx.save();
  const visorGrad = ctx.createLinearGradient(-8, -16, 8, -8);
  visorGrad.addColorStop(0, '#f59e0b'); // Gold specular mirror
  visorGrad.addColorStop(0.5, '#0284c7');
  visorGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = visorGrad;

  ctx.beginPath();
  if (player.dir === 'down') {
    ctx.roundRect(-8, -16, 16, 9, 4);
  } else if (player.dir === 'up') {
    // Back of helmet with communication pack
    ctx.fillStyle = '#475569';
    ctx.roundRect(-5, -15, 10, 5, 2);
  } else if (player.dir === 'left') {
    ctx.roundRect(-10, -16, 12, 9, 4);
  } else {
    ctx.roundRect(-2, -16, 12, 9, 4);
  }
  ctx.fill();

  // Visor Sun Glare Reflection
  if (player.dir !== 'up') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.arc(player.dir === 'left' ? -6 : 2, -14, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 9. Helmet Radio Antenna & Tip Beacon
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(player.dir === 'left' ? 4 : -4, -24);
  ctx.lineTo(player.dir === 'left' ? 6 : -6, -30);
  ctx.stroke();

  const beaconBlink = Math.sin(ticks * 0.15) > 0;
  ctx.fillStyle = beaconBlink ? '#38bdf8' : '#0284c7';
  ctx.beginPath();
  ctx.arc(player.dir === 'left' ? 6 : -6, -31, 2, 0, Math.PI * 2);
  ctx.fill();

  // 10. Astronaut HUD Floating Name Plate
  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.textAlign = 'center';
  ctx.fillText('FiXo 零重力探索員', 0, -38);

  ctx.restore();
}

/**
 * Click Destination Marker
 */
function drawClickTarget(ctx: CanvasRenderingContext2D, x: number, y: number, ticks: number) {
  ctx.save();
  const radius = 14 + Math.sin(ticks * 0.15) * 4;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(x, y, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Interaction Prompt
 */
function drawInteractionPrompt(
  ctx: CanvasRenderingContext2D,
  prod: FixoProduct,
  player: { x: number; y: number },
  ticks: number
) {
  ctx.save();
  const px = player.x;
  const py = player.y - 62;
  const floatY = Math.sin(ticks * 0.1) * 3;

  const text = `🚀 進入太空艙 [SPACE / E / 點擊]：${prod.building.name}`;
  ctx.font = 'bold 12px "Noto Sans TC", sans-serif';
  const width = ctx.measureText(text).width + 24;

  ctx.fillStyle = 'rgba(2, 6, 23, 0.95)';
  ctx.strokeStyle = prod.color.primary;
  ctx.lineWidth = 1.8;
  ctx.shadowColor = prod.color.primary;
  ctx.shadowBlur = 12;

  ctx.beginPath();
  ctx.roundRect(px - width / 2, py - 14 + floatY, width, 28, 8);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, px, py + floatY);

  ctx.restore();
}
