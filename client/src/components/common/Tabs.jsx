import { useState } from 'react';
import { motion } from 'framer-motion';

const Tabs = ({ 
  tabs, 
  activeTab, 
  onChange, 
  variant = 'default',
  className = '',
  fullWidth = false 
}) => {
  const [active, setActive] = useState(activeTab || tabs[0]?.id);

  const handleTabChange = (tabId) => {
    setActive(tabId);
    onChange?.(tabId);
  };

  const variants = {
    default: 'bg-gray-100 rounded-xl p-1',
    underline: 'border-b border-gray-200',
    pills: 'space-x-1',
  };

  const tabVariants = {
    default: {
      active: 'bg-white text-gray-900 shadow-sm',
      inactive: 'text-gray-600 hover:text-gray-900 hover:bg-white/50',
    },
    underline: {
      active: 'border-b-2 border-blue-500 text-blue-600',
      inactive: 'text-gray-500 hover:text-gray-700 hover:border-gray-300',
    },
    pills: {
      active: 'bg-blue-500 text-white',
      inactive: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
    },
  };

  return (
    <div className={`${variants[variant]} ${className} ${fullWidth ? 'w-full' : ''}`}>
      <div className={`flex ${variant === 'underline' ? 'space-x-8' : variant === 'pills' ? '' : 'space-x-1'}`}>
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                relative px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg
                ${fullWidth ? 'flex-1' : ''}
                ${tabVariants[variant][isActive ? 'active' : 'inactive']}
                ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${tab.icon ? 'flex items-center space-x-2' : ''}
              `}
              disabled={tab.disabled}
            >
              {tab.icon && <tab.icon className="w-4 h-4" />}
              <span>{tab.label}</span>
              
              {tab.badge && (
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  isActive 
                    ? variant === 'pills' ? 'bg-white/20' : 'bg-blue-100 text-blue-800'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {tab.badge}
                </span>
              )}

              {variant === 'underline' && isActive && (
                <motion.div
                  layoutId="underline"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;