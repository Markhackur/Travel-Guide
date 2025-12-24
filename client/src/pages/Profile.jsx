import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { travellerAPI } from '../api';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Tabs from '../components/common/Tabs';
import UploadAvatar from '../components/common/UploadAvatar';
import { 
  getInitials, 
  formatDate, 
  formatCurrency 
} from '../utils/helpers';
import { 
  FiUser, 
  FiMail, 
  FiMapPin, 
  FiCalendar, 
  FiGlobe,
  FiEdit2,
  FiSave,
  FiCamera,
  FiShield,
  FiBell,
  FiCreditCard
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar);
  const [stats, setStats] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      preferredLocation: user?.preferredLocation || '',
      bio: user?.bio || '',
    },
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await travellerAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await travellerAPI.updateProfile(data);
      updateUser(response.data);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await travellerAPI.uploadAvatar(formData);
      updateUser(response.data);
      setAvatarPreview(response.data.avatar);
      toast.success('Avatar updated successfully');
    } catch (error) {
      toast.error('Failed to upload avatar');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'billing', label: 'Billing', icon: FiCreditCard },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>
        {isEditing ? (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setIsEditing(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit(onSubmit)}
              isLoading={loading}
              className="flex items-center gap-2"
            >
              <FiSave />
              Save Changes
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2"
          >
            <FiEdit2 />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      {user?.role === 'traveller' && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Total Bookings</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalBookings}</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <FiCalendar className="text-white text-xl" />
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Total Spent</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(stats.totalSpent)}
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <FiCreditCard className="text-white text-xl" />
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Itineraries</p>
                <p className="text-2xl font-bold text-purple-900">{stats.totalItineraries}</p>
              </div>
              <div className="p-3 bg-purple-500 rounded-full">
                <FiGlobe className="text-white text-xl" />
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Avatar & Basic Info */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative group mb-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-4xl font-bold">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={user?.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(user?.name)
                  )}
                </div>
                {isEditing && (
                  <UploadAvatar
                    onUpload={handleAvatarUpload}
                    className="absolute bottom-0 right-0"
                  />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <div className="mt-2">
                <span className="inline-block px-3 py-1 text-sm font-medium bg-primary-100 text-primary-800 rounded-full">
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Member Since */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center text-gray-600">
                <FiCalendar className="mr-2" />
                <span className="text-sm">Member since {formatDate(user?.createdAt)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Tabs Content */}
        <div className="lg:col-span-2">
          <Card>
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="mt-6"
              >
                {activeTab === 'profile' && (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Full Name"
                        icon={FiUser}
                        {...register('name', { 
                          required: 'Name is required',
                          minLength: {
                            value: 2,
                            message: 'Name must be at least 2 characters'
                          }
                        })}
                        error={errors.name?.message}
                        disabled={!isEditing}
                      />
                      <Input
                        label="Email"
                        type="email"
                        icon={FiMail}
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        error={errors.email?.message}
                        disabled={!isEditing}
                      />
                      <Input
                        label="Phone Number"
                        type="tel"
                        {...register('phone')}
                        disabled={!isEditing}
                      />
                      {user?.role === 'traveller' && (
                        <Input
                          label="Preferred Location"
                          icon={FiMapPin}
                          placeholder="e.g., Paris, France"
                          {...register('preferredLocation')}
                          disabled={!isEditing}
                        />
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        {...register('bio')}
                        rows={4}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    {user?.role === 'guide' && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start">
                          <FiShield className="text-blue-600 mt-0.5 mr-3" />
                          <div>
                            <p className="text-blue-800 font-medium mb-1">
                              Guide Profile Management
                            </p>
                            <p className="text-blue-700 text-sm">
                              Guide profiles are managed through the guide dashboard. 
                              Contact support if you need to update your professional information.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </form>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Change Password
                      </h3>
                      <div className="space-y-4 max-w-md">
                        <Input
                          label="Current Password"
                          type="password"
                          placeholder="Enter current password"
                        />
                        <Input
                          label="New Password"
                          type="password"
                          placeholder="Enter new password"
                        />
                        <Input
                          label="Confirm New Password"
                          type="password"
                          placeholder="Confirm new password"
                        />
                        <Button variant="primary">Update Password</Button>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Two-Factor Authentication
                      </h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">2FA is disabled</p>
                          <p className="text-sm text-gray-600">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Button variant="outline">Enable 2FA</Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Notification Preferences
                    </h3>
                    <div className="space-y-4">
                      {[
                        { id: 'booking', label: 'Booking updates', description: 'Get notified about booking status changes' },
                        { id: 'promo', label: 'Promotions & offers', description: 'Receive special offers and discounts' },
                        { id: 'newsletter', label: 'Newsletter', description: 'Weekly travel tips and inspiration' },
                        { id: 'guide', label: 'Guide messages', description: 'Messages from your assigned guides' },
                      ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{item.label}</p>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'billing' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Payment Methods
                    </h3>
                    {/* Add billing content here */}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;