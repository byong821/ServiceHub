// src/App.js
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ServiceDetail from './pages/ServiceDetail';
import BookingsDashboard from './pages/BookingsDashboard';
import BookingDetail from './pages/BookingDetail';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="App-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services/:id" element={<ServiceDetailWrapper />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/me" element={<Profile />} />
          <Route path="/bookings" element={<BookingsDashboard />} />
          <Route path="/bookings/:id" element={<BookingDetailWrapper />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

function ServiceDetailWrapper() {
  const { id } = useParams();
  return <ServiceDetail id={id} />;
}

function BookingDetailWrapper() {
  const { id } = useParams();
  return <BookingDetail id={id} />;
}

export default App;
