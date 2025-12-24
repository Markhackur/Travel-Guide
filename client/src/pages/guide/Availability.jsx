import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { guideAPI } from '../../api';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { 
  FiCalendar, 
  FiClock, 
  FiCheckCircle,
  FiXCircle,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiDollarSign,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const GuideAvailability = () => {
  const { register, handleSubmit, watch, setValue, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingSlot, setEditingSlot] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Mock data - in real app, fetch from API
  const mockAvailability = [
    { id: 1, date: '2024-01-15', slots: 5, booked: 2, price: 75, status: 'available' },
    { id: 2, date: '2024-01-16', slots: 8, booked: 5, price: 85, status: 'available' },
    { id: 3, date: '2024-01-17', slots: 0, booked: 0, price: 75, status: 'unavailable' },
    { id: 4, date: '2024-01-18', slots: 10, booked: 3, price: 90, status: 'available' },
    { id: 5, date: '2024-01-19', slots: 6, booked: 6, price: 80, status: 'full' },
  ];

  useEffect(() => {
    // Fetch availability data
    setAvailability(mockAvailability);
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Format date for API
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      await guideAPI.updateAvailability({
        date: formattedDate,
        slots: parseInt(data.slots),
        price: parseFloat(data.price) || 75,
      });
      
      toast.success('Availability updated successfully', {
        icon: '✅',
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });
      
      reset();
      setShowForm(false);
      
      // Update local state
      const newSlot = {
        id: Date.now(),
        date: formattedDate,
        slots: parseInt(data.slots),
        booked: 0,
        price: parseFloat(data.price) || 75,
        status: 'available'
      };
      setAvailability([...availability, newSlot]);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update availability', {
        icon: '❌',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = (id) => {
    setAvailability(availability.filter(slot => slot.id !== id));
    toast.success('Time slot removed', {
      icon: '🗑️',
    });
  };

  const handleToggleAvailability = (id) => {
    setAvailability(availability.map(slot => 
      slot.id === id 
        ? { ...slot, status: slot.status === 'available' ? 'unavailable' : 'available' }
        : slot
    ));
    
    const slot = availability.find(s => s.id === id);
    toast.success(
      `Slot marked as ${slot.status === 'available' ? 'unavailable' : 'available'}`,
      { icon: '🔄' }
    );
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowForm(true);
    
    // Check if slot exists for this date
    const existingSlot = availability.find(
      slot => slot.date === date.toISOString().split('T')[0]
    );
    
    if (existingSlot) {
      setValue('slots', existingSlot.slots);
      setValue('price', existingSlot.price);
      setEditingSlot(existingSlot.id);
    } else {
      setValue('slots', 5);
      setValue('price', 75);
      setEditingSlot(null);
    }
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const slot = availability.find(s => s.date === dateStr);
      
      days.push({
        date,
        dateStr,
        slot,
        isToday: date.toDateString() === new Date().toDateString(),
        isPast: date < new Date().setHours(0, 0, 0, 0),
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  const getSlotStatusColor = (slot) => {
    if (!slot) return 'bg-gray-100';
    switch (slot.status) {
      case 'available': return 'bg-green-100 border-green-200';
      case 'unavailable': return 'bg-red-100 border-red-200';
      case 'full': return 'bg-yellow-100 border-yellow-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  const getSlotStatusText = (slot) => {
    if (!slot) return 'Not set';
    switch (slot.status) {
      case 'available': return `${slot.slots - slot.booked} slots left`;
      case 'unavailable': return 'Unavailable';
      case 'full': return 'Fully booked';
      default: return 'Not set';
    }
  };

  const getDayStats = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const slot = availability.find(s => s.date === dateStr);
    
    if (!slot) {
      return {
        total: 0,
        booked: 0,
        available: 0,
        status: 'not_set'
      };
    }
    
    return {
      total: slot.slots,
      booked: slot.booked,
      available: slot.slots - slot.booked,
      status: slot.status
    };
  };

  const dayStats = getDayStats();

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Availability Manager</h1>
          <p className="text-gray-600 mt-1">
            Manage your schedule, set prices, and track bookings
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button
            onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
            variant="outline"
            className="flex items-center"
          >
            {viewMode === 'calendar' ? (
              <>
                <FiEyeOff className="w-4 h-4 mr-2" />
                List View
              </>
            ) : (
              <>
                <FiEye className="w-4 h-4 mr-2" />
                Calendar View
              </>
            )}
          </Button>
          
          <Button
            onClick={() => {
              setSelectedDate(new Date());
              setShowForm(true);
              setEditingSlot(null);
            }}
            variant="gradient"
            className="flex items-center"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Add Slot
          </Button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Slots', value: availability.reduce((sum, s) => sum + s.slots, 0), color: 'from-blue-500 to-cyan-500' },
          { label: 'Booked', value: availability.reduce((sum, s) => sum + s.booked, 0), color: 'from-green-500 to-emerald-500' },
          { label: 'Available', value: availability.reduce((sum, s) => sum + (s.slots - s.booked), 0), color: 'from-purple-500 to-pink-500' },
          { label: 'Revenue', value: `$${availability.reduce((sum, s) => sum + (s.booked * s.price), 0)}`, color: 'from-amber-500 to-orange-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 text-white shadow-lg`}
          >
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm opacity-90">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        {viewMode === 'calendar' ? (
          <motion.div
            key="calendar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="lg:col-span-2"
          >
            <Card className="h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Calendar View</h2>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    variant="ghost"
                    size="sm"
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </Button>
                  <span className="font-semibold text-gray-900">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                  <Button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    variant="ghost"
                    size="sm"
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.01 }}
                    onClick={() => handleDateSelect(day.date)}
                    className={`relative p-3 rounded-xl text-left transition-all duration-200 ${
                      day.isToday
                        ? 'ring-2 ring-blue-500 ring-offset-2'
                        : 'hover:bg-gray-50'
                    } ${day.isPast ? 'opacity-60' : ''} ${getSlotStatusColor(day.slot)} border`}
                  >
                    <div className="flex flex-col items-start">
                      <span className={`text-lg font-semibold ${
                        day.isToday ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {day.date.getDate()}
                      </span>
                      
                      {day.slot && (
                        <div className="mt-2 space-y-1">
                          <div className="text-xs font-medium">
                            {getSlotStatusText(day.slot)}
                          </div>
                          {day.slot.status === 'available' && (
                            <div className="text-xs text-gray-600">
                              ${day.slot.price}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {day.slot?.booked > 0 && (
                        <div className="absolute top-2 right-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
                  <span className="text-sm text-gray-600">Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                  <span className="text-sm text-gray-600">Unavailable</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
                  <span className="text-sm text-gray-600">Full</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
                  <span className="text-sm text-gray-600">Not set</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          /* List View */
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="lg:col-span-2"
          >
            <Card className="h-full">
              <h2 className="text-xl font-bold text-gray-900 mb-6">All Time Slots</h2>
              
              <div className="space-y-3">
                <AnimatePresence>
                  {availability.map((slot) => (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`p-4 rounded-xl border transition-all duration-200 ${
                        slot.status === 'available'
                          ? 'bg-green-50 border-green-200'
                          : slot.status === 'unavailable'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <FiCalendar className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {new Date(slot.date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </h3>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="flex items-center text-sm text-gray-600">
                                  <FiUser className="w-4 h-4 mr-1" />
                                  {slot.booked}/{slot.slots} booked
                                </span>
                                <span className="flex items-center text-sm text-gray-600">
                                  <FiDollarSign className="w-4 h-4 mr-1" />
                                  ${slot.price}/person
                                </span>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  slot.status === 'available'
                                    ? 'bg-green-100 text-green-800'
                                    : slot.status === 'unavailable'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {slot.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleAvailability(slot.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              slot.status === 'available'
                                ? 'text-green-600 hover:bg-green-100'
                                : 'text-red-600 hover:bg-red-100'
                            }`}
                          >
                            {slot.status === 'available' ? (
                              <FiCheckCircle className="w-5 h-5" />
                            ) : (
                              <FiXCircle className="w-5 h-5" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedDate(new Date(slot.date));
                              setValue('slots', slot.slots);
                              setValue('price', slot.price);
                              setEditingSlot(slot.id);
                              setShowForm(true);
                            }}
                            className="p-2 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="p-2 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Form Sidebar */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-1"
            >
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingSlot ? 'Edit Slot' : 'Add Time Slot'}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiXCircle className="w-5 h-5" />
                  </button>
                </div>

                {/* Selected Date Display */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FiCalendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Selected Date</p>
                      <p className="font-semibold text-gray-900">
                        {selectedDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Day Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-gray-900">{dayStats.total}</div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-green-700">{dayStats.available}</div>
                    <div className="text-xs text-green-600">Available</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-blue-700">{dayStats.booked}</div>
                    <div className="text-xs text-blue-600">Booked</div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input
                    label="Total Slots"
                    type="number"
                    placeholder="e.g., 10"
                    leftIcon={<FiUser className="text-gray-400" />}
                    {...register('slots', {
                      required: 'Slots is required',
                      min: { value: 1, message: 'Must be at least 1' },
                    })}
                  />
                  
                  <Input
                    label="Price per Person ($)"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 75.00"
                    leftIcon={<FiDollarSign className="text-gray-400" />}
                    {...register('price', {
                      required: 'Price is required',
                      min: { value: 1, message: 'Must be at least $1' },
                    })}
                  />
                  
                  <div className="pt-4">
                    <Button
                      type="submit"
                      variant="gradient"
                      className="w-full"
                      isLoading={loading}
                    >
                      {editingSlot ? 'Update Slot' : 'Save Time Slot'}
                    </Button>
                    
                    {editingSlot && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full mt-3 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteSlot(editingSlot)}
                      >
                        <FiTrash2 className="w-4 h-4 mr-2" />
                        Delete Slot
                      </Button>
                    )}
                  </div>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Tips */}
        {!showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="lg:col-span-1"
          >
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
              <h3 className="font-bold text-lg mb-4">Quick Tips</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiClock className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Set availability 2 weeks in advance</p>
                    <p className="text-gray-400 text-xs mt-1">Travelers book early</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiDollarSign className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Adjust prices for weekends</p>
                    <p className="text-gray-400 text-xs mt-1">Higher demand periods</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiUser className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Keep 1-2 slots for last-minute bookings</p>
                    <p className="text-gray-400 text-xs mt-1">Flexibility pays off</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-gray-400 text-sm">
                  Need help managing your schedule?
                  <button className="text-blue-400 hover:text-blue-300 ml-1 font-medium">
                    Contact support
                  </button>
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GuideAvailability;