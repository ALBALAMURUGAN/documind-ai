import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Workspace from './pages/Workspace';
import Architecture from './pages/Architecture';
import Studio from './pages/Studio';
import Trust from './pages/Trust';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/trust" element={<Trust />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

