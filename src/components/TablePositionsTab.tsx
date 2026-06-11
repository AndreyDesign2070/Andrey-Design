import React, { useState } from 'react';
import { 
  Trophy, 
  Plus, 
  Trash2, 
  Save, 
  Edit, 
  Check, 
  X, 
  Calendar,
  AlertCircle,
  Clock,
  ShieldCheck,
  Flame,
  Gamepad2
} from 'lucide-react';
import { Tournament, Club, Matchday, Match, KnockoutMatch, KnockoutStageType } from '../types';
import ConfirmDialog from './ConfirmDialog';

interface TablePositionsTabProps {
  tournament: Tournament;
  clubs: Club[];
  matchdays: Matchday[];
  role: 'admin' | 'visitante';
  onAddMatchday: (matchday: Matchday) => void;
  onDeleteMatchday: (matchdayId: string) => void;
  onAddMatch: (matchdayId: string, match: Match) => void;
  onUpdateMatchScore: (matchdayId: string, matchId: string, homeScore: number | null, awayScore: number | null, played: boolean) => void;
  onDeleteMatch: (matchdayId: string, matchId: string) => void;
  knockoutMatches: KnockoutMatch[];
  onUpdateKnockoutMatch: (match: KnockoutMatch) => void;
}

interface TableRow {
  clubId: string;
  name: string;
  crest: string;
  pts: number;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
}

export default function TablePositionsTab({
  tournament,
  clubs,
  matchdays,
  role,
  onAddMatchday,
  onDeleteMatchday,
  onAddMatch,
  onUpdateMatchScore,
  onDeleteMatch,
  knockoutMatches,
  onUpdateKnockoutMatch
}: TablePositionsTabProps) {
  // Filter clubs and matchdays of current tournament
  const currentClubs = clubs.filter(c => c.tournamentId === tournament.id);
  const currentMatchdays = matchdays.filter(m => m.tournamentId === tournament.id)
    .sort((a,b) => a.number - b.number);

  // Selected active Matchday to display matches
  const [activeMdayId, setActiveMdayId] = useState<string>(
    currentMatchdays.length > 0 ? currentMatchdays[0].id : ''
  );

  // Safely get active matchday index / correction
  const validActiveMdayId = currentMatchdays.some(m => m.id === activeMdayId)
    ? activeMdayId
    : (currentMatchdays.length > 0 ? currentMatchdays[0].id : '');
  
  const activeMatchday = currentMatchdays.find(m => m.id === validActiveMdayId);

  // New Match Creator inputs (Admin)
  const [newMatchHomeId, setNewMatchHomeId] = useState('');
  const [newMatchAwayId, setNewMatchAwayId] = useState('');

  // Editing scores state (matchId -> {home, away})
  const [editingMatches, setEditingMatches] = useState<Record<string, { home: string; away: string; played: boolean }>>({});

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // --- ETAPA FINAL (PLAYOFFS / BRACKETS) STATES ---
  const [selectedStage, setSelectedStage] = useState<KnockoutStageType>('OCTAVOS');
  const [editingKnockoutId, setEditingKnockoutId] = useState<string | null>(null);

  const [editKHomeId, setEditKHomeId] = useState('');
  const [editKHomeCustom, setEditKHomeCustom] = useState('');
  const [editKUseCustomHome, setEditKUseCustomHome] = useState(false);

  const [editKAwayId, setEditKAwayId] = useState('');
  const [editKAwayCustom, setEditKAwayCustom] = useState('');
  const [editKUseCustomAway, setEditKUseCustomAway] = useState(false);

  const [editKHomeScore, setEditKHomeScore] = useState('');
  const [editKAwayScore, setEditKAwayScore] = useState('');
  const [editKPlayed, setEditKPlayed] = useState(false);
  const [editKDate, setEditKDate] = useState('');

  const stageConfig = {
    OCTAVOS: { label: 'Octavos de Final', teamsCount: 16, matchesCount: 8 },
    CUARTOS: { label: 'Cuartos de Final', teamsCount: 8, matchesCount: 4 },
    SEMIFINAL: { label: 'Semifinales', teamsCount: 4, matchesCount: 2 },
    FINAL: { label: 'Gran Final', teamsCount: 2, matchesCount: 1 }
  };

  const startEditingKnockout = (match: KnockoutMatch) => {
    setEditingKnockoutId(match.id);
    
    const isHomeClub = currentClubs.some(c => c.id === match.homeTeamId);
    if (isHomeClub) {
      setEditKHomeId(match.homeTeamId);
      setEditKHomeCustom('');
      setEditKUseCustomHome(false);
    } else {
      setEditKHomeId('');
      setEditKHomeCustom(match.homeTeamId !== 'Pendiente' ? match.homeTeamId : '');
      setEditKUseCustomHome(true);
    }
    
    const isAwayClub = currentClubs.some(c => c.id === match.awayTeamId);
    if (isAwayClub) {
      setEditKAwayId(match.awayTeamId);
      setEditKAwayCustom('');
      setEditKUseCustomAway(false);
    } else {
      setEditKAwayId('');
      setEditKAwayCustom(match.awayTeamId !== 'Pendiente' ? match.awayTeamId : '');
      setEditKUseCustomAway(true);
    }
    
    setEditKHomeScore(match.homeScore !== null ? String(match.homeScore) : '');
    setEditKAwayScore(match.awayScore !== null ? String(match.awayScore) : '');
    setEditKPlayed(match.played);
    setEditKDate(match.date || '');
  };

  const saveKnockoutChange = (matchId: string, index: number) => {
    const homeVal = editKUseCustomHome ? (editKHomeCustom.trim() || 'Pendiente') : (editKHomeId || 'Pendiente');
    const awayVal = editKUseCustomAway ? (editKAwayCustom.trim() || 'Pendiente') : (editKAwayId || 'Pendiente');

    const homeScoreVal = editKHomeScore === '' ? null : parseInt(editKHomeScore, 10);
    const awayScoreVal = editKAwayScore === '' ? null : parseInt(editKAwayScore, 10);

    const updated: KnockoutMatch = {
      id: matchId,
      tournamentId: tournament.id,
      stage: selectedStage,
      matchIndex: index,
      homeTeamId: homeVal,
      awayTeamId: awayVal,
      homeScore: homeScoreVal,
      awayScore: awayScoreVal,
      played: editKPlayed,
      date: editKDate
    };

    onUpdateKnockoutMatch(updated);
    setEditingKnockoutId(null);
  };

  const getTeamDisplay = (teamIdOrText: string) => {
    const club = currentClubs.find(c => c.id === teamIdOrText);
    if (club) {
      return {
        name: club.name,
        crest: club.crest,
        isClub: true
      };
    }
    return {
      name: teamIdOrText || 'Pendiente',
      crest: '',
      isClub: false
    };
  };

  // 1. Create a new Matchday (Fecha)
  const handleCreateMatchday = () => {
    const nextNumber = currentMatchdays.length + 1;
    const newMday: Matchday = {
      id: `mday-${Date.now()}`,
      tournamentId: tournament.id,
      number: nextNumber,
      matches: []
    };
    onAddMatchday(newMday);
    setActiveMdayId(newMday.id);
  };

  // 2. Add Match to Active Matchday
  const handleAddMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validActiveMdayId) return;
    if (!newMatchHomeId || !newMatchAwayId) return;
    if (newMatchHomeId === newMatchAwayId) {
      alert('Un equipo no puede jugar contra sí mismo.');
      return;
    }

    // Check if this matchup already exists in current matchday
    const isDuplicate = activeMatchday?.matches.some(
      m => (m.homeTeamId === newMatchHomeId && m.awayTeamId === newMatchAwayId) ||
           (m.homeTeamId === newMatchAwayId && m.awayTeamId === newMatchHomeId)
    );

    if (isDuplicate) {
      alert('Este encuentro ya está programado para esta fecha.');
      return;
    }

    const newM: Match = {
      id: `match-${Date.now()}`,
      homeTeamId: newMatchHomeId,
      awayTeamId: newMatchAwayId,
      homeScore: null,
      awayScore: null,
      played: false
    };

    onAddMatch(validActiveMdayId, newM);
    setNewMatchHomeId('');
    setNewMatchAwayId('');
  };

  // 3. Edit Scores Handlers
  const startEditingScore = (m: Match) => {
    setEditingMatches({
      ...editingMatches,
      [m.id]: {
        home: m.homeScore !== null ? String(m.homeScore) : '',
        away: m.awayScore !== null ? String(m.awayScore) : '',
        played: m.played
      }
    });
  };

  const handleScoreChange = (matchId: string, team: 'home' | 'away', val: string) => {
    const rawVal = val.replace(/\D/g, ''); // Digits only
    setEditingMatches({
      ...editingMatches,
      [matchId]: {
        ...editingMatches[matchId],
        [team]: rawVal
      }
    });
  };

  const saveScoreChange = (matchId: string) => {
    const editState = editingMatches[matchId];
    if (!editState) return;

    if (editState.home === '' || editState.away === '') {
      alert('Debe rellenar ambos marcadores para registrar el resultado.');
      return;
    }

    const home = parseInt(editState.home, 10);
    const away = parseInt(editState.away, 10);

    onUpdateMatchScore(validActiveMdayId, matchId, home, away, true);

    // Remove from edit state
    const copy = { ...editingMatches };
    delete copy[matchId];
    setEditingMatches(copy);
  };

  const clearMatchScore = (matchId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Anular Resultado',
      message: '¿Estás seguro de que deseas anular el resultado registrado y volver a dejar este partido como pendiente "por jugar"?',
      onConfirm: () => {
        onUpdateMatchScore(validActiveMdayId, matchId, null, null, false);
        const copy = { ...editingMatches };
        delete copy[matchId];
        setEditingMatches(copy);
      }
    });
  };

  // 4. GENERATE POSITIONS TABLE
  // Standard Football Calculations:
  // Won (PG) = 3pts, Draw (PE) = 1pts, Lost (PP) = 0pt
  const calculatePositionsTable = (): TableRow[] => {
    // Scaffold initial blank rows for each club in this tournament
    const table: Record<string, TableRow> = {};
    currentClubs.forEach(club => {
      table[club.id] = {
        clubId: club.id,
        name: club.name,
        crest: club.crest,
        pts: 0,
        pj: 0,
        pg: 0,
        pe: 0,
        pp: 0,
        gf: 0,
        gc: 0,
        dg: 0
      };
    });

    // Loop through ALL matchdays and matches of this tournament
    currentMatchdays.forEach(mday => {
      mday.matches.forEach(match => {
        if (!match.played) return; // Skip non-played
        if (match.homeScore === null || match.awayScore === null) return;

        const home = table[match.homeTeamId];
        const away = table[match.awayTeamId];

        // Guard against deleted club orphans
        if (!home || !away) return;

        // Played games increment
        home.pj += 1;
        away.pj += 1;

        // Goals accumulation
        home.gf += match.homeScore;
        home.gc += match.awayScore;
        away.gf += match.awayScore;
        away.gc += match.homeScore;

        // Determine outcome
        if (match.homeScore > match.awayScore) {
          // Home win
          home.pg += 1;
          home.pts += 3;
          away.pp += 1;
        } else if (match.homeScore < match.awayScore) {
          // Away win
          away.pg += 1;
          away.pts += 3;
          home.pp += 1;
        } else {
          // Draw
          home.pe += 1;
          home.pts += 1;
          away.pe += 1;
          away.pts += 1;
        }
      });
    });

    // Re-calculate goal differences and parse into array
    const tableRows = Object.values(table).map(row => {
      row.dg = row.gf - row.gc;
      return row;
    });

    // Sort criteria: Points desc, Goal Diff desc, Goals For desc, Name asc
    return tableRows.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.dg !== a.dg) return b.dg - a.dg;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.name.localeCompare(b.name);
    });
  };

  const positionsTable = calculatePositionsTable();

  return (
    <div className="space-y-6">
      
      {/* Tab Title */}
      <div className="border-b border-zinc-900 pb-5">
        <h2 className="text-xl font-bold font-sans flex items-center gap-2">
          <Trophy className="w-5 h-5 text-emerald-500" />
          <span>Tabla & Jornadas Deportivas</span>
        </h2>
        <p className="text-zinc-400 text-xs mt-1">
          Crea fechas ("jornadas") manualmente, actualiza scores de partidos y visualiza la tabla dinámica
        </p>
      </div>

      {currentClubs.length < 2 ? (
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-10 text-center">
          <div className="text-3xl mb-3">⚽</div>
          <h3 className="text-sm font-bold text-white mb-2">Se necesitan mínimo 2 Equipos</h3>
          <p className="text-zinc-500 text-xs max-w-sm mx-auto">
            Para iniciar a programar jornadas y ver la tabla de posiciones, debes registrar por lo menos 2 equipos en la pestaña de "Equipos".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT PANEL: MATCHDAYS & FIXTURES CREATOR (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-lg p-5">
              
              {/* Matchday Header Selector */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-900 pb-4 gap-4">
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <select
                    id="matchday-selector"
                    value={validActiveMdayId}
                    onChange={(e) => {
                      setActiveMdayId(e.target.value);
                      setEditingMatches({});
                    }}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                  >
                    {currentMatchdays.length === 0 ? (
                      <option value="">Ninguna Fecha Creada</option>
                    ) : (
                      currentMatchdays.map(m => (
                        <option key={m.id} value={m.id}>Fecha deportiva {m.number}</option>
                      ))
                    )}
                  </select>
                </div>

                {/* Matchdays controls (Only Admin) */}
                {role === 'admin' && (
                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    {validActiveMdayId && (
                      <button
                        id="delete-matchday-btn"
                        onClick={() => {
                          setConfirmConfig({
                            isOpen: true,
                            title: 'Eliminar Fecha/Jornada',
                            message: `¿Estás completamente seguro de eliminar por completo la "Fecha ${activeMatchday?.number}" e invalidar todos sus resultados de forma permanente?`,
                            onConfirm: () => {
                              onDeleteMatchday(validActiveMdayId);
                            }
                          });
                        }}
                        className="bg-zinc-950 hover:bg-red-950/20 text-zinc-500 hover:text-red-400 px-3 py-1.5 border border-zinc-900 hover:border-red-900/30 rounded-lg text-xs transition duration-150 cursor-pointer"
                        title="Borrar fecha actual"
                      >
                        Eliminar Fecha
                      </button>
                    )}

                    <button
                      id="create-matchday-btn"
                      onClick={handleCreateMatchday}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nueva Fecha</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Match builder (Only if Active Matchday exists & Admin) */}
              {role === 'admin' && validActiveMdayId && (
                <form onSubmit={handleAddMatchSubmit} className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl mt-4 space-y-3">
                  <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Gamepad2 className="w-3.5 h-3.5" />
                    <span>Programar un Encuentro Cara a Cara</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] text-zinc-500 uppercase tracking-wider mb-1">Local (Home)</label>
                      <select
                        id="new-match-home-team"
                        value={newMatchHomeId}
                        onChange={(e) => setNewMatchHomeId(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        required
                      >
                        <option value="">Seleccionar equipo...</option>
                        {currentClubs.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] text-zinc-500 uppercase tracking-wider mb-1">Visita (Away)</label>
                      <select
                        id="new-match-away-team"
                        value={newMatchAwayId}
                        onChange={(e) => setNewMatchAwayId(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        required
                      >
                        <option value="">Seleccionar equipo...</option>
                        {currentClubs.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    id="add-match-btn"
                    type="submit"
                    className="w-full bg-zinc-900 hover:bg-zinc-850 text-white font-bold py-2 rounded-lg text-xs border border-zinc-800 transition transform active:scale-[0.99] cursor-pointer"
                  >
                    + Enlazar Rivales a la Fecha
                  </button>
                </form>
              )}

              {/* Match list */}
              <div className="mt-6 space-y-3">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <span>Partidos Agendados</span>
                </h3>

                {!activeMatchday || activeMatchday.matches.length === 0 ? (
                  <div className="border border-zinc-900 border-dashed rounded-xl py-12 px-4 text-center">
                    <p className="text-zinc-600 text-xs">No hay encuentros programados en esta fecha.</p>
                    {role === 'admin' && activeMatchday && (
                      <p className="text-[10px] text-zinc-500 mt-1">Utiliza el programador superior para añadir equipos.</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeMatchday.matches.map((match) => {
                      const homeClub = currentClubs.find(c => c.id === match.homeTeamId);
                      const awayClub = currentClubs.find(c => c.id === match.awayTeamId);
                      
                      // Guard check
                      if (!homeClub || !awayClub) return null;

                      const isEditing = !!editingMatches[match.id];
                      const editValues = editingMatches[match.id];

                      return (
                        <div
                          id={`match-row-${match.id}`}
                          key={match.id}
                          className="bg-zinc-950 border border-zinc-900 hover:border-zinc-800 p-3 rounded-xl transition duration-150 flex flex-col sm:flex-row items-center justify-between gap-4"
                        >
                          {/* Left Team Info (Local) */}
                          <div className="flex items-center gap-2 w-full sm:w-5/12 justify-end sm:justify-start">
                            <span className="text-xs font-bold text-white truncate text-right order-1 sm:order-2">{homeClub.name}</span>
                            <img 
                              src={homeClub.crest} 
                              alt="Crest" 
                              className="w-7 h-7 object-contain order-2 sm:order-1 flex-shrink-0" 
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          {/* Center Score Grid */}
                          <div className="flex items-center justify-center gap-3 py-1 bg-zinc-900/60 px-4 rounded-xl border border-zinc-850/80 w-full sm:w-2/12">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  id={`edit-score-home-${match.id}`}
                                  type="text"
                                  placeholder="L"
                                  value={editValues.home}
                                  onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                                  className="w-8 h-8 rounded bg-zinc-950 border border-zinc-800 text-center font-bold text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                                />
                                <span className="text-zinc-600 text-xs">:</span>
                                <input
                                  id={`edit-score-away-${match.id}`}
                                  type="text"
                                  placeholder="V"
                                  value={editValues.away}
                                  onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                                  className="w-8 h-8 rounded bg-zinc-950 border border-zinc-800 text-center font-bold text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                                />
                              </div>
                            ) : (
                              <div className="font-mono text-base font-black flex items-center gap-2">
                                {match.played ? (
                                  <>
                                    <span className="text-white">{match.homeScore}</span>
                                    <span className="text-zinc-600 text-sm">-</span>
                                    <span className="text-white">{match.awayScore}</span>
                                  </>
                                ) : (
                                  <span className="text-zinc-600 font-sans text-xs font-medium uppercase tracking-wider py-0.5">VS</span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Right Team Info (Visita) */}
                          <div className="flex items-center gap-2 w-full sm:w-5/12 justify-start sm:justify-end">
                            <img 
                              src={awayClub.crest} 
                              alt="Crest" 
                              className="w-7 h-7 object-contain flex-shrink-0" 
                              referrerPolicy="no-referrer"
                            />
                            <span className="text-xs font-bold text-white truncate">{awayClub.name}</span>
                          </div>

                          {/* Admin Edit Panel */}
                          {role === 'admin' && (
                            <div className="flex gap-1 border-t sm:border-t-0 border-zinc-900/60 pt-2.5 sm:pt-0 justify-end w-full sm:w-auto">
                              {isEditing ? (
                                <>
                                  <button
                                    id={`save-score-btn-${match.id}`}
                                    onClick={() => saveScoreChange(match.id)}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded transition"
                                    title="Confirmar resultado"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  {match.played && (
                                    <button
                                      id={`clear-score-btn-${match.id}`}
                                      onClick={() => clearMatchScore(match.id)}
                                      className="bg-zinc-800 hover:bg-zinc-700 text-yellow-500 p-1.5 rounded"
                                      title="Anular partido"
                                    >
                                      <Clock className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button
                                    id={`cancel-score-edit-btn-${match.id}`}
                                    onClick={() => {
                                      const copy = { ...editingMatches };
                                      delete copy[match.id];
                                      setEditingMatches(copy);
                                    }}
                                    className="bg-zinc-950 border border-zinc-900 hover:bg-zinc-900 text-zinc-400 p-1.5 rounded"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    id={`edit-score-btn-${match.id}`}
                                    onClick={() => startEditingScore(match)}
                                    className="bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white p-1.5 rounded-lg transition"
                                    title="Editar Goles"
                                  >
                                    <Edit className="w-3 h-3 text-emerald-500" />
                                  </button>
                                  <button
                                    id={`delete-match-btn-${match.id}`}
                                    onClick={() => {
                                      setConfirmConfig({
                                        isOpen: true,
                                        title: 'Eliminar Partido',
                                        message: '¿Estás seguro de que deseas eliminar permanentemente este partido de la programación de esta fecha?',
                                        onConfirm: () => {
                                          onDeleteMatch(validActiveMdayId, match.id);
                                        }
                                      });
                                    }}
                                    className="bg-zinc-950 border border-zinc-900 hover:border-red-900/40 text-zinc-600 hover:text-red-400 p-1.5 rounded-lg transition cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* RIGHT PANEL: DYNAMIC POSITIONS TAB TABLE (5 Cols) */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-6">
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
              
              <div className="bg-zinc-900/60 px-5 py-4 border-b border-zinc-950 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black uppercase tracking-wider text-white">Tabla de Posiciones Clásica</span>
                </div>
              </div>

              {positionsTable.length === 0 ? (
                <div className="py-12 px-4 text-center text-zinc-500 text-xs">
                  Inscribe equipos para proyectar los puntajes aquí.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-300 select-none">
                    <thead>
                      <tr className="bg-zinc-900/60 text-zinc-500 font-bold uppercase text-[9px] border-b border-zinc-900">
                        <th className="py-2.5 px-3 text-center w-8">Pos</th>
                        <th className="py-2.5 px-3">Club</th>
                        <th className="py-2.5 px-2 text-center font-bold text-white w-10 bg-zinc-900">PTS</th>
                        <th className="py-2.5 px-2 text-center w-8 font-mono">PJ</th>
                        <th className="py-2.5 px-2 text-center w-8 font-mono">PG</th>
                        <th className="py-2.5 px-2 text-center w-8 font-mono">PE</th>
                        <th className="py-2.5 px-2 text-center w-8 font-mono">PP</th>
                        <th className="py-2.5 px-2 text-center w-8 font-mono">GF</th>
                        <th className="py-2.5 px-2 text-center w-8 font-mono">GC</th>
                        <th className="py-2.5 px-2 text-center w-8 font-mono">DG</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {positionsTable.map((row, index) => {
                        const position = index + 1;
                        
                        // Style top qualifier and red dropouts subtly
                        let posBg = "text-zinc-400";
                        if (position === 1) posBg = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold rounded";
                        if (position === 2) posBg = "text-white font-bold bg-zinc-900 border border-zinc-800 rounded";

                        return (
                          <tr 
                            id={`positions-table-row-${row.clubId}`}
                            key={row.clubId} 
                            className="hover:bg-zinc-900/10 transition duration-100"
                          >
                            <td className="py-3 px-3 text-center">
                              <span className={`inline-block w-5 h-5 leading-5 text-center text-[10px] ${posBg}`}>
                                {position}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <img 
                                  src={row.crest} 
                                  alt="Crest" 
                                  className="w-5 h-5 object-contain" 
                                  referrerPolicy="no-referrer"
                                />
                                <span className="font-bold text-white truncate max-w-[110px]" title={row.name}>
                                  {row.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-center font-black text-sm text-emerald-400 bg-emerald-950/20 w-10 font-mono">
                              {row.pts}
                            </td>
                            <td className="py-3 px-2 text-center font-mono text-[11px] text-zinc-400">{row.pj}</td>
                            <td className="py-3 px-2 text-center font-mono text-[11px] text-emerald-500">{row.pg}</td>
                            <td className="py-3 px-2 text-center font-mono text-[11px] text-zinc-500">{row.pe}</td>
                            <td className="py-3 px-2 text-center font-mono text-[11px] text-red-500">{row.pp}</td>
                            <td className="py-3 px-2 text-center font-mono text-[11px] text-zinc-500">{row.gf}</td>
                            <td className="py-3 px-2 text-center font-mono text-[11px] text-zinc-500">{row.gc}</td>
                            <td className={`py-3 px-2 text-center font-mono text-[11px] font-bold ${row.dg > 0 ? 'text-emerald-400' : row.dg < 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                              {row.dg > 0 ? `+${row.dg}` : row.dg}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Required Footer Note */}
              <div className="bg-zinc-900/60 p-4 border-t border-zinc-900 text-center text-[11px] text-zinc-400 font-mono tracking-wider">
                Reglas del Torneo: <span className="text-emerald-400 font-bold font-sans">PG +3</span> | <span className="text-zinc-200 font-bold font-sans">PE +1</span> | <span className="text-red-500 font-bold font-sans">PP 0</span>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* --- SECCIÓN ETAPA FINAL --- */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl p-6 mt-6">
        
        {/* Header de Etapa Final */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-900 pb-5 mb-6 gap-4">
          <div>
            <h3 className="text-lg font-bold font-sans text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500 animate-pulse" />
              <span>Etapa Final (Playoffs / Eliminación Directa)</span>
            </h3>
            <p className="text-zinc-500 text-xs mt-1">
              Selecciona una fase, agenda los cruces con sus fechas correspondientes y edita los resultados de cada llave de eliminación directa.
            </p>
          </div>

          {/* Phase Selector Dropdown */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <span className="text-xs font-semibold text-zinc-400">Fase del Torneo:</span>
            <select
              id="knockout-stage-selector"
              value={selectedStage}
              onChange={(e) => {
                setSelectedStage(e.target.value as KnockoutStageType);
                setEditingKnockoutId(null);
              }}
              className="bg-zinc-900 border border-zinc-850 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold cursor-pointer"
            >
              <option value="OCTAVOS">Octavos de Final (16 Equipos)</option>
              <option value="CUARTOS">Cuartos de Final (8 Equipos)</option>
              <option value="SEMIFINAL">Semifinales (4 Equipos)</option>
              <option value="FINAL">Gran Final (2 Equipos)</option>
            </select>
          </div>
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: stageConfig[selectedStage].matchesCount }).map((_, index) => {
            const matchId = `${tournament.id}-${selectedStage}-${index}`;
            const m = knockoutMatches.find(k => k.id === matchId) || {
              id: matchId,
              tournamentId: tournament.id,
              stage: selectedStage,
              matchIndex: index,
              homeTeamId: 'Pendiente',
              awayTeamId: 'Pendiente',
              homeScore: null,
              awayScore: null,
              played: false,
              date: ''
            };

            const homeInfo = getTeamDisplay(m.homeTeamId);
            const awayInfo = getTeamDisplay(m.awayTeamId);
            const isEditing = editingKnockoutId === m.id;

            return (
              <div
                key={matchId}
                id={`knockout-match-card-${matchId}`}
                className={`bg-zinc-900/10 border rounded-2xl p-4 transition duration-200 ${
                  isEditing 
                    ? 'border-emerald-500 bg-zinc-900/30 shadow-md shadow-emerald-950/10' 
                    : m.played 
                      ? 'border-zinc-800 hover:border-zinc-755 bg-zinc-950/20' 
                      : 'border-zinc-900 hover:border-zinc-800'
                }`}
              >
                {/* Match Card Header */}
                <div className="flex justify-between items-center mb-3 border-b border-zinc-900/60 pb-2">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                    {stageConfig[selectedStage].label} — Llave {index + 1}
                  </span>
                  
                  {m.date && !isEditing && (
                    <span className="text-[9px] text-zinc-500 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-zinc-500" />
                      {m.date}
                    </span>
                  )}
                </div>

                {isEditing ? (
                  /* EDIT MODE PANEL */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Local Team Edit */}
                      <div className="space-y-2 p-2.5 bg-zinc-950/65 rounded-xl border border-zinc-900">
                        <label className="block text-[9px] text-emerald-400 font-extrabold uppercase tracking-widest">Local</label>
                        
                        {/* Segment button */}
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => setEditKUseCustomHome(false)}
                            className={`flex-1 text-[9px] font-extrabold py-1 rounded transition cursor-pointer ${!editKUseCustomHome ? 'bg-emerald-600 text-white' : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400'}`}
                          >
                            Club
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditKUseCustomHome(true);
                              if (!editKHomeCustom) {
                                setEditKHomeCustom(editKHomeId ? (currentClubs.find(c => c.id === editKHomeId)?.name || '') : '');
                              }
                            }}
                            className={`flex-1 text-[9px] font-extrabold py-1 rounded transition cursor-pointer ${editKUseCustomHome ? 'bg-emerald-600 text-white' : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400'}`}
                          >
                            Texto Libre
                          </button>
                        </div>

                        {editKUseCustomHome ? (
                          <input
                            type="text"
                            placeholder="Ej. Ganador Grupo A"
                            value={editKHomeCustom}
                            onChange={(e) => setEditKHomeCustom(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-emerald-500"
                          />
                        ) : (
                          <select
                            value={editKHomeId}
                            onChange={(e) => setEditKHomeId(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                          >
                            <option value="">-- Sin Clasificar / Pendiente --</option>
                            {currentClubs.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Visitante Team Edit */}
                      <div className="space-y-2 p-2.5 bg-zinc-950/65 rounded-xl border border-zinc-900">
                        <label className="block text-[9px] text-orange-400 font-extrabold uppercase tracking-widest">Visitante</label>
                        
                        {/* Segment button */}
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => setEditKUseCustomAway(false)}
                            className={`flex-1 text-[9px] font-extrabold py-1 rounded transition cursor-pointer ${!editKUseCustomAway ? 'bg-emerald-600 text-white' : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400'}`}
                          >
                            Club
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditKUseCustomAway(true);
                              if (!editKAwayCustom) {
                                setEditKAwayCustom(editKAwayId ? (currentClubs.find(c => c.id === editKAwayId)?.name || '') : '');
                              }
                            }}
                            className={`flex-1 text-[9px] font-extrabold py-1 rounded transition cursor-pointer ${editKUseCustomAway ? 'bg-emerald-600 text-white' : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400'}`}
                          >
                            Texto Libre
                          </button>
                        </div>

                        {editKUseCustomAway ? (
                          <input
                            type="text"
                            placeholder="Ej. Segundo Grupo B"
                            value={editKAwayCustom}
                            onChange={(e) => setEditKAwayCustom(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white placeholder-zinc-655 focus:outline-none focus:border-emerald-500"
                          />
                        ) : (
                          <select
                            value={editKAwayId}
                            onChange={(e) => setEditKAwayId(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                          >
                            <option value="">-- Sin Clasificar / Pendiente --</option>
                            {currentClubs.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        )}
                      </div>

                    </div>

                    {/* Match Score & Date Row */}
                    <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-900 space-y-3">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                        <div>
                          <label className="block text-[8px] text-zinc-500 uppercase font-black mb-1">Goles Local</label>
                          <input
                            type="text"
                            placeholder="L"
                            value={editKHomeScore}
                            onChange={(e) => setEditKHomeScore(e.target.value.replace(/\D/g, ''))}
                            disabled={!editKPlayed}
                            className={`w-full bg-zinc-950 border rounded-lg px-2 py-1 text-center font-mono text-sm focus:outline-none ${
                              editKPlayed ? 'border-zinc-850 text-emerald-400 focus:border-emerald-500' : 'border-zinc-900 text-zinc-700 bg-zinc-950/80 cursor-not-allowed'
                            }`}
                          />
                        </div>

                        <div className="text-center">
                          <label className="block text-[8px] text-zinc-500 uppercase font-black mb-1">Estado</label>
                          <label className="inline-flex items-center gap-1.5 cursor-pointer select-none py-1.5 justify-center">
                            <input
                              type="checkbox"
                              checked={editKPlayed}
                              onChange={(e) => {
                                setEditKPlayed(e.target.checked);
                                if (!e.target.checked) {
                                  setEditKHomeScore('');
                                  setEditKAwayScore('');
                                }
                              }}
                              className="accent-emerald-500 cursor-pointer w-3.5 h-3.5"
                            />
                            <span className="text-[10px] text-zinc-300 font-extrabold uppercase tracking-wide">¿Jugado?</span>
                          </label>
                        </div>

                        <div>
                          <label className="block text-[8px] text-zinc-500 uppercase font-black mb-1">Goles Visita</label>
                          <input
                            type="text"
                            placeholder="V"
                            value={editKAwayScore}
                            onChange={(e) => setEditKAwayScore(e.target.value.replace(/\D/g, ''))}
                            disabled={!editKPlayed}
                            className={`w-full bg-zinc-950 border rounded-lg px-2 py-1 text-center font-mono text-sm focus:outline-none ${
                              editKPlayed ? 'border-zinc-850 text-emerald-400 focus:border-emerald-500' : 'border-zinc-900 text-zinc-700 bg-zinc-950/80 cursor-not-allowed'
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[8px] text-zinc-500 uppercase font-bold mb-1">Fecha / Hora / Cancha</label>
                        <input
                          type="text"
                          placeholder="Ej. Sábado 15/10 - 20:30 hs - Cancha Central"
                          value={editKDate}
                          onChange={(e) => setEditKDate(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end gap-2 pt-1 border-t border-zinc-900/40">
                      <button
                        type="button"
                        onClick={() => setEditingKnockoutId(null)}
                        className="bg-zinc-950 hover:bg-zinc-900 text-zinc-400 border border-zinc-900 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => saveKnockoutChange(m.id, index)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-[10px] font-extrabold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Guardar llave</span>
                      </button>
                    </div>

                  </div>
                ) : (
                  /* STATIC DISPLAY MODE */
                  <div className="space-y-4">
                    
                    {/* Teams faceoff row */}
                    <div className="flex items-center justify-between gap-2.5 bg-zinc-950/25 p-3 rounded-xl border border-zinc-900/60">
                      
                      {/* Home team */}
                      <div className="flex items-center gap-2.5 w-5/12">
                        {homeInfo.crest ? (
                          <img src={homeInfo.crest} className="w-6 h-6 object-contain shrink-0" alt="Local Logo" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="w-6 h-6 rounded-full bg-zinc-900/60 border border-zinc-850 flex items-center justify-center text-[10px] text-zinc-500">🛡️</span>
                        )}
                        <span className={`text-xs font-bold truncate text-white ${!homeInfo.isClub ? 'text-zinc-400 font-medium italic' : ''}`} title={homeInfo.name}>
                          {homeInfo.name}
                        </span>
                      </div>

                      {/* Display Score center */}
                      <div className="w-2/12 flex justify-center">
                        <div className="font-mono font-black text-center text-xs px-2 py-1 bg-zinc-900/60 rounded-lg border border-zinc-850/40 min-w-[55px]">
                          {m.played ? (
                            <span className="text-white flex items-center justify-center gap-1">
                              <span className="text-emerald-400 font-extrabold text-sm">{m.homeScore}</span>
                              <span className="text-zinc-650 font-sans text-xs">-</span>
                              <span className="text-emerald-400 font-extrabold text-sm">{m.awayScore}</span>
                            </span>
                          ) : (
                            <span className="text-zinc-500 text-[10px] font-sans font-extrabold uppercase tracking-widest">VS</span>
                          )}
                        </div>
                      </div>

                      {/* Away team */}
                      <div className="flex items-center gap-2.5 w-5/12 justify-end text-right">
                        <span className={`text-xs font-bold truncate text-white ${!awayInfo.isClub ? 'text-zinc-400 font-medium italic' : ''}`} title={awayInfo.name}>
                          {awayInfo.name}
                        </span>
                        {awayInfo.crest ? (
                          <img src={awayInfo.crest} className="w-6 h-6 object-contain shrink-0" alt="Away Logo" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="w-6 h-6 rounded-full bg-zinc-900/60 border border-zinc-850 flex items-center justify-center text-[10px] text-zinc-500">🛡️</span>
                        )}
                      </div>

                    </div>

                    {/* Footer match details & Controls */}
                    <div className="flex justify-between items-center bg-zinc-900/20 px-3 py-2 rounded-xl border border-zinc-900/40 text-[10px]">
                      
                      <div className="text-zinc-400 font-sans truncate pr-2">
                        {m.date ? (
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>{m.date}</span>
                          </span>
                        ) : (
                          <span className="italic text-zinc-600">Día e inscripción pendiente...</span>
                        )}
                      </div>

                      {/* Edit Button (Only Admin) */}
                      {role === 'admin' ? (
                        <button
                          type="button"
                          onClick={() => startEditingKnockout(m)}
                          className="text-zinc-400 hover:text-white bg-zinc-900/45 hover:bg-zinc-850 border border-zinc-800 rounded-lg px-2.5 py-1 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3 h-3 text-emerald-400" />
                          <span>Editar</span>
                        </button>
                      ) : (
                        <div className={`font-mono font-bold tracking-widest text-[9px] uppercase ${m.played ? 'text-emerald-500 font-extrabold' : 'text-zinc-600 font-medium'}`}>
                          {m.played ? 'Jugado' : 'Por jugar'}
                        </div>
                      )}

                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
