import './MainWindow.css';

import NavBar from './navigation/NavBar';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

const MainWindow: React.FC<Props> = ({ children }) => (
  <div className="main-window-container">
    <NavBar></NavBar>
    <main className="main-window">{children}</main>
  </div>
);

export default MainWindow;
