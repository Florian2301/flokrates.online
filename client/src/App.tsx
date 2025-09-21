import './App.css';

import { Route, Routes } from 'react-router-dom';

import { BrowserRouter } from 'react-router-dom';
import ChatBox from './components/chatbox/ChatBox';
import ChatInfo from './components/chatinfo/ChatInfo';
import ChatList from './components/chatlist/ChatList';
import { ChatProvider } from './context/ChatContext';
import MainWindow from './components/MainWindow';
import React from 'react';

//import ChatInfo from './components/chatinfo/ChatInfo';

function App() {
  return (
    <BrowserRouter>
      <ChatProvider>
        <div className="App">
          <MainWindow>
            <Routes>
              <Route path="/" element={<ChatList />} />
              <Route path="/chatlist" element={<ChatList />} />
              <Route path="/chatbox" element={<ChatBox />} />
              <Route path="/chatinfo" element={<ChatInfo />} />
              <Route path="/dropdown" element={<ChatList />} />{' '}
            </Routes>
          </MainWindow>
        </div>
      </ChatProvider>
    </BrowserRouter>
  );
}

export default App;
