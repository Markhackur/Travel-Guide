import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { itineraryAPI } from '../../api';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import { 
  FiMapPin, 
  FiCalendar, 
  FiDollarSign, 
  FiStar,
  FiCompass,
  FiNavigation,
  FiClock,
  FiUsers,
  FiChevronRight,
  FiThumbsUp,
  FiCoffee,
  FiCamera,
  FiSun,
  FiMoon,
  FiChevronDown,
  FiZap,
  FiDownload
} from 'react-icons/fi';
import { 
  FaRobot,
  FaRegHeart,
  FaRegLightbulb,
  FaRegMap
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const AIPlanner = () => {
  const [generatedItinerary, setGeneratedItinerary] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('plan');
  const [tripType, setTripType] = useState('standard');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const navigate = useNavigate();
  const { user } = useAuth();

  const preferences = watch('preferences', '');

  const onSubmit = async (data) => {
    if (!user) {
      toast.error('Please login to generate itineraries', {
        icon: '🔒',
      });
      navigate('/login');
      return;
    }

    try { 
      setIsGenerating(true);
      
      // Enhanced AI request with additional parameters
      const enhancedData = {
        ...data,
        tripType,
        includeTransportation: data.includeTransportation || false,
        includeAccommodation: data.includeAccommodation || false,
        travelStyle: data.travelStyle || 'balanced'
      };

      const response = await itineraryAPI.generateAI(enhancedData);
      
      const itineraryData = response.data.itinerary;
      if (itineraryData && !itineraryData.error) {
        // Save the generated itinerary
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = new Date(Date.now() + (data.days - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const createPayload = {
          title: `AI Trip to ${data.city} - ${tripType}`,
          startDate,
          endDate,
          description: `AI-generated ${tripType} trip to ${data.city}`,
          budget: data.budget,
          items: itineraryData.items || [],
          preferences: data.preferences,
          tags: [tripType, data.city]
        };
        
        await itineraryAPI.create(createPayload);
        
        setGeneratedItinerary(itineraryData);
        toast.success('✨ Perfect itinerary generated and saved!', {
          duration: 4000,
          icon: '🎉',
          style: {
            background: '#10B981',
            color: '#fff',
          },
        });
        setActiveTab('results');
      } else {
        setGeneratedItinerary(itineraryData);
        setActiveTab('results');
      }
    } catch (error) {
      console.error('AI Planner error:', error);
      const message = error.response?.data?.message;
      if (message && message.includes('No attractions found')) {
        setGeneratedItinerary({ error: message });
        setActiveTab('results');
      } else {
        toast.error(message || 'Failed to generate itinerary. Please try again.', {
          icon: '❌',
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const tripTypes = [
    { id: 'standard', label: 'Standard', icon: FiCompass, color: 'from-blue-500 to-cyan-500' },
    { id: 'adventure', label: 'Adventure', icon: FiNavigation, color: 'from-emerald-500 to-green-500' },
    { id: 'luxury', label: 'Luxury', icon: FiStar, color: 'from-amber-500 to-orange-500' },
    { id: 'budget', label: 'Budget', icon: FiDollarSign, color: 'from-purple-500 to-pink-500' },
  ];

  const travelStyles = [
    { id: 'relaxed', label: 'Relaxed', icon: FiCoffee },
    { id: 'balanced', label: 'Balanced', icon: FiSun },
    { id: 'active', label: 'Active', icon: FiZap },
  ];

  const preferenceTags = [
    'Historical', 'Food', 'Art', 'Nature', 'Shopping', 'Nightlife', 
    'Family', 'Romantic', 'Photography', 'Local Culture', 'Adventure'
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-8 md:p-10"
      >
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <FaRobot className="w-6 h-6 text-blue-400" />
                <span className="text-blue-400 text-sm font-medium">AI-Powered Planning</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                AI Travel Planner
                <span className="block text-2xl text-gray-300 mt-2">
                  Let AI craft your perfect journey
                </span>
              </h1>
              
              <p className="text-gray-300 text-lg max-w-2xl">
                Get personalized itineraries based on your preferences, budget, and travel style.
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="hidden lg:block"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <FaRobot className="w-12 h-12 text-white" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('plan')}
          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
            activeTab === 'plan' 
              ? 'bg-white text-gray-900 shadow-lg' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Plan Your Trip
        </button>
        <button
          onClick={() => setActiveTab('results')}
          disabled={!generatedItinerary}
          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
            activeTab === 'results' 
              ? 'bg-white text-gray-900 shadow-lg' 
              : 'text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          Results
          {generatedItinerary && !generatedItinerary.error && (
            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
              Ready
            </span>
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Planning Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Create Your Perfect Itinerary
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Destination City"
                    placeholder="e.g., Paris, Tokyo, Barcelona"
                    leftIcon={<FiMapPin className="text-gray-400" />}
                    error={errors.city?.message}
                    className="bg-gray-50 border-gray-200 focus:border-blue-500"
                    {...register('city', { 
                      required: 'Destination is required',
                      minLength: { value: 2, message: 'Enter a valid city name' }
                    })}
                  />
                </div>

                <div>
                  <Input
                    label="Number of Days"
                    type="number"
                    placeholder="3-30 days"
                    leftIcon={<FiCalendar className="text-gray-400" />}
                    error={errors.days?.message}
                    className="bg-gray-50 border-gray-200 focus:border-blue-500"
                    {...register('days', {
                      required: 'Number of days is required',
                      min: { value: 1, message: 'Minimum 1 day' },
                      max: { value: 30, message: 'Maximum 30 days' },
                    })}
                  />
                </div>
              </div>

              {/* Trip Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Trip Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {tripTypes.map((type) => (
                    <motion.button
                      key={type.id}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setTripType(type.id)}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                        tripType === type.id
                          ? `border-transparent bg-gradient-to-br ${type.color} text-white shadow-lg`
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <type.icon className={`w-6 h-6 mb-2 ${tripType === type.id ? 'text-white' : 'text-gray-400'}`} />
                        <span className="font-medium">{type.label}</span>
                      </div>
                      {tripType === type.id && (
                        <div className="absolute -top-2 -right-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <Input
                  label="Budget ($)"
                  type="number"
                  placeholder="e.g., 1500"
                  leftIcon={<FiDollarSign className="text-gray-400" />}
                  {...register('budget')}
                  className="bg-gray-50 border-gray-200 focus:border-blue-500"
                />
                {watch('budget') && (
                  <div className="mt-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                        style={{ width: `${Math.min((watch('budget') / 5000) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Budget</span>
                      <span>${watch('budget')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What interests you?
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {preferenceTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const currentPrefs = watch('preferences') || '';
                        const newPrefs = currentPrefs.includes(tag)
                          ? currentPrefs.replace(tag, '').replace(/,\s*,/, ',').replace(/^,|,$/g, '')
                          : currentPrefs ? `${currentPrefs}, ${tag}` : tag;
                        // Use setValue if using react-hook-form setValue
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
                        preferences?.includes(tag)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                      {preferences?.includes(tag) && ' ✓'}
                    </button>
                  ))}
                </div>
                <Input
                  placeholder="Add custom preferences (e.g., Art museums, local cuisine)"
                  {...register('preferences')}
                  className="bg-gray-50 border-gray-200 focus:border-blue-500"
                />
              </div>

              {/* Advanced Options */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 mb-3"
                >
                  Advanced Options
                  <FiChevronDown className={`ml-1 w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                        <div>
                          <label className="flex items-center text-sm text-gray-600">
                            <input
                              type="checkbox"
                              {...register('includeTransportation')}
                              className="mr-2 rounded border-gray-300"
                            />
                            Include transportation
                          </label>
                        </div>
                        <div>
                          <label className="flex items-center text-sm text-gray-600">
                            <input
                              type="checkbox"
                              {...register('includeAccommodation')}
                              className="mr-2 rounded border-gray-300"
                            />
                            Include accommodation
                          </label>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Travel Style
                          </label>
                          <div className="flex space-x-3">
                            {travelStyles.map((style) => (
                              <label
                                key={style.id}
                                className="flex-1 flex flex-col items-center p-3 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 transition-colors"
                              >
                                <input
                                  type="radio"
                                  value={style.id}
                                  {...register('travelStyle')}
                                  className="sr-only"
                                />
                                <style.icon className="w-5 h-5 text-gray-400 mb-1" />
                                <span className="text-sm">{style.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full h-14 rounded-xl font-semibold text-lg"
                  isLoading={isGenerating}
                >
                  <FaRobot className="w-5 h-5 mr-2" />
                  {isGenerating ? 'Generating Itinerary...' : 'Generate Smart Itinerary'}
                  <FiZap className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </form>
          </Card>
        </motion.div>

        {/* Right Column - Results Preview */}
        <div className="lg:col-span-1">
          <Card className="h-full sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Your Itinerary Preview
            </h2>
            
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 mx-auto mb-4">
                    <div className="w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-gray-600 font-medium mb-2">AI is planning your trip...</p>
                  <p className="text-sm text-gray-500">This may take a few moments</p>
                </motion.div>
              ) : generatedItinerary ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {generatedItinerary.error ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center">
                        <FaRegMap className="w-8 h-8 text-red-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No Itinerary Found
                      </h3>
                      <p className="text-gray-600">{generatedItinerary.error}</p>
                      <Button
                        onClick={() => setActiveTab('plan')}
                        variant="outline"
                        className="mt-4"
                      >
                        Try Different Preferences
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {generatedItinerary.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <FiCalendar className="w-4 h-4 mr-1" />
                            {generatedItinerary.days || 'Multi-day'} trip
                          </span>
                          <span className="flex items-center">
                            <FiStar className="w-4 h-4 mr-1" />
                            {generatedItinerary.rating || 'Custom'} experience
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-bold text-gray-900">Daily Highlights</h4>
                        {generatedItinerary.items?.map((item, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-semibold text-gray-900">{item.day}</h5>
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                {item.duration || 'Full day'}
                              </span>
                            </div>
                            <ul className="space-y-1 text-sm text-gray-600">
                              {item.activities?.slice(0, 3).map((activity, i) => (
                                <li key={i} className="flex items-start">
                                  <FiChevronRight className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                  {activity}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex space-x-3">
                        <Button
                          onClick={() => navigate('/itineraries')}
                          variant="gradient"
                          className="flex-1"
                        >
                          <FiDownload className="w-4 h-4 mr-2" />
                          Save & View
                        </Button>
                        <Button
                          onClick={() => {
                            setActiveTab('plan');
                            setGeneratedItinerary(null);
                          }}
                          variant="outline"
                        >
                          New Plan
                        </Button>
                      </div>
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                    <FaRegLightbulb className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Your Itinerary Awaits
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Fill in your travel preferences and let AI create the perfect plan for you.
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p className="flex items-center">
                      <FiThumbsUp className="w-4 h-4 mr-2 text-green-500" />
                      Personalized recommendations
                    </p>
                    <p className="flex items-center">
                      <FiClock className="w-4 h-4 mr-2 text-blue-500" />
                      Time-optimized schedules
                    </p>
                    <p className="flex items-center">
                      <FiDollarSign className="w-4 h-4 mr-2 text-purple-500" />
                      Budget-friendly options
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIPlanner;