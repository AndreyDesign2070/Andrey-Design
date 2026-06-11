import React, { useState } from 'react';
import { 
  Flame, 
  Plus, 
  Trash2, 
  Award, 
  Percent, 
  Zap, 
  Clock,
  Shirt,
  Shield,
  ShieldCheck,
  AlertCircle,
  Calendar,
  X
} from 'lucide-react';
import { Tournament, Club, Player, GoalRecord } from '../types';
import ConfirmDialog from './ConfirmDialog';

interface ScorersTabProps {
  tournament: Tournament;
  clubs: Club[];
  players: Player[];
  goalRecords: GoalRecord[];
  role: 'admin' | 'visitante';
  onRegisterGoals: (playerId: string, clubId: string, goals: number, matchday: string, date: string) => void;
  onClearScorer: (scorerId: string) => void;
}

export default function ScorersTab({
  tournament,
  clubs,
  players,
  goalRecords,
  role,
  onRegisterGoals,
  onClearScorer
}: ScorersTabProps) {
  const [deleteScorerId, setDeleteScorerId] = useState<string | null>(null);
  const [deleteScorerName, setDeleteScorerName] = useState<string>('');
  // Filter clubs of current tournament
  const currentClubs = clubs.filter(c => c.tournamentId === tournament.id);

  // Helper date parsing/display logic
  const getAutoFormattedDateInput = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDateToDDMMYYYY = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Selector controls
  const [showAddForm, setShowAddForm] = useState(false);
  const [scClId, setScClId] = useState('');
  const [scPlId, setScPlId] = useState('');
  const [scGoals, setScGoals] = useState('1');
  const [scMatchdayName, setScMatchdayName] = useState('Fecha 1');
  const [scGoalDate, setScGoalDate] = useState(getAutoFormattedDateInput());

  // Filter players belonging to selected club in dropdown
  const filteredClubPlayers = players.filter(p => p.clubId === scClId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scClId || !scPlId) return;
    const goalsToAdd = parseInt(scGoals, 10);
    if (isNaN(goalsToAdd) || goalsToAdd < 1) return;

    onRegisterGoals(scPlId, scClId, goalsToAdd, scMatchdayName, formatDateToDDMMYYYY(scGoalDate));

    // Reset Form
    setScPlId('');
    setScGoals('1');
    setScMatchdayName('Fecha 1');
    setScGoalDate(getAutoFormattedDateInput());
    setShowAddForm(false);
  };

  // Compile full scorer data, listing all events with they occurred
  // We group individual GoalRecords of this player in this tournament.
  const activeGoalRecords = goalRecords.filter(g => g.tournamentId === tournament.id);

  const groupedScorers: {
    [playerId: string]: {
      playerId: string;
      clubId: string;
      totalGoals: number;
      events: { id: string; goals: number; matchday?: string; date?: string }[];
    };
  } = {};

  activeGoalRecords.forEach((g) => {
    if (!groupedScorers[g.playerId]) {
      groupedScorers[g.playerId] = {
        playerId: g.playerId,
        clubId: g.clubId,
        totalGoals: 0,
        events: []
      };
    }
    groupedScorers[g.playerId].totalGoals += g.goals;
    groupedScorers[g.playerId].events.push({
      id: g.id,
      goals: g.goals,
      matchday: g.matchday,
      date: g.date
    });
  });

  const fullScorersList = Object.values(groupedScorers)
    .map(group => {
      const playerObj = players.find(p => p.id === group.playerId);
      const clubObj = clubs.find(c => c.id === group.clubId);
      // Sort player events so Fecha 1, Fecha 2 are in order
      const sortedEvents = [...group.events].sort((a, b) => {
        const m1 = parseInt(a.matchday?.replace(/[^\d]/g, '') || '0', 10);
        const m2 = parseInt(b.matchday?.replace(/[^\d]/g, '') || '0', 10);
        return m1 - m2;
      });

      return {
        id: group.playerId, // unique key ID
        playerId: group.playerId,
        playerName: playerObj ? `${playerObj.firstName} ${playerObj.lastName}` : 'Jugador Retirado',
        playerDorsal: playerObj ? playerObj.dorsal : 'S/N',
        clubName: clubObj ? clubObj.name : 'Club Desconocido',
        clubCrest: clubObj ? clubObj.crest : '',
        goals: group.totalGoals,
        events: sortedEvents
      };
    })
    // Filter out orphans if player or club was completely deleted
    .filter(item => item.playerName !== 'Jugador Retirado')
    // Sorter: descending order of goals, then name asc
    .sort((a, b) => {
      if (b.goals !== a.goals) return b.goals - a.goals;
      return a.playerName.localeCompare(b.playerName);
    });

  // Extract exactly the TOP 5 scorers of the active tournament
  const top5Scorers = fullScorersList.slice(0, 5);

  const handleClubSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setScClId(e.target.value);
    setScPlId(''); // Reset player when club changes
  };

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-900 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
            <span>Goleadores del Campeonato</span>
          </h2>
          <p className="text-zinc-400 text-xs mt-1">
            Tabla oficial de artilleros con el registro de goles fecha a fecha del torneo
          </p>
        </div>

        {role === 'admin' && currentClubs.length > 0 && (
          <button
            id="toggle-goal-form-btn"
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (!scClId && currentClubs.length > 0) {
                setScClId(currentClubs[0].id);
              }
            }}
            className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-black font-bold px-4 py-2 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-950/20"
          >
            {showAddForm ? <Plus className="w-4.5 h-4.5 rotate-45 transform duration-150" /> : <Plus className="w-3.5 h-3.5" />}
            <span>Registrar Anotaciones</span>
          </button>
        )}
      </div>

      {/* Goal registration Form Modal card */}
      {showAddForm && role === 'admin' && (
        <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 shadow-2xl animate-fade-in max-w-xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-zinc-900 pb-2">
            ⚽ Registrar Goles para el Torneo
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Club Dropdown */}
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Seleccionar Club
                </label>
                <select
                  id="goal-club-select"
                  value={scClId}
                  onChange={handleClubSelectChange}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                  required
                >
                  <option value="">-- Elige un Club --</option>
                  {currentClubs.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Player Dropdown (Activated only when club chosen) */}
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Seleccionar Goleador
                </label>
                <select
                  id="goal-player-select"
                  value={scPlId}
                  onChange={(e) => setScPlId(e.target.value)}
                  disabled={!scClId}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed font-medium font-sans"
                  required
                >
                  <option value="">{scClId ? '-- Elige un Jugador --' : 'Selecciona un club primero'}</option>
                  {filteredClubPlayers.map(p => (
                    <option key={p.id} value={p.id}>#{p.dorsal} - {p.lastName}, {p.firstName}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Matchday & Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-900/30 p-4 rounded-xl border border-zinc-850">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Fecha Deportiva (Jornada)
                </label>
                <select
                  id="goal-matchday-input"
                  value={scMatchdayName}
                  onChange={(e) => setScMatchdayName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-medium font-sans"
                >
                  {Array.from({ length: 15 }, (_, idx) => `Fecha ${idx + 1}`).map(fName => (
                    <option key={fName} value={fName}>{fName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Fecha Calendario del Gol
                </label>
                <input
                  type="date"
                  value={scGoalDate}
                  onChange={(e) => setScGoalDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>
            </div>

            {/* Goals Input & Buttons */}
            <div className="flex flex-col sm:flex-row items-end justify-between gap-4 border-t border-zinc-900 pt-4">
              <div className="w-full sm:w-1/3">
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Cantidad de Goles
                </label>
                <input
                  id="goal-count-input"
                  type="number"
                  min="1"
                  max="99"
                  value={scGoals}
                  onChange={(e) => setScGoals(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-2 text-xs text-white font-bold font-mono focus:outline-none text-center"
                  required
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <button
                  id="cancel-goal-reg-btn"
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs py-2 px-4 rounded-xl border border-zinc-800 transition"
                >
                  Cancelar
                </button>
                <button
                  id="submit-goal-reg-btn"
                  type="submit"
                  disabled={!scPlId}
                  className="bg-amber-600 hover:bg-amber-500 text-black text-xs font-bold py-2 px-4 rounded-xl shadow-lg transition duration-150 disabled:opacity-40"
                >
                  Subir Goles
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Main Display Grid: Top 5 Rank List */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl max-w-4xl">
        <div className="bg-zinc-900 px-6 py-4 border-b border-zinc-950 flex justify-between items-center bg-gradient-to-r from-amber-950/20 to-zinc-900">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Award className="w-4.5 h-4.5" />
            <span>Top 5 Goleadores de la Temporada</span>
          </h3>
          <span className="text-[10px] text-zinc-500 font-mono">Fútbol Profesional GOLAPP</span>
        </div>

        {top5Scorers.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-xs px-4">
            <div className="text-3xl mb-2">🥅</div>
            <p className="font-semibold">Sin goles registrados para este campeonato todavía.</p>
            {role === 'admin' && (
              <p className="text-[10px] text-zinc-650 mt-1">Utiliza el botón de arriba para registrar anotaciones del silbato inicial.</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-zinc-900">
            {top5Scorers.map((scorer, i) => {
              const rank = i + 1;
              
              // Formatting crown indicators
              let rankStyle = "bg-zinc-900 text-zinc-400 border-zinc-800";
              if (rank === 1) rankStyle = "bg-amber-500 text-black border-amber-400 font-extrabold scale-110 shadow-lg shadow-amber-500/20";
              if (rank === 2) rankStyle = "bg-zinc-300 text-black border-white font-bold";
              if (rank === 3) rankStyle = "bg-amber-800 text-white border-amber-900 font-bold";

              return (
                <div 
                  id={`scorer-rank-row-${scorer.id}`}
                  key={scorer.id}
                  className="px-6 py-4.5 hover:bg-zinc-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition duration-150"
                >
                  <div className="flex items-center gap-5">
                    {/* Rank Number Badge */}
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-sans border shrink-0 ${rankStyle}`}>
                      {rank}
                    </span>

                    {/* Logo Crest */}
                    {scorer.clubCrest && (
                      <div className="w-10 h-10 bg-zinc-900 p-2 rounded-xl border border-zinc-850 flex items-center justify-center shrink-0">
                        <img 
                          src={scorer.clubCrest} 
                          alt="Crest" 
                          className="w-full h-full object-contain" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    {/* Player Identity */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">{scorer.playerName}</span>
                        <span className="text-[10px] font-mono font-bold bg-zinc-900 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-850 flex items-center gap-0.5">
                          <Shirt className="w-2.5 h-2.5 text-zinc-400" />
                          <span>#{scorer.playerDorsal}</span>
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 font-semibold">{scorer.clubName}</p>
                      
                      {/* Ocurrencia y Fecha del Gol */}
                      <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-sm sm:max-w-md">
                        {scorer.events.map((evt, idx) => {
                          const mdayText = evt.matchday || 'Fecha Inicial';
                          const dateText = evt.date;
                          return (
                            <span 
                              key={evt.id || idx} 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono tracking-wide font-medium bg-zinc-900 border border-zinc-850 text-zinc-300"
                              title={`${evt.goals} ${evt.goals === 1 ? 'gol' : 'goles'} anotados`}
                            >
                              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                              <span className="text-zinc-500 font-semibold">{mdayText}:</span>
                              <span className="font-extrabold text-white">{evt.goals} {evt.goals === 1 ? 'gol' : 'goles'}</span>
                              {dateText && (
                                <span className="text-amber-400 font-semibold opacity-90 text-[8px] ml-0.5 flex items-center gap-0.5">
                                  <Calendar className="w-2.5 h-2.5" />
                                  <span>{dateText}</span>
                                </span>
                              )}
                              
                              {/* Granular deletion of this scoring matchday event */}
                              {role === 'admin' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeleteScorerId(evt.id);
                                    setDeleteScorerName(`${scorer.playerName} (${mdayText} - ${evt.goals} ${evt.goals === 1 ? 'gol' : 'goles'})`);
                                  }}
                                  className="text-zinc-550 hover:text-red-400 p-0.5 ml-1 transition shrink-0 cursor-pointer"
                                  title="Eliminar esta anotación"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Goal stats */}
                  <div className="flex items-center justify-end gap-6 text-right">
                    <div>
                      <span className="text-2xl font-black font-mono text-emerald-400 pr-1">{scorer.goals}</span>
                      <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono">goles totales</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteScorerId !== null}
        title="Eliminar Registro de Goles"
        message={`¿Estás seguro de que deseas eliminar permanentemente la marca de goles e historial del jugador "${deleteScorerName}" en este torneo?`}
        onConfirm={() => {
          if (deleteScorerId) {
            onClearScorer(deleteScorerId);
          }
        }}
        onCancel={() => {
          setDeleteScorerId(null);
          setDeleteScorerName('');
        }}
      />
    </div>
  );
}
