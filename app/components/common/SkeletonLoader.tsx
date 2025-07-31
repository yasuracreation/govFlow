
import React from 'react';

interface SkeletonLoaderProps {
  type?: 'text' | 'title' | 'avatar' | 'card' | 'list';
  className?: string;
  count?: number; // for list items
  height?: string;
  width?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'text', 
  className = '', 
  count = 1,
  height,
  width 
}) => {
  const baseClass = "skeleton-loader";

  if (type === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className={`${baseClass} h-10 w-full`}></div>
        ))}
      </div>
    );
  }
  
  if (type === 'card') {
    return (
      <div className={`bg-white shadow rounded-lg p-4 ${className}`}>
        <div className={`${baseClass} h-8 w-3/4 mb-4`}></div>
        <div className={`${baseClass} h-4 w-full mb-2`}></div>
        <div className={`${baseClass} h-4 w-5/6 mb-2`}></div>
        <div className={`${baseClass} h-4 w-1/2`}></div>
      </div>
    );
  }

  const typeStyles = {
    text: `h-4 ${width || 'w-full'}`,
    title: `h-8 ${width || 'w-3/4'} mb-2`,
    avatar: `h-12 w-12 rounded-full ${width || ''}`,
  };

  return (
    <div
      className={`${baseClass} ${typeStyles[type]} ${className}`}
      style={{ height: height, width: width }}
    ></div>
  );
};

export default SkeletonLoader;
    