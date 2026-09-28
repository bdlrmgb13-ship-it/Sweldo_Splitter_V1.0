import React, { useState, useEffect, useRef } from 'react';
import { Plus, Move } from 'lucide-react';
import { FabCoordinates } from '../types';

interface MovableFabProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onTap: () => void;
  storageKey?: string;
  navBarHeight?: number;
}

const FAB_SIZE = 58;
const PADDING = 16;
const LONG_PRESS_MS = 350;
const DRAG_MOVE_THRESHOLD = 6;

export const MovableFab: React.FC<MovableFabProps> = ({
  containerRef,
  onTap,
  storageKey = 'sweldo_fab_position',
  navBarHeight = 80,
}) => {
  const [coords, setCoords] = useState<FabCoordinates | null>(null);
  const [isPressing, setIsPressing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const longPressTimerRef = useRef<number | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number; originX: number; originY: number } | null>(null);
  const hasMovedRef = useRef(false);

  // Initialize or load position from local storage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          setCoords(parsed);
          return;
        }
      } catch {
        // Fall back to default
      }
    }

    // Default position: bottom-right
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const defaultX = rect.width - FAB_SIZE - PADDING;
      const defaultY = rect.height - FAB_SIZE - navBarHeight - PADDING;
      setCoords({ x: Math.max(PADDING, defaultX), y: Math.max(PADDING, defaultY) });
    }
  }, [containerRef, navBarHeight, storageKey]);

  // Handle boundary clamp
  const clampCoordinates = (newX: number, newY: number): FabCoordinates => {
    if (!containerRef.current) return { x: newX, y: newY };
    const rect = containerRef.current.getBoundingClientRect();

    const minX = PADDING;
    const maxX = Math.max(PADDING, rect.width - FAB_SIZE - PADDING);
    const minY = 64; // below top app bar
    const maxY = Math.max(minY, rect.height - FAB_SIZE - navBarHeight - 12);

    return {
      x: Math.min(Math.max(newX, minX), maxX),
      y: Math.min(Math.max(newY, minY), maxY),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    // Only respond to primary click/touch
    if (e.button !== 0) return;

    const currentCoords = coords || { x: 0, y: 0 };
    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      originX: currentCoords.x,
      originY: currentCoords.y,
    };
    hasMovedRef.current = false;
    setIsPressing(true);

    // Start long-press timer to unlock dragging (simulating detectDragGesturesAfterLongPress)
    longPressTimerRef.current = window.setTimeout(() => {
      setIsDragging(true);
      setShowTooltip(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(50);
        } catch {
          // ignore
        }
      }
    }, LONG_PRESS_MS);

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!pointerStartRef.current) return;

    const deltaX = e.clientX - pointerStartRef.current.x;
    const deltaY = e.clientY - pointerStartRef.current.y;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance > DRAG_MOVE_THRESHOLD) {
      hasMovedRef.current = true;
    }

    if (isDragging) {
      const nextX = pointerStartRef.current.originX + deltaX;
      const nextY = pointerStartRef.current.originY + deltaY;
      const clamped = clampCoordinates(nextX, nextY);
      setCoords(clamped);
    } else if (hasMovedRef.current && !isDragging) {
      // If user moved significantly before long-press timer fired, cancel timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if ((e.target as HTMLElement).hasPointerCapture(e.pointerId)) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }

    const wasDragging = isDragging;
    setIsPressing(false);
    setIsDragging(false);
    setShowTooltip(false);

    // If dragged, save position
    if (wasDragging && coords) {
      localStorage.setItem(storageKey, JSON.stringify(coords));
    } else if (!hasMovedRef.current) {
      // Short tap: trigger action
      onTap();
    }

    pointerStartRef.current = null;
    hasMovedRef.current = false;
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if ((e.target as HTMLElement).hasPointerCapture(e.pointerId)) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
    setIsPressing(false);
    setIsDragging(false);
    setShowTooltip(false);
    pointerStartRef.current = null;
    hasMovedRef.current = false;
  };

  if (!coords) return null;

  return (
    <div
      className="absolute z-40 touch-none pointer-events-auto select-none transition-transform duration-75"
      style={{
        left: `${coords.x}px`,
        top: `${coords.y}px`,
        width: `${FAB_SIZE}px`,
        height: `${FAB_SIZE}px`,
      }}
    >
      {/* Visual drag status indicator pill */}
      {showTooltip && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-in fade-in zoom-in-90">
          <Move className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>Moving FAB</span>
        </div>
      )}

      {/* Floating Action Button (M3 Styled) */}
      <button
        type="button"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        aria-label="Add transaction or hold to drag"
        title="Tap to add daily expense · Long-press to drag"
        className={`w-full h-full rounded-2xl flex items-center justify-center transition-all cursor-grab active:cursor-grabbing ${
          isDragging
            ? 'scale-115 bg-emerald-600 text-white shadow-2xl ring-4 ring-emerald-400/50'
            : isPressing
            ? 'scale-105 bg-emerald-600 text-white shadow-xl'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl active:scale-95'
        }`}
      >
        {isDragging ? (
          <Move className="w-6 h-6 animate-pulse" />
        ) : (
          <Plus className="w-7 h-7 stroke-[2.5]" />
        )}
      </button>
    </div>
  );
};
