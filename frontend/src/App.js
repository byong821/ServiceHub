// src/App.js
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ServiceDetail from './pages/ServiceDetail';
import CreateListing from './pages/CreateListing';
import BrowseServices from './pages/BrowseServices';
import ProviderProfile from './pages/ProviderProfile';
import './App.css';

export default function App() {
  return (
    <>
      <Header />
      <main className="App-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<BrowseServices />} />
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/providers/:providerId" element={<ProviderProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/me" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
