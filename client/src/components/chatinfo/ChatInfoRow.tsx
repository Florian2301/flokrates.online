import './ChatInfo.css';

import React from 'react';

type ChatInfoRowProps = {
  label: string;
  children: React.ReactNode;
};

export const ChatInfoRow: React.FC<ChatInfoRowProps> = ({
  label,
  children,
}) => {
  return (
    <div className="chatinfo-row">
      <p className="chatpara">{label}</p>
      <div className="chatinfo-content">{children}</div>
    </div>
  );
};
