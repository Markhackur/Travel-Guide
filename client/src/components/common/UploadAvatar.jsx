import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiCamera, FiUpload, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const UploadAvatar = ({
  size = 'lg',
  src,
  name,
  onUpload,
  className = '',
  editable = true
}) => {
  const [preview, setPreview] = useState(src);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      if (onUpload) {
        onUpload(file, e.target.result);
      }
      toast.success('Avatar updated successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
        if (onUpload) {
          onUpload(file, e.target.result);
        }
        toast.success('Avatar updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onUpload) {
      onUpload(null, null);
    }
    toast.success('Avatar removed');
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`${sizes[size]} relative rounded-full overflow-hidden border-4 border-white shadow-lg group cursor-pointer ${
          isDragging ? 'ring-4 ring-blue-500 ring-opacity-50' : ''
        }`}
        onClick={() => editable && fileInputRef.current?.click()}
        onDragOver={editable ? handleDragOver : undefined}
        onDragLeave={editable ? handleDragLeave : undefined}
        onDrop={editable ? handleDrop : undefined}
      >
        {/* Avatar Image or Initials */}
        {preview ? (
          <img
            src={preview}
            alt={name || 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
            {getInitials(name)}
          </div>
        )}

        {/* Hover Overlay */}
        {editable && (
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity"
          >
            <div className="text-center">
              <FiCamera className="w-6 h-6 text-white mx-auto mb-1" />
              <span className="text-white text-xs font-medium">Change Photo</span>
            </div>
          </motion.div>
        )}

        {/* Remove Button for existing images */}
        {editable && preview && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            <FiX className="w-3 h-3" />
          </button>
        )}

        {/* Size Indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          {size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : size === 'lg' ? 'Large' : 'Extra Large'}
        </div>
      </div>

      {/* Upload Stats */}
      {editable && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Drag & drop or click to upload
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG up to 5MB
          </p>
        </div>
      )}

      {/* File Input (Hidden) */}
      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      )}

      {/* Quick Action Buttons */}
      {editable && (
        <div className="flex justify-center space-x-2 mt-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center"
          >
            <FiUpload className="w-3 h-3 mr-1" />
            Upload
          </button>
          {preview && (
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors flex items-center"
            >
              <FiX className="w-3 h-3 mr-1" />
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadAvatar;