import { motion } from 'framer-motion';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  animate = false,
  ...props
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-purple-100 text-purple-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-cyan-100 text-cyan-800',
    dark: 'bg-gray-800 text-white',
    outline: 'bg-transparent border border-gray-300 text-gray-700',
    gradient: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white',
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-sm',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const badgeContent = (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${sizes[size]}
        ${variants[variant]}
        ${className}
        ${animate ? 'animate-pulse' : ''}
      `}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className={`mr-1.5 ${iconSizes[size]}`}>
          {icon}
        </span>
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && (
        <span className={`ml-1.5 ${iconSizes[size]}`}>
          {icon}
        </span>
      )}
    </span>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      >
        {badgeContent}
      </motion.div>
    );
  }

  return badgeContent;
};

// Color variants for specific use cases
Badge.Status = ({ status, ...props }) => {
  const statusConfig = {
    active: { variant: 'success', label: 'Active' },
    pending: { variant: 'warning', label: 'Pending' },
    completed: { variant: 'primary', label: 'Completed' },
    cancelled: { variant: 'danger', label: 'Cancelled' },
    draft: { variant: 'default', label: 'Draft' },
    published: { variant: 'success', label: 'Published' },
    upcoming: { variant: 'info', label: 'Upcoming' },
    in_progress: { variant: 'primary', label: 'In Progress' },
  };

  const config = statusConfig[status] || { variant: 'default', label: status };

  return (
    <Badge variant={config.variant} {...props}>
      {config.label}
    </Badge>
  );
};

Badge.Count = ({ count, max = 99, variant = 'primary', ...props }) => {
  const displayCount = count > max ? `${max}+` : count;
  
  return (
    <Badge variant={variant} size="xs" {...props}>
      {displayCount}
    </Badge>
  );
};

Badge.Pill = ({ children, variant = 'primary', ...props }) => (
  <Badge variant={variant} className="rounded-full" {...props}>
    {children}
  </Badge>
);

export default Badge;