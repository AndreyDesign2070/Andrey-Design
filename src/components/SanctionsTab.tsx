import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Settings, 
  Calendar, 
  Check, 
  X, 
  Edit,
  BadgeAlert,
  Info,
  UserCheck2,
  Bookmark
} from 'lucide-react';
import { Tournament, Club, Player, SanctionRecord, CardType } from '../types';
import ConfirmDialog from './ConfirmDialog';

interface SanctionsTabProps {
  tournament: Tournament;
  clubs: Club[];
  players: Player[];
  sanctionRecords: SanctionRecord[];
  role: 'admin' | 'visitante';
  onAddSanction: (sanction: SanctionRecord) => void;
  onUpdateSanction: (sanction: SanctionRecord) => void;
  onDeleteSanction: (sanctionId: string) => void;
}

export default function SanctionsTab({
  tournament,
  clubs,
  players,
  sanctionRecords,
  role,
  onAddSanction,
  onUpdateSanction,
  onDeleteSanction
}: SanctionsTabProps) {
  const [deleteSanctionId, setDeleteSanctionId] = useState<string | null>(null);
  // Filter associations under active tournament
  const currentClubs = clubs.filter(c => c.tournamentId === tournament.id);
  const currentSanctions = sanctionRecords.filter(s => s.tournamentId === tournament.id);

  // Selector form toggler
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSanctionId, setEditingSanctionId] = useState<string | null>(null);

  // New Sanction states
  const [sClId, setSClId] = useState('');
  const [sPlId, setSPlId] = useState('');
  const [sCardType, setSCardType] = useState<CardType>('1_AMARILLA');
  const [sSuspensionWeeks, setSSuspensionWeeks] = useState('0');
  const [sReason, setSReason] = useState('');
  const [sMatchdayName, setSMatchdayName] = useState('Fecha 1');

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

  const formatDateToYYYYMMDD = (ddmmyyyyStr: string) => {
    if (!ddmmyyyyStr) return '';
    const parts = ddmmyyyyStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return ddmmyyyyStr;
  };

  const [sSanctionDate, setSSanctionDate] = useState(getAutoFormattedDateInput());

  // Edit Sanction states
  const [editCardType, setEditCardType] = useState<CardType>('1_AMARILLA');
  const [editWeeks, setEditWeeks] = useState('');
  const [editReason, setEditReason] = useState('');
  const [editMatchday, setEditMatchday] = useState('');
  const [editDate, setEditDate] = useState('');

  // Dropdown list filter
  const filteredClubPlayers = players.filter(p => p.clubId === sClId);

  // Format date helper: returns string in DD/MM/YYYY style
  const getAutoFormattedDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yyyy = today.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sClId || !sPlId) return;

    const weeks = parseInt(sSuspensionWeeks, 10);

    const defaultReason = sCardType === '1_AMARILLA' 
      ? 'Amonestación con Tarjeta Amarilla' 
      : sCardType === '2_AMARILLAS_ROJA' 
        ? 'Doble Tarjeta Amarilla (Roja indirecta)' 
        : 'Sanción con Tarjeta Roja Directa';

    const newSanction: SanctionRecord = {
      id: `s-${Date.now()}`,
      tournamentId: tournament.id,
      clubId: sClId,
      playerId: sPlId,
      cardType: sCardType,
      suspensionWeeks: isNaN(weeks) ? 0 : weeks,
      reason: sReason.trim() || defaultReason,
      matchday: sMatchdayName,
      date: formatDateToDDMMYYYY(sSanctionDate) || getAutoFormattedDate()
    };

    onAddSanction(newSanction);

    // Reset Creation states
    setSPlId('');
    setSSuspensionWeeks('0');
    setSReason('');
    setSSanctionDate(getAutoFormattedDateInput());
    setShowAddForm(false);
  };

  const startEdit = (s: SanctionRecord) => {
    setEditingSanctionId(s.id);
    setEditCardType(s.cardType);
    setEditWeeks(String(s.suspensionWeeks));
    setEditReason(s.reason);
    setEditMatchday(s.matchday);
    setEditDate(formatDateToYYYYMMDD(s.date) || getAutoFormattedDateInput());
  };

  const saveEdit = (sanctionId: string) => {
    const orig = sanctionRecords.find(s => s.id === sanctionId);
    if (!orig) return;

    const weeks = parseInt(editWeeks, 10);
    if (!isNaN(weeks) && weeks > 0 && !editReason.trim()) {
      alert('El motivo/causa es obligatorio cuando existe mínimo una fecha de suspensión.');
      return;
    }

    const defaultReason = editCardType === '1_AMARILLA' 
      ? 'Amonestación con Tarjeta Amarilla' 
      : editCardType === '2_AMARILLAS_ROJA' 
        ? 'Doble Tarjeta Amarilla (Roja indirecta)' 
        : 'Sanción con Tarjeta Roja Directa';

    const updated: SanctionRecord = {
      ...orig,
      cardType: editCardType,
      suspensionWeeks: isNaN(weeks) ? 0 : weeks,
      reason: editReason.trim() || defaultReason,
      matchday: editMatchday,
      date: formatDateToDDMMYYYY(editDate) || orig.date
    };

    onUpdateSanction(updated);
    setEditingSanctionId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-900 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
            <span>Tarjetas & Sanciones Disciplinarias</span>
          </h2>
          <p className="text-zinc-400 text-xs mt-1">
            Visualiza las amonestaciones acumuladas y programa suspensiones de fechas deportivas
          </p>
        </div>

        {role === 'admin' && currentClubs.length > 0 && (
          <button
            id="toggle-sanction-form-btn"
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (!sClId && currentClubs.length > 0) {
                setSClId(currentClubs[0].id);
              }
            }}
            className="w-full sm:w-auto bg-red-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950/20"
          >
            {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{showAddForm ? 'Cancelar Sanción' : 'Registrar Sanción'}</span>
          </button>
        )}
      </div>

      {/* Creation form (Admin only) */}
      {showAddForm && role === 'admin' && (
        <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 shadow-2xl animate-fade-in">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-zinc-900 pb-2">
            🛡️ Expediente Disciplinario Arbitral
          </h3>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Select Club */}
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Seleccionar Club
                </label>
                <select
                  id="sanction-club-select"
                  value={sClId}
                  onChange={(e) => {
                    setSClId(e.target.value);
                    setSPlId('');
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-semibold"
                  required
                >
                  <option value="">-- Elige un Club --</option>
                  {currentClubs.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Select Player (Filtered to chosen club) */}
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Seleccionar Jugador Amonestado
                </label>
                <select
                  id="sanction-player-select"
                  value={sPlId}
                  onChange={(e) => setSPlId(e.target.value)}
                  disabled={!sClId}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed font-medium font-sans"
                  required
                >
                  <option value="">{sClId ? '-- Elige un Jugador --' : 'Selecciona un club primero'}</option>
                  {filteredClubPlayers.map(p => (
                    <option key={p.id} value={p.id}>#{p.dorsal} - {p.lastName}, {p.firstName}</option>
                  ))}
                </select>
              </div>

              {/* Amonestation Type (Combines options nicely) */}
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Concepto / Tarjeta Aplicada
                </label>
                <select
                  id="sanction-card-type-select"
                  value={sCardType}
                  onChange={(e) => setSCardType(e.target.value as CardType)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none font-medium"
                >
                  <option value="1_AMARILLA">🟨 1 Tarjeta Amarilla</option>
                  <option value="2_AMARILLAS_ROJA">🟨🟥 2 Amarillas (Roja indirecta)</option>
                  <option value="ROJA_DIRECTA">🟥 Tarjeta Roja Directa</option>
                </select>
              </div>

            </div>

            {/* Suspensions and Date Details row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-900/30 p-4 rounded-xl border border-zinc-850">
              
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Fecha Deportiva del Suceso
                </label>
                <select
                  id="sanction-matchday-input"
                  value={sMatchdayName}
                  onChange={(e) => setSMatchdayName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  {Array.from({ length: 15 }, (_, idx) => `Fecha ${idx + 1}`).map(fName => (
                    <option key={fName} value={fName}>{fName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Fecha Calendario del Evento
                </label>
                <input
                  type="date"
                  value={sSanctionDate}
                  onChange={(e) => setSSanctionDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Fechas de Suspensión (Matchdays)
                </label>
                <input
                  id="sanction-suspension-weeks"
                  type="number"
                  min="0"
                  max="50"
                  value={sSuspensionWeeks}
                  onChange={(e) => setSSuspensionWeeks(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1 text-xs text-white font-bold font-mono focus:outline-none focus:border-red-500"
                  required
                />
              </div>

            </div>

            {/* Motivo description box */}
            <div>
              <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Motivo / Causa de la Sanción</span>
                {parseInt(sSuspensionWeeks, 10) > 0 ? (
                  <span className="text-red-400 font-bold lowercase tracking-normal bg-red-950/40 border border-red-900/30 px-1.5 py-0.5 rounded text-[9px] animate-pulse">obligatorio por suspensión</span>
                ) : (
                  <span className="text-zinc-505 font-medium lowercase tracking-normal bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 rounded text-[9px]">opcional</span>
                )}
              </label>
              <textarea
                id="sanction-reason-input"
                rows={2}
                value={sReason}
                onChange={(e) => setSReason(e.target.value)}
                placeholder="Ej. Juego brusco grave al minuto 43' del segundo tiempo"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                required={parseInt(sSuspensionWeeks, 10) > 0}
              />
            </div>

            {/* Form actions submitting */}
            <div className="flex gap-2 justify-end border-t border-zinc-900 pt-4">
              <button
                id="cancel-sanction-btn"
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-zinc-900 hover:bg-zinc-855 text-zinc-400 px-4 py-2 rounded-xl text-xs transition border border-zinc-800"
              >
                Cancelar
              </button>
              <button
                id="submit-sanction-btn"
                type="submit"
                disabled={!sPlId}
                className="bg-red-650 hover:bg-red-550 text-white font-bold px-5 py-2 rounded-xl text-xs transition shadow-lg shadow-red-950/40 disabled:opacity-40"
              >
                Registrar Sanción Accionária
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Roster list of sanctioned players */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
        <div className="bg-zinc-900 px-5 py-4 border-b border-zinc-950 flex justify-between items-center bg-gradient-to-r from-red-950/15 to-zinc-900">
          <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
            <BadgeAlert className="w-4.5 h-4.5" />
            <span>Acumulación Disciplinaria Activa</span>
          </h3>
          <span className="text-[10px] font-mono text-zinc-500">{currentSanctions.length} Expedientes</span>
        </div>

        {currentSanctions.length === 0 ? (
          <div className="py-16 px-4 text-center text-zinc-500 text-xs">
            <div className="text-3xl mb-1.5">😇</div>
            <p className="font-semibold">¡Limpio! No se registran incidentes ofensivos todavía.</p>
            <p className="text-[10px] text-zinc-600 mt-1">El fair-play reina por el momento en el torneo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300 min-w-[700px]">
              <thead>
                <tr className="bg-zinc-900/40 text-zinc-500 font-semibold uppercase text-[9px] border-b border-zinc-900">
                  <th className="py-3 px-4">Jugador / Club</th>
                  <th className="py-3 px-4 text-center">Tarjeta</th>
                  <th className="py-3 px-4 text-center">Fechas Susps.</th>
                  <th className="py-3 px-4">Matchday & Fecha</th>
                  <th className="py-3 px-4">Motivo / Descripción</th>
                  {role === 'admin' && <th className="py-3 px-4 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {currentSanctions.map((sanc) => {
                  const playerObj = players.find(p => p.id === sanc.playerId);
                  const clubObj = clubs.find(c => c.id === sanc.clubId);
                  const isEditing = editingSanctionId === sanc.id;

                  // Render amonestation icon helper
                  const renderCardBadge = (type: CardType) => {
                    if (type === '1_AMARILLA') {
                      return <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-1 rounded text-[10px] font-bold">🟨 Amarilla</span>;
                    } else if (type === '2_AMARILLAS_ROJA') {
                      return <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-1 rounded text-[10px] font-bold">🟨🟥 Doble Amarilla</span>;
                    } else {
                      return <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded text-[10px] font-bold">🟥 Roja Directa</span>;
                    }
                  };

                  return (
                    <tr 
                      id={`sanction-row-${sanc.id}`}
                      key={sanc.id} 
                      className="hover:bg-zinc-900/30 transition duration-150"
                    >
                      {isEditing ? (
                        /* Editing Form cells row */
                        <>
                          <td className="py-3 px-4" colSpan={2}>
                            <div className="space-y-1.5 p-1">
                              <span className="text-[10px] text-zinc-400 font-bold block">{playerObj ? `${playerObj.lastName}, ${playerObj.firstName}` : 'Desconocido'}</span>
                              <select
                                id={`edit-sanction-card-type-${sanc.id}`}
                                value={editCardType}
                                onChange={(e) => setEditCardType(e.target.value as CardType)}
                                className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1 text-[11px] text-white"
                              >
                                <option value="1_AMARILLA">Amarilla</option>
                                <option value="2_AMARILLAS_ROJA">2 Amarillas</option>
                                <option value="ROJA_DIRECTA">Roja Directa</option>
                              </select>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <input
                              id={`edit-sanction-weeks-${sanc.id}`}
                              type="number"
                              value={editWeeks}
                              onChange={(e) => setEditWeeks(e.target.value)}
                              className="w-12 bg-zinc-800 rounded border border-zinc-700 px-1 py-0.5 text-center text-xs font-mono font-bold text-white"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1.5 min-w-[110px]">
                              <input
                                id={`edit-sanction-matchday-${sanc.id}`}
                                type="text"
                                value={editMatchday}
                                onChange={(e) => setEditMatchday(e.target.value)}
                                className="w-full bg-zinc-800 rounded border border-zinc-700 px-1.5 py-0.5 text-xs text-white"
                                placeholder="Jornada"
                              />
                              <input
                                type="date"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                                className="w-full bg-zinc-800 rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] text-white font-mono"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <textarea
                              id={`edit-sanction-reason-${sanc.id}`}
                              value={editReason}
                              onChange={(e) => setEditReason(e.target.value)}
                              className="w-full bg-zinc-800 rounded border border-zinc-700 px-2 py-1 text-xs text-white"
                            />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                id={`cancel-edit-sanction-${sanc.id}`}
                                onClick={() => setEditingSanctionId(null)}
                                className="bg-zinc-800 text-zinc-400 p-1 rounded hover:text-white"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                              <button
                                id={`save-edit-sanction-${sanc.id}`}
                                onClick={() => saveEdit(sanc.id)}
                                className="bg-emerald-600 text-white p-1 rounded hover:bg-emerald-500"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        /* Read cells row */
                        <>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              {clubObj && (
                                <img 
                                  src={clubObj.crest} 
                                  alt="Club" 
                                  className="w-5 h-5 object-contain" 
                                  referrerPolicy="no-referrer"
                                />
                              )}
                              <div>
                                <h4 className="font-bold text-white">
                                  {playerObj ? `${playerObj.lastName}, ${playerObj.firstName}` : 'Fichaje antiguo'}
                                </h4>
                                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{clubObj ? clubObj.name : 'Vínculo roto'}</p>
                              </div>
                            </div>
                          </td>

                          {/* Card Type Badge */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            {renderCardBadge(sanc.cardType)}
                          </td>

                          {/* Suspension weeks cell */}
                          <td className="py-3.5 px-4 text-center font-mono">
                            {sanc.suspensionWeeks > 0 ? (
                              <span className="bg-red-950/30 text-rose-400 font-bold px-2 py-0.5 rounded border border-red-900/30">
                                {sanc.suspensionWeeks} {sanc.suspensionWeeks === 1 ? 'Fecha' : 'Fechas'}
                              </span>
                            ) : (
                              <span className="text-zinc-650 font-sans text-[10px]">Sin suspensión</span>
                            )}
                          </td>

                          {/* Matchday details */}
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-zinc-400 block text-xs">{sanc.matchday}</span>
                            <span className="font-mono text-[9px] text-zinc-600 mt-0.5 block">{sanc.date}</span>
                          </td>

                          {/* Motivation details */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="text-zinc-400 text-xs italic truncate" title={sanc.reason}>
                              "{sanc.reason}"
                            </p>
                          </td>

                          {/* Actions button (Only admin) */}
                          {role === 'admin' && (
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <button
                                id={`edit-sanction-btn-${sanc.id}`}
                                onClick={() => startEdit(sanc)}
                                className="bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white p-1.5 rounded-lg transition mr-1.5"
                                title="Editar sanción"
                              >
                                <Edit className="w-3.5 h-3.5 text-emerald-500" />
                              </button>
                              <button
                                id={`delete-sanction-record-${sanc.id}`}
                                onClick={() => {
                                  setDeleteSanctionId(sanc.id);
                                }}
                                className="bg-zinc-950 border border-zinc-900 text-zinc-600 hover:text-red-400 p-1.5 rounded-lg transition"
                                title="Baja de sanción"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteSanctionId !== null}
        title="Dar de Baja Sanción"
        message="¿Estás completamente seguro de borrar permanentemente este registro de sanción/disciplinario de los archivos del torneo?"
        onConfirm={() => {
          if (deleteSanctionId) {
            onDeleteSanction(deleteSanctionId);
          }
        }}
        onCancel={() => {
          setDeleteSanctionId(null);
        }}
      />
    </div>
  );
}
