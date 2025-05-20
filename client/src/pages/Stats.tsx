import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import type { Kitty } from "@/lib/types";

import tonLogo from "@/assets/ton_symbol_1746668225277.png";

// Generate DiceBear URLs for kitties
const generateKittyImageUrl = (name: string) => `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`;

// Mapping kitty names to their images 
const kittyImages: Record<string, string> = {
  Fluffy: generateKittyImageUrl('Fluffy'),
  Ash: generateKittyImageUrl('Ash'),
  Tofu: generateKittyImageUrl('Tofu'),
  Biscuit: generateKittyImageUrl('Biscuit'),
  Boba: generateKittyImageUrl('Boba'),
  Crystal: generateKittyImageUrl('Crystal'),
  Ghost: generateKittyImageUrl('Ghost'),
  Glitch: generateKittyImageUrl('Glitch'),
  Luna: generateKittyImageUrl('Luna'),
  Meowster: generateKittyImageUrl('Meowster'),
  Miso: generateKittyImageUrl('Miso'),
  Orion: generateKittyImageUrl('Orion'),
  Phantom: generateKittyImageUrl('Phantom'),
  Salem: generateKittyImageUrl('Salem'),
  Solar: generateKittyImageUrl('Solar'),
  Stripey: generateKittyImageUrl('Stripey'),
  Vega: generateKittyImageUrl('Vega'),
  Mochi: generateKittyImageUrl('Mochi'),
  Aqua: generateKittyImageUrl('Aqua'),
  Blaze: generateKittyImageUrl('Blaze'),
  Eclipse: generateKittyImageUrl('Eclipse'),
  Jade: generateKittyImageUrl('Jade'),
  Nebula: generateKittyImageUrl('Nebula'),
  Onyx: generateKittyImageUrl('Onyx'),
  Storm: generateKittyImageUrl('Storm'),
  Nova: generateKittyImageUrl('Nova'),
  Chronos: generateKittyImageUrl('Chronos'),
  Dragon: generateKittyImageUrl('Dragon')
};

// Mapping kitty names to distinct colors for those without images
const kittyColors: Record<string, string> = {
  Fluffy: "#E8D7F1",  // Existing color from API
  Ash: "#A8D8B9",
  Tofu: "#FFEADD",
  Mochi: "#FFD8CC",
  Onyx: "#3F3F3F",
  Salem: "#7D7D7D",
  Vega: "#89CFF0",
  Ghost: "#E8E8E8",
  Solar: "#FFB347",
  Luna: "#C6E2FF",
  Nova: "#9370DB",
  Pixel: "#B19CD9",
  Cosmic: "#6A5ACD",
  Aurora: "#77DD77",
  Nebula: "#FF6B6B",
  Biscuit: "#FFD700",
};

const Stats = () => {
  const [activeTab, setActiveTab] = useState<string>("status");
  const [recentOpenings, setRecentOpenings] = useState<{
    kitty: Kitty;
    openedAt: string;
    userName: string;
  }[]>([]);

  const tabs = [
    { id: "status", label: "Status" },
    { id: "box", label: "Box" },
    { id: "profit", label: "Profit/day" }
  ];

  useEffect(() => {
    const fetchRecentOpenings = async () => {
      try {
        const response = await fetch('/api/recent-openings');
        const data = await response.json();
        setRecentOpenings(data.openings || []);
      } catch (error) {
        console.error("Failed to fetch recent openings:", error);
      }
    };

    fetchRecentOpenings();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-display font-semibold">Statistics</h2>
        <button className="text-gray-400 hover:text-white">
          <Bell className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Tabs */}
      <div className="relative mb-6">
        <div className="flex rounded-full bg-gray-800 p-1 mb-4">
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

        {/* Recent Openings List */}
        <div className="space-y-3">
          {recentOpenings.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 border-b border-gray-800">
              <div className="flex items-center">
                <span className="mr-3 text-sm">{item.userName}</span>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full overflow-hidden">
                    {kittyImages[item.kitty.name] ? (
                      <img 
                        src={kittyImages[item.kitty.name]} 
                        alt={item.kitty.name}
                        className="w-full h-full object-contain bg-white rounded-full p-0.5 shadow-inner"
                      />
                    ) : (
                      <div 
                        style={{ backgroundColor: kittyColors[item.kitty.name] || item.kitty.color || '#888888' }} 
                        className="w-full h-full flex items-center justify-center"
                      >
                        <span className="text-xs text-white font-bold">
                          {item.kitty.name[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="ml-2 text-sm">{item.kitty.name}</span>
                </div>
              </div>
              <div className="flex items-center">
                <div className={`text-xs px-2 py-1 rounded-full mr-3 ${
                  item.kitty.rarity === 'Common' ? 'bg-gray-600/50 text-gray-300' : 
                  item.kitty.rarity === 'Rare' ? 'bg-blue-600/50 text-blue-300' : 
                  item.kitty.rarity === 'Epic' ? 'bg-purple-600/50 text-purple-300' : 
                  item.kitty.rarity === 'Legendary' ? 'bg-amber-600/50 text-amber-300' : 
                  'bg-pink-600/50 text-pink-300'
                }`}>
                  {item.kitty.rarity}
                </div>
                <div className="text-amber-500 flex items-center">
                  <img src={tonLogo} alt="TON" className="w-3 h-3 mr-1" />
                  <span className="font-medium">+{item.kitty.earnPerDay}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stats;