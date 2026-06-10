import React, { useEffect, useRef } from 'react';

const FormModal = ({ isOpen, onClose, title, children, onSubmit, submitText = 'Save', isEdit = false }) => {
  const modalRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Prevent scrolling background
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close on click outside
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop fade-in" onClick={handleBackdropClick}>
      <div className="modal-content scale-in" ref={modalRef}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? '✏️' : '➕'} {title}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button 
            type="button" 
            className={`btn ${isEdit ? 'btn-warning' : 'btn-primary'}`} 
            onClick={onSubmit}
          >
            {submitText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormModal;
