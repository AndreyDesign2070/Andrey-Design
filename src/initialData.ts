import { Tournament, Club, Player, Matchday, GoalRecord, SanctionRecord, FixturePDF } from './types';

// Default base64 logos or placeholders
export const DEFAULT_TOURNAMENT_LOGO = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%2310b981"/><circle cx="50" cy="50" r="30" stroke="white" stroke-width="4" fill="none"/><line x1="50" y1="20" x2="50" y2="80" stroke="white" stroke-width="4"/><circle cx="50" cy="50" r="8" fill="white"/></svg>';

export const DEFAULT_CLUB_CRESTS: Record<string, string> = {
  barsa: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="%23b91c1c" stroke="%23facc15" stroke-width="4"/><rect x="30" y="30" width="40" height="40" fill="%231e3a8a"/><text x="50" y="60" font-family="sans-serif" font-weight="bold" font-size="24" fill="white" text-anchor="middle">FCB</text></svg>',
  madrid: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="white" stroke="%233b82f6" stroke-width="4"/><line x1="20" y1="20" x2="80" y2="80" stroke="%23facc15" stroke-width="6"/><text x="50" y="60" font-family="sans-serif" font-weight="bold" font-size="30" fill="%231e3a8a" text-anchor="middle">RM</text></svg>',
  mancity: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="55" r="38" fill="%230ea5e9" stroke="white" stroke-width="4"/><polygon points="50,15 80,45 50,75 20,45" fill="%23facc15"/><text x="50" y="62" font-family="sans-serif" font-weight="bold" font-size="20" fill="%231e3a8a" text-anchor="middle">MC</text></svg>',
  bayern: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23dc2626" stroke="white" stroke-width="4"/><circle cx="50" cy="50" r="25" fill="%232563eb" stroke="white" stroke-width="2"/><text x="50" y="58" font-family="sans-serif" font-weight="bold" font-size="22" fill="white" text-anchor="middle">FCB</text></svg>'
};

export const initialTournaments: Tournament[] = [
  {
    id: 't-1',
    name: 'Liga de las Estrellas GOLAPP',
    type: 'LIGA',
    status: 'VIGENTE',
    logo: DEFAULT_TOURNAMENT_LOGO
  },
  {
    id: 't-2',
    name: 'Copa Nocturna de Verano',
    type: 'MUERTE_SUBITA',
    status: 'VIGENTE',
    logo: DEFAULT_TOURNAMENT_LOGO
  },
  {
    id: 't-3',
    name: 'Torneo Clausura de Clubes',
    type: 'GRUPOS',
    status: 'TERMINADO',
    logo: DEFAULT_TOURNAMENT_LOGO
  }
];

export const initialClubs: Club[] = [
  // Clubs in't-1' (Liga de las Estrellas)
  {
    id: 'c-1',
    tournamentId: 't-1',
    name: 'Barcelona FC',
    crest: DEFAULT_CLUB_CRESTS.barsa,
    primaryColor: '#b91c1c',
    secondaryColor: '#1e3a8a'
  },
  {
    id: 'c-2',
    tournamentId: 't-1',
    name: 'Real Madrid',
    crest: DEFAULT_CLUB_CRESTS.madrid,
    primaryColor: '#ffffff',
    secondaryColor: '#3b82f6'
  },
  {
    id: 'c-3',
    tournamentId: 't-1',
    name: 'Manchester City',
    crest: DEFAULT_CLUB_CRESTS.mancity,
    primaryColor: '#0ea5e9',
    secondaryColor: '#1e3a8a'
  },
  {
    id: 'c-4',
    tournamentId: 't-1',
    name: 'Bayern Múnich',
    crest: DEFAULT_CLUB_CRESTS.bayern,
    primaryColor: '#dc2626',
    secondaryColor: '#2563eb'
  }
];

export const initialPlayers: Player[] = [
  // Barcelona FC
  { id: 'p-1', clubId: 'c-1', dorsal: '10', firstName: 'Lionel', lastName: 'Messi' },
  { id: 'p-2', clubId: 'c-1', dorsal: '9', firstName: 'Robert', lastName: 'Lewandowski' },
  { id: 'p-3', clubId: 'c-1', dorsal: '8', firstName: 'Pedri', lastName: 'González' },
  { id: 'p-4', clubId: 'c-1', dorsal: '6', firstName: 'Gavi', lastName: 'Páez' },
  
  // Real Madrid
  { id: 'p-5', clubId: 'c-2', dorsal: '7', firstName: 'Vinícius', lastName: 'Júnior' },
  { id: 'p-6', clubId: 'c-2', dorsal: '5', firstName: 'Jude', lastName: 'Bellingham' },
  { id: 'p-7', clubId: 'c-2', dorsal: '9', firstName: 'Kylian', lastName: 'Mbappé' },
  { id: 'p-8', clubId: 'c-2', dorsal: '10', firstName: 'Luka', lastName: 'Modric' },

  // Manchester City
  { id: 'p-9', clubId: 'c-3', dorsal: '9', firstName: 'Erling', lastName: 'Haaland' },
  { id: 'p-10', clubId: 'c-3', dorsal: '17', firstName: 'Kevin', lastName: 'De Bruyne' },
  { id: 'p-11', clubId: 'c-3', dorsal: '47', firstName: 'Phil', lastName: 'Foden' },

  // Bayern Munich
  { id: 'p-12', clubId: 'c-4', dorsal: '9', firstName: 'Harry', lastName: 'Kane' },
  { id: 'p-13', clubId: 'c-4', dorsal: '10', firstName: 'Leroy', lastName: 'Sané' },
  { id: 'p-14', clubId: 'c-4', dorsal: '42', firstName: 'Jamal', lastName: 'Musiala' }
];

export const initialMatchdays: Matchday[] = [
  {
    id: 'mday-1',
    tournamentId: 't-1',
    number: 1,
    matches: [
      {
        id: 'match-1',
        homeTeamId: 'c-1',
        awayTeamId: 'c-2',
        homeScore: 3,
        awayScore: 2,
        played: true
      },
      {
        id: 'match-2',
        homeTeamId: 'c-3',
        awayTeamId: 'c-4',
        homeScore: 1,
        awayScore: 1,
        played: true
      }
    ]
  },
  {
    id: 'mday-2',
    tournamentId: 't-1',
    number: 2,
    matches: [
      {
        id: 'match-3',
        homeTeamId: 'c-1',
        awayTeamId: 'c-3',
        homeScore: null,
        awayScore: null,
        played: false
      },
      {
        id: 'match-4',
        homeTeamId: 'c-2',
        awayTeamId: 'c-4',
        homeScore: null,
        awayScore: null,
        played: false
      }
    ]
  }
];

export const initialGoals: GoalRecord[] = [
  { id: 'g-1', tournamentId: 't-1', clubId: 'c-1', playerId: 'p-1', goals: 2 },
  { id: 'g-2', tournamentId: 't-1', clubId: 'c-1', playerId: 'p-2', goals: 1 },
  { id: 'g-3', tournamentId: 't-1', clubId: 'c-2', playerId: 'p-7', goals: 2 },
  { id: 'g-4', tournamentId: 't-1', clubId: 'c-3', playerId: 'p-9', goals: 1 },
  { id: 'g-5', tournamentId: 't-1', clubId: 'c-4', playerId: 'p-12', goals: 1 }
];

export const initialSanctions: SanctionRecord[] = [
  {
    id: 's-1',
    tournamentId: 't-1',
    clubId: 'c-1',
    playerId: 'p-3',
    cardType: '1_AMARILLA',
    suspensionWeeks: 0,
    reason: 'Falta táctica repetitiva',
    matchday: 'Fecha 1',
    date: '10/06/2026'
  },
  {
    id: 's-2',
    tournamentId: 't-1',
    clubId: 'c-2',
    playerId: 'p-5',
    cardType: '2_AMARILLAS_ROJA',
    suspensionWeeks: 1,
    reason: 'Doble amonestación por reclamos reiterados al árbitro',
    matchday: 'Fecha 1',
    date: '10/06/2026'
  }
];

export const initialFixtures: FixturePDF[] = [];
