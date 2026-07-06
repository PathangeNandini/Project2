export default function Modal({ title, onClose, children, width }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        style={width ? { maxWidth: width } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}
