import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import Lenis from 'lenis';
import 'leaflet/dist/leaflet.css';
import './index.css';

const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter><App /></BrowserRouter>
);
