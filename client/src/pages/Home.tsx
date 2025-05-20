import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Info, Award, User as UserIcon, Loader2, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import LanguageSelector from "@/components/ui/language-selector";
import Egg from "@/components/ui/egg";
import GradientButton from "@/components/ui/gradient-button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { translate } from "@/lib/i18n";
import TelegramStatus from "@/components/TelegramStatus";

// Import TON logo
import tonLogo from "@/assets/ton_symbol_1746668225277.png";
// Import treasure chest images for eggs
import miniEggImage from "@/assets/egg0_1746671519249.png";
import starterEggImage from "@/assets/egg1_1746671839217.png";
import proEggImage from "@/assets/egg2_1746671963979.png";
import genesisEggImage from "@/assets/egg3_1746672005465.png";

// Import kitty images
import fluffyImage from "@/assets/Fluffy.png";
import ashImage from "@/assets/Ash.png";
import tofuImage from "@/assets/Tofu.png";
import biscuitImage from "@/assets/Biscuit.png";
import bobaImage from "@/assets/Boba.png";
import crystalImage from "@/assets/Crystal.png";
import ghostImage from "@/assets/Ghost.png";
import glitchImage from "@/assets/Glitch.png";
import lunaImage from "@/assets/Luna.png";
import meowsterImage from "@/assets/Meowster.png";
import misoImage from "@/assets/Miso.png";
import orionImage from "@/assets/Orion.png";
import phantomImage from "@/assets/Phantom.png";
import salemImage from "@/assets/Salem.png";
import solarImage from "@/assets/Solar.png";
import stripeyImage from "@/assets/Stripey.png";
import vegaImage from "@/assets/Vega.png";
import mochiImage from "@/assets/Mochi.png";
import aquaImage from "@/assets/Aqua.png";
import blazeImage from "@/assets/Blaze.png";
import eclipseImage from "@/assets/Eclipse.png";
import jadeImage from "@/assets/Jade.png";
import nebulaImage from "@/assets/Nebula.png";
import onyxImage from "@/assets/Onyx.png";
import stormImage from "@/assets/Storm.png";
import novaImage from "@/assets/Nova.png";
import chronosImage from "@/assets/Chronos.png";
import dragonImage from "@/assets/Dragon.png";

// Mapping kitty names to their images
const kittyImages: Record<string, string> = {
  Fluffy: fluffyImage,
  Ash: ashImage,
  Tofu: tofuImage,
  Biscuit: biscuitImage,
  Boba: bobaImage,
  Crystal: crystalImage,
  Ghost: ghostImage,
  Glitch: glitchImage,
  Luna: lunaImage,
  Meowster: meowsterImage,
  Miso: misoImage,
  Orion: orionImage,
  Phantom: phantomImage,
  Salem: salemImage,
  Solar: solarImage,
  Stripey: stripeyImage,
  Vega: vegaImage,
  Mochi: mochiImage,
  Aqua: aquaImage,
  Blaze: blazeImage,
  Eclipse: eclipseImage,
  Jade: jadeImage,
  Nebula: nebulaImage,
  Onyx: onyxImage,
  Storm: stormImage,
  Nova: novaImage,
  Chronos: chronosImage,
  Dragon: dragonImage
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

interface EggType {
  id: number;
  name: string;
  price: number;
  minEarnPerDay: number;
  maxEarnPerDay: number;
  description?: string;
  color?: string;
}

interface Kitty {
  id: number;
  name: string;
  rarity: string;
  earnPerDay: number;
  dropRate: number;
  eggTypeId: number;
  color?: string;
  spotColor?: string;
  imageUrl?: string;
}

interface User {
  id: number;
  username: string;
  rank?: string;
  avatar?: string;
  balance?: number;
  totalReward?: number;
  eggsOpened?: number;
}

// Default eggs data to use if API is not available
const defaultEggs = [
  { id: 2, name: "Starter Egg", price: 1, minEarnPerDay: 0.001, maxEarnPerDay: 0.5, color: "#F2C879" },
  { id: 3, name: "Mega Egg", price: 10, minEarnPerDay: 0.01, maxEarnPerDay: 1, color: "#EF959C" },
  { id: 4, name: "Genesis Egg", price: 100, minEarnPerDay: 0.1, maxEarnPerDay: 10, color: "#69A2B0" }
];

const Home = () => {
  const [currentEgg, setCurrentEgg] = useState(0);
  const [showKittyDialog, setShowKittyDialog] = useState(false);
  const queryClient = useQueryClient();
  // Use our translation function
  const t = translate;

  // Fetch egg types from API
  const { data: eggTypes, isLoading: loadingEggs } = useQuery<EggType[]>({
    queryKey: ['/api/egg-types'],
  });

  // Use API data or fall back to defaults
  const eggs = eggTypes || defaultEggs;

  // Get current egg ID for fetching kitties
  const currentEggId = eggs[currentEgg]?.id;

  // Fetch kitties data for the current egg
  const { data: kitties, isLoading: loadingKitties } = useQuery<Kitty[]>({
    queryKey: ['/api/kitties', currentEggId],
    queryFn: async () => {
      if (!currentEggId) return [];
      const response = await fetch(`/api/kitties?eggTypeId=${currentEggId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch kitties');
      }
      return response.json();
    },
    enabled: !!currentEggId,
  });

  // Update kitties data when egg selection changes
  useEffect(() => {
    if (currentEggId) {
      queryClient.invalidateQueries({ queryKey: ['/api/kitties', currentEggId] });
    }
  }, [currentEgg, currentEggId, queryClient]);

  // Handle egg opening
  const [isOpeningEgg, setIsOpeningEgg] = useState(false);
  const [openedKitty, setOpenedKitty] = useState<Kitty | null>(null);
  // Fetch user's kitty collection
  const { data: collectionKitties = [], refetch: refetchCollection } = useQuery<(Kitty & { count: number })[]>({
    queryKey: ['/api/user-kitties'],
    refetchOnWindowFocus: false,
  });

  // Refetch collection when a new kitty is opened
  useEffect(() => {
    if (openedKitty) {
      refetchCollection();
    }
  }, [openedKitty, refetchCollection]);

  // Fetch user data
  const { data: userData, isLoading: loadingUser } = useQuery<User>({
    queryKey: ['/api/user'],
  });

  // Calculate total daily reward
  const totalDailyReward = collectionKitties.reduce((sum, kitty) => 
    sum + (kitty.earnPerDay * kitty.count), 0
  );

  const isLoading = loadingEggs || loadingUser;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpenEgg = async () => {
    if (!currentEggId || isOpeningEgg) return;

    setIsOpeningEgg(true);
    setErrorMessage(null);
    try {
      console.log("Opening egg with ID:", currentEggId);
      const response = await fetch('/api/open-egg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eggTypeId: currentEggId }),
      });

      // Parse the error response
      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData?.error || 'Failed to open egg';
        console.error("Error opening egg:", errorMsg);
        setErrorMessage(errorMsg);
        return;
      }

      const data = await response.json();
      console.log("Egg opened successfully:", data);

      if (data && data.kitty) {
        setOpenedKitty(data.kitty);
        // Refresh user data and kitties list
        queryClient.invalidateQueries({ queryKey: ['/api/user-kitties'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      } else {
        console.error("Invalid response from server:", data);
        setErrorMessage("Invalid response from server");
      }

    } catch (error) {
      console.error('Error opening egg:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsOpeningEgg(false);
    }
  };

  const handlePrevEgg = () => {
    setCurrentEgg((prev) => (prev === 0 ? eggs.length - 1 : prev - 1));
  };

  const handleNextEgg = () => {
    setCurrentEgg((prev) => (prev === eggs.length - 1 ? 0 : prev + 1));
  };

  return (
    <div id="home-screen">
      {/* Profile Info */}
      <div className="mx-2 mt-2 bg-gray-800/50 rounded-b-2xl">
        <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          {/* Profile Avatar */}
          <div className="relative">
            {userData?.avatar ? (
              <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden">
                <img 
                  src={userData.avatar} 
                  alt={userData.username} 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center border-2 border-primary">
                <UserIcon className="w-6 h-6" />
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-xs text-black">
              <Award className="w-3 h-3" />
            </span>
          </div>
          <div>
            <div className="flex items-center">
              <span className="text-sm font-medium">{userData?.username || t('player')}</span>
              <span className="ml-1 text-yellow-500 text-xs">
                <Award className="w-3 h-3" />
              </span>
              <span className="ml-1 text-xs text-gray-300">KittyMint</span>
            </div>
            <div className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-xs rounded-full inline-flex items-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 15a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span className="text-[10px] font-medium">{userData?.eggsOpened || 0} {t('eggsOpened')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <LanguageSelector />
        </div>
        </div>
      </div>

      {/* Removed Telegram Connection Status display */}

      {/* Token Balance, Total Reward, and Daily Reward */}
      <div className="mt-4 px-4 text-center">
        <div className="bg-gradient-to-b from-gray-800/70 to-gray-900/70 rounded-xl p-4 shadow-lg border border-primary/30 backdrop-blur-sm">
          {/* Balance */}
          <div className="mb-4 pb-3 border-b border-primary/20">
            <div className="text-sm text-gray-300 mb-1 font-medium">{t('balance')}</div>
            <div className="text-xl font-display font-bold text-amber-500 flex items-center justify-center">
              <img src={tonLogo} alt="TON" className="w-6 h-6 mr-1" />
              <span>
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin inline mr-1" />
                ) : (
                  userData?.balance?.toFixed(3) || '0.000'
                )}
              </span>
            </div>
          </div>
          
          {/* Rewards */}
          <div className="flex justify-between">
            <div className="flex-1 p-2 mx-1 bg-gray-800/50 rounded-lg border border-primary/20">
              <div className="text-sm text-gray-300 font-medium">{t('totalReward')}</div>
              <div className="flex items-center justify-center mt-1">
                <img src={tonLogo} alt="TON" className="w-4 h-4 mr-1" />
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <span className="font-semibold text-amber-400">{userData?.totalReward?.toFixed(4) || '0.0000'}</span>
                )}
              </div>
            </div>
            <div className="flex-1 p-2 mx-1 bg-gray-800/50 rounded-lg border border-primary/20">
              <div className="text-sm text-gray-300 font-medium">{t('dailyReward')}</div>
              <div className="flex items-center justify-center mt-1">
                <img src={tonLogo} alt="TON" className="w-4 h-4 mr-1" />
                <span className="font-semibold text-amber-400">{totalDailyReward.toFixed(4)}</span> {/* Updated Daily Reward */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Egg Display */}
      <div className="mt-6 relative sunburst-bg">

        {/* EGG CAROUSEL */}
        <div className="relative py-8 egg-container flex justify-center items-center">
          {/* Previous Egg Button */}
          <button 
            onClick={handlePrevEgg}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-800/60 text-white rounded-full w-8 h-8 flex items-center justify-center z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Loading state */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-2" />
              <p className="text-sm text-gray-400">Loading eggs...</p>
            </div>
          ) : (
            <>
              {/* Current Egg */}
              {eggs[currentEgg].price === 0.1 ? (
                <div className="relative w-40 h-40 flex items-center justify-center animate-float">
                  <img 
                    src={miniEggImage} 
                    alt={t('miniEgg')} 
                    className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                  />
                </div>
              ) : eggs[currentEgg].price === 1 ? (
                <div className="relative w-40 h-40 flex items-center justify-center animate-float">
                  <img 
                    src={starterEggImage} 
                    alt={t('starterEgg')} 
                    className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(242,200,121,0.5)]" 
                  />
                </div>
              ) : eggs[currentEgg].price === 10 ? (
                <div className="relative w-40 h-40 flex items-center justify-center animate-float">
                  <img 
                    src={proEggImage} 
                    alt={t('proEgg')} 
                    className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(239,149,156,0.5)]" 
                  />
                </div>
              ) : eggs[currentEgg].price === 100 ? (
                <div className="relative w-40 h-40 flex items-center justify-center animate-float">
                  <img 
                    src={genesisEggImage} 
                    alt={t('genesisEgg')} 
                    className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(105,162,176,0.7)]" 
                  />
                </div>
              ) : (
                <Egg 
                  color={eggs[currentEgg].color || "#A7D7C9"} 
                  spotColor={"#FFFFFF"} 
                />
              )}

              {/* Removed Egg Label */}
            </>
          )}

          {/* Next Egg Button */}
          <button 
            onClick={handleNextEgg}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-800/60 text-white rounded-full w-8 h-8 flex items-center justify-center z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Egg Action Button */}
        <div className="relative -mt-4 px-10 mb-4">
          {errorMessage && (
            <div className="mb-2 text-sm text-red-400 bg-red-900/30 rounded-md p-2 text-center">
              {errorMessage}
            </div>
          )}
          <GradientButton 
            fullWidth 
            className="py-3 rounded-md font-medium text-white flex items-center justify-center space-x-2 shadow-lg"
            onClick={handleOpenEgg}
            disabled={isOpeningEgg}
          >
            {isOpeningEgg ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span>{t('opening')}</span>
              </>
            ) : (
              <>
                <span className="text-lg">{eggs[currentEgg].price} TON</span>
                <img src={tonLogo} alt="TON" className="w-5 h-5" />
              </>
            )}
          </GradientButton>

          {/* Opened Kitty Dialog */}
          {openedKitty && (
            <Dialog open={!!openedKitty} onOpenChange={(open) => !open && setOpenedKitty(null)}>
              <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-center">
                    <span className="block mb-1">🎉 {t('congratulations')} 🎉</span>
                    <span>{t('youGotNewCat')}</span>
                  </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center p-4">
                  <div 
                    className="w-24 h-24 rounded-full overflow-hidden mb-4 shadow-lg"
                  >
                    {kittyImages[openedKitty.name] ? (
                      <img 
                        src={kittyImages[openedKitty.name]} 
                        alt={openedKitty.name}
                        className="w-full h-full object-contain bg-white rounded-full p-1 shadow-inner"
                      />
                    ) : (
                      <div 
                        style={{ backgroundColor: kittyColors[openedKitty.name] || openedKitty.color || '#888888' }} 
                        className="w-full h-full flex items-center justify-center"
                      >
                        <span className="text-3xl font-bold text-white">{openedKitty.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-center mb-4">
                    <div className="text-xl font-medium mb-1">{openedKitty.name}</div>
                    <div className={`text-sm px-3 py-1 rounded-full inline-block
                      ${openedKitty.rarity === 'Common' ? 'bg-gray-600/50 text-gray-300' : 
                      openedKitty.rarity === 'Rare' ? 'bg-blue-600/50 text-blue-300' : 
                      openedKitty.rarity === 'Epic' ? 'bg-purple-600/50 text-purple-300' : 
                      openedKitty.rarity === 'Legendary' ? 'bg-amber-600/50 text-amber-300' : 
                      'bg-pink-600/50 text-pink-300'}
                    `}>
                      {openedKitty.rarity}
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-3 w-full">
                    <div className="text-sm text-gray-400 mb-1">Earns per day:</div>
                    <div className="flex items-center justify-center text-amber-400 text-lg">
                      <img src={tonLogo} alt="TON" className="w-5 h-5 mr-2" />
                      <span>{openedKitty.earnPerDay} TON</span>
                    </div>
                  </div>

                  <button 
                    className="mt-4 w-full py-3 bg-primary rounded-md font-medium"
                    onClick={() => setOpenedKitty(null)}
                  >
                    Awesome!
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={showKittyDialog} onOpenChange={setShowKittyDialog}>
            <button 
              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 text-sm flex items-center text-white/80 hover:text-white"
              onClick={() => setShowKittyDialog(true)}
            >
              <span>{t('whatIsInside')}</span>
              <Info className="ml-1 text-primary w-4 h-4" />
            </button>
            <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <span className="mr-2">{eggs[currentEgg].name} - Possible Cats</span>
                  <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
                    {eggs[currentEgg].minEarnPerDay} - {eggs[currentEgg].maxEarnPerDay} TON / Day
                  </span>
                </DialogTitle>
              </DialogHeader>

              <div className="max-h-[70vh] overflow-y-auto py-2">
                {loadingKitties ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : kitties && kitties.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 p-1">
                    {kitties.map((kitty) => (
                      <Card key={kitty.id} className="flex bg-gray-800/50 border-gray-700 overflow-hidden">
                        <div className="p-3 flex-1">
                          <div className="flex items-center mb-1">
                            <div 
                              className="w-8 h-8 rounded-full overflow-hidden mr-2"
                            >
                              {kittyImages[kitty.name] ? (
                                <img 
                                  src={kittyImages[kitty.name]} 
                                  alt={kitty.name}
                                  className="w-full h-full object-contain bg-white rounded-full p-0.5 shadow-inner"
                                />
                              ) : (
                                <div 
                                  style={{ backgroundColor: kittyColors[kitty.name] || kitty.color || '#888888' }} 
                                  className="w-full h-full flex items-center justify-center"
                                >
                                  <span className="text-xs font-bold text-white">{kitty.name.charAt(0)}</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{kitty.name}</div>
                              <div className={`text-xs px-2 py-0.5 rounded-full inline-block
                                ${kitty.rarity === 'Common' ? 'bg-gray-600/50 text-gray-300' : 
                                  kitty.rarity === 'Rare' ? 'bg-blue-600/50 text-blue-300' : 
                                  kitty.rarity === 'Epic' ? 'bg-purple-600/50 text-purple-300' : 
                                  kitty.rarity === 'Legendary' ? 'bg-amber-600/50 text-amber-300' : 
                                  'bg-pink-600/50 text-pink-300'}
                              `}>
                                {kitty.rarity}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between text-sm mt-2">
                            <div>
                              <div className="text-gray-400 text-xs">Earn per day</div>
                              <div className="flex items-center text-amber-400">
                                <img src={tonLogo} alt="TON" className="w-3 h-3 mr-1" />
                                <span>{kitty.earnPerDay} TON</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-gray-400 text-xs">Drop chance</div>
                              <div className="text-primary">{kitty.dropRate}%</div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 text-gray-400">
                    No cats found for this egg
                  </div>
                )}
              </div>

              <button 
                className="absolute top-3 right-3 rounded-full bg-gray-800/80 p-1"
                onClick={() => setShowKittyDialog(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Collection Section */}
      <div className="px-4 mt-2">
        <h2 className="text-lg font-display font-medium mb-3">{t('collection')}</h2>

        <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
          {collectionKitties.length > 0 ? (
            collectionKitties.map((kitty) => (
              <Card key={kitty.id} className="flex-shrink-0 bg-gray-800 rounded-xl p-3 w-40 relative">
                <div className="absolute top-2 right-2 bg-amber-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{kitty.count}</div>
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 mr-2 rounded-full overflow-hidden">
                    {kittyImages[kitty.name] ? (
                      <img 
                        src={kittyImages[kitty.name]} 
                        alt={kitty.name}
                        className="w-full h-full object-contain bg-white rounded-full p-0.5 shadow-inner"
                      />
                    ) : (
                      <div 
                        style={{ backgroundColor: kittyColors[kitty.name] || kitty.color || '#888888' }} 
                        className="w-full h-full flex items-center justify-center"
                      >
                        <span className="text-xs font-bold text-white">{kitty.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-sm">{kitty.name}</span>
                </div>
                <div className={`text-xs px-2 py-0.5 mb-2 rounded-full inline-block
                  ${kitty.rarity === 'Common' ? 'bg-gray-600/50 text-gray-300' : 
                    kitty.rarity === 'Rare' ? 'bg-blue-600/50 text-blue-300' : 
                    kitty.rarity === 'Epic' ? 'bg-purple-600/50 text-purple-300' : 
                    kitty.rarity === 'Legendary' ? 'bg-amber-600/50 text-amber-300' : 
                    'bg-pink-600/50 text-pink-300'}
                `}>
                  {kitty.rarity}
                </div>
                <div className="flex items-center text-yellow-400">
                  <span>{(kitty.earnPerDay * kitty.count).toFixed(4)}</span> {/* Updated earnPerDay with fixed decimal places */}
                  <img src={tonLogo} alt="TON" className="w-4 h-4 ml-1" />
                  <span className="text-sm text-gray-400 ml-1">/day</span>
                </div>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center w-full py-8 text-gray-400">
              <div className="text-center mb-4">
                <p>{t('noCollection')}</p>
                <p className="text-sm">{t('openToGetItems')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;