import React, { useState } from 'react';
import { 
  Users, 
  Upload, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  FileSpreadsheet, 
  UserPlus,
  AlertCircle,
  Shield,
  Download
} from 'lucide-react';
import { Tournament, Club, Player } from '../types';
import * as XLSX from 'xlsx';
import ConfirmDialog from './ConfirmDialog';

interface PlayersTabProps {
  tournament: Tournament;
  clubs: Club[];
  players: Player[];
  role: 'admin' | 'visitante';
  onAddPlayer: (player: Player) => void;
  onAddPlayersBatch: (players: Player[]) => void;
  onUpdatePlayer: (player: Player) => void;
  onDeletePlayer: (playerId: string) => void;
}

export default function PlayersTab({
  tournament,
  clubs,
  players,
  role,
  onAddPlayer,
  onAddPlayersBatch,
  onUpdatePlayer,
  onDeletePlayer
}: PlayersTabProps) {
  const [deletePlayerId, setDeletePlayerId] = useState<string | null>(null);
  const [deletePlayerName, setDeletePlayerName] = useState<string>('');
  // Filter clubs of current tournament
  const currentClubs = clubs.filter(c => c.tournamentId === tournament.id);

  // Active Selected Club State
  const [selectedClubId, setSelectedClubId] = useState<string>(
    currentClubs.length > 0 ? currentClubs[0].id : ''
  );

  // If selected club is no longer valid or unset, auto-correct
  const activeClubId = currentClubs.some(c => c.id === selectedClubId)
    ? selectedClubId
    : (currentClubs.length > 0 ? currentClubs[0].id : '');

  // Filter players of active club
  const activeClubPlayers = players.filter(p => p.clubId === activeClubId);

  // Manual player form states
  const [manualDorsal, setManualDorsal] = useState('');
  const [manualFirstName, setManualFirstName] = useState('');
  const [manualLastName, setManualLastName] = useState('');

  // Editing player states
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editDorsal, setEditDorsal] = useState('');
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');

  // Excel parsing response message
  const [parseMsg, setParseMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Parse Excel Handler
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParseMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!activeClubId) {
      setParseMsg({ type: 'error', text: 'Por favor selecciona un club antes de subir el archivo Excel.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Convert sheet to 2D Array
        const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
        
        if (data.length < 2) {
          setParseMsg({ type: 'error', text: 'El archivo Excel parece estar vacío o le faltan líneas de registros.' });
          return;
        }

        // Detect columns from first header row
        const headers = data[0].map(h => String(h).trim().toLowerCase());
        
        // Find indices
        const dorsalIdx = headers.findIndex(h => h.includes('camiseta') || h.includes('dorsal') || h.includes('número') || h.includes('numero'));
        const nameIdx = headers.findIndex(h => h.includes('nombre'));
        const lastNameIdx = headers.findIndex(h => h.includes('apellido'));
        const clubIdx = headers.findIndex(h => h.includes('club') || h.includes('equipo'));

        if (nameIdx === -1 || lastNameIdx === -1) {
          setParseMsg({ 
            type: 'error', 
            text: 'Columnas requeridas no encontradas. Asegúrate de incluir las cabeceras: "Dorsal", "Nombres" y "Apellidos".' 
          });
          return;
        }

        const parsedPlayers: Player[] = [];
        let ignoredLinesCount = 0;

        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0) continue;

          const rawDorsal = dorsalIdx !== -1 ? String(row[dorsalIdx] || '').trim() : `${i}`;
          const firstName = String(row[nameIdx] || '').trim();
          const lastName = String(row[lastNameIdx] || '').trim();

          if (!firstName && !lastName) {
            ignoredLinesCount++;
            continue;
          }

          parsedPlayers.push({
            id: `p-excel-${Date.now()}-${i}-${Math.random().toString(36).substring(3, 7)}`,
            clubId: activeClubId,
            dorsal: rawDorsal || 'S/N',
            firstName: firstName || 'Jugador',
            lastName: lastName || 'Nuevo'
          });
        }

        if (parsedPlayers.length === 0) {
          setParseMsg({ type: 'error', text: 'No se pudieron extraer jugadores válidos del Excel.' });
          return;
        }

        onAddPlayersBatch(parsedPlayers);
        setParseMsg({ 
          type: 'success', 
          text: `¡Éxito! Se importaron ${parsedPlayers.length} jugadores al club correctamente.${ignoredLinesCount > 0 ? ` (${ignoredLinesCount} líneas en blanco ignoradas)` : ''}` 
        });
        
        // Clear input element value
        e.target.value = '';

      } catch (err) {
        console.error(err);
        setParseMsg({ type: 'error', text: 'Error al decodificar el Excel. Asegúrate de que sea un archivo .xlsx válido.' });
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClubId) return;
    if (!manualFirstName.trim()) return;

    const newPlayer: Player = {
      id: `p-${Date.now()}`,
      clubId: activeClubId,
      dorsal: manualDorsal.trim() || 'S/N',
      firstName: manualFirstName.trim(),
      lastName: manualLastName.trim()
    };

    onAddPlayer(newPlayer);

    // Reset manual form
    setManualDorsal('');
    setManualFirstName('');
    setManualLastName('');
  };

  const startEditing = (p: Player) => {
    setEditingPlayerId(p.id);
    setEditDorsal(String(p.dorsal));
    setEditFirstName(p.firstName);
    setEditLastName(p.lastName);
  };

  const saveEditing = (pId: string) => {
    if (!editFirstName.trim()) return;

    const updated: Player = {
      id: pId,
      clubId: activeClubId,
      dorsal: editDorsal.trim() || 'S/N',
      firstName: editFirstName.trim(),
      lastName: editLastName.trim()
    };

    onUpdatePlayer(updated);
    setEditingPlayerId(null);
  };

  // Helper template Excel Creator for the User
  const downloadTemplateExcel = () => {
    const wsData = [
      ['Dorsal', 'Nombres', 'Apellidos', 'Club'],
      ['10', 'Lionel Andrés', 'Messi', 'Barcelona FC'],
      ['7', 'Vinicius Jr', 'De Oliveira', 'Real Madrid'],
      ['9', 'Erling', 'Haaland', 'Manchester City']
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
    XLSX.writeFile(wb, "Plantilla_Jugadores_GOLAPP.xlsx");
  };

  if (currentClubs.length === 0) {
    return (
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-10 flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-500 text-3xl mb-4 border border-zinc-850">
          ⚠️
        </div>
        <h3 className="text-sm font-bold text-white mb-1">Requiere Equipos Creados</h3>
        <p className="text-zinc-500 text-xs max-w-sm">
          No hay clubes deportivos creados para este torneo todavía. Por favor, ve primero a la pestaña de "{role === 'admin' ? 'Equipos' : 'Equipos'}" para inscribir clubes y poder vincular futbolistas a sus plantillas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="border-b border-zinc-900 pb-5">
        <h2 className="text-xl font-bold font-sans flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-500" />
          <span>Fichaje de Jugadores</span>
        </h2>
        <p className="text-zinc-400 text-xs mt-1">
          Inscribe deportistas a través de archivos de plantilla Excel o agrégalos manualmente uno a uno
        </p>
      </div>

      {/* Club Selector bar */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider shrink-0">Seleccione el Club: </span>
          <select
            id="active-club-selector"
            value={activeClubId}
            onChange={(e) => {
              setSelectedClubId(e.target.value);
              setParseMsg(null);
            }}
            className="flex-1 sm:w-64 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
          >
            {currentClubs.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {activeClubId && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-zinc-400 font-mono">
              Plantilla inscrita: <span className="font-bold text-white font-sans text-sm">{activeClubPlayers.length}</span> jugadores
            </span>
          </div>
        )}
      </div>

      {/* Excel Upload and Manual Registration Row (Only Admin) */}
      {role === 'admin' && activeClubId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Box 1: Excel Bulk Import */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-2">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Importar Plantilla Excel (.xlsx)</span>
              </h3>
              <p className="text-zinc-500 text-[11px] leading-relaxed mb-4">
                Sube la lista de tus futbolistas utilizando un libro de Excel. El nombre de las columnas debe incluir: <span className="text-zinc-300 font-semibold">"Camiseta"</span> (o "Dorsal"), <span className="text-zinc-300 font-semibold">"Nombres"</span> y <span className="text-zinc-300 font-semibold">"Apellidos"</span>.
              </p>
            </div>

            <div className="space-y-3">
              {/* Excel Message Info */}
              {parseMsg && (
                <div className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                  parseMsg.type === 'success' 
                    ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' 
                    : 'bg-red-950/20 border-red-500/20 text-red-400'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{parseMsg.text}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex-1 min-w-[140px] bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4 text-emerald-500" />
                  <span>Seleccionar Excel (.xlsx)</span>
                  <input
                    id="excel-file-upload-input"
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleExcelUpload}
                    className="hidden"
                  />
                </label>

                {/* Template download assist */}
                <button
                  id="download-template-excel-btn"
                  onClick={downloadTemplateExcel}
                  className="bg-zinc-950 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 p-3 rounded-xl border border-zinc-850 transition flex items-center justify-center"
                  title="Descargar Plantilla Excel de ejemplo"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Box 2: Manual Player Registration */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-3">
              <UserPlus className="w-4 h-4" />
              <span>Inscripción Manual Individual</span>
            </h3>

            <form onSubmit={handleManualSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">Dorsal</label>
                <input
                  id="manual-player-dorsal"
                  type="text"
                  placeholder="Ej. 10"
                  value={manualDorsal}
                  onChange={(e) => setManualDorsal(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">Nombres</label>
                <input
                  id="manual-player-names"
                  type="text"
                  placeholder="Lionel"
                  value={manualFirstName}
                  onChange={(e) => setManualFirstName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">Apellidos</label>
                <input
                  id="manual-player-lastname"
                  type="text"
                  placeholder="Messi"
                  value={manualLastName}
                  onChange={(e) => setManualLastName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                id="add-manual-player-btn"
                type="submit"
                className="w-full sm:col-span-3 mt-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition duration-150 cursor-pointer shadow-lg shadow-emerald-950/20"
              >
                Inscribir Jugador
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Roster list at the bottom of the screen */}
      {activeClubId && (
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-zinc-900 px-5 py-4 border-b border-zinc-950 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              📋 Lista de Jugadores Registrados
            </h3>
            <span className="text-[10px] bg-zinc-950 font-mono text-zinc-500 px-2 py-0.5 rounded border border-zinc-850">
              {activeClubPlayers.length} Inscritos
            </span>
          </div>

          {activeClubPlayers.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <p className="text-zinc-500 text-xs">No hay jugadores vinculados a este equipo todavía.</p>
              {role === 'admin' && (
                <p className="text-zinc-600 text-[10px] mt-1">Utiliza las herramientas superiores para registrar la plantilla oficial.</p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-zinc-900 overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300 min-w-[500px]">
                <thead>
                  <tr className="bg-zinc-900/40 text-zinc-500 font-bold uppercase tracking-widest text-[9px] border-b border-zinc-900">
                    <th className="py-3 px-5 w-16 text-center">Dorsal</th>
                    <th className="py-3 px-5">Apellidos y Nombres</th>
                    <th className="py-3 px-5">Equipo Vinculado</th>
                    {role === 'admin' && <th className="py-3 px-5 w-28 text-right">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {activeClubPlayers.map((player) => {
                    const isEditing = editingPlayerId === player.id;
                    const clubObj = clubs.find(c => c.id === player.clubId);

                    return (
                      <tr 
                        id={`player-row-${player.id}`}
                        key={player.id} 
                        className="hover:bg-zinc-900/30 transition duration-150"
                      >
                        {isEditing ? (
                          <>
                            {/* Edit Fields */}
                            <td className="py-2.5 px-4">
                              <input
                                id={`edit-player-dorsal-${player.id}`}
                                type="text"
                                value={editDorsal}
                                onChange={(e) => setEditDorsal(e.target.value)}
                                className="w-14 bg-zinc-800 rounded border border-zinc-700 px-1.5 py-1 text-center font-mono text-xs text-white"
                              />
                            </td>
                            <td className="py-2.5 px-4" colSpan={2}>
                              <div className="flex gap-2">
                                <input
                                  id={`edit-player-firstname-${player.id}`}
                                  type="text"
                                  value={editFirstName}
                                  onChange={(e) => setEditFirstName(e.target.value)}
                                  className="flex-1 bg-zinc-800 rounded border border-zinc-700 px-2 py-1 text-xs text-white"
                                  placeholder="Nombres"
                                />
                                <input
                                  id={`edit-player-lastname-${player.id}`}
                                  type="text"
                                  value={editLastName}
                                  onChange={(e) => setEditLastName(e.target.value)}
                                  className="flex-1 bg-zinc-800 rounded border border-zinc-700 px-2 py-1 text-xs text-white"
                                  placeholder="Apellidos"
                                />
                              </div>
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  id={`cancel-edit-player-${player.id}`}
                                  onClick={() => setEditingPlayerId(null)}
                                  className="bg-zinc-800 text-zinc-400 p-1.5 rounded hover:text-white transition"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  id={`save-edit-player-${player.id}`}
                                  onClick={() => saveEditing(player.id)}
                                  className="bg-emerald-600 text-white p-1.5 rounded hover:bg-emerald-500 transition"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            {/* Read Fields */}
                            <td className="py-3.5 px-5 text-center font-mono text-sm font-semibold text-emerald-400">
                              #{player.dorsal}
                            </td>
                            <td className="py-3.5 px-5 font-bold text-white text-sm">
                              {player.lastName}, {player.firstName}
                            </td>
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-2">
                                {clubObj && (
                                  <>
                                    <img 
                                      src={clubObj.crest} 
                                      alt="Crest" 
                                      className="w-5 h-5 object-contain" 
                                      referrerPolicy="no-referrer"
                                    />
                                    <span className="text-zinc-400 font-medium">{clubObj.name}</span>
                                  </>
                                )}
                              </div>
                            </td>
                            
                            {role === 'admin' && (
                              <td className="py-3.5 px-5 text-right whitespace-nowrap">
                                <button
                                  id={`edit-player-btn-${player.id}`}
                                  onClick={() => startEditing(player)}
                                  className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400 p-1.5 rounded-lg transition mr-1.5"
                                  title="Editar jugador"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  id={`delete-player-btn-${player.id}`}
                                  onClick={() => {
                                    setDeletePlayerId(player.id);
                                    setDeletePlayerName(`${player.firstName} ${player.lastName}`);
                                  }}
                                  className="bg-zinc-950 border border-zinc-900 hover:border-red-900/30 hover:bg-red-950/20 text-zinc-500 hover:text-red-400 p-1.5 rounded-lg transition"
                                  title="Dar de baja"
                                >
                                  <Trash2 className="w-4 h-4" />
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
      )}

      <ConfirmDialog
        isOpen={deletePlayerId !== null}
        title="Dar de Baja Jugador"
        message={`¿Estás completamente seguro de retirar del torneo al jugador "${deletePlayerName}"? Sus registros de estadísticas como goles y sanciones asociadas también serán depurados.`}
        onConfirm={() => {
          if (deletePlayerId) {
            onDeletePlayer(deletePlayerId);
          }
        }}
        onCancel={() => {
          setDeletePlayerId(null);
          setDeletePlayerName('');
        }}
      />
    </div>
  );
}
