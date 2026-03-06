import { useRef, useEffect } from 'react';

/**
 * Attaches HTML5 drag source behaviour to a DOM node via ref.
 * Works in React Native Web because ref.current IS the underlying DOM element.
 *
 * @param activityId - stored in dataTransfer so drop targets can read it
 * @param onDragStart - called when drag begins
 * @param onDragEnd   - called when drag ends (drop or cancel)
 */
export function useDragSource(
  activityId: string,
  onDragStart: () => void,
  onDragEnd: () => void,
) {
  const ref = useRef<any>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof el.addEventListener !== 'function') return;

    el.draggable = true;
    el.style.cursor = 'grab';

    const handleDragStart = (e: DragEvent) => {
      e.dataTransfer!.setData('text/plain', activityId);
      e.dataTransfer!.effectAllowed = 'move';
      onDragStart();
      // Defer opacity so the ghost image captures the full card
      requestAnimationFrame(() => {
        if (el) el.style.opacity = '0.35';
      });
    };

    const handleDragEnd = () => {
      if (el) el.style.opacity = '1';
      onDragEnd();
    };

    el.addEventListener('dragstart', handleDragStart);
    el.addEventListener('dragend', handleDragEnd);

    return () => {
      el.removeEventListener('dragstart', handleDragStart);
      el.removeEventListener('dragend', handleDragEnd);
    };
  }, [activityId]);

  return ref;
}

/**
 * Attaches HTML5 drop target behaviour to a DOM node via ref.
 *
 * Uses an enter-counter to work around the browser quirk where dragLeave
 * fires when the pointer crosses a child element boundary.
 */
export function useDropTarget(
  onDrop: (activityId: string) => void,
  onEnter: () => void,
  onLeave: () => void,
) {
  const ref = useRef<any>(null);
  const enterCount = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof el.addEventListener !== 'function') return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'move';
    };

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      enterCount.current += 1;
      if (enterCount.current === 1) onEnter();
    };

    const handleDragLeave = () => {
      enterCount.current -= 1;
      if (enterCount.current === 0) onLeave();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      enterCount.current = 0;
      const id = e.dataTransfer!.getData('text/plain');
      if (id) onDrop(id);
      onLeave();
    };

    el.addEventListener('dragover', handleDragOver);
    el.addEventListener('dragenter', handleDragEnter);
    el.addEventListener('dragleave', handleDragLeave);
    el.addEventListener('drop', handleDrop);

    return () => {
      el.removeEventListener('dragover', handleDragOver);
      el.removeEventListener('dragenter', handleDragEnter);
      el.removeEventListener('dragleave', handleDragLeave);
      el.removeEventListener('drop', handleDrop);
    };
  }, []);

  return ref;
}
