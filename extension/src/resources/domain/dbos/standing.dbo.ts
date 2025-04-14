export interface StandingDbo {
  id: string, // teamId
  rank: number
  wins: number
  losses: number
  draws: number
  matchPoints: number
  gameWinPercent: number
  opponentGameWinPercent: number
  opponentMatchWinPercent: number
}