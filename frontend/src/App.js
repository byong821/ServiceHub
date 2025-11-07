// src/App.js
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from 'react-router-dom';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ServiceDetail from './pages/ServiceDetail';

import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Header />
        <main className="App-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services/:id" element={<ServiceDetailWrapper />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/me" element={<Profile />} />
            {/* fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

function ServiceDetailWrapper() {
  const { id } = useParams();
  return <ServiceDetail id={id} />;
}

export default App;
