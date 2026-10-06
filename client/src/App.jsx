import Header from './components/Header';
import Home from './pages/Home';
import Trip from './pages/Trip';
import CreateTrip from './pages/CreateTrip';
import Profile from './pages/Profile';
import Chats from './pages/Chats';
import Admin from './pages/Admin';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';
import { Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <AuthProvider>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trip/:id" element={<Trip />} />
        <Route path="/create" element={<CreateTrip />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chats" element={<Chats />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </AuthProvider>
  );
}
