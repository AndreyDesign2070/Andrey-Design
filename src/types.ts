export type TournamentType = 'LIGA' | 'GRUPOS' | 'MUERTE_SUBITA';
export type TournamentStatus = 'VIGENTE' | 'TERMINADO';

export interface Tournament {
  id: string;
  name: string;
  type: TournamentType;
  status: TournamentStatus;
  logo: string; // Base64 PNG or default asset URL
}

export interface Club {
  id: string;
  tournamentId: string;
  name: string;
  crest: string; // Base64 or placeholder URL
  primaryColor: string; // hex
  secondaryColor: string; // hex
}

export interface Player {
  id: string;
  clubId: string;
  dorsal: string | number;
  firstName: string;
  lastName: string;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  played: boolean;
}

export interface Matchday {
  id: string;
  tournamentId: string;
  number: number; // e.g. 1 for Fecha 1
  matches: Match[];
}

export interface GoalRecord {
  id: string;
  tournamentId: string;
  clubId: string;
  playerId: string;
  goals: number;
  matchday?: string;
  date?: string;
}

export type CardType = '1_AMARILLA' | '2_AMARILLAS_ROJA' | 'ROJA_DIRECTA';

export interface SanctionRecord {
  id: string;
  tournamentId: string;
  clubId: string;
  playerId: string;
  cardType: CardType;
  suspensionWeeks: number;
  reason: string;
  matchday: string; // e.g. "Fecha 1"
  date: string; // Format: DD/MM/YYYY
}

export interface FixturePDF {
  tournamentId: string;
  pdfDataUrl: string; // Base64 dataURL
  fileName: string;
}

export type KnockoutStageType = 'OCTAVOS' | 'CUARTOS' | 'SEMIFINAL' | 'FINAL';

export interface KnockoutMatch {
  id: string;
  tournamentId: string;
  stage: KnockoutStageType;
  matchIndex: number;
  homeTeamId: string; // Can be a clubId or a custom team name like "Por clasificar"
  awayTeamId: string; // Can be a clubId or a custom team name like "Por clasificar"
  homeScore: number | null;
  awayScore: number | null;
  played: boolean;
  date: string;
}

