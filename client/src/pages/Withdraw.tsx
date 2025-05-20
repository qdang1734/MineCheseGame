import { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import GradientButton from "@/components/ui/gradient-button";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import tonLogo from "@/assets/ton_symbol_1746668225277.png";
import { formatWalletAddress, tonToNano, isValidTonAddress } from '../lib/ton-helper';
import { tonWallet, tonConnectUI } from './Wallet';

interface WithdrawProps {
  onBack: () => void;
}

const NETWORK_FEE = 0.05; // Network fee in TON
const MIN_WITHDRAW = 0.02; // Minimum withdraw amount in TON

// Define a type for the user data
interface UserData {
  id: number;
  username: string;
  balance: number;
  rank?: string;
  avatar?: string;
  [key: string]: any;
}

const Withdraw = ({ onBack }: WithdrawProps) => {
  const { data: userData, isLoading: isUserLoading } = useQuery<UserData>({
    queryKey: ['/api/user'],
  });
  
  const queryClient = useQueryClient();
  
  const [amount, setAmount] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  const gameBalance = userData?.balance || 0;
  const maxWithdrawAmount = Math.max(0, gameBalance - NETWORK_FEE).toFixed(4);
  
  // Check for wallet connection on component mount
  useEffect(() => {
    // Check if we have a connected wallet
    const checkWalletConnection = () => {
      try {
        if (tonWallet.connected && tonConnectUI.wallet) {
          const address = tonConnectUI.wallet.account.address;
          if (address) {
            setWalletAddress(address);
            setIsConnected(true);
          }
        }
      } catch (err) {
        console.error("Error checking wallet connection:", err);
      }
    };
    
    // Set up subscription to wallet status changes
    try {
      tonConnectUI.onStatusChange((wallet: any) => {
        if (wallet) {
          const address = wallet.account.address;
          setWalletAddress(address || '');
          setIsConnected(true);
        } else {
          setWalletAddress('');
          setIsConnected(false);
        }
      });
    } catch (err) {
      console.error("Error setting up wallet status listener:", err);
    }
    
    // Initial check
    checkWalletConnection();
  }, []);
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow only numbers and decimals
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      
      // Validate amount
      const numValue = parseFloat(value || '0');
      
      if (numValue < MIN_WITHDRAW && value !== '') {
        setError(`Minimum withdrawal is ${MIN_WITHDRAW} TON`);
      } else if (numValue > parseFloat(maxWithdrawAmount)) {
        setError(`Maximum withdrawal is ${maxWithdrawAmount} TON`);
      } else {
        setError('');
      }
    }
  };
  
  const handleMaxAmount = () => {
    setAmount(maxWithdrawAmount);
    setError('');
  };
  
  const [success, setSuccess] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>('');
  
  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) < MIN_WITHDRAW) {
      setError(`Please enter a valid amount (min ${MIN_WITHDRAW} TON)`);
      return;
    }
    
    if (parseFloat(amount) > parseFloat(maxWithdrawAmount)) {
      setError(`Maximum withdrawal is ${maxWithdrawAmount} TON`);
      return;
    }
    
    // Validate the wallet address
    if (!isValidTonAddress(walletAddress)) {
      setError('Invalid TON address format');
      return;
    }
    
    setIsLoading(true);
    setSuccess(false);
    setTxHash('');
    
    try {
      if (!isConnected) {
        // Prompt user to connect wallet first
        await tonWallet.connect();
        setIsLoading(false);
        return;
      }
      
      // Gửi yêu cầu rút tiền đến API mới (tự động)
      const response = await fetch('/api/auto-withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount)
        }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Withdrawal failed');
      }
      
      // Set success state
      setSuccess(true);
      setTxHash(result.transactionHash || 'Transaction submitted');
      
      // Reset form
      setAmount('');
      
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
    } catch (err: any) {
      console.error('Withdrawal error:', err);
      setError(err.message || 'Withdrawal failed. Please try again.');
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getReceiveAmount = () => {
    if (!amount) return 0;
    
    const withdrawAmount = parseFloat(amount);
    return withdrawAmount;
  };
  
  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <button 
          onClick={onBack}
          className="text-gray-400 hover:text-white mr-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-display font-semibold">Withdraw TON</h2>
      </div>
      
      {success ? (
        <div className="space-y-4 mb-6">
          <div className="bg-green-500/20 rounded-lg p-6 flex flex-col items-center justify-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-3" />
            <h3 className="text-xl font-semibold mb-1">Withdrawal Successful!</h3>
            <p className="text-center text-gray-300 text-sm mb-3">
              Your withdrawal has been processed successfully.
            </p>
            {txHash && (
              <div className="bg-gray-800/80 p-3 rounded-lg text-xs text-gray-400 w-full overflow-hidden">
                <p className="text-xs text-center font-medium mb-1">Transaction Hash:</p>
                <p className="text-xs break-all text-center">{txHash}</p>
              </div>
            )}
            <GradientButton 
              className="mt-4" 
              onClick={onBack}
            >
              Return to Wallet
            </GradientButton>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            <div className="bg-gray-800/80 rounded-lg p-4">
              <p className="text-sm text-gray-300 mb-4">
                Withdraw TON from your game balance to your TON Space wallet.
              </p>
              
              {isConnected ? (
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Your TON Space wallet</label>
                  <div className="bg-gray-900 p-3 rounded-lg text-sm break-all">
                    <span className="text-gray-300 text-xs">{walletAddress}</span>
                  </div>
                </div>
              ) : (
                <div className="mb-4 mt-2">
                  <div className="bg-blue-500/20 p-3 rounded-lg flex items-start">
                    <AlertCircle className="w-4 h-4 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-300">
                      Connect your TON Space wallet first to withdraw funds.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-gray-400">Amount</label>
                <span className="text-sm text-gray-400">
                  Available: {isUserLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin inline" />
                  ) : (
                    `${gameBalance.toFixed(4)} TON`
                  )}
                </span>
              </div>
              <div className="relative bg-gray-800 rounded-lg overflow-hidden flex">
                <input 
                  type="text" 
                  className={`p-4 w-full bg-transparent focus:outline-none ${
                    error ? 'border border-red-500' : ''
                  }`}
                  placeholder="0"
                  value={amount}
                  onChange={handleAmountChange}
                  disabled={isLoading || !isConnected}
                />
                <div className="absolute right-14 top-1/2 -translate-y-1/2 flex items-center">
                  <img src={tonLogo} alt="TON" className="w-5 h-5 mr-1" />
                  <span className="text-gray-300 text-sm">TON</span>
                </div>
                <button 
                  className="px-4 text-primary font-medium"
                  onClick={handleMaxAmount}
                  disabled={isLoading || !isConnected}
                >
                  MAX
                </button>
              </div>
              {error && (
                <div className="mt-1 flex items-center text-red-500 text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {error}
                </div>
              )}
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-gray-400">Network Fee</label>
                <span className="text-sm text-gray-400">{NETWORK_FEE} TON</span>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg w-full text-sm flex justify-between">
                <span>Estimated network fee</span>
                <span>{NETWORK_FEE} TON</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-gray-400">You will receive</label>
                <span className="text-sm text-gray-400"></span>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg w-full text-sm flex justify-between items-center">
                <span>Total amount</span>
                <div className="flex items-center">
                  <img src={tonLogo} alt="TON" className="w-4 h-4 mr-1" />
                  <span className="font-medium">{getReceiveAmount().toFixed(4)} TON</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <GradientButton 
              fullWidth
              onClick={handleWithdraw}
              disabled={isLoading || !isConnected || !amount || !!error}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : !isConnected ? (
                'Connect Wallet'
              ) : (
                'Withdraw TON'
              )}
            </GradientButton>
          </div>
        </>
      )}
    </div>
  );
};

export default Withdraw;
