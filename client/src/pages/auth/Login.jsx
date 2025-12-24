import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiUser,
  FiChevronRight,
  FiCheckCircle,
  FiShield,
  FiGlobe,
  FiMapPin,
  FiStar
} from 'react-icons/fi';
import { 
  FaGoogle,
  FaApple,
  FaFacebookF
} from 'react-icons/fa';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState(null);
  const [isHovering, setIsHovering] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  // Animated background gradients
  const [gradientPosition, setGradientPosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth) * 100;
    const y = (clientY / window.innerHeight) * 100;
    setGradientPosition({ x, y });
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await login(data);
    setIsLoading(false);

    if (result.success) {
      toast.success('Welcome back! Redirecting to dashboard...', {
        icon: '👋',
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } else {
      toast.error(result.error || 'Login failed. Please check your credentials.', {
        icon: '⚠️',
      });
    }
  };

  const handleDemoLogin = async (type) => {
    setActiveDemo(type);
    const credentials = type === 'traveller' 
      ? { email: 'traveller@test.com', password: 'pass123' }
      : { email: 'guide@test.com', password: 'pass123' };
    
    setValue('email', credentials.email);
    setValue('password', credentials.password);
    
    setIsLoading(true);
    const result = await login(credentials);
    setIsLoading(false);

    if (result.success) {
      toast.success(`Welcome ${type}!`, {
        icon: '🎉',
      });
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  };

  const socialLogins = [
    { icon: <FaGoogle />, label: 'Google', color: 'bg-red-500 hover:bg-red-600' },
    { icon: <FaApple />, label: 'Apple', color: 'bg-gray-800 hover:bg-gray-900' },
    { icon: <FaFacebookF />, label: 'Facebook', color: 'bg-blue-600 hover:bg-blue-700' },
  ];

  const benefits = [
    { icon: <FiGlobe />, text: 'Global Destinations', subtext: 'Access 1000+ locations' },
    { icon: <FiUser />, text: 'Expert Guides', subtext: 'Certified professionals' },
    { icon: <FiStar />, text: 'Premium Experience', subtext: '5-star rated service' },
    { icon: <FiShield />, text: 'Secure Booking', subtext: 'Encrypted & safe' },
  ];

  return (
    <div 
      className="min-h-screen flex bg-gray-900 overflow-hidden relative"
      onMouseMove={handleMouseMove}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Overlay */}
        <div 
          className="absolute inset-0 transition-all duration-700 ease-out"
          style={{
            background: `radial-gradient(circle at ${gradientPosition.x}% ${gradientPosition.y}%, 
              rgba(59, 130, 246, 0.15) 0%, 
              rgba(139, 92, 246, 0.1) 25%, 
              rgba(16, 185, 129, 0.05) 50%, 
              transparent 70%)`,
          }}
        />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(to right, #fff 1px, transparent 1px),
                              linear-gradient(to bottom, #fff 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
        
        {/* Floating Orbs */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10"
            style={{
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              left: `${20 + i * 15}%`,
              top: `${10 + i * 20}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Left Side - Enhanced Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10">
        <div className="w-full p-12 flex flex-col justify-between">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white"
          >
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-16">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <FiMapPin className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">TouristGuide</h1>
                <p className="text-sm text-gray-400">AI-Powered Travel Platform</p>
              </div>
            </div>

            {/* Hero Content */}
            <div className="mb-12">
              <motion.h1
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-6xl font-bold mb-6 leading-tight"
              >
                Welcome Back to 
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Your Journey
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="text-xl text-gray-300 max-w-lg"
              >
                Continue your adventure with personalized recommendations, expert guides, and seamless planning.
              </motion.p>
            </div>

            {/* Benefits Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="grid grid-cols-2 gap-4 mb-12"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <div className="text-blue-400">{benefit.icon}</div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{benefit.text}</h3>
                      <p className="text-sm text-gray-400">{benefit.subtext}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="flex items-center justify-between max-w-md"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-white">50K+</div>
                <div className="text-sm text-gray-400">Travelers</div>
              </div>
              <div className="h-8 w-px bg-gray-700"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">4.9</div>
                <div className="text-sm text-gray-400">Avg Rating</div>
              </div>
              <div className="h-8 w-px bg-gray-700"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-sm text-gray-400">Support</div>
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

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Form Container with Glass Effect */}
          <div 
            className="bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-gray-700/50 shadow-2xl overflow-hidden"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Glow Effect */}
            <motion.div
              animate={{
                opacity: isHovering ? 1 : 0.5,
                scale: isHovering ? 1.02 : 1,
              }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl"
            />
            
            <div className="relative p-8 md:p-10">
              {/* Header */}
              <div className="text-center mb-10">
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ duration: 0.6, type: "spring" }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-lg"
                >
                  <FiUser className="w-10 h-10 text-white" />
                </motion.div>
                
                <motion.h2 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="text-3xl font-bold text-white mb-2"
                >
                  Welcome Back
                </motion.h2>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-gray-400"
                >
                  Sign in to access your personalized dashboard
                </motion.p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    leftIcon={<FiMail className="text-gray-400" />}
                    error={errors.email?.message}
                    className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <div className="relative">
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
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
                      className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                    />
                  </div>
                </motion.div>

                {/* Options */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="flex items-center justify-between"
                >
                  <label className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 rounded border border-gray-600 peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-all duration-200 flex items-center justify-center group-hover:border-blue-400">
                        <FiCheckCircle className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <span className="ml-2 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                      Remember me
                    </span>
                  </label>
                  
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors group"
                  >
                    Forgot password?
                    <span className="inline-block ml-1 transform group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </Link>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full h-12 rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl relative overflow-hidden group"
                    isLoading={isLoading}
                  >
                    <span className="relative z-10">Sign In</span>
                    <FiChevronRight className="ml-2 w-5 h-5 relative z-10" />
                    {/* Button Shine Effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </Button>
                </motion.div>
              </form>

              

              {/* Sign Up Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="text-center mt-8 pt-6 border-t border-gray-700"
              >
                <p className="text-gray-400">
                  New to TouristGuide?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-blue-400 hover:text-blue-300 transition-colors group"
                  >
                    Create an account
                    <span className="inline-block ml-1 transform group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </Link>
                </p>
              </motion.div>
            </div>

            {/* Security Badge */}
            <div className="bg-gray-900/50 border-t border-gray-700 px-6 py-3">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                <FiShield className="w-4 h-4 text-green-400" />
                <span>Secure SSL Encryption • Your data is protected</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Background Decorative Elements */}
        <div className="absolute top-8 right-8 opacity-10">
          <div className="w-64 h-64 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 blur-3xl"></div>
        </div>
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
              className="bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700"
            >
              <div className="flex flex-col items-center">
                <Loader size="large" variant="gradient" />
                <p className="mt-4 text-white font-medium">Authenticating...</p>
                <p className="text-sm text-gray-400 mt-1">Please wait a moment</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile View Alert */}
      <div className="lg:hidden absolute bottom-4 left-4 right-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
        >
          <p className="text-white text-sm text-center">
            For the best experience, please use a larger screen or rotate your device.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;