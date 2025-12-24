import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { travellerAPI, summaryAPI } from '../../api';
import { 
  FiCalendar, 
  FiMapPin, 
  FiTrendingUp, 
  FiStar,
  FiCompass,
  FiNavigation,
  FiClock,
  FiUsers,
  FiChevronRight,
  FiSearch,
  FiPlus,
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi';
import { 
  FaRegCompass,
  FaRegMap,
  FaRegCalendarCheck,
  FaRegChartBar
} from 'react-icons/fa';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import { formatCurrency, formatDate } from '../../utils/helpers';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('Welcome back');
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    fetchData();
    updateGreeting();
  }, []);

  const updateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  };

  const fetchData = async () => {
    try {
      const [bookingsRes, summaryRes] = await Promise.all([
        travellerAPI.getBookings({ status: 'confirmed' }),
        summaryAPI.getSummary(),
      ]); 

      setBookings(bookingsRes.data.bookings?.slice(0, 5) || []);
      setStats(summaryRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Upcoming Trips',
      value: bookings.length,
      icon: FiCalendar,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10',
      borderColor: 'border-blue-500/20',
      link: '/bookings',
      description: 'Confirmed bookings',
      trend: '+2 this week',
    },
    {
      title: 'Total Attractions',
      value: stats?.totalAttractions || 0,
      icon: FiMapPin,
      color: 'from-emerald-500 to-green-500',
      bgColor: 'bg-gradient-to-br from-emerald-500/10 to-green-500/10',
      borderColor: 'border-emerald-500/20',
      link: '/explore',
      description: 'Available destinations',
      trend: '+15 new',
    },
    {
      title: 'Avg. Rating',
      value: stats?.averageRating?.toFixed(1) || '0.0',
      icon: FiStar,
      color: 'from-amber-500 to-yellow-500',
      bgColor: 'bg-gradient-to-br from-amber-500/10 to-yellow-500/10',
      borderColor: 'border-amber-500/20',
      description: 'Based on reviews',
      trend: '4.8 last month',
    },
    {
      title: 'Active Guides',
      value: stats?.totalGuides || 0,
      icon: FiUsers,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10',
      borderColor: 'border-purple-500/20',
      description: 'Available now',
      trend: '5 online',
    },
  ];

  const quickActions = [
    {
      title: 'Explore Attractions',
      description: 'Discover amazing places to visit',
      icon: <FiCompass className="w-6 h-6" />,
      color: 'from-blue-500 to-purple-500',
      link: '/explore',
    },
    {
      title: 'AI Travel Planner',
      description: 'Plan your trip with AI assistance',
      icon: <FiNavigation className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      link: '/ai-planner',
    },
    {
      title: 'Book a Guide',
      description: 'Find expert local guides',
      icon: <FiUsers className="w-6 h-6" />,
      color: 'from-emerald-500 to-teal-500',
      link: '/guides',
    },
    {
      title: 'Create Itinerary',
      description: 'Build your travel plan',
      icon: <FiClock className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      link: '/itineraries/new',
    },
  ];

  const travelTips = [
    "Book guides at least 48 hours in advance for better availability",
    "Use AI planner for personalized itinerary suggestions",
    "Check weather forecasts before confirming outdoor activities",
    "Read recent reviews for up-to-date attraction information",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

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
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Live Dashboard</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {greeting}, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{user?.name}!</span> ✨
              </h1>
              
              <p className="text-gray-300 text-lg max-w-2xl">
                Ready to explore new destinations? Here's what's happening with your travel plans today.
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 md:mt-0"
            >
              <Link
                to="/explore"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <FiSearch className="w-5 h-5 mr-2" />
                Start Exploring
                <FiChevronRight className="w-5 h-5 ml-2" />
              </Link>
            </motion.div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-white">{bookings.length}</div>
              <div className="text-sm text-gray-400">Active Trips</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-white">{stats?.totalAttractions || 0}</div>
              <div className="text-sm text-gray-400">Destinations</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-sm text-gray-400">Support</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-sm text-gray-400">Satisfaction</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -5 }}
            onMouseEnter={() => setActiveCard(index)}
            onMouseLeave={() => setActiveCard(null)}
          >
            <Card 
              className={`relative overflow-hidden transition-all duration-300 ${
                stat.link ? 'cursor-pointer' : ''
              } border ${stat.borderColor} ${stat.bgColor}`}
            >
              {/* Animated Background */}
              <AnimatePresence>
                {activeCard === index && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute inset-0 bg-gradient-to-br ${stat.color}`}
                  />
                )}
              </AnimatePresence>

              {stat.link ? (
                <Link to={stat.link} className="relative z-10 block">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mb-2">
                        {stat.value}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{stat.description}</span>
                        <span className="text-xs px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full">
                          {stat.trend}
                        </span>
                      </div>
                    </div>
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mb-2">
                        {stat.value}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{stat.description}</span>
                        <span className="text-xs px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full">
                          {stat.trend}
                        </span>
                      </div>
                    </div>
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions Grid */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
              <span className="text-sm text-gray-500">Popular actions</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Link
                    to={action.link}
                    className={`block p-5 rounded-2xl bg-gradient-to-br ${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group`}
                  >
                    {/* Shine Effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                          {action.icon}
                        </div>
                        <FiChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h3 className="font-bold text-lg mb-1">{action.title}</h3>
                      <p className="text-white/80 text-sm">{action.description}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Upcoming Bookings */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Upcoming Bookings</h2>
              <Link
                to="/bookings"
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center text-sm"
              >
                View all
                <FiChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                    className="group"
                  >
                    <div className="p-5 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 hover:border-blue-300 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <FiCalendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {booking.attraction?.name || 'Unknown Attraction'}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                <span className="flex items-center">
                                  <FiClock className="w-4 h-4 mr-1" />
                                  {booking.date}
                                </span>
                                <span className="flex items-center">
                                  <FiUsers className="w-4 h-4 mr-1" />
                                  {booking.partySize} guests
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-3">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              booking.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {booking.status}
                            </span>
                            <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              ${booking.totalAmount}
                            </span>
                          </div>
                        </div>
                        
                        <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            to={`/bookings/${booking.id}`}
                            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <FiChevronRight className="w-5 h-5 text-gray-600" />
                          </Link>
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
                    <FiCalendar className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No upcoming bookings
                </h3>
                <p className="text-gray-600 mb-4">
                  Start planning your next adventure today!
                </p>
                <Link
                  to="/explore"
                  className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  <FiPlus className="w-5 h-5 mr-2" />
                  Explore Destinations
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Travel Tips & Insights */}
        <div className="space-y-6">
          {/* Travel Tips */}
          <Card>
            <div className="flex items-center space-x-2 mb-6">
              <FiAlertCircle className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Travel Tips</h2>
            </div>
            <div className="space-y-4">
              {travelTips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start space-x-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700">{tip}</p>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <div className="flex items-center space-x-2 mb-6">
              <FaRegChartBar className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Profile Updated</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiStar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Review Submitted</p>
                  <p className="text-xs text-gray-500">Yesterday</p>
                </div>
              </div>
            </div>
          </Card>

          {/* AI Assistant */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">AI Travel Assistant</h3>
              <p className="text-gray-300 text-sm mb-4">
                Need help planning? Our AI can create personalized itineraries for you.
              </p>
              <Link
                to="/ai-planner"
                className="inline-flex items-center justify-center w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
              >
                <FiNavigation className="w-5 h-5 mr-2" />
                Try AI Planner
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Trip Completion</h3>
              <div className="flex items-baseline mt-2">
                <span className="text-3xl font-bold text-blue-600">85%</span>
                <span className="text-gray-600 ml-2">success rate</span>
              </div>
            </div>
            <div className="w-16 h-16">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                <div 
                  className="absolute inset-0 w-16 h-16 border-4 border-blue-600 rounded-full"
                  style={{ clipPath: 'inset(0 0 0 50%)' }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Saved Places</h3>
              <div className="flex items-baseline mt-2">
                <span className="text-3xl font-bold text-purple-600">12</span>
                <span className="text-gray-600 ml-2">destinations</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <FiMapPin className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Guide Rating</h3>
              <div className="flex items-baseline mt-2">
                <span className="text-3xl font-bold text-emerald-600">4.9</span>
                <span className="text-gray-600 ml-2">avg. stars</span>
              </div>
            </div>
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} className="w-6 h-6 text-yellow-500 fill-current" />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;