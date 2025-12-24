import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

const Card = ({
  children,
  className = '',
  hover = true,
  onClick,
  ...props
}) => {
  return (
    <motion.div
      className={cn(
        'bg-white rounded-xl shadow-soft p-6',
        hover && 'card-hover cursor-pointer',
        className
      )}
      onClick={onClick}
      whileHover={hover ? { y: -4 } : {}}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  ); 
};

Card.Header = ({ children, className = '' }) => (
  <div className={cn('mb-4', className)}>{children}</div>
);

Card.Title = ({ children, className = '' }) => (
  <h3 className={cn('text-xl font-semibold text-gray-900', className)}>
    {children}
  </h3>
);

Card.Content = ({ children, className = '' }) => (
  <div className={cn('text-gray-600', className)}>{children}</div>
);

Card.Footer = ({ children, className = '' }) => (
  <div className={cn('mt-4 pt-4 border-t border-gray-200', className)}>
    {children}
  </div>
);

export default Card;





