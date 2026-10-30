import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { Footer } from './components/Footer.jsx';
import { BookingModal } from './components/BookingModal.jsx';

// Pages
import { HomePage } from './pages/HomePage.jsx';
import { DoctorsPage } from './pages/DoctorsPage.jsx';
import { DoctorDetailsPage } from './pages/DoctorDetailsPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { PatientDashboard } from './pages/PatientDashboard.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { AdminLoginPage } from './pages/AdminLoginPage.jsx';

function MainLayout() {
  const { isAdmin } = useAuth();

  // Detect /admin in URL path or hash
  const getInitialView = () => {
    const path = window.location.pathname.toLowerCase();
    if (path === '/admin' || window.location.hash === '#admin') {
      return 'admin';
    }
    return 'home';
  };

  const [currentView, setCurrentView] = useState(getInitialView);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [bookingInitialDate, setBookingInitialDate] = useState('');
  const [bookingInitialSlot, setBookingInitialSlot] = useState('');
  const [doctorFilters, setDoctorFilters] = useState({});

  // Synchronize browser URL bar and back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/admin' || window.location.hash === '#admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (view, params = {}) => {
    setCurrentView(view);
    if (view === 'doctors') {
      setDoctorFilters(params);
    }

    // Keep URL clean: update path for /admin vs regular views
    if (view === 'admin' || view === 'admin-dashboard') {
      window.history.pushState(null, '', '/admin');
    } else {
      window.history.pushState(null, '', '/');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookDoctor = (doctor, initialDate = '', initialSlot = '') => {
    setBookingDoctor(doctor);
    setBookingInitialDate(initialDate);
    setBookingInitialSlot(initialSlot);
  };

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setCurrentView('doctor-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      {/* Top Navigation */}
      <Navbar currentView={currentView} setCurrentView={handleNavigate} />

      {/* Main Page Content */}
      <main style={{ flex: 1 }}>
        {currentView === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onBookDoctor={handleBookDoctor}
            onSelectDoctor={handleSelectDoctor}
          />
        )}

        {currentView === 'doctors' && (
          <DoctorsPage
            initialFilters={doctorFilters}
            onBookDoctor={handleBookDoctor}
            onSelectDoctor={handleSelectDoctor}
          />
        )}

        {currentView === 'doctor-details' && (
          <DoctorDetailsPage
            doctor={selectedDoctor}
            onBack={() => handleNavigate('doctors')}
            onBookSlot={(doc, date, slot) => handleBookDoctor(doc, date, slot)}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            onNavigate={handleNavigate}
            onLoginSuccess={() => handleNavigate('patient-dashboard')}
          />
        )}

        {currentView === 'register' && (
          <RegisterPage
            onNavigate={handleNavigate}
            onRegisterSuccess={() => handleNavigate('patient-dashboard')}
          />
        )}

        {currentView === 'patient-dashboard' && (
          <PatientDashboard
            onNavigate={handleNavigate}
            onBookNew={() => handleNavigate('doctors')}
          />
        )}

        {/* /admin route handling: shows AdminDashboard if already admin, otherwise dedicated AdminLoginPage */}
        {(currentView === 'admin' || currentView === 'admin-dashboard') && (
          isAdmin ? (
            <AdminDashboard onNavigate={handleNavigate} />
          ) : (
            <AdminLoginPage
              onNavigate={handleNavigate}
              onLoginSuccess={() => handleNavigate('admin-dashboard')}
            />
          )
        )}
      </main>

      {/* Global Booking Modal */}
      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          initialDate={bookingInitialDate}
          initialSlot={bookingInitialSlot}
          onClose={() => setBookingDoctor(null)}
          onNavigateLogin={() => {
            setBookingDoctor(null);
            handleNavigate('login');
          }}
          onViewAppointments={() => {
            setBookingDoctor(null);
            handleNavigate('patient-dashboard');
          }}
        />
      )}

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
