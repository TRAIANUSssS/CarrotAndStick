import { useId, type ReactNode } from "react";

type ModalProps = {
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ title, closeLabel, onClose, children }: ModalProps) {
  const titleId = useId();

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <section
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        aria-labelledby={titleId}
        role="dialog"
        aria-modal="true"
      >
        <header className="modal-card__header">
          <h2 id={titleId}>{title}</h2>
          <button className="icon-button" onClick={onClose} type="button" aria-label={closeLabel}>
            x
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
