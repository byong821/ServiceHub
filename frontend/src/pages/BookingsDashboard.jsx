import { useState } from 'react';
import PropTypes from 'prop-types';
import BookingsList from './BookingsList';
import './BookingsDashboard.css';

export default function BookingsDashboard({ onSelectBooking }) {
  const [activeTab, setActiveTab] = useState('all');
  const [role, setRole] = useState('customer');

  const tabs = [
    { id: 'all', label: 'All', status: null },
    { id: 'pending', label: 'Pending', status: 'pending' },
    { id: 'confirmed', label: 'Confirmed', status: 'confirmed' },
    { id: 'completed', label: 'Completed', status: 'completed' },
    { id: 'cancelled', label: 'Cancelled', status: 'cancelled' },
  ];

  return (
    <div className="bookingsDashboard">
      <header className="bookingsDashboard__header">
        <h2>My Bookings</h2>
        <div className="roleToggle">
          <button
            className={role === 'customer' ? 'active' : ''}
            onClick={() => setRole('customer')}
          >
            As Customer
          </button>
          <button
            className={role === 'provider' ? 'active' : ''}
            onClick={() => setRole('provider')}
          >
            As Provider
          </button>
        </div>
      </header>

      <nav className="bookingsDashboard__tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="bookingsDashboard__content" role="tabpanel">
        <BookingsList
          role={role}
          status={tabs.find((t) => t.id === activeTab)?.status}
          onSelect={onSelectBooking}
        />
      </div>
    </div>
  );
}

BookingsDashboard.propTypes = {
  onSelectBooking: PropTypes.func,
};
