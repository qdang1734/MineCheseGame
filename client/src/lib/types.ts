export type ActiveScreen = "home" | "stats" | "invite" | "earn" | "wallet" | "deposit" | "withdraw" | "profile";

export interface User {
  id: number;
  username: string;
  rank?: string;
  avatar?: string;
  balance?: number;
  totalReward?: number;
  openedEggsCount?: number;
  totalEggs?: number;
  openedEggs?: number;
  loginStreak?: number;
  totalLogins?: number;
  lastLoginAt?: string;
  telegramUsername?: string;
  telegramId?: number;
}

export interface Kitty {
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

export interface Reward {
  amount: number;
  currency: string;
}

export interface Egg {
  id: number;
  type: string;
  color: string;
  spotColor: string;
  reward?: Reward;
}

export interface Collection {
  id: number;
  name: string;
  count: number;
  icon: string;
  color: string;
  reward: Reward;
}

export interface Task {
  id: number;
  title: string;
  platform: "twitter" | "telegram";
  reward: number;
  completed: boolean;
}
