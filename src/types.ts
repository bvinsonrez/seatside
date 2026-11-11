export type SportId = 'hockey' | 'basketball';
export type GameMode = 'prediction' | 'trivia' | 'bingo';

export interface Seat { section: string; row: string; seat: string }

/** A ticket order from the team's ticketing system. `seats` includes `holderSeat`. */
export interface TicketOrder { id: string; holderName: string; holderEmail: string; holderSeat: Seat; seats: Seat[] }

export type SeatLink =
  | { kind: 'holder'; orderId: string }
  | { kind: 'seat-match'; orderId: string; holderName: string }
  | { kind: 'no-match' }
  | { kind: 'no-seat' };

export interface GameRecord { gameId: string; date: string; opponent: string; points: number }

export interface Fan {
  id: string;
  name: string;
  email: string;
  seat: Seat | null;
  link: SeatLink;
  signupOrder: number;
  signupBreakId: string | null;
  gamePoints: number;
  plays: GameMode[];
  seasonHistory: GameRecord[];
  isPresenter: boolean;
}

export interface Sponsor { id: string; name: string; category: string }
export interface Reward { id: string; name: string; sponsorId: string; unlockAt: number }
export interface BreakSlot { id: string; label: string; mode: GameMode; sponsorId: string }
export interface GameEvent { id: string; label: string; bingoSquareIds: string[]; predictionOutcome: string | null }
export interface TriviaQuestion { id: string; question: string; choices: string[]; answerIndex: number }
export interface BingoSquare { id: string; label: string }

export interface ContentPack {
  sport: SportId;
  displayName: string;
  terms: { period: string; breakName: string };
  predictionPrompt: string;
  predictionOptions: string[];
  trivia: TriviaQuestion[];
  bingoSquares: BingoSquare[];
  breaks: BreakSlot[];
  events: GameEvent[];
}

export interface TeamConfig {
  appName: 'Seatside';
  home: { name: string; short: string; primary: string; secondary: string };
  away: { name: string; short: string };
  venue: string;
  tonightLabel: string;
  nightSponsorId: string;
  sectionBattle: { sponsorId: string; prize: string };
}
