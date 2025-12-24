import { useState, useEffect, useCallback } from 'react';
import { travellerAPI } from '../../api';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { formatDate, getStatusColor, formatCurrency } from '../../utils/helpers';
import { 
  FiCalendar, 
  FiUsers, 
  FiMapPin, 
  FiDownload, 
  FiMessageSquare,
  FiStar,
  FiFilter,
  FiChevronDown,
  FiRefreshCw
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedBooking, setExpandedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, sortBy]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = { 
        ...(statusFilter !== 'all' && { status: statusFilter }),
        sortBy 
      };
      const response = await travellerAPI.getBookings(params);
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (bookingId) => {
    try {
      const response = await travellerAPI.downloadReceipt(bookingId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${bookingId}.pdf`;
      link.click();
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Bookings', count: bookings.length },
    { value: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
    { value: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
    { value: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length },
    { value: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
  ];

  const sortOptions = [
    { value: 'date', label: 'Date (Newest)' },
    { value: 'date_old', label: 'Date (Oldest)' },
    { value: 'price', label: 'Price (High-Low)' },
    { value: 'price_low', label: 'Price (Low-High)' },
  ];

  if (loading && bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader size="xl" />
        <p className="mt-4 text-gray-500">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
            My Bookings
          </h1>
          <p className="text-gray-600 mt-1">Manage your travel bookings and experiences</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <FiFilter />
            Filters
            <FiChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchBookings}
            className="flex items-center gap-2"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-primary-100 border-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setStatusFilter(option.value)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          statusFilter === option.value
                            ? 'bg-primary-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option.label}
                        <span className="ml-1.5 text-xs opacity-75">
                          ({option.count})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusOptions.slice(1).map((status) => (
          <Card key={status.value} className="bg-gradient-to-br from-white to-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{status.label}</p>
                <p className="text-2xl font-bold text-gray-900">{status.count}</p>
              </div>
              <div className={`p-3 rounded-full ${getStatusColor(status.value)}`}>
                <FiCalendar className="text-white text-xl" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Bookings List */}
      <AnimatePresence mode="wait">
        {bookings.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {bookings.map((booking, index) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                index={index}
                isExpanded={expandedBooking === booking.id}
                onExpand={() => setExpandedBooking(
                  expandedBooking === booking.id ? null : booking.id
                )}
                onDownloadReceipt={() => downloadReceipt(booking.id)}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <FiCalendar className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {statusFilter === 'all' 
                ? "You haven't made any bookings yet. Start exploring attractions!"
                : `No ${statusFilter} bookings found.`}
            </p>
            <Button variant="primary" href="/explore">
              Explore Attractions
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const BookingCard = ({ booking, index, isExpanded, onExpand, onDownloadReceipt }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card 
        className={`hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 ${
          booking.status === 'confirmed' ? 'border-l-green-500' :
          booking.status === 'pending' ? 'border-l-yellow-500' :
          booking.status === 'cancelled' ? 'border-l-red-500' :
          'border-l-blue-500'
        }`}
        onClick={onExpand}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600">
                  {booking.attraction?.name || 'Unknown Attraction'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Booking ID: #{booking.id}</p>
              </div>
              <Badge 
                variant={booking.status}
                className="animate-pulse"
              >
                {booking.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center text-gray-600">
                <FiMapPin className="mr-2 text-primary-500" />
                <span>{booking.attraction?.location || 'N/A'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FiCalendar className="mr-2 text-primary-500" />
                <span>{formatDate(booking.date)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FiUsers className="mr-2 text-primary-500" />
                <span>{booking.partySize} {booking.partySize === 1 ? 'guest' : 'guests'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(booking.totalAmount)}
                </span>
                {booking.guide && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 mr-2"></div>
                    <div>
                      <p className="text-sm font-medium">Guide: {booking.guide.name}</p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FiStar 
                            key={i}
                            className={`w-3 h-3 ${
                              i < (booking.guide.rating || 0) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <FiChevronDown 
                className={`text-gray-400 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Booking Details</h4>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Booking Date:</dt>
                        <dd className="font-medium">{formatDate(booking.createdAt)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Payment Status:</dt>
                        <dd className={`font-medium ${
                          booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {booking.paymentStatus}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Reference Number:</dt>
                        <dd className="font-mono text-sm">{booking.reference}</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Actions</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadReceipt();
                        }}
                        className="flex items-center gap-2"
                      >
                        <FiDownload />
                        Download Receipt
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <FiMessageSquare />
                        Contact Guide
                      </Button>
                      {booking.status === 'confirmed' && (
                        <Button
                          variant="danger"
                          size="sm"
                        >
                          Cancel Booking
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default MyBookings;