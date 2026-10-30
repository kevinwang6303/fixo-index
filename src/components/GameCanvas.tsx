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
const PLAYER_SPEED = 4.2;
const INTERACTION_DIST = 110;

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

  // Player state
  const playerRef = useRef({
    x: playerPos.x,
    y: playerPos.y,
    dir: 'down' as 'down' | 'up' | 'left' | 'right',
    frame: 0,
    isMoving: false,
    stepTimer: 0
  });

  // Camera state
  const cameraRef = useRef({
    x: playerPos.x,
    y: playerPos.y
  });

  // Keep playerRef updated when teleporting
  useEffect(() => {
    if (teleportTarget) {
      playerRef.current.x = teleportTarget.x;
      playerRef.current.y = teleportTarget.y;
      clickTargetRef.current = null;
      setPlayerPos({ x: teleportTarget.x, y: teleportTarget.y });
      sound.playTeleport();
      clearTeleport();
    }
  }, [teleportTarget, clearTeleport, setPlayerPos]);

  // Key listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys if modal is open
      if (activeProduct) return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', ' '].includes(e.key.toLowerCase())) {
        keysRef.current[e.key.toLowerCase()] = true;
      }

      if ((e.key === ' ' || e.key.toLowerCase() === 'e') && nearbyProduct) {
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

  // Canvas click to move / interact
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeProduct) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    // Convert screen coordinates to world coordinates
    const worldX = screenX + cameraRef.current.x - canvas.width / 2;
    const worldY = screenY + cameraRef.current.y - canvas.height / 2;

    // Check if clicked directly on a building
    for (const prod of products) {
      const bx = prod.building.x;
      const by = prod.building.y;
      const dist = Math.hypot(worldX - bx, worldY - by);
      if (dist < 80) {
        sound.playInteract();
        onOpenProduct(prod);
        return;
      }
    }

    // Otherwise set click target to walk there
    clickTargetRef.current = {
      x: Math.max(80, Math.min(WORLD_WIDTH - 80, worldX)),
      y: Math.max(80, Math.min(WORLD_HEIGHT - 80, worldY))
    };
  }, [activeProduct, products, onOpenProduct]);

  // Main Render & Physics Loop
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

      // 1. Calculate Player Movement
      let moveX = 0;
      let moveY = 0;

      if (!activeProduct) {
        if (keys['w'] || keys['arrowup']) moveY -= 1;
        if (keys['s'] || keys['arrowdown']) moveY += 1;
        if (keys['a'] || keys['arrowleft']) moveX -= 1;
        if (keys['d'] || keys['arrowright']) moveX += 1;

        // Joystick input override
        if (joystickVector.x !== 0 || joystickVector.y !== 0) {
          moveX = joystickVector.x;
          moveY = joystickVector.y;
          clickTargetRef.current = null;
        }

        // Click-to-move handling
        if (clickTargetRef.current && moveX === 0 && moveY === 0) {
          const dx = clickTargetRef.current.x - p.x;
          const dy = clickTargetRef.current.y - p.y;
          const dist = Math.hypot(dx, dy);

          if (dist > 5) {
            moveX = dx / dist;
            moveY = dy / dist;
          } else {
            clickTargetRef.current = null;
          }
        }
      }

      const isMoving = moveX !== 0 || moveY !== 0;
      p.isMoving = isMoving;

      if (isMoving) {
        // Normalize diagonal speed
        const length = Math.hypot(moveX, moveY);
        if (length > 0) {
          const normX = (moveX / length) * PLAYER_SPEED;
          const normY = (moveY / length) * PLAYER_SPEED;

          p.x = Math.max(100, Math.min(WORLD_WIDTH - 100, p.x + normX));
          p.y = Math.max(100, Math.min(WORLD_HEIGHT - 100, p.y + normY));
        }

        // Direction & animation frame
        if (Math.abs(moveX) > Math.abs(moveY)) {
          p.dir = moveX > 0 ? 'right' : 'left';
        } else {
          p.dir = moveY > 0 ? 'down' : 'up';
        }

        p.frame = (p.frame + 0.15) % 4;

        // Footstep sound throttled
        p.stepTimer++;
        if (p.stepTimer % 24 === 0) {
          sound.playStep();
        }

        // Sync to React state every few frames
        if (ticks % 6 === 0) {
          setPlayerPos({ x: p.x, y: p.y });
        }
      }

      // 2. Camera Smooth Follow
      cameraRef.current.x += (p.x - cameraRef.current.x) * 0.08;
      cameraRef.current.y += (p.y - cameraRef.current.y) * 0.08;

      // 3. Check Nearby Products
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
      // Translate camera
      const offsetX = canvas.width / 2 - cameraRef.current.x;
      const offsetY = canvas.height / 2 - cameraRef.current.y;
      ctx.translate(offsetX, offsetY);

      // --- A. Draw Digital Ocean & Cyber Grid ---
      drawBackground(ctx, ticks);

      // --- B. Draw Roads & Data Pipelines ---
      drawDataRoads(ctx, products, ticks);

      // --- C. Draw Destination Click Marker ---
      if (clickTargetRef.current) {
        drawClickTarget(ctx, clickTargetRef.current.x, clickTargetRef.current.y, ticks);
      }

      // --- D. Draw Buildings ---
      for (const prod of products) {
        drawBuilding(ctx, prod, ticks, foundNearby?.id === prod.id);
      }

      // --- E. Draw Character ---
      drawPlayer(ctx, p, ticks);

      // --- F. Draw Interaction Popup if near ---
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

// ==================== CANVAS DRAWING HELPERS ====================

function drawBackground(ctx: CanvasRenderingContext2D, ticks: number) {
  // Deep space ocean
  const oceanGrad = ctx.createLinearGradient(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  oceanGrad.addColorStop(0, '#020617');
  oceanGrad.addColorStop(0.5, '#070f26');
  oceanGrad.addColorStop(1, '#03081a');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(-400, -400, WORLD_WIDTH + 800, WORLD_HEIGHT + 800);

  // Floating Cyber Island Boundary
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, WORLD_WIDTH / 2 - 120, WORLD_HEIGHT / 2 - 80, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#0b132b';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#1e3a8a';
  ctx.stroke();

  // Island Grid lines
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
  ctx.lineWidth = 1;
  const gridSize = 60;
  for (let x = 100; x < WORLD_WIDTH - 100; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 100);
    ctx.lineTo(x, WORLD_HEIGHT - 100);
    ctx.stroke();
  }
  for (let y = 100; y < WORLD_HEIGHT - 100; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(100, y);
    ctx.lineTo(WORLD_WIDTH - 100, y);
    ctx.stroke();
  }

  // Island glowing edge contour
  const pulse = Math.sin(ticks * 0.04) * 0.2 + 0.8;
  ctx.strokeStyle = `rgba(56, 189, 248, ${0.3 * pulse})`;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Floating ambient energy particles
  for (let i = 0; i < 20; i++) {
    const px = ((i * 137 + ticks * 0.5) % (WORLD_WIDTH - 200)) + 100;
    const py = ((i * 97 + Math.sin(ticks * 0.02 + i) * 80) % (WORLD_HEIGHT - 200)) + 100;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.4)' : 'rgba(168, 85, 247, 0.4)';
    ctx.beginPath();
    ctx.arc(px, py, (i % 3) + 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDataRoads(ctx: CanvasRenderingContext2D, products: FixoProduct[], ticks: number) {
  ctx.save();
  ctx.lineWidth = 28;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.85)'; // Road base

  // Center Plaza coordinates
  const centerX = 1200;
  const centerY = 960;

  // Draw main avenues connecting all buildings to central artery
  for (const prod of products) {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    // Draw stepped cyber road
    const midY = (centerY + prod.building.y) / 2;
    ctx.lineTo(centerX, midY);
    ctx.lineTo(prod.building.x, midY);
    ctx.lineTo(prod.building.x, prod.building.y);
    ctx.stroke();
  }

  // Road glowing neon borders
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  for (const prod of products) {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    const midY = (centerY + prod.building.y) / 2;
    ctx.lineTo(centerX, midY);
    ctx.lineTo(prod.building.x, midY);
    ctx.lineTo(prod.building.x, prod.building.y);
    ctx.stroke();
  }

  // Animated data pulses traveling through roads
  const pulseOffset = (ticks * 2) % 100;
  ctx.fillStyle = '#38bdf8';
  for (let i = 0; i < products.length; i++) {
    const prod = products[i];
    const t = ((pulseOffset + i * 25) % 100) / 100;
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

    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Central Grand Cyber Plaza
  ctx.fillStyle = 'rgba(14, 165, 233, 0.12)';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#0ea5e9';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
  ctx.stroke();

  // Central FiXo holographic rotating core
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(ticks * 0.02);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
  ctx.strokeRect(-25, -25, 50, 50);
  ctx.rotate(Math.PI / 4);
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
  ctx.strokeRect(-20, -20, 40, 40);
  ctx.restore();

  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.textAlign = 'center';
  ctx.fillText('FiXo CENTRAL PLAZA', centerX, centerY + 5);

  ctx.restore();
}

function drawBuilding(
  ctx: CanvasRenderingContext2D,
  prod: FixoProduct,
  ticks: number,
  isNearby: boolean
) {
  const { x, y, width, height, symbol, name } = prod.building;

  ctx.save();
  ctx.translate(x, y);

  // Plaza foundation under building
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.beginPath();
  ctx.roundRect(-width / 2, -height / 2, width, height, 16);
  ctx.fill();

  // Border & Glow
  const pulse = isNearby ? Math.sin(ticks * 0.1) * 0.3 + 0.9 : 0.6;
  ctx.lineWidth = isNearby ? 3.5 * pulse : 2;
  ctx.strokeStyle = isNearby ? '#38bdf8' : prod.color.primary;
  ctx.shadowColor = prod.color.primary;
  ctx.shadowBlur = isNearby ? 20 * pulse : 8;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Holographic rooftop grid
  ctx.fillStyle = `${prod.color.primary}18`;
  ctx.fillRect(-width / 2 + 6, -height / 2 + 6, width - 12, height - 12);

  // Building Symbol Icon
  ctx.font = '36px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, 0, -10);

  // Chapter & Code Tag
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-45, 20, 90, 20);
  ctx.strokeStyle = prod.color.primary;
  ctx.lineWidth = 1;
  ctx.strokeRect(-45, 20, 90, 20);

  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = prod.color.primary;
  ctx.fillText(`${prod.code}`, 0, 31);

  // Floating Title Label above building
  ctx.font = 'bold 13px "Noto Sans TC", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(name, 0, -height / 2 - 12);

  // Antenna blinking light on roof
  const lightBlink = Math.sin(ticks * 0.15) > 0;
  ctx.fillStyle = lightBlink ? '#22c55e' : '#15803d';
  ctx.beginPath();
  ctx.arc(width / 2 - 12, -height / 2 + 12, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: { x: number; y: number; dir: string; frame: number; isMoving: boolean },
  ticks: number
) {
  ctx.save();
  ctx.translate(player.x, player.y);

  // Shadow under player
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 16, 14, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Character body animation offset
  const bob = player.isMoving ? Math.sin(player.frame * Math.PI) * 2 : Math.sin(ticks * 0.08) * 1.5;

  // Space Suit Body (Cyan / White cyber explorer)
  ctx.fillStyle = '#38bdf8'; // Cyan suit
  ctx.beginPath();
  ctx.roundRect(-10, -4 + bob, 20, 18, 5);
  ctx.fill();

  // Backpack / Jetpack
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(-12, -2 + bob, 4, 12);
  ctx.fillRect(8, -2 + bob, 4, 12);

  // Helmet Head
  ctx.fillStyle = '#f8fafc'; // White helmet
  ctx.beginPath();
  ctx.arc(0, -10 + bob, 12, 0, Math.PI * 2);
  ctx.fill();

  // Visor (Tinted Gold / Dark Glass)
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  if (player.dir === 'down') {
    ctx.roundRect(-7, -13 + bob, 14, 8, 3);
  } else if (player.dir === 'up') {
    // Back of helmet - small antenna
    ctx.roundRect(-4, -13 + bob, 8, 4, 2);
  } else if (player.dir === 'left') {
    ctx.roundRect(-9, -13 + bob, 10, 8, 3);
  } else {
    ctx.roundRect(-1, -13 + bob, 10, 8, 3);
  }
  ctx.fill();

  // Visor Reflection shine
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(-2, -11 + bob, 2, 0, Math.PI * 2);
  ctx.fill();

  // Helmet Antenna
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -22 + bob);
  ctx.lineTo(0, -28 + bob);
  ctx.stroke();

  // Antenna tip blinking light
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(0, -29 + bob, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Name Tag above player
  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = '#e2e8f0';
  ctx.textAlign = 'center';
  ctx.fillText('FiXo 探索員', 0, -36 + bob);

  ctx.restore();
}

function drawClickTarget(ctx: CanvasRenderingContext2D, x: number, y: number, ticks: number) {
  ctx.save();
  const radius = 12 + Math.sin(ticks * 0.15) * 4;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawInteractionPrompt(
  ctx: CanvasRenderingContext2D,
  prod: FixoProduct,
  player: { x: number; y: number },
  ticks: number
) {
  ctx.save();
  const px = player.x;
  const py = player.y - 58;

  const floatY = Math.sin(ticks * 0.1) * 3;

  // Background speech bubble
  const text = `按 [SPACE / E] 或點擊 檢視 ${prod.code}`;
  ctx.font = 'bold 11px sans-serif';
  const width = ctx.measureText(text).width + 24;

  ctx.fillStyle = 'rgba(3, 7, 18, 0.92)';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 10;

  ctx.beginPath();
  ctx.roundRect(px - width / 2, py - 14 + floatY, width, 26, 8);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(text, px, py + floatY);

  ctx.restore();
}
