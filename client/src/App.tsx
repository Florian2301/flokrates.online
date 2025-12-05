import './App.css';

import { Route, Routes } from 'react-router-dom';

import AboutPage from './components/about/AboutPage';
import { BrowserRouter } from 'react-router-dom';
import ChatBox from './components/chatbox/ChatBox';
import ChatInfo from './components/chatinfo/ChatInfo';
import ChatList from './components/chatlist/ChatList';
import LoginPage from './components/auth/LoginPage';
import MainWindow from './components/MainWindow';
import Settings from './components/settings/Settings';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <MainWindow>
          <Routes>
            <Route path="/" element={<ChatList />} />
            <Route path="/chatlist" element={<ChatList />} />
            <Route path="/chatbox" element={<ChatBox />} />
            <Route path="/chatinfo" element={<ChatInfo />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MainWindow>
      </div>
    </BrowserRouter>
  );
}

export default App;
