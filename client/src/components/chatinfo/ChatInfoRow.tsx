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
    <div className="chatinfo">
      <p className="chatpara">{label}</p>
      {children}
    </div>
  );
};
