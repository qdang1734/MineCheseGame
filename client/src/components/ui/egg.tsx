import { useRef, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface EggProps {
  color?: string;
  spotColor?: string;
  className?: string;
}

const Egg = ({ 
  color = "#8B5CF6", 
  spotColor = "#FFD700",
  className = ""
}: EggProps) => {
  const eggRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  
  // Handle mouse movement for 3D effect
  const handleMouseMove = (e: MouseEvent) => {
    if (!eggRef.current) return;
    
    const rect = eggRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 10;
    const y = (e.clientY - rect.top - rect.height / 2) / 10;
    
    setRotation({ x: -y, y: x });
  };
  
  // Reset rotation when mouse leaves
  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };
  
  useEffect(() => {
    const egg = eggRef.current;
    if (!egg) return;
    
    egg.addEventListener("mousemove", handleMouseMove);
    egg.addEventListener("mouseleave", handleMouseLeave);
    
    return () => {
      egg.removeEventListener("mousemove", handleMouseMove);
      egg.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);
  
  return (
    <div 
      ref={eggRef}
      className={`egg relative animate-float flex justify-center ${className}`}
      style={{ 
        transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
      }}
    >
      <div className="w-36 h-48 relative">
        <svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" className="animate-glow">
          {/* Egg base shape */}
          <ellipse cx="100" cy="130" rx="80" ry="100" fill={`url(#eggGradient-${color.replace('#', '')})`} />
          
          {/* Star pattern */}
          <path d="M100,80 L110,105 L135,105 L115,120 L125,145 L100,130 L75,145 L85,120 L65,105 L90,105 Z" fill={spotColor} />
          
          {/* Glow effect */}
          <defs>
            <radialGradient id={`eggGradient-${color.replace('#', '')}`} cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
              <stop offset="0%" stopColor={color} />
              <stop offset="70%" stopColor={`${color}CC`} />
              <stop offset="100%" stopColor={`${color}99`} />
            </radialGradient>
          </defs>
        </svg>
        
        {/* Sparkle effects */}
        <div className="absolute top-1/4 right-1/4 animate-pulse">
          <Sparkles className="text-yellow-300" size={16} />
        </div>
        <div className="absolute bottom-1/3 left-1/4 animate-pulse-slow">
          <Sparkles className="text-purple-300" size={16} />
        </div>
      </div>
    </div>
  );
};

export default Egg;
