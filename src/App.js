import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import UploadResume from './components/UploadResume';
import ResumeScore from './components/ResumeScore';
import './styles/App.css';  // Updated import path

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<UploadResume />} />
        <Route path="/score" element={<ResumeScore />} />
      </Routes>
    </div>
  );
}

export default App;