import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  closeLabel?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onClose,
  title,
  children,
  closeLabel = 'Close',
}) => {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [dragY, setDragY] = useState(0);
  const dragStartY = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    const timer = setTimeout(() => {
      sheetRef.current?.focus();
    }, 10);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/45 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={sheetRef}
        tabIndex={-1}
        style={dragY > 0 ? { transform: `translateY(${dragY}px)` } : undefined}
        className="w-full md:max-w-lg rounded-t-[24px] md:rounded-[24px] bg-[#FFFFFF] dark:bg-[#1D1F20] text-[#19191B] dark:text-[#F3F1EC] border-t md:border border-[#DADADD] dark:border-[#363839] shadow-2xl max-h-[88dvh] flex flex-col outline-none transition-transform duration-200 ease-out"
      >
        {/* Drag handle on mobile */}
        <div
          className="md:hidden pt-3 pb-1 flex justify-center cursor-grab touch-none"
          onPointerDown={(e) => {
            dragStartY.current = e.clientY;
          }}
          onPointerMove={(e) => {
            if (dragStartY.current !== null) {
              const delta = e.clientY - dragStartY.current;
              if (delta > 0) setDragY(delta);
            }
          }}
          onPointerUp={() => {
            if (dragY > 90) onClose();
            setDragY(0);
            dragStartY.current = null;
          }}
          onPointerCancel={() => {
            setDragY(0);
            dragStartY.current = null;
          }}
        >
          <span className="w-10 h-1 rounded-full bg-[#DADADD] dark:bg-[#363839]" />
        </div>

        <div className="px-5 py-3.5 flex items-center justify-between border-b border-[#DADADD]/70 dark:border-[#363839]/80 shrink-0">
          <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-[#59595F] dark:text-[#B3B4B1] hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 overflow-y-auto pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  );
};
