import './MainWindow.css';

import NavBar from './navigation/NavBar';
import React from 'react';

const MainWindow: React.FC = () => {
  return (
    <div className="main-container">
      <NavBar></NavBar>
    </div>
  );
};

export default MainWindow;
