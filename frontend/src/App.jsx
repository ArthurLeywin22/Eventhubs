import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Navigation & Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Route Guards
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Public Pages
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AIAssistantPage from './pages/AIAssistantPage';

// Student Pages
import StudentDashboardPage from './pages/StudentDashboardPage';
import MyEventsPage from './pages/MyEventsPage';
import ProfilePage from './pages/ProfilePage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminCreateEventPage from './pages/admin/AdminCreateEventPage';
import AdminEditEventPage from './pages/admin/AdminEditEventPage';
import AdminRegistrationsPage from './pages/admin/AdminRegistrationsPage';

// Scroll to top upon route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen">
          <Navbar />

          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/ai-assistant" element={<AIAssistantPage />} />

              {/* Student Authenticated Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <StudentDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-events"
                element={
                  <ProtectedRoute>
                    <MyEventsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Campus Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/events"
                element={
                  <AdminRoute>
                    <AdminEventsPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/events/create"
                element={
                  <AdminRoute>
                    <AdminCreateEventPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/events/:id/edit"
                element={
                  <AdminRoute>
                    <AdminEditEventPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/events/:id/registrations"
                element={
                  <AdminRoute>
                    <AdminRegistrationsPage />
                  </AdminRoute>
                }
              />

              {/* Catch-all Fallback */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
