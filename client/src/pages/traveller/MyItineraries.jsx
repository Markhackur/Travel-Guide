import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { itineraryAPI } from '../../api';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { formatDate as formatDateHelper, daysBetween } from '../../utils/helpers';
import toast from 'react-hot-toast';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiDollarSign,
  FiEye,
  FiEdit,
  FiTrash2,
  FiShare2,
  FiDownload,
  FiPlus,
  FiFilter,
  FiSearch,
  FiChevronRight,
  FiStar,
  FiNavigation
} from 'react-icons/fi';

const MyItineraries = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchItineraries();
  }, []);

  const fetchItineraries = async () => {
    try {
      setLoading(true);
      const response = await itineraryAPI.getAll();
      setItineraries(response.data.itineraries || []);
    } catch (error) {
      toast.error('Failed to fetch itineraries');
    } finally {
      setLoading(false);
    }
  };

  const deleteItinerary = async (id) => {
    if (!window.confirm('Are you sure you want to delete this itinerary?')) {
      return;
    }

    try {
      setDeletingId(id);
      await itineraryAPI.delete(id);
      toast.success('Itinerary deleted successfully');
      fetchItineraries();
    } catch (error) {
      toast.error('Failed to delete itinerary');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredItineraries = itineraries.filter(itinerary => {
    if (searchQuery && !itinerary.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedStatus !== 'all' && itinerary.status !== selectedStatus) {
      return false;
    }
    return true;
  });

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    archived: 'bg-purple-100 text-purple-800',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" />
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
          <h1 className="text-3xl font-bold text-gray-900">My Itineraries</h1>
          <p className="text-gray-600 mt-1">Plan and manage your travel itineraries</p>
        </div>
        
        <Link to="/ai-planner">
          <Button variant="gradient" className="mt-4 md:mt-0 flex items-center">
            <FiPlus className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </Link>
      </motion.div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search itineraries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Itineraries Grid */}
      {filteredItineraries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredItineraries.map((itinerary, index) => (
              <motion.div
                key={itinerary.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full overflow-hidden group cursor-pointer border hover:border-blue-300 transition-all duration-300">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {itinerary.title}
                        </h3>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            statusColors[itinerary.status] || 'bg-gray-100 text-gray-800'
                          }`}>
                            {itinerary.status}
                          </span>
                          <span className="text-sm text-gray-600">
                            {daysBetween(itinerary.startDate, itinerary.endDate)} days
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          ${itinerary.budget || '0'}
                        </div>
                        <div className="text-sm text-gray-600">Budget</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <FiCalendar className="w-4 h-4 mr-2" />
                        {formatDateHelper(itinerary.startDate)}
                      </span>
                      <span className="flex items-center">
                        <FiUsers className="w-4 h-4 mr-2" />
                        {itinerary.travelers || 1} traveler(s)
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">
                      {truncateText(itinerary.description, 120)}
                    </p>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Destinations:</span>
                        <span className="font-medium">{itinerary.destinations?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Activities:</span>
                        <span className="font-medium">{itinerary.activities?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium">{formatDateHelper(itinerary.updatedAt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/itineraries/${itinerary.id}`}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                        >
                          <FiEye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                        <Link
                          to={`/itineraries/${itinerary.id}/edit`}
                          className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center"
                        >
                          <FiEdit className="w-4 h-4 mr-1" />
                          Edit
                        </Link>
                      </div>
                      
                      <button
                        onClick={() => deleteItinerary(itinerary.id)}
                        disabled={deletingId === itinerary.id}
                        className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center disabled:opacity-50"
                      >
                        {deletingId === itinerary.id ? (
                          <>
                            <Loader size="sm" className="mr-1" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <FiTrash2 className="w-4 h-4 mr-1" />
                            Delete
                          </>
                        )}
                      </button>
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
              <FiMapPin className="w-12 h-12 text-gray-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No itineraries found
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            {searchQuery || selectedStatus !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Create your first travel itinerary to get started!'}
          </p>
          <Link to="/ai-planner">
            <Button variant="gradient" className="flex items-center">
              <FiPlus className="w-4 h-4 mr-2" />
              Create Your First Itinerary
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyItineraries;