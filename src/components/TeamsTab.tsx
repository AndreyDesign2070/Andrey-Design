import React, { useState } from 'react';
import { 
  Shield, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  X, 
  Save, 
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Tournament, Club } from '../types';
import { DEFAULT_CLUB_CRESTS } from '../initialData';
import ConfirmDialog from './ConfirmDialog';
import { compressImage } from '../utils/imageCompressor';

interface TeamsTabProps {
  tournament: Tournament;
  tournaments: Tournament[];
  clubs: Club[];
  role: 'admin' | 'visitante';
  onAddClub: (club: Club) => void;
  onUpdateClub: (club: Club) => void;
  onDeleteClub: (clubId: string) => void;
}

export default function TeamsTab({
  tournament,
  tournaments,
  clubs,
  role,
  onAddClub,
  onUpdateClub,
  onDeleteClub
}: TeamsTabProps) {
  const [deleteClubId, setDeleteClubId] = useState<string | null>(null);
  const [deleteClubName, setDeleteClubName] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClubId, setEditingClubId] = useState<string | null>(null);

  // States for New Club form
  const [newName, setNewName] = useState('');
  const [newTournamentId, setNewTournamentId] = useState(tournament.id);
  const [newCrest, setNewCrest] = useState(DEFAULT_CLUB_CRESTS.barsa);
  const [newPrimaryColor, setNewPrimaryColor] = useState('#10b981'); // Emerald
  const [newSecondaryColor, setNewSecondaryColor] = useState('#ffffff'); // White

  // States for Edit Club form
  const [editName, setEditName] = useState('');
  const [editTournamentId, setEditTournamentId] = useState('');
  const [editCrest, setEditCrest] = useState('');
  const [editPrimary, setEditPrimary] = useState('');
  const [editSecondary, setEditSecondary] = useState('');

  // Filtering clubs of currently active tournament for viewing
  const tournamentClubs = clubs.filter(c => c.tournamentId === tournament.id);

  const [compressing, setCompressing] = useState(false);

  const handleCrestUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      setCompressing(true);
      try {
        const compressed = await compressImage(file, 200, 200);
        if (isEdit) {
          setEditCrest(compressed);
        } else {
          setNewCrest(compressed);
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error al procesar la imagen.');
      } finally {
        setCompressing(false);
      }
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newClub: Club = {
      id: `c-${Date.now()}`,
      tournamentId: newTournamentId,
      name: newName.trim(),
      crest: newCrest,
      primaryColor: newPrimaryColor,
      secondaryColor: newSecondaryColor
    };

    onAddClub(newClub);
    
    // Reset Form
    setNewName('');
    setNewCrest(DEFAULT_CLUB_CRESTS.barsa);
    setNewPrimaryColor('#10b981');
    setNewSecondaryColor('#ffffff');
    setShowAddForm(false);
  };

  const handleStartEdit = (club: Club) => {
    setEditingClubId(club.id);
    setEditName(club.name);
    setEditTournamentId(club.tournamentId);
    setEditCrest(club.crest);
    setEditPrimary(club.primaryColor);
    setEditSecondary(club.secondaryColor);
  };

  const handleSaveEdit = (clubId: string) => {
    if (!editName.trim()) return;

    const upClub: Club = {
      id: clubId,
      tournamentId: editTournamentId,
      name: editName.trim(),
      crest: editCrest,
      primaryColor: editPrimary,
      secondaryColor: editSecondary
    };

    onUpdateClub(upClub);
    setEditingClubId(null);
  };

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-900 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-500" />
            <span>Equipos (Clubes)</span>
          </h2>
          <p className="text-zinc-400 text-xs mt-1">
            Administra los clubes, colores de indumentaria y escudos inscritos en el torneo
          </p>
        </div>

        {role === 'admin' && (
          <button
            id="show-add-club-form-btn"
            onClick={() => {
              setShowAddForm(!showAddForm);
              setNewTournamentId(tournament.id); // Default to current
            }}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/20"
          >
            {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{showAddForm ? 'Cerrar Registro' : 'Inscribir Equipo'}</span>
          </button>
        )}
      </div>

      {/* Form to Add Club */}
      {showAddForm && role === 'admin' && (
        <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 shadow-xl animate-fade-in">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-zinc-900 pb-2">
            ⚽ Inscribir Nuevo Club Técnico
          </h3>
          <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Input fields */}
            <div className="space-y-4 md:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Nombre del Club
                  </label>
                  <input
                    id="new-club-name"
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ej. Santos Laguna Fc"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Asignar al Torneo
                  </label>
                  <select
                    id="new-club-tournament"
                    value={newTournamentId}
                    onChange={(e) => setNewTournamentId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {tournaments.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.type})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Colors selection */}
              <div className="grid grid-cols-2 gap-4 bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-850">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Color Primario
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="new-club-primary-color"
                      type="color"
                      value={newPrimaryColor}
                      onChange={(e) => setNewPrimaryColor(e.target.value)}
                      className="w-9 h-9 border border-zinc-700 bg-transparent rounded cursor-pointer"
                    />
                    <span className="font-mono text-[10px] text-zinc-300 bg-zinc-900 px-2 py-1 rounded border border-zinc-800 uppercase">{newPrimaryColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Color Secundario
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="new-club-secondary-color"
                      type="color"
                      value={newSecondaryColor}
                      onChange={(e) => setNewSecondaryColor(e.target.value)}
                      className="w-9 h-9 border border-zinc-700 bg-transparent rounded cursor-pointer"
                    />
                    <span className="font-mono text-[10px] text-zinc-300 bg-zinc-900 px-2 py-1 rounded border border-zinc-800 uppercase">{newSecondaryColor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Crest Upload */}
            <div className="space-y-4 flex flex-col justify-between">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Escudo del Club (PNG/JPG)
                </label>
                <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl">
                  {newCrest ? (
                    <img 
                      src={newCrest} 
                      alt="Escudo" 
                      className="w-12 h-12 object-contain bg-zinc-950 p-1 rounded-lg border border-zinc-800"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-zinc-950 rounded-lg flex items-center justify-center border border-zinc-850 text-zinc-600">🛡️</div>
                  )}
                  <div>
                    <label className="inline-flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-750 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition">
                      <Upload className="w-3 h-3" />
                      <span>Subir Escudo</span>
                      <input 
                        id="new-club-crest-upload"
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg" 
                        onChange={(e) => handleCrestUpload(e, false)} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  id="cancel-club-btn"
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-zinc-900 hover:bg-zinc-850 text-zinc-400 text-xs py-2 px-4 rounded-xl border border-zinc-800 transition"
                >
                  Cancelar
                </button>
                <button
                  id="submit-club-btn"
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-2 px-4 rounded-xl font-bold shadow-lg shadow-emerald-950/20"
                >
                  Confirmar Registro
                </button>
              </div>
            </div>

          </form>
        </div>
      )}

      {/* Grid List of Clubs */}
      {tournamentClubs.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl py-12 px-4 text-center">
          <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-500 text-xl mx-auto mb-3 border border-zinc-850">
            🛡️
          </div>
          <p className="text-zinc-400 text-xs font-semibold">No hay equipos inscritos en este torneo</p>
          {role === 'admin' && (
            <p className="text-zinc-500 text-[11px] mt-1">Sube escudos y llena el formulario de arriba para habilitar jugadores y partidos</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournamentClubs.map((club) => {
            const isEditing = editingClubId === club.id;
            return (
              <div 
                id={`club-card-${club.id}`}
                key={club.id}
                className="bg-zinc-950 border border-zinc-900/85 rounded-2xl overflow-hidden shadow-md flex flex-col justify-between"
              >
                {/* Visual Colors Bar */}
                <div className="h-2.5 flex">
                  <div className="flex-1" style={{ backgroundColor: club.primaryColor }} />
                  <div className="flex-1" style={{ backgroundColor: club.secondaryColor }} />
                </div>

                {isEditing ? (
                  /* Editing Mode Card Content */
                  <div className="p-5 space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] text-zinc-500 uppercase tracking-widest mb-1">Nombre</label>
                        <input
                          id={`edit-club-name-${club.id}`}
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] text-zinc-500 uppercase tracking-widest mb-1">Torneo</label>
                        <select
                          id={`edit-club-tournament-${club.id}`}
                          value={editTournamentId}
                          onChange={(e) => setEditTournamentId(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-white"
                        >
                          {tournaments.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] text-zinc-500 uppercase tracking-widest mb-1">C. Primario</label>
                          <input
                            id={`edit-club-primary-${club.id}`}
                            type="color"
                            value={editPrimary}
                            onChange={(e) => setEditPrimary(e.target.value)}
                            className="w-full bg-transparent h-8 border border-zinc-800 p-0 rounded-lg cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-zinc-500 uppercase tracking-widest mb-1">C. Secundario</label>
                          <input
                            id={`edit-club-secondary-${club.id}`}
                            type="color"
                            value={editSecondary}
                            onChange={(e) => setEditSecondary(e.target.value)}
                            className="w-full bg-transparent h-8 border border-zinc-800 p-0 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] text-zinc-500 uppercase tracking-widest mb-1">Escudo PNG/JPG</label>
                        <div className="flex items-center gap-2">
                          <img 
                            src={editCrest} 
                            alt="Crest" 
                            className="w-8 h-8 object-contain bg-zinc-900 p-1 rounded" 
                            referrerPolicy="no-referrer"
                          />
                          <label className="bg-zinc-900 hover:bg-zinc-800 text-[10px] py-1 px-2 border border-zinc-800 rounded cursor-pointer text-zinc-300">
                            Subir
                            <input
                              id={`edit-club-crest-upload-${club.id}`}
                              type="file"
                              accept="image/png, image/jpeg, image/jpg"
                              onChange={(e) => handleCrestUpload(e, true)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Editor Action Buttons */}
                    <div className="flex justify-end gap-2 pt-2 border-t border-zinc-900">
                      <button
                        id={`cancel-edit-club-${club.id}`}
                        onClick={() => setEditingClubId(null)}
                        className="bg-zinc-900 hover:bg-zinc-850 text-zinc-400 text-[10px] font-bold py-1 px-2 rounded-lg"
                      >
                        Cancelar
                      </button>
                      <button
                        id={`save-edit-club-${club.id}`}
                        onClick={() => handleSaveEdit(club.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold py-1 px-3 rounded-lg flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        <span>Guardar</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Default Read / Display Mode Card Content */
                  <div className="p-5 flex flex-col justify-between flex-1">
                    <div className="flex items-center gap-4">
                      {/* Crest Preview Frame */}
                      <div className="w-14 h-14 bg-zinc-900 rounded-xl p-2.5 flex items-center justify-center border border-zinc-850 relative">
                        <img
                          src={club.crest}
                          alt={club.name}
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                        {/* Bullet color overlays on the shield circle */}
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-zinc-950" style={{ backgroundColor: club.primaryColor }} />
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-base font-bold text-white leading-snug truncate">
                          {club.name}
                        </h4>
                        
                        {/* Dual colors tags preview */}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-[9px] uppercase font-bold text-zinc-500">Uniforme:</span>
                          <span className="w-2.5 h-2.5 rounded-full inline-block border border-zinc-800" style={{ backgroundColor: club.primaryColor }} title="Color principal" />
                          <span className="w-2.5 h-2.5 rounded-full inline-block border border-zinc-800" style={{ backgroundColor: club.secondaryColor }} title="Color secundario" />
                        </div>
                      </div>
                    </div>

                    {/* Admin modification bar */}
                    {role === 'admin' && (
                      <div className="flex justify-end gap-2 border-t border-zinc-900/70 pt-3 mt-4">
                        <button
                          id={`edit-club-btn-${club.id}`}
                          onClick={() => handleStartEdit(club)}
                          className="bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-850 p-1.5 rounded-lg border border-zinc-800 transition text-[10px] font-semibold flex items-center gap-1"
                          title="Editar información"
                        >
                          <Edit3 className="w-3 h-3 text-emerald-500" />
                          <span>Editar</span>
                        </button>
                        <button
                          id={`delete-club-btn-${club.id}`}
                          onClick={() => {
                            setDeleteClubId(club.id);
                            setDeleteClubName(club.name);
                          }}
                          className="bg-zinc-950 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 p-1.5 rounded-lg border border-zinc-900 hover:border-red-900/30 transition"
                          title="Eliminar equipo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteClubId !== null}
        title="Eliminar Equipo"
        message={`¿Estás completamente seguro de borrar el equipo "${deleteClubName}"? Esta acción eliminará irremediablemente todos sus jugadores, goleadores, registros de sanciones y estadísticas asociadas dentro del torneo.`}
        onConfirm={() => {
          if (deleteClubId) {
            onDeleteClub(deleteClubId);
          }
        }}
        onCancel={() => {
          setDeleteClubId(null);
          setDeleteClubName('');
        }}
      />
    </div>
  );
}
