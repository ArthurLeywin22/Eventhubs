import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Sparkles,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  LayoutDashboard,
  BookmarkCheck,
  PlusCircle,
} from 'lucide-react';
import Button from './Button';

export default function Navbar() {
  const { user, profile, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
      isActive
        ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">EventHub</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-indigo-100 text-indigo-700">Campus</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium -mt-1 hidden sm:block">Discover. Register. Participate.</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" className={navLinkClass}>Home</NavLink>
          <NavLink to="/events" className={navLinkClass}>Events</NavLink>
          
          {user && !isAdmin && (
            <NavLink to="/my-events" className={navLinkClass}>
              <BookmarkCheck className="w-4 h-4" /> My Events
            </NavLink>
          )}

          <NavLink to="/ai-assistant" className={navLinkClass}>
            <Sparkles className="w-4 h-4 text-violet-500" /> AI Assistant
          </NavLink>

          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              <Shield className="w-4 h-4 text-amber-600" /> Admin
            </NavLink>
          )}
        </nav>

        {/* Auth Actions / User Menu */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pl-3 rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all text-left"
              >
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 line-clamp-1">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                    {isAdmin ? 'Campus Admin' : 'Student'}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                </div>
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">{profile?.full_name || 'Logged In'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    {!isAdmin ? (
                      <>
                        <Link
                          to="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Student Dashboard
                        </Link>
                        <Link
                          to="/my-events"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                        >
                          <BookmarkCheck className="w-4 h-4" /> Registered Events
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                        >
                          <User className="w-4 h-4" /> My Profile
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                        >
                          <Shield className="w-4 h-4 text-amber-500" /> Admin Overview
                        </Link>
                        <Link
                          to="/admin/events"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                        >
                          <Calendar className="w-4 h-4" /> Manage All Events
                        </Link>
                        <Link
                          to="/admin/events/create"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                        >
                          <PlusCircle className="w-4 h-4 text-emerald-600" /> Create New Event
                        </Link>
                      </>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Register</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <NavLink
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Home
          </NavLink>
          <NavLink
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Events
          </NavLink>
          <NavLink
            to="/ai-assistant"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-lg flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> AI Assistant
          </NavLink>

          {user ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="px-3 py-1">
                <p className="text-xs font-bold text-slate-900">{profile?.full_name}</p>
                <p className="text-[11px] text-slate-500">{user.email}</p>
              </div>

              {!isAdmin ? (
                <>
                  <NavLink
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    Student Dashboard
                  </NavLink>
                  <NavLink
                    to="/my-events"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    My Registered Events
                  </NavLink>
                  <NavLink
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    Profile
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 rounded-lg"
                  >
                    Admin Dashboard
                  </NavLink>
                  <NavLink
                    to="/admin/events"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    Manage Events
                  </NavLink>
                  <NavLink
                    to="/admin/events/create"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg"
                  >
                    + Create Event
                  </NavLink>
                </>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" className="w-full">Sign In</Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full">Register Account</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
