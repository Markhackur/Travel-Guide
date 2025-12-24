import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  FiHome,
  FiMap,
  FiCalendar,
  FiFileText,
  FiNavigation,
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiStar,
  FiBriefcase,
  FiClock,
  FiTrendingUp,
  FiHelpCircle
} from 'react-icons/fi';
import { FaRobot } from 'react-icons/fa';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  const travellerMenu = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/explore', label: 'Explore', icon: FiMap },
    { path: '/bookings', label: 'Bookings', icon: FiCalendar },
    { path: '/itineraries', label: 'Itineraries', icon: FiFileText },
    { path: '/ai-planner', label: 'AI Planner', icon: FaRobot },
  ];

  const guideMenu = [
    { path: '/guide/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/guide/bookings', label: 'Bookings', icon: FiCalendar },
    { path: '/guide/availability', label: 'Availability', icon: FiClock },
    { path: '/guide/reviews', label: 'Reviews', icon: FiStar },
    { path: '/guide/earnings', label: 'Earnings', icon: FiTrendingUp },
  ];

  const userMenu = [
    { path: '/profile', label: 'Profile', icon: FiUser },
    { path: '/settings', label: 'Settings', icon: FiSettings },
    { path: '/help', label: 'Help', icon: FiHelpCircle },
  ];

  const menuItems = user?.role === 'traveller' ? travellerMenu : guideMenu;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.div
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      className={`h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white ${
        collapsed ? 'w-20' : 'w-64'
      } transition-all duration-300 flex flex-col shadow-2xl sticky top-0`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FiNavigation className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">TouristGuide</h1>
                <p className="text-xs text-gray-400">AI Travel Platform</p>
              </div>
            </Link>
          )}
          {collapsed && (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto">
              <FiNavigation className="w-6 h-6" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {collapsed ? (
              <FiChevronRight className="w-5 h-5" />
            ) : (
              <FiChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* User Profile */}
      {!collapsed && (
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="font-semibold">{user?.name}</h3>
              <p className="text-sm text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          <p className={`text-xs uppercase text-gray-500 font-semibold mb-3 ${
            collapsed ? 'text-center' : 'px-3'
          }`}>
            {collapsed ? '...' : 'Navigation'}
          </p>
          
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center ${
                  collapsed ? 'justify-center p-3' : 'px-4 py-3'
                } rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border-l-4 border-blue-500'
                    : 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 ${collapsed ? '' : 'mr-3'}`} />
                {!collapsed && <span>{item.label}</span>}
                
                {collapsed && isActive && (
                  <div className="absolute right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Menu */}
        <div className="mt-8">
          <p className={`text-xs uppercase text-gray-500 font-semibold mb-3 ${
            collapsed ? 'text-center' : 'px-3'
          }`}>
            {collapsed ? '...' : 'Account'}
          </p>
          
          {userMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center ${
                collapsed ? 'justify-center p-3' : 'px-4 py-3'
              } rounded-xl transition-all duration-200 group hover:bg-gray-700/50 text-gray-300 hover:text-white`}
            >
              <item.icon className={`w-5 h-5 ${collapsed ? '' : 'mr-3'}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className={`flex items-center ${
            collapsed ? 'justify-center p-3' : 'justify-between px-4 py-3'
          } w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-all duration-200`}
        >
          <FiLogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>
        
        {!collapsed && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              © 2024 TouristGuide
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Sidebar;