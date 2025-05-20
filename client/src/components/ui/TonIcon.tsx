import React from "react";

interface TonIconProps {
  className?: string;
  size?: number;
}

export const TonIcon: React.FC<TonIconProps> = ({ 
  className = "", 
  size = 16 
}) => {
  return (
    <img 
      src="/icon.png" 
      alt="TON" 
      width={size} 
      height={size} 
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
};

export default TonIcon;