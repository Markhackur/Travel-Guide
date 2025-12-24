import { useState, useEffect } from 'react';
import { guideAPI, bookingAPI } from '../../api';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext';
import { getStatusColor, formatCurrency } from '../../utils/helpers';
import { 
  FiCalendar, 
  FiDollarSign, 
  FiStar, 
  FiUsers,
  FiTrendingUp,
  FiClock,
  FiMapPin,
  FiMessageSquare,
  FiChevronRight,
  FiEye,
  FiDownload
} from 'react-icons/fi';
import { 
  FaRegCalendarAlt,
  FaChartLine,
  FaRegUserCircle
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const GuideDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    rating: 4.8,
    responseTime: '2.5h',
    completionRate: '94%'
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [bookingsRes, guideStats] = await Promise.all([
        bookingAPI.getAll(),
        guideAPI.getDashboardStats(),
      ]);
      
      setBookings(bookingsRes.data.bookings || []);
      setStats(guideStats.data || stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) { 
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="w-full h-full border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const dashboardStats = [
    {
      title: 'Total Bookings',
      value: bookings.length,
      icon: FiCalendar,
      color: 'from-blue-500 to-cyan-500',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Pending Reviews',
      value: bookings.filter((b) => b.status === 'pending').length,
      icon: FiClock,
      color: 'from-yellow-500 to-amber-500',
      change: '+3',
      trend: 'up'
    },
    {
      title: 'Confirmed',
      value: bookings.filter((b) => b.status === 'confirmed').length,
      icon: FiStar,
      color: 'from-green-500 to-emerald-500',
      change: '+24%',
      trend: 'up'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + (b.totalAmount || 0), 0)),
      icon: FiDollarSign,
      color: 'from-purple-500 to-pink-500',
      change: '+18%',
      trend: 'up'
    },
  ];

  const quickActions = [
    { label: 'Update Availability', icon: FiCalendar, color: 'from-blue-500 to-cyan-500', path: '/guide/availability' },
    { label: 'View Calendar', icon: FaRegCalendarAlt, color: 'from-emerald-500 to-green-500', path: '/guide/calendar' },
    { label: 'Message Inbox', icon: FiMessageSquare, color: 'from-purple-500 to-pink-500', path: '/guide/messages' },
    { label: 'View Reviews', icon: FiStar, color: 'from-amber-500 to-orange-500', path: '/guide/reviews' },
  ];

  const performanceMetrics = [
    { label: 'Response Rate', value: '98%', target: '95%', color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'On-time Arrival', value: '96%', target: '90%', color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Customer Rating', value: '4.8', target: '4.5', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: 'Repeat Clients', value: '42%', target: '30%', color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Welcome Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8 md:p-10"
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Live Dashboard</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Welcome back, <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{user?.name}!</span> 👋
              </h1>
              
              <p className="text-gray-300 text-lg max-w-2xl">
                Here's an overview of your guide performance and upcoming bookings.
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 md:mt-0"
            >
              <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <FiDownload className="w-5 h-5 mr-2" />
                Download Report
                <FiChevronRight className="w-5 h-5 ml-2" />
              </button>
            </motion.div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-white">{stats.rating}</div>
              <div className="text-sm text-gray-400">Avg. Rating</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-white">{stats.responseTime}</div>
              <div className="text-sm text-gray-400">Avg. Response</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-white">{stats.completionRate}</div>
              <div className="text-sm text-gray-400">Completion</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-white">{formatCurrency(stats.revenue)}</div>
              <div className="text-sm text-gray-400">This Month</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -5 }}
          >
            <Card className={`relative overflow-hidden border ${stat.color.replace('from-', 'border-').replace(' to-', '/20')}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                      {stat.value}
                    </p>
                    <div className="flex items-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        stat.trend === 'up' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {stat.trend === 'up' ? '↗' : '↘'} {stat.change}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">from last month</span>
                    </div>
                  </div>
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Performance & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Metrics */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Performance Metrics</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View details
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {performanceMetrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border border-gray-200"
                >
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${metric.color} mb-1`}>{metric.value}</div>
                    <div className="text-sm text-gray-600 mb-2">{metric.label}</div>
                    <div className="text-xs text-gray-500">Target: {metric.target}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ x: 5 }}
                onClick={() => window.location.href = action.path}
                className={`w-full p-4 rounded-xl bg-gradient-to-r ${action.color} text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-between`}
              >
                <div className="flex items-center">
                  <action.icon className="w-5 h-5 mr-3" />
                  {action.label}
                </div>
                <FiChevronRight className="w-5 h-5" />
              </motion.button>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Bookings & Upcoming Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                View all
                <FiChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.slice(0, 5).map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                    className="group"
                  >
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 hover:border-blue-300 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <FaRegUserCircle className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {booking.customerName}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                <span className="flex items-center">
                                  <FiCalendar className="w-4 h-4 mr-1" />
                                  {booking.date}
                                </span>
                                <span className="flex items-center">
                                  <FiClock className="w-4 h-4 mr-1" />
                                  {booking.time || '2:00 PM'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {booking.status}
                            </span>
                            <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                              ${booking.totalAmount || '0'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                            <FiEye className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 mx-auto mb-4">
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
                    <FaRegCalendarAlt className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No bookings yet
                </h3>
                <p className="text-gray-600">
                  Your bookings will appear here when customers book your services.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Upcoming Schedule */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Schedule</h2>
          <div className="space-y-4">
            {bookings.filter(b => b.status === 'confirmed').slice(0, 3).map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <FiCalendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{booking.date}</h4>
                    <p className="text-sm text-gray-600">{booking.time || 'All day'}</p>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-700">
                  {booking.attraction?.name || 'Guided Tour'}
                </div>
              </motion.div>
            ))}
            
            {bookings.filter(b => b.status === 'confirmed').length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No upcoming bookings scheduled</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GuideDashboard;