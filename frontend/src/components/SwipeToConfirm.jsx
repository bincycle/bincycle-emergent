import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";

/**
 * Swipe-to-confirm slider.
 * Drag the thumb from left to right to fire onConfirm.
 * Supports touch + mouse pointers. Resets if release happens before threshold.
 *
 * Props:
 *  - label          : string  · Resting label (e.g. "Slide to mark arrived")
 *  - confirmLabel   : string  · Optional label shown at completion (default: "Done")
 *  - onConfirm      : () => void
 *  - icon           : lucide icon component (defaults to ArrowRight)
 *  - tone           : "primary" (terracotta) | "success" (green) | "dark"
 *  - threshold      : 0..1, fraction of width considered complete (default 0.9)
 *  - disabled       : boolean
 *  - testId         : string  · root data-testid
 */
export const SwipeToConfirm = ({
    label,
    confirmLabel = "Confirmed",
    onConfirm,
    icon: Icon = ArrowRight,
    tone = "primary",
    threshold = 0.9,
    disabled = false,
    testId,
}) => {
    const trackRef = useRef(null);
    const thumbWidth = 56; // px
    const [maxX, setMaxX] = useState(0);
    const [x, setX] = useState(0);
    const dragging = useRef(false);
    const startX = useRef(0);
    const startVal = useRef(0);
    const [done, setDone] = useState(false);

    // Compute available travel
    const measure = () => {
        const node = trackRef.current;
        if (!node) return;
        setMaxX(Math.max(0, node.clientWidth - thumbWidth - 4));
    };

    useEffect(() => {
        measure();
        const ro = new ResizeObserver(measure);
        if (trackRef.current) ro.observe(trackRef.current);
        return () => ro.disconnect();
    }, []);

    const onPointerDown = (e) => {
        if (disabled || done) return;
        dragging.current = true;
        startX.current =
            e.clientX ?? e.touches?.[0]?.clientX ?? 0;
        startVal.current = x;
        if (e.currentTarget.setPointerCapture) {
            try {
                e.currentTarget.setPointerCapture(e.pointerId);
            } catch {
                /* ignore */
            }
        }
    };
    const onPointerMove = (e) => {
        if (!dragging.current) return;
        const cur = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
        const delta = cur - startX.current;
        const next = Math.min(maxX, Math.max(0, startVal.current + delta));
        setX(next);
    };
    const onPointerEnd = () => {
        if (!dragging.current) return;
        dragging.current = false;
        if (maxX > 0 && x / maxX >= threshold) {
            setX(maxX);
            setDone(true);
            // Defer to allow visual completion before navigation/state churn.
            setTimeout(() => {
                onConfirm?.();
            }, 220);
        } else {
            setX(0);
        }
    };

    const toneCls =
        tone === "success"
            ? {
                  track: "bg-[#284226]",
                  trackText: "text-[#F7F5F0]/85",
                  fill: "bg-[#1C2E1A]",
                  thumb: "bg-[#F7F5F0] text-[#284226]",
              }
            : tone === "dark"
              ? {
                    track: "bg-[#171A15]",
                    trackText: "text-[#F7F5F0]/85",
                    fill: "bg-[#0B0D09]",
                    thumb: "bg-[#F7F5F0] text-[#171A15]",
                }
              : {
                    track: "bg-[#C45B38]",
                    trackText: "text-[#F7F5F0]/90",
                    fill: "bg-[#A64A2B]",
                    thumb: "bg-[#F7F5F0] text-[#C45B38]",
                };

    const progress = maxX > 0 ? x / maxX : 0;

    return (
        <div
            ref={trackRef}
            data-testid={testId}
            data-state={done ? "done" : progress > 0 ? "active" : "idle"}
            className={`relative h-14 w-full select-none overflow-hidden rounded-sm shadow-lg shadow-black/20 ${
                toneCls.track
            } ${disabled ? "opacity-50" : ""}`}
        >
            {/* Fill */}
            <div
                aria-hidden
                className={`absolute inset-y-0 left-0 ${toneCls.fill}`}
                style={{
                    width: `${x + thumbWidth + 2}px`,
                    transition: dragging.current
                        ? "none"
                        : "width 220ms cubic-bezier(.22,1,.36,1)",
                }}
            />

            {/* Centered label */}
            <div
                className={`pointer-events-none absolute inset-0 flex items-center justify-center font-display text-sm font-semibold tracking-tight ${
                    toneCls.trackText
                }`}
                style={{
                    opacity: 1 - Math.min(1, progress * 1.25),
                    transition: dragging.current
                        ? "none"
                        : "opacity 220ms",
                }}
            >
                {label}
            </div>
            <div
                className={`pointer-events-none absolute inset-0 flex items-center justify-center font-display text-sm font-semibold tracking-tight text-[#F7F5F0]`}
                style={{
                    opacity: done ? 1 : 0,
                    transition: "opacity 200ms",
                }}
            >
                {confirmLabel}
            </div>

            {/* Thumb */}
            <button
                type="button"
                disabled={disabled || done}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerEnd}
                onPointerCancel={onPointerEnd}
                onTouchStart={onPointerDown}
                onTouchMove={onPointerMove}
                onTouchEnd={onPointerEnd}
                data-testid={testId ? `${testId}-thumb` : undefined}
                aria-label={label}
                className={`absolute top-1 left-1 h-12 w-14 inline-flex items-center justify-center rounded-sm ${toneCls.thumb} touch-none cursor-grab active:cursor-grabbing disabled:cursor-not-allowed`}
                style={{
                    transform: `translateX(${x}px)`,
                    transition: dragging.current
                        ? "none"
                        : "transform 220ms cubic-bezier(.22,1,.36,1)",
                }}
            >
                {done ? <Check size={20} /> : <Icon size={18} />}
            </button>

            {/* Faint arrow hint */}
            {!done && progress < 0.05 && (
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-0.5 font-mono-label text-[10px] text-[#F7F5F0]/50">
                    <span>swipe</span>
                    <ArrowRight size={11} />
                </div>
            )}
        </div>
    );
};

export default SwipeToConfirm;
