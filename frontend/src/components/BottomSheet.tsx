import React, { useId, type ReactNode } from "react";

type BottomSheetProps = {
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
};

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

export function BottomSheet({ title, closeLabel, onClose, children, actions }: BottomSheetProps) {
  const titleId = useId();
  const sheetRef = React.useRef<HTMLElement | null>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const firstFocusable = sheetRef.current ? getFocusableElements(sheetRef.current)[0] : null;
    window.setTimeout(() => {
      firstFocusable?.focus();
    }, 0);

    return () => {
      previousFocusRef.current?.focus();
    };
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || sheetRef.current === null) {
        return;
      }

      const focusableElements = getFocusableElements(sheetRef.current);
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="bottom-sheet-backdrop" onClick={onClose} role="presentation">
      <section
        ref={sheetRef}
        className="bottom-sheet"
        onClick={(event) => event.stopPropagation()}
        aria-labelledby={titleId}
        role="dialog"
        aria-modal="true"
      >
        <div className="bottom-sheet__handle" aria-hidden="true" />
        <header className="bottom-sheet__header">
          <h2 id={titleId}>{title}</h2>
          <button className="icon-button bottom-sheet__close" onClick={onClose} type="button" aria-label={closeLabel}>
            x
          </button>
        </header>
        <div className="bottom-sheet__body">{children}</div>
        {actions ? <div className="bottom-sheet__actions">{actions}</div> : null}
      </section>
    </div>
  );
}
