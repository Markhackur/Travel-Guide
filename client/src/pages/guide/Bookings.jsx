import { useState, useEffect } from 'react';
import { bookingAPI } from '../../api';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { formatDate, getStatusColor, formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";



// CORRECT the imports - FiMap should come from 'react-icons/fi', not 'react-icons/fa'
import { 
  FiCalendar, 
  FiMapPin,  // Use FiMapPin instead of FiMap from 'fi'
  FiClock, 
  FiUsers,
  FiDollarSign,
  FiMessageSquare,
  FiCheck,
  FiX,
  FiEye,
  FiDownload,
  FiChevronRight,
  FiFilter,
  FiSearch
} from 'react-icons/fi';  // Fi icons come from 'fi'

import { 
  FaRegCalendarAlt,
  FaRegUserCircle,
  // Remove FiMap from here - it doesn't exist in 'fa'
} from 'react-icons/fa';  // Fa icons come from 'fa'

const GuideBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    date: '',
    search: ''
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getAll();
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }; 

  const updateStatus = async (id, status) => {
    try {
      await bookingAPI.updateStatus(id, status);
      toast.success(`Booking ${status} successfully!`, {
        icon: '✅',
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update status', {
        icon: '❌',
      });
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filters.status !== 'all' && booking.status !== filters.status) return false;
    if (filters.date && booking.date !== filters.date) return false;
    if (filters.search && !booking.customerName.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    revenue: bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + (b.totalAmount || 0), 0)
  };

  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'bg-gray-100 text-gray-800' },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    { value: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-800' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600 mt-1">Manage and review all booking requests</p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex items-center"
          >
            <FiFilter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button
            variant="gradient"
            className="flex items-center"
          >
            <FiDownload className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Bookings', value: stats.total, icon: FaRegCalendarAlt, color: 'from-blue-500 to-cyan-500' },
          { label: 'Pending', value: stats.pending, icon: FiClock, color: 'from-yellow-500 to-amber-500' },
          { label: 'Confirmed', value: stats.confirmed, icon: FiCheck, color: 'from-green-500 to-emerald-500' },
          { label: 'Cancelled', value: stats.cancelled, icon: FiX, color: 'from-red-500 to-orange-500' },
          { label: 'Revenue', value: `$${stats.revenue}`, icon: FiDollarSign, color: 'from-purple-500 to-pink-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 text-white shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm opacity-90">{stat.label}</div>
              </div>
              <stat.icon className="w-8 h-8 opacity-80" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Customer
                </label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bookings List */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Bookings ({filteredBookings.length})
          </h2>
          <div className="text-sm text-gray-500">
            Showing {filteredBookings.length} of {bookings.length}
          </div>
        </div>

        {filteredBookings.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  exit={{ opacity: 0, x: 20 }}
                  whileHover={{ x: 5 }}
                  className="group"
                >
                  <div className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 hover:border-blue-300 transition-all duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Booking Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {booking.attraction?.name || 'Tour Experience'}
                            </h3>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="flex items-center text-sm text-gray-600">
                                <FaRegUserCircle className="w-4 h-4 mr-2" />
                                {booking.customerName}
                              </span>
                              <span className="flex items-center text-sm text-gray-600">
                                <FiCalendar className="w-4 h-4 mr-2" />
                                {formatDate(booking.date)}
                              </span>
                              <span className="flex items-center text-sm text-gray-600">
                                <FiUsers className="w-4 h-4 mr-2" />
                                {booking.partySize} guests
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <span className={`px-3 py-1.5 text-sm font-medium rounded-full mb-2 ${
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {booking.status}
                            </span>
                            <div className="text-lg font-bold text-gray-900">
                              ${booking.totalAmount || '0'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Additional Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                              <FiMap className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Location</p>
                              <p className="font-medium">{booking.location || 'City Center'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                              <FiClock className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Duration</p>
                              <p className="font-medium">{booking.duration || '3 hours'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                              <FiDollarSign className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Total</p>
                              <p className="font-medium">${booking.totalAmount || '0'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="lg:w-48">
                        {booking.status === 'pending' ? (
                          <div className="flex flex-col space-y-2">
                            <Button
                              variant="success"
                              onClick={() => updateStatus(booking.id, 'confirmed')}
                              className="w-full flex items-center justify-center"
                            >
                              <FiCheck className="w-4 h-4 mr-2" />
                              Accept Booking
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => updateStatus(booking.id, 'cancelled')}
                              className="w-full border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <FiX className="w-4 h-4 mr-2" />
                              Decline
                            </Button>
                          </div>
                        ) : booking.status === 'confirmed' ? (
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              className="w-full border-green-200 text-green-600 hover:bg-green-50"
                            >
                              <FiMessageSquare className="w-4 h-4 mr-2" />
                              Message
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => updateStatus(booking.id, 'completed')}
                            >
                              Mark Complete
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center py-2">
                            <p className="text-sm text-gray-500">No actions available</p>
                          </div>
                        )}
                        
                        <div className="mt-3 flex justify-center">
                          <button
                            onClick={() => setSelectedBooking(selectedBooking === booking.id ? null : booking.id)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                          >
                            View Details
                            <FiChevronRight className={`w-4 h-4 ml-1 transition-transform ${
                              selectedBooking === booking.id ? 'rotate-90' : ''
                            }`} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded Details */}
                    <AnimatePresence>
                      {selectedBooking === booking.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 pt-4 border-t border-gray-200"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Customer Notes</h4>
                              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                                {booking.notes || 'No additional notes provided.'}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                              <div className="space-y-2">
                                <p className="text-gray-600">Email: {booking.customerEmail}</p>
                                <p className="text-gray-600">Phone: {booking.customerPhone || 'Not provided'}</p>
                                <p className="text-gray-600">Special Requirements: {booking.specialRequirements || 'None'}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6">
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
                <FaRegCalendarAlt className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {filters.status !== 'all' || filters.date || filters.search 
                ? 'Try adjusting your filters to see more results.'
                : 'You don\'t have any bookings yet. They will appear here when customers book your services.'}
            </p>
            {(filters.status !== 'all' || filters.date || filters.search) && (
              <Button
                onClick={() => setFilters({ status: 'all', date: '', search: '' })}
                variant="outline"
              >
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default GuideBookings; 