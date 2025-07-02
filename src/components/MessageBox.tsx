import React from "react";

interface MessageBoxProps {
  title: string;
  message: string;
  onClose: () => void;
}

const MessageBox: React.FC<MessageBoxProps> = ({ title, message, onClose }) => {
  return (
    <div className="message-box-overlay">
      <div className="message-box-content">
        <h3 className="message-box-title">{title}</h3>
        <p className="message-box-text">{message}</p>
        <button onClick={onClose} className="btn btn-blue">
          OK
        </button>
      </div>
    </div>
  );
};

export default MessageBox;
