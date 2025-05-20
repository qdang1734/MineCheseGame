import { useState, useEffect } from "react";
import { Copy, Share2, Gift, Award, Check, UserPlus, Loader2 } from "lucide-react";
import GradientButton from "@/components/ui/gradient-button";
import { useLanguage } from "@/providers/LanguageProvider";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import tonLogo from "@/assets/ton_symbol_1746668225277.png";

interface Tab {
  id: string;
  label: string;
}

interface ReferredUser {
  id: number;
  username: string;
  eggsOpened: number;
}

interface ReferralStats {
  totalReferrals: number;
  totalEarned: number;
  referralCode: string;
  referralLink: string;
}

const Invite = () => {
  const [activeTab, setActiveTab] = useState<string>("friends");
  const [isCopying, setIsCopying] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const tabs: Tab[] = [
    { id: "friends", label: t('listFriends') },
    { id: "rewards", label: t('rewards') }
  ];

  // Fetch referral data
  const { data: referralStats, isLoading: statsLoading } = useQuery<ReferralStats>({
    queryKey: ['/api/referral-stats'],
    refetchOnWindowFocus: false,
  });

  // Fetch referred users
  const { data: referredUsers, isLoading: usersLoading } = useQuery<ReferredUser[]>({
    queryKey: ['/api/referred-users'],
    refetchOnWindowFocus: false,
  });

  // Handle copying referral link
  const handleCopyLink = async () => {
    if (!referralStats?.referralLink) return;

    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(referralStats.referralLink);
      toast({
        title: t('copyInviteLink'),
        description: t('copyInviteLink'),
      });
    } catch (err) {
      toast({
        title: t('copyInviteLink'),
        description: t('copyInviteLink'),
        variant: "destructive",
      });
    } finally {
      setIsCopying(false);
    }
  };

  // Handle sharing referral link
  const handleShareLink = async () => {
    if (!referralStats?.referralLink) return;

    try {
      setIsSharing(true);
      if (navigator.share) {
        await navigator.share({
          title: 'NebulaChest - Mời bạn bè',
          text: 'Tham gia NebulaChest và nhận phần thưởng! Sử dụng liên kết của tôi:',
          url: referralStats.referralLink,
        });
      } else {
        throw new Error("Web Share API không được hỗ trợ");
      }
    } catch (err) {
      // Fallback to copy if sharing fails
      handleCopyLink();
    } finally {
      setIsSharing(false);
    }
  };

  const isLoading = statsLoading || usersLoading;

  return (
    <div className="p-4">
      <h2 className="text-xl font-display font-semibold mb-2">{t('inviteFriends')}</h2>
      <p className="text-gray-400 text-sm mb-4">{t('earnTonCoin')}</p>

      <div className="flex space-x-2 mb-6">
        <div className="flex-1 rounded-lg bg-gray-800/80 p-3">
          <div className="text-center text-sm text-gray-300 mb-1">{t('totalFriends')}</div>
          <div className="text-amber-500 text-2xl font-display font-bold text-center">
            {isLoading ? (
              <Loader2 className="w-5 h-5 mx-auto animate-spin opacity-70" />
            ) : (
              referralStats?.totalReferrals || 0
            )}
          </div>
        </div>
        <div className="flex-1 rounded-lg bg-gray-800/80 p-3">
          <div className="text-center text-sm text-gray-300 mb-1">{t('tonEarned')}</div>
          <div className="text-amber-500 text-2xl font-display font-bold flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="w-5 h-5 mx-auto animate-spin opacity-70" />
            ) : (
              <>
                {(referralStats?.totalEarned || 0).toFixed(4)}
                <img src={tonLogo} alt="TON" className="w-4 h-4 ml-1" />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-800/80 rounded-lg p-4 mb-6">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
            <Gift className="text-amber-500 text-xl" />
          </div>
        </div>
        <h3 className="text-center font-medium mb-3">{t('reward')}</h3>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">{t('eachChestOpened')}</span>
            <span className="text-amber-500 font-medium">10%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">{t('invite1Friend')}</span>
            <div className="flex items-center text-amber-500 font-medium">
              <span>+0.1</span>
              <img src={tonLogo} alt="TON" className="w-4 h-4 ml-1" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">{t('invite1PremiumFriend')}</span>
            <div className="flex items-center text-amber-500 font-medium">
              <span>+1</span>
              <img src={tonLogo} alt="TON" className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-400 mt-2">{t('friendOpenChest')}</div>
      </div>

      <div className="mb-6">
        <div className="flex border-b border-gray-700">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              className={`pb-2 ${
                activeTab === tab.id 
                  ? "font-medium text-white border-b-2 border-primary" 
                  : "text-gray-400"
              } ${tab.id !== tabs[0].id ? "ml-4" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "friends" && (
          <div className="py-3">
            {isLoading ? (
              <div className="py-8 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                <p className="text-sm text-gray-400">{t('loading')}</p>
              </div>
            ) : referredUsers && referredUsers.length > 0 ? (
              <div className="space-y-3 mt-3">
                {referredUsers.map(user => (
                  <div key={user.id} className="bg-gray-800/60 rounded-lg p-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                        <UserPlus className="w-4 h-4 text-gray-300" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{user.username}</div>
                        <div className="text-xs text-gray-400">
                          {t('eggsOpened')}: {user.eggsOpened}
                        </div>
                      </div>
                    </div>
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400">
                <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>{t('noData')}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "rewards" && (
          <div className="py-6 text-center text-gray-400">
            <Gift className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>{t('earnTonCoin')}</p>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <GradientButton 
          fullWidth 
          className="flex-1 py-3 rounded-lg font-medium text-white"
          onClick={handleCopyLink}
        >
          {isCopying ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('loading')}
            </>
          ) : (
            <>{t('copyInviteLink')}</>
          )}
        </GradientButton>
        <button 
          className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center"
          title={t('copyInviteLink')}
          onClick={handleCopyLink}
        >
          {isCopying ? (
            <Loader2 className="text-gray-400 w-5 h-5 animate-spin" />
          ) : (
            <Copy className="text-gray-400 w-5 h-5" />
          )}
        </button>
        <button 
          className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center"
          title={t('shareInviteLink')}
          onClick={handleShareLink}
        >
          {isSharing ? (
            <Loader2 className="text-gray-400 w-5 h-5 animate-spin" />
          ) : (
            <Share2 className="text-gray-400 w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default Invite;