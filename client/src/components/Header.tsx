import { X, ChevronDown, MoreVertical, ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const Header = ({ title, showBackButton = false, onBackClick }: HeaderProps) => {
  const [showUserInfo, setShowUserInfo] = useState(false);
  
  // Fetch current user data
  const { data: userData } = useQuery({
    queryKey: ['/api/user'],
    retry: false
  });
  
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-secondary sticky top-0 z-50 border-b border-gray-800">
      <div className="flex items-center gap-2">
        {showBackButton ? (
          <button className="w-8 h-8 flex items-center justify-center text-white">
            <ChevronLeft onClick={onBackClick} className="w-6 h-6" />
          </button>
        ) : (
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setShowUserInfo(!showUserInfo)}
          >
            <Avatar className="w-8 h-8 border border-primary">
              <AvatarImage src={userData?.avatar || ''} alt={userData?.username || 'User'} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                {(userData?.username || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {showUserInfo && (
              <span className="text-sm font-medium text-white">{userData?.username}</span>
            )}
          </div>
        )}
      </div>
      <h1 className="text-xl font-display font-semibold text-white">{title}</h1>
      <div className="flex space-x-4">
        <button className="w-8 h-8 flex items-center justify-center text-white">
          <ChevronDown className="w-6 h-6" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center text-white">
          <MoreVertical className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;
