import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { attractionAPI, bookingAPI } from '../../api';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { 
  FiStar, 
  FiMapPin, 
  FiClock, 
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiHeart,
  FiShare2,
  FiUsers,
  FiCalendar,
  FiChevronRight,
  FiCheck,
  FiX,
  FiNavigation,
  FiMap
} from 'react-icons/fi';
import { 
  FaRegHeart,
  FaRegStar,
  FaRegCalendarAlt,
  FaMapMarkerAlt,
  FaRobot,
  FaLightbulb
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ExploreAttractions = () => {
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingModal, setBookingModal] = useState({ open: false, attraction: null });
  const [bookingData, setBookingData] = useState({ date: '', partySize: 1 });
  const [availableGuides, setAvailableGuides] = useState([]);
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: [0, 1000],
    rating: 0,
    sortBy: 'popular'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [activeAttraction, setActiveAttraction] = useState(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchAttractions();
  }, [searchQuery, filters]);

  useEffect(() => {
    if (bookingData.date) {
      checkGuideAvailability(bookingData.date);
    } else {
      setAvailableGuides([]); 
    }
  }, [bookingData.date]);

  const fetchAttractions = async () => {
    try {
      setLoading(true);
      const response = await attractionAPI.getAll({ 
        q: searchQuery,
        category: filters.category !== 'all' ? filters.category : undefined,
        minPrice: filters.priceRange[0],
        maxPrice: filters.priceRange[1],
        minRating: filters.rating,
        sortBy: filters.sortBy
      });
      setAttractions(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch attractions', {
        icon: '❌',
      });
    } finally {
      setLoading(false);
    }
  };

  const checkGuideAvailability = async (date) => {
    try {
      const response = await fetch(`http://localhost:4000/api/guides?date=${date}`);
      const guides = await response.json();
      setAvailableGuides(guides);
    } catch (error) {
      console.error('Failed to check guide availability:', error);
      setAvailableGuides([]);
    }
  };

  const isGuideAvailable = (guideId) => {
    return availableGuides.some(guide => guide.id === guideId);
  };

  const handleBook = async () => {
    if (!user) {
      toast.error('Please login to book attractions', {
        icon: '🔒',
      });
      navigate('/login');
      return;
    }

    if (!bookingData.date || !bookingData.partySize) {
      toast.error('Please fill in date and party size');
      return;
    }

    if (!isGuideAvailable(bookingModal.attraction.guideId)) {
      toast.error('This attraction is not available on the selected date', {
        icon: '⚠️',
      });
      return;
    }

    try {
      const bookingPayload = {
        customerId: user.id,
        customerName: user.name,
        email: user.email,
        attractionId: bookingModal.attraction.id,
        guideId: bookingModal.attraction.guideId,
        date: bookingData.date,
        partySize: Number(bookingData.partySize),
        specialRequests: bookingData.specialRequests || ''
      };

      await bookingAPI.create(bookingPayload);

      toast.success('🎉 Booking created successfully!', {
        duration: 4000,
        icon: '✅',
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });
      setBookingModal({ open: false, attraction: null });
      setBookingData({ date: '', partySize: 1 });
      navigate('/bookings');
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || 'Booking failed', {
        icon: '❌',
      });
    }
  };

  const toggleFavorite = (attractionId) => {
    if (favorites.includes(attractionId)) {
      setFavorites(favorites.filter(id => id !== attractionId));
      toast.success('Removed from favorites', {
        icon: '❤️',
      });
    } else {
      setFavorites([...favorites, attractionId]);
      toast.success('Added to favorites', {
        icon: '❤️',
      });
    }
  };

  const categories = [
    { id: 'all', label: 'All Categories', icon: '🏛️' },
    { id: 'historical', label: 'Historical', icon: '🏰' },
    { id: 'nature', label: 'Nature', icon: '🌲' },
    { id: 'cultural', label: 'Cultural', icon: '🎭' },
    { id: 'adventure', label: 'Adventure', icon: '🧗' },
    { id: 'food', label: 'Food & Drink', icon: '🍽️' },
  ];

  const sortOptions = [
    { id: 'popular', label: 'Most Popular' },
    { id: 'rating', label: 'Highest Rated' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Discovering amazing places...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-green-900 to-cyan-900 p-8 md:p-10"
      >
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Discover Amazing Destinations
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl">
              Explore hand-picked attractions with expert local guides
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search destinations, activities, guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="flex items-center"
            >
              <FiFilter className="w-4 h-4 mr-2" />
              Filters
              {Object.values(filters).some(v => v !== 'all' && v !== 0 && v !== 'popular') && (
                <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </Button>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map(option => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
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
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Categories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setFilters({ ...filters, category: category.id })}
                        className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
                          filters.category === category.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <span>{category.icon}</span>
                        <span>{category.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="10"
                      value={filters.priceRange[1]}
                      onChange={(e) => setFilters({ 
                        ...filters, 
                        priceRange: [filters.priceRange[0], parseInt(e.target.value)] 
                      })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>$0</span>
                      <span>$500</span>
                      <span>$1000+</span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Minimum Rating: {filters.rating}+
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setFilters({ ...filters, rating })}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          filters.rating >= rating
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        <FiStar className={`w-5 h-5 ${filters.rating >= rating ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {attractions.length} Attractions Found
        </h2>
        <button
          onClick={() => setFilters({ category: 'all', priceRange: [0, 1000], rating: 0, sortBy: 'popular' })}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Clear all filters
        </button>
      </div>

      {/* Attractions Grid */}
      {attractions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {attractions.map((attraction, index) => (
              <motion.div
                key={attraction.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                onMouseEnter={() => setActiveAttraction(attraction.id)}
                onMouseLeave={() => setActiveAttraction(null)}
              >
                <Card className="h-full overflow-hidden group cursor-pointer border hover:border-blue-300 transition-all duration-300">
                  {/* Image with Overlay */}
                  <div className="relative h-48 overflow-hidden">
                    {attraction.image ? (
                      <img 
                        src={attraction.image} 
                        alt={attraction.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <FiMap className="w-12 h-12 text-white opacity-80" />
                      </div>
                    )}
                    
                    {/* Image Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(attraction.id);
                      }}
                      className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    >
                      {favorites.includes(attraction.id) ? (
                        <FiHeart className="w-5 h-5 text-red-500 fill-current" />
                      ) : (
                        <FaRegHeart className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                    
                    {/* Category Badge */}
                    <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-sm font-medium rounded-full">
                      {attraction.category || 'Tour'}
                    </span>
                    
                    {/* Price Overlay */}
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg shadow-lg">
                        {formatCurrency(attraction.price)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {attraction.name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{attraction.rating?.toFixed(1) || '4.5'}</span>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <FiMapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="line-clamp-1">{attraction.location}</span>
                      </div>
                      <div className="flex items-center">
                        <FiClock className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span>{attraction.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <FiUsers className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span>Max {attraction.maxGroupSize || 10} people</span>
                      </div>
                    </div>

                    <p className="text-gray-600 line-clamp-2 mb-4">
                      {attraction.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => navigate(`/attractions/${attraction.id}`)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                      >
                        View details
                        <FiChevronRight className="w-4 h-4 ml-1" />
                      </button>
                      
                      <Button
                        size="sm"
                        onClick={() => setBookingModal({ open: true, attraction })}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6">
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
              <FiMap className="w-12 h-12 text-gray-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No attractions found
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          <Button
            onClick={() => {
              setSearchQuery('');
              setFilters({ category: 'all', priceRange: [0, 1000], rating: 0, sortBy: 'popular' });
            }}
            variant="outline"
          >
            Clear all filters
          </Button>
        </div>
      )}

      {/* Booking Modal */}
      <Modal
        isOpen={bookingModal.open}
        onClose={() => {
          setBookingModal({ open: false, attraction: null });
          setBookingData({ date: '', partySize: 1 });
        }}
        title="Book Your Experience"
        size="lg"
      >
        <div className="space-y-6">
          {/* Attraction Summary */}
          {bookingModal.attraction && (
            <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
              <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                {bookingModal.attraction.image ? (
                  <img 
                    src={bookingModal.attraction.image} 
                    alt={bookingModal.attraction.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <FiMap className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  {bookingModal.attraction.name}
                </h3>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center">
                    <FiMapPin className="w-4 h-4 mr-1" />
                    {bookingModal.attraction.location}
                  </span>
                  <span className="flex items-center">
                    <FiClock className="w-4 h-4 mr-1" />
                    {bookingModal.attraction.duration}
                  </span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(bookingModal.attraction.price)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiCalendar className="w-4 h-4 inline mr-2" />
                Select Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={bookingData.date}
                onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Party Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiUsers className="w-4 h-4 inline mr-2" />
                Party Size
              </label>
              <div className="flex items-center">
                <button
                  onClick={() => setBookingData({ 
                    ...bookingData, 
                    partySize: Math.max(1, bookingData.partySize - 1) 
                  })}
                  className="w-10 h-10 border border-gray-300 rounded-l-xl flex items-center justify-center hover:bg-gray-50"
                >
                  <span className="text-lg">-</span>
                </button>
                <input
                  type="number"
                  min="1"
                  max={bookingModal.attraction?.maxGroupSize || 20}
                  value={bookingData.partySize}
                  onChange={(e) => setBookingData({ 
                    ...bookingData, 
                    partySize: Math.min(
                      bookingModal.attraction?.maxGroupSize || 20,
                      Math.max(1, parseInt(e.target.value) || 1)
                    )
                  })}
                  className="flex-1 px-4 py-3 border-y border-gray-300 text-center focus:outline-none"
                />
                <button
                  onClick={() => setBookingData({ 
                    ...bookingData, 
                    partySize: Math.min(
                      bookingModal.attraction?.maxGroupSize || 20,
                      bookingData.partySize + 1
                    )
                  })}
                  className="w-10 h-10 border border-gray-300 rounded-r-xl flex items-center justify-center hover:bg-gray-50"
                >
                  <span className="text-lg">+</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Max {bookingModal.attraction?.maxGroupSize || 20} people per booking
              </p>
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Requests (Optional)
            </label>
            <textarea
              value={bookingData.specialRequests || ''}
              onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
              placeholder="Any dietary restrictions, accessibility needs, or special preferences..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
            />
          </div>

          {/* Availability Check */}
          {bookingData.date && bookingModal.attraction && (
            <div className={`p-4 rounded-xl border ${
              isGuideAvailable(bookingModal.attraction.guideId)
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start">
                {isGuideAvailable(bookingModal.attraction.guideId) ? (
                  <FiCheck className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                ) : (
                  <FiX className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                )}
                <div>
                  <p className="font-medium">
                    {isGuideAvailable(bookingModal.attraction.guideId)
                      ? '✅ Available for your selected date!'
                      : '❌ Not available on selected date'
                    }
                  </p>
                  {isGuideAvailable(bookingModal.attraction.guideId) && (
                    <p className="text-sm text-gray-600 mt-1">
                      Perfect! Your guide is available on {formatDate(bookingData.date)}.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Price Summary */}
          {bookingModal.attraction && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Price per person</span>
                <span className="font-medium">{formatCurrency(bookingModal.attraction.price)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Number of people</span>
                <span className="font-medium">{bookingData.partySize}</span>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(bookingModal.attraction.price * bookingData.partySize)}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setBookingModal({ open: false, attraction: null });
                setBookingData({ date: '', partySize: 1 });
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBook}
              disabled={!bookingData.date || !isGuideAvailable(bookingModal.attraction?.guideId)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExploreAttractions;