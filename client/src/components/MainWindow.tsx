import './MainWindow.css';

import NavBar from './navigation/NavBar';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

const MainWindow = ({ children }: Props) => {
  return (
    <div className="main-window-container">
      <NavBar></NavBar>
      <main className="main-window">{children}</main>
    </div>
  );
};

export default MainWindow;
