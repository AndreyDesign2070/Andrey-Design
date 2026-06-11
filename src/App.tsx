import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  FileText, 
  Shield, 
  Users, 
  Flame, 
  ShieldAlert, 
  Share2, 
  ArrowLeft, 
  User, 
  LogOut,
  Calendar,
  Layers,
  Sparkles,
  Loader2
} from 'lucide-react';

import { 
  Tournament, 
  Club, 
  Player, 
  Matchday, 
  Match, 
  GoalRecord, 
  SanctionRecord, 
  FixturePDF,
  KnockoutMatch
} from './types';

import { 
  initialTournaments, 
  initialClubs, 
  initialPlayers, 
  initialMatchdays, 
  initialGoals, 
  initialSanctions,
  initialFixtures
} from './initialData';

import Login from './components/Login';
import TournamentSelector from './components/TournamentSelector';
import FixtureTab from './components/FixtureTab';
import TeamsTab from './components/TeamsTab';
import PlayersTab from './components/PlayersTab';
import TablePositionsTab from './components/TablePositionsTab';
import ScorersTab from './components/ScorersTab';
import SanctionsTab from './components/SanctionsTab';
import ShareTab from './components/ShareTab';

import { 
  collection, 
  onSnapshot, 
  setDoc, 
  doc, 
  deleteDoc, 
  getDocs,
  getDocFromServer
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from './firebase';

type TabId = 'FIXTURE' | 'EQUIPOS' | 'JUGADORES' | 'TABLA' | 'GOLEADORES' | 'SANCIONES' | 'COMPARTIR';

// Helper function to seed initial data in Firestore if empty
async function seedInitialDataIfEmpty() {
  try {
    // 1. Validate connection initially per skill guidelines
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (testError) {
      console.warn('Test connection document not found (which is expected if empty), client is online.');
    }

    let tSnap;
    try {
      tSnap = await getDocs(collection(db, 'tournaments'));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'tournaments');
    }

    if (tSnap.empty) {
      console.log('Iniciando carga de datos iniciales en Firestore...');
      
      // Seed tournaments
      for (const t of initialTournaments) {
        try {
          await setDoc(doc(db, 'tournaments', t.id), t);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `tournaments/${t.id}`);
        }
      }
      // Seed clubs
      for (const c of initialClubs) {
        try {
          await setDoc(doc(db, 'clubs', c.id), c);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `clubs/${c.id}`);
        }
      }
      // Seed players
      for (const p of initialPlayers) {
        try {
          await setDoc(doc(db, 'players', p.id), p);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `players/${p.id}`);
        }
      }
      // Seed matchdays
      for (const m of initialMatchdays) {
        try {
          await setDoc(doc(db, 'matchdays', m.id), m);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `matchdays/${m.id}`);
        }
      }
      // Seed goals
      for (const g of initialGoals) {
        try {
          await setDoc(doc(db, 'goalRecords', g.id), g);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `goalRecords/${g.id}`);
        }
      }
      // Seed sanctions
      for (const s of initialSanctions) {
        try {
          await setDoc(doc(db, 'sanctionRecords', s.id), s);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `sanctionRecords/${s.id}`);
        }
      }
      // Seed fixtures
      for (const f of initialFixtures) {
        try {
          await setDoc(doc(db, 'fixtures', f.tournamentId), f);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `fixtures/${f.tournamentId}`);
        }
      }
      console.log('Datos iniciales cargados con éxito en la nube!');
    }
  } catch (err) {
    console.error('Error al sembrar datos en Firestore:', err);
  }
}

export default function App() {
  // --- Persistent Authentication Role State ---
  const [role, setRole] = useState<'admin' | 'visitante' | null>(() => {
    const cached = localStorage.getItem('golapp_role');
    return (cached === 'admin' || cached === 'visitante') ? cached : null;
  });

  // --- Active selected tournament state ---
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(() => {
    return localStorage.getItem('golapp_active_tournament');
  });

  // --- Selected sub-view (Tab) state ---
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const cached = localStorage.getItem('golapp_active_tab');
    return (cached as TabId) || 'FIXTURE';
  });

  // --- Core Domain Database Collections ---
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matchdays, setMatchdays] = useState<Matchday[]>([]);
  const [goalRecords, setGoalRecords] = useState<GoalRecord[]>([]);
  const [sanctionRecords, setSanctionRecords] = useState<SanctionRecord[]>([]);
  const [fixtures, setFixtures] = useState<FixturePDF[]>([]);
  const [knockoutMatches, setKnockoutMatches] = useState<KnockoutMatch[]>([]);
  
  // Track database loading state
  const [isLoading, setIsLoading] = useState(true);

  // --- Load Data from Firestore on mount & subscribe to real-time changes ---
  useEffect(() => {
    let active = true;

    async function initFirebaseAndListen() {
      // First make sure initial data is seeded if database is completely empty
      await seedInitialDataIfEmpty();

      if (!active) return;

      // Setup real-time listeners with error handler per guidelines
      const unsubTournaments = onSnapshot(collection(db, 'tournaments'), (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data() as Tournament);
        setTournaments(data);
        setIsLoading(false);
      }, (error) => {
        setIsLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'tournaments');
      });

      const unsubClubs = onSnapshot(collection(db, 'clubs'), (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data() as Club);
        setClubs(data);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'clubs');
      });

      const unsubPlayers = onSnapshot(collection(db, 'players'), (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data() as Player);
        setPlayers(data);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'players');
      });

      const unsubMatchdays = onSnapshot(collection(db, 'matchdays'), (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data() as Matchday);
        const sorted = data.sort((a, b) => a.number - b.number);
        setMatchdays(sorted);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'matchdays');
      });

      const unsubGoals = onSnapshot(collection(db, 'goalRecords'), (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data() as GoalRecord);
        setGoalRecords(data);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'goalRecords');
      });

      const unsubSanctions = onSnapshot(collection(db, 'sanctionRecords'), (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data() as SanctionRecord);
        setSanctionRecords(data);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'sanctionRecords');
      });

      const unsubFixtures = onSnapshot(collection(db, 'fixtures'), (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data() as FixturePDF);
        setFixtures(data);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'fixtures');
      });

      const unsubKnockouts = onSnapshot(collection(db, 'knockoutMatches'), (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data() as KnockoutMatch);
        setKnockoutMatches(data);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'knockoutMatches');
      });

      return () => {
        unsubTournaments();
        unsubClubs();
        unsubPlayers();
        unsubMatchdays();
        unsubGoals();
        unsubSanctions();
        unsubFixtures();
        unsubKnockouts();
      };
    }

    let unsubscribersPromise = initFirebaseAndListen();

    return () => {
      active = false;
      unsubscribersPromise.then(unsubscribes => {
        if (typeof unsubscribes === 'function') {
          unsubscribes();
        }
      });
    };
  }, []);

  const handleRoleLogin = (userRole: 'admin' | 'visitante') => {
    setRole(userRole);
    localStorage.setItem('golapp_role', userRole);
  };

  const handleLogout = () => {
    setRole(null);
    setSelectedTournamentId(null);
    localStorage.removeItem('golapp_role');
    localStorage.removeItem('golapp_active_tournament');
  };

  const handleSelectTournament = (tId: string) => {
    setSelectedTournamentId(tId);
    localStorage.setItem('golapp_active_tournament', tId);
    setActiveTab('FIXTURE'); // Reset to default tab
  };

  const handleBackToTournaments = () => {
    setSelectedTournamentId(null);
    localStorage.removeItem('golapp_active_tournament');
  };

  // --- TOURNAMENT STATE CRUD ---
  const addTournament = async (newT: Tournament) => {
    try {
      await setDoc(doc(db, 'tournaments', newT.id), newT);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `tournaments/${newT.id}`);
    }
  };

  const deleteTournament = async (tId: string) => {
    try {
      // Delete tournament document
      try {
        await deleteDoc(doc(db, 'tournaments', tId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `tournaments/${tId}`);
      }

      // Cascade delete association elements
      const assocFixtures = fixtures.filter(f => f.tournamentId === tId);
      for (const f of assocFixtures) {
        try {
          await deleteDoc(doc(db, 'fixtures', f.tournamentId));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `fixtures/${f.tournamentId}`);
        }
      }

      const assocClubs = clubs.filter(c => c.tournamentId === tId);
      for (const c of assocClubs) {
        try {
          await deleteDoc(doc(db, 'clubs', c.id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `clubs/${c.id}`);
        }
      }

      const assocClubIds = assocClubs.map(c => c.id);
      const assocPlayers = players.filter(p => assocClubIds.includes(p.clubId));
      for (const p of assocPlayers) {
        try {
          await deleteDoc(doc(db, 'players', p.id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `players/${p.id}`);
        }
      }

      const assocMatchdays = matchdays.filter(m => m.tournamentId === tId);
      for (const m of assocMatchdays) {
        try {
          await deleteDoc(doc(db, 'matchdays', m.id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `matchdays/${m.id}`);
        }
      }

      const assocGoals = goalRecords.filter(g => g.tournamentId === tId);
      for (const g of assocGoals) {
        try {
          await deleteDoc(doc(db, 'goalRecords', g.id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `goalRecords/${g.id}`);
        }
      }

      const assocSanctions = sanctionRecords.filter(s => s.tournamentId === tId);
      for (const s of assocSanctions) {
        try {
          await deleteDoc(doc(db, 'sanctionRecords', s.id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `sanctionRecords/${s.id}`);
        }
      }

      if (selectedTournamentId === tId) {
        setSelectedTournamentId(null);
        localStorage.removeItem('golapp_active_tournament');
      }
    } catch (err) {
      console.error("Error deleting tournament from cloud:", err);
    }
  };

  // --- CLUBS STATE CRUD ---
  const addClub = async (newClub: Club) => {
    try {
      await setDoc(doc(db, 'clubs', newClub.id), newClub);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `clubs/${newClub.id}`);
    }
  };

  const updateClub = async (updatedClub: Club) => {
    try {
      await setDoc(doc(db, 'clubs', updatedClub.id), updatedClub);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `clubs/${updatedClub.id}`);
    }
  };

  const deleteClub = async (clubId: string) => {
    try {
      try {
        await deleteDoc(doc(db, 'clubs', clubId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `clubs/${clubId}`);
      }

      // Cascade delete players in this club
      const assocPlayers = players.filter(p => p.clubId === clubId);
      for (const p of assocPlayers) {
        try {
          await deleteDoc(doc(db, 'players', p.id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `players/${p.id}`);
        }
      }

      // Cascade delete goals
      const assocGoals = goalRecords.filter(g => g.clubId === clubId);
      for (const g of assocGoals) {
        try {
          await deleteDoc(doc(db, 'goalRecords', g.id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `goalRecords/${g.id}`);
        }
      }

      // Cascade delete sanctions
      const assocSanctions = sanctionRecords.filter(s => s.clubId === clubId);
      for (const s of assocSanctions) {
        try {
          await deleteDoc(doc(db, 'sanctionRecords', s.id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `sanctionRecords/${s.id}`);
        }
      }
    } catch (err) {
      console.error("Error deleting club from cloud:", err);
    }
  };

  // --- PLAYERS STATE CRUD ---
  const addPlayer = async (newPlayer: Player) => {
    try {
      await setDoc(doc(db, 'players', newPlayer.id), newPlayer);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `players/${newPlayer.id}`);
    }
  };

  const addPlayersBatch = async (batch: Player[]) => {
    try {
      for (const p of batch) {
        try {
          await setDoc(doc(db, 'players', p.id), p);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `players/${p.id}`);
        }
      }
    } catch (err) {
      console.error("Error adding batch players:", err);
    }
  };

  const updatePlayer = async (upPlayer: Player) => {
    try {
      await setDoc(doc(db, 'players', upPlayer.id), upPlayer);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `players/${upPlayer.id}`);
    }
  };

  const deletePlayer = async (playerId: string) => {
    try {
      try {
        await deleteDoc(doc(db, 'players', playerId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `players/${playerId}`);
      }

      // Delete corresponding statistics records
      const assocGoals = goalRecords.filter(g => g.playerId === playerId);
      for (const g of assocGoals) {
        try {
          await deleteDoc(doc(db, 'goalRecords', g.id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `goalRecords/${g.id}`);
        }
      }

      const assocSanctions = sanctionRecords.filter(s => s.playerId === playerId);
      for (const s of assocSanctions) {
        try {
          await deleteDoc(doc(db, 'sanctionRecords', s.id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `sanctionRecords/${s.id}`);
        }
      }
    } catch (err) {
      console.error("Error deleting player from cloud:", err);
    }
  };

  // --- JORNADAS STATE CRUD ---
  const addMatchday = async (newMday: Matchday) => {
    try {
      await setDoc(doc(db, 'matchdays', newMday.id), newMday);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `matchdays/${newMday.id}`);
    }
  };

  const deleteMatchday = async (mdayId: string) => {
    try {
      await deleteDoc(doc(db, 'matchdays', mdayId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `matchdays/${mdayId}`);
    }
  };

  const addMatch = async (matchdayId: string, match: Match) => {
    try {
      const currentMday = matchdays.find(m => m.id === matchdayId);
      if (currentMday) {
        const updated = {
          ...currentMday,
          matches: [...currentMday.matches, match]
        };
        await setDoc(doc(db, 'matchdays', matchdayId), updated);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `matchdays/${matchdayId}`);
    }
  };

  const updateMatchScore = async (
    matchdayId: string, 
    matchId: string, 
    homeScore: number | null, 
    awayScore: number | null, 
    played: boolean
  ) => {
    try {
      const currentMday = matchdays.find(m => m.id === matchdayId);
      if (currentMday) {
        const updated = {
          ...currentMday,
          matches: currentMday.matches.map(match => {
            if (match.id === matchId) {
              return {
                ...match,
                homeScore,
                awayScore,
                played
              };
            }
            return match;
          })
        };
        await setDoc(doc(db, 'matchdays', matchdayId), updated);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `matchdays/${matchdayId}`);
    }
  };

  const deleteMatch = async (matchdayId: string, matchId: string) => {
    try {
      const currentMday = matchdays.find(m => m.id === matchdayId);
      if (currentMday) {
        const updated = {
          ...currentMday,
          matches: currentMday.matches.filter(match => match.id !== matchId)
        };
        await setDoc(doc(db, 'matchdays', matchdayId), updated);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `matchdays/${matchdayId}`);
    }
  };

  // --- SCORERS STATE CRUD ---
  const registerGoals = async (playerId: string, clubId: string, goals: number, matchday?: string, date?: string) => {
    try {
      // Find record under selected tournament, same player AND same matchday to group correctly
      const existingRec = goalRecords.find(
        g => g.playerId === playerId && 
             g.tournamentId === selectedTournamentId && 
             g.matchday === matchday
      );

      if (existingRec) {
        await setDoc(doc(db, 'goalRecords', existingRec.id), {
          ...existingRec,
          goals: existingRec.goals + goals,
          date: date || existingRec.date || ''
        });
      } else {
        const goalId = `g-${Date.now()}`;
        const newRec: GoalRecord = {
          id: goalId,
          tournamentId: selectedTournamentId || '',
          clubId,
          playerId,
          goals,
          matchday: matchday || 'Fecha Inicial',
          date: date || ''
        };
        await setDoc(doc(db, 'goalRecords', goalId), newRec);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'goalRecords');
    }
  };

  const clearScorer = async (scorerId: string) => {
    try {
      await deleteDoc(doc(db, 'goalRecords', scorerId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `goalRecords/${scorerId}`);
    }
  };

  // --- SANCIONES STATE CRUD ---
  const addSanction = async (newS: SanctionRecord) => {
    try {
      await setDoc(doc(db, 'sanctionRecords', newS.id), newS);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `sanctionRecords/${newS.id}`);
    }
  };

  const updateSanction = async (upS: SanctionRecord) => {
    try {
      await setDoc(doc(db, 'sanctionRecords', upS.id), upS);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `sanctionRecords/${upS.id}`);
    }
  };

  const deleteSanction = async (sId: string) => {
    try {
      await deleteDoc(doc(db, 'sanctionRecords', sId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `sanctionRecords/${sId}`);
    }
  };

  // --- FIXTURE PDF CRUD ---
  const handleUploadFixturePdf = async (pdfDataUrl: string, fileName: string) => {
    if (!selectedTournamentId) return;
    try {
      const fId = selectedTournamentId;
      const newPdfObj: FixturePDF = { 
        tournamentId: selectedTournamentId, 
        pdfDataUrl, 
        fileName 
      };
      await setDoc(doc(db, 'fixtures', fId), newPdfObj);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `fixtures/${selectedTournamentId}`);
    }
  };

  const handleClearFixturePdf = async () => {
    if (!selectedTournamentId) return;
    try {
      await deleteDoc(doc(db, 'fixtures', selectedTournamentId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `fixtures/${selectedTournamentId}`);
    }
  };

  // --- KNOCKOUT STAGE CRUD ---
  const updateKnockoutMatch = async (match: KnockoutMatch) => {
    try {
      await setDoc(doc(db, 'knockoutMatches', match.id), match);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `knockoutMatches/${match.id}`);
    }
  };

  // Render Loader if initial fetch is pending
  if (role && isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white font-sans select-none">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-zinc-400 text-xs uppercase tracking-widest font-mono animate-pulse">Sincronizando con GOLAPP Cloud...</p>
      </div>
    );
  }

  // --- 3. View Routing Controllers ---
  if (!role) {
    return <Login onLogin={handleRoleLogin} />;
  }

  const activeTournament = tournaments.find(t => t.id === selectedTournamentId);

  if (!selectedTournamentId || !activeTournament) {
    return (
      <TournamentSelector
        tournaments={tournaments}
        role={role}
        onSelectTournament={handleSelectTournament}
        onAddTournament={addTournament}
        onDeleteTournament={deleteTournament}
        onLogout={handleLogout}
      />
    );
  }

  // Find active pdf fixture
  const activePdf = fixtures.find(f => f.tournamentId === activeTournament.id);

  // Tabs metadata list
  const tabSchema = [
    { id: 'FIXTURE', text: 'Fixture PDF', icon: <FileText className="w-4 h-4" /> },
    { id: 'EQUIPOS', text: 'Equipos', icon: <Shield className="w-4 h-4" /> },
    { id: 'JUGADORES', text: 'Jugadores', icon: <Users className="w-4 h-4" /> },
    { id: 'TABLA', text: 'Tabla Posiciones', icon: <Trophy className="w-4 h-4" /> },
    { id: 'GOLEADORES', text: 'Goleadores', icon: <Flame className="w-4 h-4" /> },
    { id: 'SANCIONES', text: 'Tarjetas/Sanciones', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'COMPARTIR', text: 'Compartir/APK', icon: <Share2 className="w-4 h-4" /> }
  ] as const;

  const handleTabChange = (tId: TabId) => {
    setActiveTab(tId);
    localStorage.setItem('golapp_active_tab', tId);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans select-none antialiased">
      
      {/* 1. Header Navigation Bracket */}
      <header className="bg-zinc-950 border-b border-zinc-900 sticky top-0 z-30 shadow-lg backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            {/* Back Arrow */}
            <button
              id="back-to-tournaments-header-btn"
              onClick={handleBackToTournaments}
              className="bg-zinc-900/80 hover:bg-zinc-900 text-zinc-400 hover:text-white p-2 rounded-xl border border-zinc-850 transition flex items-center justify-center cursor-pointer"
              title="Volver a torneos"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Logo image of chosen tournament */}
            <div className="flex items-center gap-2.5">
              <img 
                src={activeTournament.logo} 
                alt="Logo del torneo" 
                className="w-10 h-10 object-contain rounded-lg bg-zinc-900 p-0.5 border border-zinc-800"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <h2 className="font-extrabold text-sm sm:text-base leading-tight text-white truncate max-w-[150px] sm:max-w-[300px]">
                  {activeTournament.name}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${activeTournament.status === 'VIGENTE' ? 'bg-emerald-500 pulse-green' : 'bg-red-500'}`} />
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                    {activeTournament.type} • {activeTournament.status === 'VIGENTE' ? 'Vigente' : 'Terminado'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* User access badge */}
          <div className="flex items-center gap-2.5">
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${
              role === 'admin' 
                ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30' 
                : 'bg-zinc-900/60 text-zinc-500 border-zinc-850'
            }`}>
              <User className="w-3.5 h-3.5" />
              <span>{role === 'admin' ? 'Admin' : 'Visitante'}</span>
            </div>

            <button
              id="logout-header-btn"
              onClick={handleLogout}
              className="bg-zinc-900 hover:bg-zinc-850 p-2 text-zinc-500 hover:text-red-500 rounded-xl border border-zinc-850 transition flex items-center justify-center cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. Interactive Navigation Tabs Rail */}
      <div className="bg-zinc-950/80 border-b border-zinc-900/60 py-2 overflow-x-auto select-none sticky top-16 z-20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex gap-1.5 min-w-[750px]">
          {tabSchema.map((item) => {
            const isSelected = activeTab === item.id;
            return (
              <button
                id={`tab-btn-${item.id}`}
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/25 ring-1 ring-emerald-500/20 shadow'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/55'
                }`}
              >
                {item.icon}
                <span>{item.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in focus:outline-none">
        
        {activeTab === 'FIXTURE' && (
          <FixtureTab
            tournament={activeTournament}
            fixturePdf={activePdf}
            role={role}
            onUpload={handleUploadFixturePdf}
            onClear={handleClearFixturePdf}
          />
        )}

        {activeTab === 'EQUIPOS' && (
          <TeamsTab
            tournament={activeTournament}
            tournaments={tournaments}
            clubs={clubs}
            role={role}
            onAddClub={addClub}
            onUpdateClub={updateClub}
            onDeleteClub={deleteClub}
          />
        )}

        {activeTab === 'JUGADORES' && (
          <PlayersTab
            tournament={activeTournament}
            clubs={clubs}
            players={players}
            role={role}
            onAddPlayer={addPlayer}
            onAddPlayersBatch={addPlayersBatch}
            onUpdatePlayer={updatePlayer}
            onDeletePlayer={deletePlayer}
          />
        )}

        {activeTab === 'TABLA' && (
          <TablePositionsTab
            tournament={activeTournament}
            clubs={clubs}
            matchdays={matchdays}
            role={role}
            onAddMatchday={addMatchday}
            onDeleteMatchday={deleteMatchday}
            onAddMatch={addMatch}
            onUpdateMatchScore={updateMatchScore}
            onDeleteMatch={deleteMatch}
            knockoutMatches={knockoutMatches}
            onUpdateKnockoutMatch={updateKnockoutMatch}
          />
        )}

        {activeTab === 'GOLEADORES' && (
          <ScorersTab
            tournament={activeTournament}
            clubs={clubs}
            players={players}
            goalRecords={goalRecords}
            role={role}
            onRegisterGoals={registerGoals}
            onClearScorer={clearScorer}
          />
        )}

        {activeTab === 'SANCIONES' && (
          <SanctionsTab
            tournament={activeTournament}
            clubs={clubs}
            players={players}
            sanctionRecords={sanctionRecords}
            role={role}
            onAddSanction={addSanction}
            onUpdateSanction={updateSanction}
            onDeleteSanction={deleteSanction}
          />
        )}

        {activeTab === 'COMPARTIR' && (
          <ShareTab 
            tournament={activeTournament} 
          />
        )}

      </main>

      {/* 4. Elegant Footer */}
      <footer className="bg-zinc-950/40 border-t border-zinc-900/60 py-6 text-center text-zinc-650 text-xs mt-auto">
        <p>App By: <span className="text-zinc-550 font-semibold">Andrey Design</span></p>
      </footer>

    </div>
  );
}
