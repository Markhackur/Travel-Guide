import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';
import Loader from './Loader';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'btn bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      type={type} 
      className={cn(
        'btn',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      onClick={onClick}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Loader size="sm" />
          Loading...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;

