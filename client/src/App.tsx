import './App.css';

import { Route, Routes } from 'react-router-dom';

import About from './components/about/About';
import { BrowserRouter } from 'react-router-dom';
import ChatBox from './components/chatbox/ChatBox';
import ChatInfo from './components/chatinfo/ChatInfo';
import ChatList from './components/chatlist/ChatList';
import MainWindow from './components/MainWindow';

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
            <Route path="/about" element={<About />} />
          </Routes>
        </MainWindow>
      </div>
    </BrowserRouter>
  );
}

export default App;
