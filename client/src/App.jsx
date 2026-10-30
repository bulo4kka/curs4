import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Trip from './pages/Trip';
import CreateTrip from './pages/CreateTrip';
import Profile from './pages/Profile';
import Chats from './pages/Chats';
import Admin from './pages/Admin';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/ToastContainer';
import Footer from './components/Footer';
import { Routes, Route } from 'react-router-dom';

// Scroll to top on route change (works with Lenis)
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Header />
        <ScrollToTop />
        <ToastContainer />
        <div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/trip/:id" element={<Trip />} />
            <Route path="/create" element={<CreateTrip />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/chats" element={<Chats />} />
            <Route path="/chat/:chatId" element={<Chats />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
        <Footer />
      </ToastProvider>
    </AuthProvider>
  );
}
