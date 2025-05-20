import { useState, useEffect } from "react";
import { Wallet as WalletIcon, ClipboardList, RefreshCw, Loader2, LogOut } from "lucide-react";
import GradientButton from "@/components/ui/gradient-button";
import { ActiveScreen } from "@/lib/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import tonLogo from "@/assets/ton_symbol_1746668225277.png";
import gameIcon from "../assets/game.png";
import { TonConnectUI } from "@tonconnect/ui";
import { translate } from "@/lib/i18n";

interface WalletProps {
  onScreenChange: (screen: ActiveScreen) => void;
}

// Define a type for the user data to avoid TypeScript errors
interface UserData {
  id: number;
  username: string;
  balance: number;
}

const TON_TO_USD_RATE = 3.01; // 1 TON = 3.01 USD

// Create proper connection to TON Connect
// We don't need a buttonRootId since we're using custom buttons
// Sử dụng URL cố định từ manifest
const MANIFEST_URL = "https://e871c018-bf4e-43bf-87cb-b697f6585e9b-00-1mz3x6mggz8tm.sisko.replit.dev/tonconnect-manifest.json";

export const tonConnectUI = new TonConnectUI({
  manifestUrl: MANIFEST_URL
});

// Create a wrapper with error handling
export const tonWallet = {
  // Show wallet connection dialog
  connect() {
    try {
      return tonConnectUI.openModal().catch(err => {
        console.info("User cancelled wallet connection or action dismissed");
        return Promise.resolve();
      });
    } catch (error) {
      console.error("Error connecting to TON wallet:", error);
      return Promise.resolve();
    }
  },
  
  // Disconnect wallet
  disconnect() {
    try {
      return tonConnectUI.disconnect().catch(err => {
        console.info("Disconnect action completed or dismissed");
        return Promise.resolve();
      });
    } catch (error) {
      console.error("Error disconnecting TON wallet:", error);
      return Promise.resolve();
    }
  },
  
  // Send a transaction
  sendTransaction(params: any) {
    try {
      return tonConnectUI.sendTransaction(params).catch(err => {
        console.info("Transaction cancelled by user or failed:", err);
        return Promise.resolve("error-tx");
      });
    } catch (error) {
      console.error("Error sending transaction:", error);
      return Promise.resolve("error-tx");
    }
  },
  
  // Check if wallet is connected
  get connected() {
    try {
      return tonConnectUI.connected;
    } catch (error) {
      console.error("Error checking wallet connection:", error);
      return false;
    }
  }
};

const Wallet = ({ onScreenChange }: WalletProps) => {
  const { data: userData, isLoading } = useQuery<UserData>({
    queryKey: ['/api/user'],
  });
  
  const queryClient = useQueryClient();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [, setLanguageUpdate] = useState(0);
  
  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      // Force component to update when language changes
      setLanguageUpdate(prev => prev + 1);
    };
    
    window.addEventListener('languageChange', handleLanguageChange);
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange);
    };
  }, []);
  
  const t = translate;
  
  const tonBalance = userData?.balance || 0;
  const usdBalance = (tonBalance * TON_TO_USD_RATE).toFixed(2);
  const walletUsdBalance = (walletBalance * TON_TO_USD_RATE).toFixed(2);
  
  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkWalletConnection = () => {
      try {
        if (tonWallet.connected && tonConnectUI.wallet) {
          const address = tonConnectUI.wallet.account.address;
          if (address) {
            // Hiển thị địa chỉ đầy đủ theo định dạng UQ
            setWalletAddress(address);
            setIsConnected(true);
          }
        }
      } catch (err) {
        console.error("Error checking wallet connection:", err);
      }
    };
    
    checkWalletConnection();
    
    // Set up wallet connection status listener
    const unsubscribe = tonConnectUI.onStatusChange((wallet: any) => {
      if (wallet) {
        const address = wallet.account.address;
        setWalletAddress(address ? address : "Connected");
        setIsConnected(true);
        
        // Lưu địa chỉ ví vào CSDL khi người dùng kết nối
        if (address) {
          fetch('/api/save-wallet-address', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ walletAddress: address }),
          })
          .then(response => response.json())
          .then(data => {
            console.log('Wallet address saved:', data);
          })
          .catch(err => {
            console.error('Error saving wallet address:', err);
          });
        }
      } else {
        setWalletAddress('');
        setIsConnected(false);
      }
    });
    
    // Cleanup when component unmounts
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);
  
  // Handle wallet connection through TON Space
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    
    try {
      // Attempt to connect to TON wallet
      await tonWallet.connect();
      
      // Check if connected after user interaction
      if (tonWallet.connected && tonConnectUI.wallet) {
        // Get actual wallet address if available
        const address = tonConnectUI.wallet.account.address;
        setWalletAddress(address || "Connected");
        setWalletBalance(0); // Actual balance would require separate API call
        setIsConnected(true);
      }
    } catch (err) {
      console.error("Error connecting wallet:", err);
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleDeposit = async () => {
    if (!isConnected) {
      // Prompt to connect wallet first
      handleConnectWallet();
      return;
    }
    
    // Navigate to deposit screen
    onScreenChange("deposit");
  };
  
  const handleWithdraw = async () => {
    if (!isConnected) {
      // Prompt to connect wallet first
      handleConnectWallet();
      return;
    }
    
    // Navigate to withdraw screen
    onScreenChange("withdraw");
  };
  
  const handleDisconnect = async () => {
    setIsConnected(false);
    setWalletAddress('');
    setWalletBalance(0);
    
    tonWallet.disconnect();
  };
  
  return (
    <div className="p-4">
      <h2 className="text-center text-xl font-display font-semibold mb-2">{t('wallet')}</h2>
      <p className="text-center text-gray-400 text-sm mb-6">{t('stayConnectedEarnReward')}</p>
      
      <div className="bg-gray-800/80 rounded-lg p-4 mb-6 flex justify-between items-center">
        <div>
          <div className="text-gray-400 text-sm">{t('totalAssets')}</div>
          <div className="text-amber-500 text-2xl font-display font-bold">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin inline" />
            ) : (
              `$ ${usdBalance}`
            )}
          </div>
        </div>
        <button className="text-gray-400 hover:text-white" title={t('viewTransactions')}>
          <ClipboardList className="w-5 h-5" />
        </button>
      </div>
      
      {/* Wallet Connect Button */}
      <div className="mb-6">
        {!isConnected ? (
          <div className="flex justify-center">
            <div className="w-full max-w-xs">
              <GradientButton 
                fullWidth 
                onClick={handleConnectWallet}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {t('connectingWallet')}</>
                ) : (
                  t('connectWallet')
                )}
              </GradientButton>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center bg-gray-800/80 rounded-lg p-3 mb-2">
            <div className="flex items-center">
              <WalletIcon className="w-5 h-5 mr-2 text-blue-400" />
              <span className="text-sm font-medium">
                {walletAddress ? (
                  walletAddress.length > 15 
                    ? `${walletAddress.substring(0, 8)}...${walletAddress.substring(walletAddress.length - 7)}`
                    : walletAddress
                ) : ""}
              </span>
            </div>
            <button 
              className="text-gray-400 hover:text-red-400"
              onClick={handleDisconnect}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      <div className="flex justify-between gap-4 mb-6">
        <GradientButton 
          variant="outline" 
          fullWidth
          onClick={handleDeposit}
        >
          {t('deposit')}
        </GradientButton>
        <GradientButton 
          variant="outline" 
          fullWidth
          onClick={handleWithdraw}
        >
          {t('withdraw')}
        </GradientButton>
      </div>
      
      <div className="mb-2 flex justify-between items-center">
        <h3 className="font-medium">{t('assets')}</h3>
        <button 
          className="text-gray-400 hover:text-white flex items-center"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/user'] })}
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          <span className="text-sm">{t('refresh')}</span>
        </button>
      </div>
      
      {/* Asset Items */}
      <div className="space-y-3">
        {/* Game TON Token */}
        <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
              <img src={tonLogo} alt="TON" className="w-6 h-6" />
            </div>
            <div>
              <div className="font-medium">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin inline" />
                ) : (
                  `${tonBalance.toFixed(4)} TON`
                )}
              </div>
              <div className="text-xs text-gray-400">{t('tonGame')}</div>
            </div>
          </div>
          <div className="text-amber-500 font-medium">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin inline" />
            ) : (
              `$ ${usdBalance}`
            )}
          </div>
        </div>
        
        {/* Wallet TON Token (only shown when connected) */}
        {isConnected && (
          <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                <img src={tonLogo} alt="TON" className="w-6 h-6" />
              </div>
              <div>
                <div className="font-medium">
                  {`${walletBalance.toFixed(4)} TON`}
                </div>
                <div className="text-xs text-gray-400">{t('tonWallet')}</div>
              </div>
            </div>
            <div className="text-amber-500 font-medium">
              {`$ ${walletUsdBalance}`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;