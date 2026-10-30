import React, { useRef, useState, useEffect, useCallback } from 'react';

interface VirtualJoystickProps {
  onMove: (dx: number, dy: number) => void;
  onStop: () => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove, onStop }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const touchIdRef = useRef<number | null>(null);

  const radius = 45;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    touchIdRef.current = e.pointerId;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX, e.clientY);
  };

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance === 0) {
      setKnobPos({ x: 0, y: 0 });
      onMove(0, 0);
      return;
    }

    const angle = Math.atan2(deltaY, deltaX);
    const clampedDist = Math.min(distance, radius);
    const nx = Math.cos(angle) * clampedDist;
    const ny = Math.sin(angle) * clampedDist;

    setKnobPos({ x: nx, y: ny });
    onMove(nx / radius, ny / radius);
  }, [onMove]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || e.pointerId !== touchIdRef.current) return;
    updatePosition(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== touchIdRef.current) return;
    setIsDragging(false);
    touchIdRef.current = null;
    setKnobPos({ x: 0, y: 0 });
    onStop();
  };

  useEffect(() => {
    const handleGlobalUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setKnobPos({ x: 0, y: 0 });
        onStop();
      }
    };
    window.addEventListener('pointerup', handleGlobalUp);
    return () => window.removeEventListener('pointerup', handleGlobalUp);
  }, [isDragging, onStop]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative w-28 h-28 rounded-full bg-slate-900/60 backdrop-blur-md border-2 border-slate-700/60 flex items-center justify-center touch-none select-none shadow-xl"
    >
      {/* Direction indicators */}
      <div className="absolute top-1 text-[10px] text-slate-500 font-bold">▲</div>
      <div className="absolute bottom-1 text-[10px] text-slate-500 font-bold">▼</div>
      <div className="absolute left-1 text-[10px] text-slate-500 font-bold">◀</div>
      <div className="absolute right-1 text-[10px] text-slate-500 font-bold">▶</div>

      {/* Center Knob */}
      <div
        className="w-12 h-12 rounded-full bg-sky-500/80 border-2 border-sky-300 shadow-lg shadow-sky-500/30 transition-transform duration-75 flex items-center justify-center pointer-events-none"
        style={{
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
        }}
      >
        <div className="w-4 h-4 rounded-full bg-white/60" />
      </div>
    </div>
  );
};
