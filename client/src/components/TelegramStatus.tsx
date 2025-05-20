import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface TelegramStatusProps {
  className?: string;
}

interface TelegramUser {
  telegramId: number;
  telegramUsername: string;
  user: {
    id: number;
    username: string;
    avatar?: string;
    rank?: string;
  };
}

const TelegramStatus = ({ className }: TelegramStatusProps) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Check if user is connected to Telegram
  useEffect(() => {
    const checkTelegramConnection = async () => {
      try {
        setIsLoading(true);
        const authToken = localStorage.getItem('authToken');
        
        if (!authToken) {
          setIsConnected(false);
          return;
        }
        
        const response = await fetch('/api/validate-token', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        const data = await response.json();
        
        if (data.valid) {
          setIsConnected(true);
          setTelegramUser({
            telegramId: data.telegramId,
            telegramUsername: data.telegramUsername,
            user: data.user
          });
        } else {
          setIsConnected(false);
          // Clear invalid token
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error('Error checking Telegram connection:', error);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkTelegramConnection();
  }, []);

  const handleOpenTelegram = () => {
    // Open bot in Telegram - sử dụng đúng username của bot
    window.open('https://t.me/NebulaChest_Bot', '_blank');
    
    toast({
      title: 'Opening Telegram Bot',
      description: 'Please use the /start command in the Telegram bot to connect your account.',
    });
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
          <span className="text-sm text-gray-300">Checking connection...</span>
        </div>
      ) : isConnected && telegramUser ? (
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-500">Connected to Telegram</span>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-3 text-sm flex items-center space-x-3">
            {telegramUser.user.avatar ? (
              <img 
                src={telegramUser.user.avatar} 
                alt={telegramUser.telegramUsername} 
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center">
                <span className="text-white font-bold">
                  {telegramUser.telegramUsername.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="font-semibold text-white">{telegramUser.telegramUsername}</p>
              <p className="text-gray-400 text-xs">@{telegramUser.telegramUsername}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TelegramStatus;