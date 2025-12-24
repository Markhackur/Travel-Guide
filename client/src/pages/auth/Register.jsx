import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  FiMail, 
  FiLock, 
  FiUser, 
  FiEye, 
  FiEyeOff, 
  FiChevronRight,
  FiCheckCircle,
  FiGlobe,
  FiMapPin,
  FiStar,
  FiBriefcase,
  FiMessageSquare,
  FiAward
} from 'react-icons/fi';
import { 
  FaGoogle,
  FaApple,
  FaFacebookF
} from 'react-icons/fa';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const Register = () => {
  const { register: registerUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('traveller');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [gradientPosition, setGradientPosition] = useState({ x: 50, y: 50 });
  const [formData, setFormData] = useState({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm();

  const password = watch('password');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth) * 100;
    const y = (clientY / window.innerHeight) * 100;
    setGradientPosition({ x, y });
  };

  const handleNextStep = async () => {
    const fields = step === 1 
      ? ['name', 'email', 'password', 'confirmPassword']
      : ['languages', 'bio', 'expertise'];
    
    const isValid = await trigger(fields);
    if (isValid) {
      if (selectedRole === 'guide' && step === 1) {
        setStep(2);
      } else {
        handleSubmit(onSubmit)();
      }
    }
  };

  const handleBackStep = () => {
    setStep(1);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const completeData = {
        ...data,
        role: selectedRole,
      };
      
      const result = await registerUser(completeData);
      setIsLoading(false);

      if (result.success) {
        toast.success(
          `Welcome aboard! Your ${selectedRole} account has been created.`,
          {
            icon: '🎉',
            style: {
              background: '#10B981',
              color: '#fff',
            },
            duration: 4000,
          }
        );
        navigate('/dashboard', { replace: true });
      } else {
        toast.error(result.error || 'Registration failed', {
          icon: '⚠️',
        });
      }
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Registration failed';
      toast.error(errorMessage, {
        icon: '❌',
      });
      console.error('Registration error:', error);
    }
  };

  const roleBenefits = {
    traveller: [
      { icon: <FiGlobe />, title: 'Global Access', desc: 'Explore 1000+ destinations' },
      { icon: <FiStar />, title: 'AI Planning', desc: 'Smart itinerary generation' },
      { icon: <FiMapPin />, title: 'Local Guides', desc: 'Connect with experts' },
    ],
    guide: [
      { icon: <FiBriefcase />, title: 'Earn Money', desc: 'Flexible schedule, great pay' },
      { icon: <FiMessageSquare />, title: 'Build Reputation', desc: 'Grow your client base' },
      { icon: <FiAward />, title: 'Verified Profile', desc: 'Get certified and trusted' },
    ],
  };

  return (
    <div 
      className="min-h-screen flex bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 overflow-hidden relative"
      onMouseMove={handleMouseMove}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Dynamic Gradient */}
        <div 
          className="absolute inset-0 transition-all duration-1000 ease-out"
          style={{
            background: `radial-gradient(circle at ${gradientPosition.x}% ${gradientPosition.y}%, 
              rgba(139, 92, 246, 0.2) 0%, 
              rgba(59, 130, 246, 0.15) 25%, 
              rgba(16, 185, 129, 0.1) 50%, 
              transparent 70%)`,
          }}
        />
        
        {/* Geometric Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(30deg, #fff 2px, transparent 2px),
                              linear-gradient(150deg, #fff 2px, transparent 2px)`,
            backgroundSize: '80px 80px',
          }}
        />
        
        {/* Floating Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10"
            style={{
              width: `${100 + i * 80}px`,
              height: `${100 + i * 80}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, 30, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 20 + i * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Left Side - Registration Info */}
      <div className="hidden lg:flex lg:w-2/5 relative z-10">
        <div className="w-full p-12 flex flex-col justify-between">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white"
          >
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-16">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg"
              >
                <FiMapPin className="w-6 h-6" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold">TouristGuide</h1>
                <p className="text-sm text-gray-400">Join the Travel Revolution</p>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="mb-12">
              <motion.h1
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-5xl font-bold mb-6 leading-tight"
              >
                Start Your
                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Adventure Today
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="text-xl text-gray-300 max-w-md"
              >
                Join thousands of travelers and guides creating unforgettable experiences together.
              </motion.p>
            </div>

            {/* Role Benefits */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="space-y-6 mb-12"
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                Why choose {selectedRole === 'traveller' ? 'Traveler' : 'Guide'}?
              </h3>
              {roleBenefits[selectedRole].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                  whileHover={{ x: 5 }}
                  className="flex items-center space-x-4 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                    <div className="text-purple-400 text-xl">
                      {benefit.icon}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{benefit.title}</h4>
                    <p className="text-sm text-gray-400">{benefit.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Progress Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Registration Progress</span>
                <span className="text-white font-semibold">
                  {selectedRole === 'guide' ? `${step}/2` : '1/1'}
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: selectedRole === 'guide' 
                      ? step === 1 ? '50%' : '100%'
                      : '100%'
                  }}
                  transition={{ duration: 0.6 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="text-gray-500 text-sm"
          >
            © 2024 TouristGuide. All rights reserved.
          </motion.div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-4 md:p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          {/* Form Container */}
          <div className="bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-gray-700/50 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-8 md:p-10 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {step === 1 ? 'Create Your Account' : 'Guide Details'}
                  </h2>
                  <p className="text-gray-400">
                    {step === 1 
                      ? 'Join our community of travelers and guides' 
                      : 'Tell us more about your expertise'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-400">Secure</span>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-10">
              {/* Step 1: Basic Information */}
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Role Selection */}
                    <div className="mb-8">
                      <label className="block text-sm font-medium text-white mb-4">
                        Choose your role
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <motion.button
                          type="button"
                          onClick={() => setSelectedRole('traveller')}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                            selectedRole === 'traveller'
                              ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                              : 'border-gray-700 bg-gray-900/50 hover:border-blue-400'
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <div className={`w-16 h-16 rounded-full mb-4 flex items-center justify-center ${
                              selectedRole === 'traveller'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-gray-800 text-gray-400'
                            }`}>
                              <FiGlobe className="w-8 h-8" />
                            </div>
                            <span className="font-semibold text-white text-lg">Traveller</span>
                            <span className="text-sm text-gray-400 mt-1">Explore & Discover</span>
                          </div>
                          {selectedRole === 'traveller' && (
                            <div className="absolute -top-2 -right-2">
                              <FiCheckCircle className="w-6 h-6 text-blue-400" />
                            </div>
                          )}
                        </motion.button>

                        <motion.button
                          type="button"
                          onClick={() => setSelectedRole('guide')}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                            selectedRole === 'guide'
                              ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                              : 'border-gray-700 bg-gray-900/50 hover:border-purple-400'
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <div className={`w-16 h-16 rounded-full mb-4 flex items-center justify-center ${
                              selectedRole === 'guide'
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'bg-gray-800 text-gray-400'
                            }`}>
                              <FiBriefcase className="w-8 h-8" />
                            </div>
                            <span className="font-semibold text-white text-lg">Guide</span>
                            <span className="text-sm text-gray-400 mt-1">Share & Earn</span>
                          </div>
                          {selectedRole === 'guide' && (
                            <div className="absolute -top-2 -right-2">
                              <FiCheckCircle className="w-6 h-6 text-purple-400" />
                            </div>
                          )}
                        </motion.button>
                      </div>
                    </div>

                    {/* Basic Form */}
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <Input
                          label="Full Name"
                          placeholder="John Doe"
                          leftIcon={<FiUser className="text-gray-400" />}
                          error={errors.name?.message}
                          className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                          {...register('name', {
                            required: 'Name is required',
                            minLength: {
                              value: 2,
                              message: 'Name must be at least 2 characters',
                            },
                          })}
                        />

                        <Input
                          label="Email Address"
                          type="email"
                          placeholder="you@example.com"
                          leftIcon={<FiMail className="text-gray-400" />}
                          error={errors.email?.message}
                          className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                          {...register('email', {
                            required: 'Email is required',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Invalid email address',
                            },
                          })}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <Input
                          label="Password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="At least 6 characters"
                          leftIcon={<FiLock className="text-gray-400" />}
                          rightIcon={
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                          }
                          error={errors.password?.message}
                          className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                          {...register('password', {
                            required: 'Password is required',
                            minLength: {
                              value: 6,
                              message: 'Password must be at least 6 characters',
                            },
                          })}
                        />

                        <Input
                          label="Confirm Password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          leftIcon={<FiLock className="text-gray-400" />}
                          error={errors.confirmPassword?.message}
                          className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                          {...register('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: (value) =>
                              value === password || 'Passwords do not match',
                          })}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-6">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={handleNextStep}
                          variant="gradient"
                          className="w-full h-14 rounded-xl font-semibold text-lg"
                        >
                          Continue
                          <FiChevronRight className="ml-2 w-5 h-5" />
                        </Button>
                      </motion.div>
                      
                      <div className="text-center mt-6">
                        <p className="text-gray-400">
                          Already have an account?{' '}
                          <Link
                            to="/login"
                            className="font-semibold text-blue-400 hover:text-blue-300 transition-colors group"
                          >
                            Sign in here
                            <span className="inline-block ml-1 transform group-hover:translate-x-1 transition-transform">
                              →
                            </span>
                          </Link>
                        </p>
                      </div>

                      
                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-8">
                        <Button
                          onClick={handleBackStep}
                          variant="outline"
                          className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                        >
                          Back
                        </Button>
                        
                        <Button
                          onClick={handleNextStep}
                          variant="gradient"
                          className="flex-1 from-purple-500 to-pink-500"  
                          isLoading={isLoading}
                        >
                          Complete Registration
                          <FiCheckCircle className="ml-2 w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Terms */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-6 text-gray-500 text-sm"
          >
            By registering, you agree to our{' '}
            <Link to="/terms" className="text-blue-400 hover:text-blue-300">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-blue-400 hover:text-blue-300">
              Privacy Policy
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4">
                <div className="w-full h-full border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-white font-medium text-lg">Creating your account...</p>
              <p className="text-gray-400 mt-2">
                Welcome to TouristGuide, {selectedRole === 'traveller' ? 'Traveler' : 'Guide'}!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Message */}
      <div className="lg:hidden absolute bottom-4 left-4 right-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
        >
          <p className="text-white text-sm text-center">
            Best viewed on desktop for complete experience
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;