import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  FiMenu, 
  FiX, 
  FiUser, 
  FiLogOut, 
  FiSettings,
  FiBell,
  FiSearch,
  FiHome,
  FiMap,
  FiCalendar,
  FiNavigation,
  FiCpu,
  FiBriefcase,
  FiClock,
  FiChevronDown,
  FiChevronRight,
  FiHelpCircle,
  FiMoon,
  FiSun,
  FiMessageSquare,
  FiStar,
  FiTrendingUp
} from 'react-icons/fi';
import { 
  FaRobot,
  FaRegCalendarAlt,
  FaRegCompass
} from 'react-icons/fa';
import { getInitials } from '../../utils/helpers';
import Modal from '../common/Modal';
import Button from '../common/Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    // Mock notifications
    setNotifications([
      { id: 1, title: 'New Booking', message: 'John booked your tour for tomorrow', time: '2 min ago', read: false, type: 'booking' },
      { id: 2, title: 'Review Received', message: 'You received a 5-star review!', time: '1 hour ago', read: false, type: 'review' },
      { id: 3, title: 'Reminder', message: 'Your tour starts in 30 minutes', time: '2 hours ago', read: true, type: 'reminder' },
    ]);

    // Close menus on click outside
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setLogoutModalOpen(false);
  }; 

  const navLinks = user?.role === 'traveller' 
    ? [
        { path: '/dashboard', label: 'Dashboard', icon: FiHome, color: 'from-blue-500 to-cyan-500' },
        { path: '/explore', label: 'Explore', icon: FiMap, color: 'from-emerald-500 to-green-500' },
        { path: '/bookings', label: 'Bookings', icon: FiCalendar, color: 'from-purple-500 to-pink-500' },
        { path: '/itineraries', label: 'Itineraries', icon: FaRegCalendarAlt, color: 'from-amber-500 to-orange-500' },
        { path: '/ai-planner', label: 'AI Planner', icon: FaRobot, color: 'from-violet-500 to-purple-500' },
      ]
    : [
        { path: '/guide/dashboard', label: 'Dashboard', icon: FiHome, color: 'from-blue-500 to-cyan-500' },
        { path: '/guide/bookings', label: 'Bookings', icon: FiBriefcase, color: 'from-purple-500 to-pink-500' },
        { path: '/guide/availability', label: 'Availability', icon: FiClock, color: 'from-emerald-500 to-green-500' },
        { path: '/guide/reviews', label: 'Reviews', icon: FiStar, color: 'from-amber-500 to-orange-500' },
        { path: '/guide/earnings', label: 'Earnings', icon: FiTrendingUp, color: 'from-green-500 to-teal-500' },
      ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-xl shadow-soft sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Logo & Navigation */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link to="/dashboard" className="flex items-center space-x-3 group">
                <motion.div
                  whileHover={{ rotate: 5 }}
                  className="relative"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">TG</span>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-pink-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.div>
                <div className="hidden lg:block">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                    TouristGuide
                  </span>
                  <div className="text-xs text-gray-500 -mt-1">
                    AI-Powered Travel Platform
                  </div>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path || 
                    (link.path !== '/dashboard' && location.pathname.startsWith(link.path));
                  
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="relative group"
                    >
                      <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? `bg-gradient-to-br ${link.color} text-white shadow-lg` 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}>
                        <link.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                        <span className="font-medium text-sm">{link.label}</span>
                      </div>
                      
                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute -bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative" ref={searchRef}>
                <AnimatePresence>
                  {searchOpen && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 300 }}
                      exit={{ opacity: 0, width: 0 }}
                      className="absolute right-0 top-1/2 -translate-y-1/2"
                    >
                      <form onSubmit={handleSearch}>
                        <div className="relative">
                          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search destinations, guides..."
                            className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                          />
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className={`p-2.5 rounded-xl transition-all duration-200 ${
                    searchOpen 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <FiSearch className="w-5 h-5" />
                </button>
              </div>

              {/* AI Assistant */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/ai-planner')}
                className="hidden lg:flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <FaRobot className="w-4 h-4" />
                <span>AI Assistant</span>
              </motion.button>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                {darkMode ? (
                  <FiSun className="w-5 h-5" />
                ) : (
                  <FiMoon className="w-5 h-5" />
                )}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 relative"
                >
                  <FiBell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-gray-900">Notifications</h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          <div className="py-2">
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${
                                  notification.read 
                                    ? 'border-transparent' 
                                    : 'border-blue-500'
                                }`}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className={`p-2 rounded-lg ${
                                    notification.type === 'booking' ? 'bg-blue-100 text-blue-600' :
                                    notification.type === 'review' ? 'bg-yellow-100 text-yellow-600' :
                                    'bg-green-100 text-green-600'
                                  }`}>
                                    {notification.type === 'booking' ? (
                                      <FiCalendar className="w-4 h-4" />
                                    ) : notification.type === 'review' ? (
                                      <FiStar className="w-4 h-4" />
                                    ) : (
                                      <FiClock className="w-4 h-4" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900">
                                      {notification.title}
                                      {!notification.read && (
                                        <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
                                      )}
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {notification.message}
                                    </p>
                                    <span className="text-xs text-gray-500 mt-1 block">
                                      {notification.time}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-8 text-center">
                            <FiBell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No notifications</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="px-4 py-3 border-t border-gray-100">
                        <Link
                          to="/notifications"
                          className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                          onClick={() => setNotificationsOpen(false)}
                        >
                          View all notifications
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                >
                  <div className="relative">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg">
                      {getInitials(user?.name)}
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-pink-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="hidden lg:block text-left">
                    <div className="font-medium text-sm text-gray-900 leading-tight">
                      {user?.name}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {user?.role}
                    </div>
                  </div>
                  
                  <FiChevronDown className={`hidden lg:block w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-50"
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-lg font-bold">
                            {getInitials(user?.name)}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{user?.name}</h3>
                            <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                            <p className="text-xs text-gray-400 mt-1">{user?.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <FiUser className="w-5 h-5 mr-3 text-gray-400" />
                          <span>Profile</span>
                        </Link>
                        
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <FiSettings className="w-5 h-5 mr-3 text-gray-400" />
                          <span>Settings</span>
                        </Link>
                        
                        <Link
                          to="/help"
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <FiHelpCircle className="w-5 h-5 mr-3 text-gray-400" />
                          <span>Help & Support</span>
                        </Link>
                      </div>

                      {/* Footer */}
                      <div className="px-4 py-3 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            setLogoutModalOpen(true);
                          }}
                          className="w-full flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-red-50 to-red-100 text-red-600 rounded-xl font-medium hover:from-red-100 hover:to-red-200 transition-all duration-200"
                        >
                          <FiLogOut className="w-5 h-5 mr-2" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                {mobileMenuOpen ? (
                  <FiX className="w-6 h-6" />
                ) : (
                  <FiMenu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            >
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25 }}
                className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Mobile Menu Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-xl">TG</span>
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">TouristGuide</div>
                        <div className="text-sm text-gray-500">{user?.name}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <div className="p-4">
                  <div className="space-y-1">
                    {navLinks.map((link) => {
                      const isActive = location.pathname === link.path;
                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                            isActive
                              ? `bg-gradient-to-r ${link.color} text-white`
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <link.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                          <span className="font-medium">{link.label}</span>
                          {isActive && <FiChevronRight className="ml-auto w-4 h-4" />}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Mobile User Actions */}
                  <div className="mt-8 pt-6 border-t border-gray-100 space-y-1">
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl"
                    >
                      <FiUser className="w-5 h-5 text-gray-400" />
                      <span>Profile</span>
                    </Link>
                    
                    <Link
                      to="/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl"
                    >
                      <FiSettings className="w-5 h-5 text-gray-400" />
                      <span>Settings</span>
                    </Link>
                    
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setLogoutModalOpen(true);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl"
                    >
                      <FiLogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>

                  {/* AI Assistant Button */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/ai-planner');
                    }}
                    className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg flex items-center justify-center space-x-2"
                  >
                    <FaRobot className="w-5 h-5" />
                    <span>AI Travel Assistant</span>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        title="Confirm Logout"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center">
            <FiLogOut className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to leave?</h3>
          <p className="text-gray-600 mb-6">
            You'll need to sign in again to access your account.
          </p>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1 border-gray-300"
              onClick={() => setLogoutModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600"
              onClick={handleLogout}
            >
              Yes, Logout
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Navbar;