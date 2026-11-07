"use client";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onDismiss: () => void;
}

export default function Toast({ message, type, onDismiss }: ToastProps) {
  return (
    <div
      className="toast-container position-fixed bottom-0 end-0 p-3"
      style={{ zIndex: 9999 }}
    >
      <div
        className={`toast show align-items-center text-white border-0 ${
          type === "success" ? "bg-success" : "bg-danger"
        }`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="d-flex">
          <div className="toast-body d-flex align-items-center gap-2">
            <i
              className={`bi ${
                type === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"
              }`}
            />
            {message}
          </div>
          <button
            type="button"
            className="btn-close btn-close-white me-2 m-auto"
            onClick={onDismiss}
            aria-label="Close"
          />
        </div>
      </div>
    </div>
  );
}
