import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import App from './App';
import Lenis from 'lenis';
import 'leaflet/dist/leaflet.css';
import './index.css';

const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
window.lenis = lenis; // Expose globally for ScrollToTop
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <MotionConfig reducedMotion="user" transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
      <App />
    </MotionConfig>
  </BrowserRouter>
);
