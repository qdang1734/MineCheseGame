
import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import GradientButton from "@/components/ui/gradient-button";

interface Tab {
  id: string;
  label: string;
}

interface Task {
  id: number;
  title: string;
  reward: number;
  platform: "twitter" | "telegram";
  completed: boolean;
}

interface HistoryItem {
  id: number;
  type: 'egg_open' | 'reward' | 'deposit' | 'withdraw';
  amount: number;
  description: string;
  timestamp: string;
  kittyName?: string;
  kittyRarity?: string;
}

const Earn = () => {
  const [activeTab, setActiveTab] = useState<string>("task");
  
  const tabs: Tab[] = [
    { id: "task", label: "Task" },
    { id: "history", label: "History" }
  ];
  
  // Đăng nhập 7 ngày liên tiếp để nhận quà
  const [loginDays, setLoginDays] = useState<number>(3); // Giả sử đã đăng nhập 3 ngày
  const MAX_LOGIN_DAYS = 7;
  
  const tasks: Task[] = [
    { 
      id: 1, 
      title: "Login 7 Days in a Row", 
      reward: 0.1, 
      platform: "telegram", // Sử dụng telegram platform vì đã có icon phù hợp
      completed: false 
    }
  ];

  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/user-history');
        const data = await response.json();
        setHistoryItems(data.history || []);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      }
    };

    fetchHistory();
  }, []);
  
  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="flex rounded-full bg-gray-800 p-1 mb-6">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            className={`flex-1 py-2 rounded-full text-sm font-medium ${
              activeTab === tab.id 
                ? "bg-amber-500 text-white" 
                : "text-gray-300"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {activeTab === "task" ? (
        <>
          <h3 className="font-medium mb-4">Daily Login Reward</h3>
          
          {/* Login Streak Progress */}
          <div className="bg-gray-800/80 rounded-lg p-4 mb-5 border border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-300">Login Days: {loginDays}/7</span>
              <span className="text-sm text-amber-400">{Math.round((loginDays/MAX_LOGIN_DAYS) * 100)}% Complete</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
              <div 
                className="bg-gradient-to-r from-amber-500 to-amber-300 h-2.5 rounded-full" 
                style={{ width: `${(loginDays/MAX_LOGIN_DAYS) * 100}%` }}
              ></div>
            </div>
            
            {/* Day Indicators */}
            <div className="flex justify-between items-center">
              {Array.from({ length: MAX_LOGIN_DAYS }).map((_, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col items-center ${index < loginDays ? 'opacity-100' : 'opacity-50'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1
                    ${index < loginDays ? 'bg-amber-500 text-white' : 'bg-gray-700 text-gray-400'}`}
                  >
                    {index < loginDays ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>
                  {index === MAX_LOGIN_DAYS - 1 && (
                    <span className="text-[10px] text-amber-400 absolute -right-1 top-3">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 12L9 4V20L21 12Z" fill="currentColor"/>
                      </svg>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            {tasks.map(task => (
              <div 
                key={task.id} 
                className={`bg-gray-800 rounded-lg p-4 flex items-center justify-between ${
                  task.completed ? "border-l-2 border-green-500" : ""
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 ${
                    task.platform === "twitter" ? "bg-black" : "bg-blue-500"
                  } rounded flex items-center justify-center mr-3`}>
                    {task.platform === "twitter" ? (
                      <svg className="text-white w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                      </svg>
                    ) : (
                      <svg className="text-white w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm-1.793 15.207l-3.414-3.414 1.414-1.414 2 2 5.414-5.414 1.414 1.414-6.828 6.828z"></path>
                      </svg>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">{task.title}</h4>
                    <div className="flex items-center text-amber-500 text-sm">
                      <span className="flex items-center">
                        +{task.reward} TON
                        <span className="ml-2 text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded-full">
                          FREE Mini Egg
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                {loginDays >= MAX_LOGIN_DAYS ? (
                  <GradientButton 
                    variant="primary" 
                    size="sm" 
                    className="px-4 relative"
                  >
                    <span className="relative z-10 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 animate-bounce">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Claim
                    </span>
                    <span className="absolute inset-0 bg-white/20 blur-sm animate-pulse rounded-md"></span>
                  </GradientButton>
                ) : (
                  <div className="text-xs text-gray-400 px-3 py-1 border border-gray-700 rounded-full">
                    {MAX_LOGIN_DAYS - loginDays} days left
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-3">
          {historyItems.map(item => (
            <div key={item.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-gray-300">{item.description}</span>
                  {item.kittyName && (
                    <div className="text-sm">
                      <span className={`
                        ${item.kittyRarity === 'Common' ? 'text-gray-400' : ''}
                        ${item.kittyRarity === 'Rare' ? 'text-blue-400' : ''}
                        ${item.kittyRarity === 'Epic' ? 'text-purple-400' : ''}
                        ${item.kittyRarity === 'Legendary' ? 'text-amber-400' : ''}
                        ${item.kittyRarity === 'Mythic' ? 'text-red-400' : ''}
                      `}>
                        {item.kittyRarity} {item.kittyName}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className={`font-medium ${item.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {item.amount >= 0 ? '+' : ''}{Math.abs(item.amount).toFixed(3)} TON
                  </div>
                  <div className="text-gray-500 text-xs mt-1">{item.timestamp}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Earn;
