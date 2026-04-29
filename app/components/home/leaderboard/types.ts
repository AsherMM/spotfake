export type LeaderboardApiEntry = {
  rank: number;
  powerScore: number;
  bestStreak: number;
  flawlessRuns: number;
  bestScore: number;
  player: {
    id: string;
    displayName: string;
    fullName?: string | null;
    avatarUrl?: string | null;
    isGuest: boolean;
  };
};

export type LeaderboardApiResponse =
  | LeaderboardApiEntry[]
  | {
      mode?: string;
      limit?: number;
      count?: number;
      items?: LeaderboardApiEntry[];
    };

export type LeaderboardEntry = {
  rank: number;
  name: string;
  avatar: string | null;
  bestScore: number;
  bestStreak: number;
  flawlessRuns: number;
  powerScore: number;
  isGuest: boolean;
};