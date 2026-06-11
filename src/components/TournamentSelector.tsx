import React, { useState } from 'react';
import { 
  Trophy, 
  Plus, 
  Trash2, 
  Calendar, 
  ShieldAlert, 
  BadgeHelp, 
  LogOut, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  Settings,
  Upload,
  Share2,
  Check,
  Copy,
  Send,
  Smartphone,
  X
} from 'lucide-react';
import { Tournament, TournamentType, TournamentStatus } from '../types';
import { DEFAULT_TOURNAMENT_LOGO } from '../initialData';
import ConfirmDialog from './ConfirmDialog';
import { compressImage } from '../utils/imageCompressor';

interface TournamentSelectorProps {
  tournaments: Tournament[];
  role: 'admin' | 'visitante';
  onSelectTournament: (tournamentId: string) => void;
  onAddTournament: (tournament: Tournament) => void;
  onDeleteTournament: (tournamentId: string) => void;
  onLogout: () => void;
}

export default function TournamentSelector({
  tournaments,
  role,
  onSelectTournament,
  onAddTournament,
  onDeleteTournament,
  onLogout
}: TournamentSelectorProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('TODOS');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<TournamentType>('LIGA');
  const [newStatus, setNewStatus] = useState<TournamentStatus>('VIGENTE');
  const [newLogo, setNewLogo] = useState<string>(DEFAULT_TOURNAMENT_LOGO);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        alert('Por favor, selecciona una imagen en formato PNG o JPG.');
        return;
      }
      try {
        const compressed = await compressImage(file, 200, 200);
        setNewLogo(compressed);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error al procesar el logo del torneo.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newTournament: Tournament = {
      id: `t-${Date.now()}`,
      name: newName.trim(),
      type: newType,
      status: newStatus,
      logo: newLogo
    };

    onAddTournament(newTournament);
    // Reset Form
    setNewName('');
    setNewType('LIGA');
    setNewStatus('VIGENTE');
    setNewLogo(DEFAULT_TOURNAMENT_LOGO);
    setShowAddForm(false);
  };

  const filteredTournaments = tournaments.filter(t => {
    if (filterType === 'TODOS') return true;
    return t.type === filterType;
  });

  return (
    <div className="min-h-screen bg-black text-white py-8 px-4 sm:px-6 lg:px-8">
      {/* Upper Navigation Rail */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center bg-zinc-950 border border-zinc-850 px-6 py-4 rounded-2xl mb-8 gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-500">
            <Trophy className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black text-white tracking-tight flex items-center gap-2">
              GOL<span className="text-emerald-500">APP</span>
            </h1>
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-mono">Gestor de Torneos</p>
          </div>
        </div>

        {/* User Badge and LogOut */}
        <div className="flex flex-wrap items-center gap-3">
          <div className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
            role === 'admin' 
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30' 
              : 'bg-zinc-900/60 text-zinc-400 border-zinc-800'
          }`}>
            <span className={`w-2 h-2 rounded-full ${role === 'admin' ? 'bg-emerald-500 pulse-green' : 'bg-zinc-500'}`} />
            <span>Rol: {role === 'admin' ? 'Administrador (Total)' : 'Visitante (Lectura)'}</span>
          </div>

          <button
            id="share-app-selector-btn"
            onClick={() => setIsShareModalOpen(true)}
            className="px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition duration-150 cursor-pointer bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-850"
            title="Compartir Aplicación"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>Compartir APP</span>
          </button>

          <button
            id="logout-btn"
            onClick={onLogout}
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white p-2.5 rounded-xl border border-zinc-850 transition duration-150 flex items-center justify-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Title and Filters Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Panel de Torneos</h2>
            <p className="text-zinc-400 text-sm mt-1">Selecciona o administra los campeonatos de fútbol</p>
          </div>

          {/* Add Tournament Button (Only Admin) */}
          {role === 'admin' && (
            <button
              id="show-add-tournament-form-btn"
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Torneo</span>
            </button>
          )}
        </div>

        {/* Add Tournament Modal Form */}
        {showAddForm && role === 'admin' && (
          <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 mb-8 shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-zinc-900 pb-3">
              <span className="text-emerald-500">⚽</span> Crear Nuevo Campeonato
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Form Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Nombre del Torneo
                  </label>
                  <input
                    id="new-tournament-name"
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ej. Copa Libertadores GOLAPP"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Tipo de Torneo
                    </label>
                    <select
                      id="new-tournament-type"
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as TournamentType)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="LIGA">LIGA (Todos contra todos)</option>
                      <option value="GRUPOS">GRUPOS (Formatos de Grupo)</option>
                      <option value="MUERTE_SUBITA">MUERTE SÚBITA (Eliminación)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Estado Inicial
                    </label>
                    <select
                      id="new-tournament-status"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as TournamentStatus)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="VIGENTE">VIGENTE (Green)</option>
                      <option value="TERMINADO">TERMINADO (Red)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Image Upload */}
              <div className="flex flex-col justify-between space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Logo del Torneo (Formato PNG)
                  </label>
                  <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                    <img 
                      src={newLogo} 
                      alt="Logo del torneo" 
                      className="w-16 h-16 object-contain rounded-lg bg-zinc-950 p-1 border border-zinc-800"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1">
                      <label className="inline-flex items-center gap-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border border-zinc-750 transition-all">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir PNG Logo</span>
                        <input 
                          id="new-tournament-logo-upload"
                          type="file" 
                          accept="image/png" 
                          onChange={handleLogoUpload} 
                          className="hidden" 
                        />
                      </label>
                      <p className="text-[10px] text-zinc-500 mt-1">Recomendado: Fondo transparente PNG cuadrado</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    id="cancel-add-tournament-btn"
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-zinc-800 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    id="submit-tournament-btn"
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg transition"
                  >
                    Crear Torneo
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Categories Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-900 mb-6 max-w-lg">
          {['TODOS', 'LIGA', 'GRUPOS', 'MUERTE_SUBITA'].map((type) => (
            <button
              id={`filter-type-${type}`}
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex-1 min-w-[80px] text-center text-xs font-semibold py-2 px-3 rounded-lg transition-all ${
                filterType === type
                  ? 'bg-zinc-800 text-white shadow'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
              }`}
            >
              {type === 'TODOS' ? 'Todos' : type === 'MUERTE_SUBITA' ? 'Muerte Súbita' : type}
            </button>
          ))}
        </div>

        {/* Main List Grid */}
        {filteredTournaments.length === 0 ? (
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl py-16 px-4 text-center">
            <div className="text-zinc-600 text-4xl mb-3">🕳️</div>
            <p className="text-zinc-400 text-sm font-medium">No se encontraron torneos de esta categoría</p>
            {role === 'admin' && (
              <p className="text-zinc-500 text-xs mt-1">¡Haz clic en "Nuevo Torneo" para agregar el primero!</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((tournament) => {
              const isVigente = tournament.status === 'VIGENTE';
              return (
                <div
                  id={`tournament-card-${tournament.id}`}
                  key={tournament.id}
                  onClick={() => onSelectTournament(tournament.id)}
                  className={`group relative overflow-hidden bg-zinc-950/90 rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl cursor-pointer ${
                    isVigente 
                      ? 'border-emerald-500/20 hover:border-emerald-500/60 shadow-lg shadow-emerald-950/10' 
                      : 'border-red-500/20 hover:border-red-500/60 shadow-lg shadow-red-950/10'
                  }`}
                >
                  {/* Color Glow accent at card top */}
                  <div className={`h-1.5 w-full ${isVigente ? 'bg-emerald-500' : 'bg-red-500'}`} />

                  {/* Card Content */}
                  <div className="p-5 flex flex-col justify-between min-h-[190px]">
                    <div className="flex items-start gap-4">
                      {/* Logo Frame */}
                      <img
                        src={tournament.logo}
                        alt="Logo"
                        className="w-14 h-14 object-contain rounded-xl bg-neutral-900 p-1.5 border border-zinc-800"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        {/* Status Badge */}
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${isVigente ? 'bg-emerald-500 pulse-green' : 'bg-red-500'}`} />
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            isVigente ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {isVigente ? 'Vigente' : 'Terminado'}
                          </span>
                        </div>

                        {/* Tournament Name */}
                        <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 leading-tight">
                          {tournament.name}
                        </h3>
                      </div>
                    </div>

                    {/* Metadata Bottom */}
                    <div className="flex justify-between items-center mt-4 border-t border-zinc-900 pt-3 text-xs text-zinc-500">
                      <div className="flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="font-mono text-[10px] uppercase font-bold tracking-wider">{tournament.type}</span>
                      </div>

                      {/* Delete Button (Only Admin) */}
                      {role === 'admin' ? (
                        <button
                          id={`delete-tournament-${tournament.id}`}
                          onClick={(e) => {
                            e.stopPropagation(); // Avoid selecting tournament
                            setDeleteTargetId(tournament.id);
                            setDeleteTargetName(tournament.name);
                          }}
                          className="bg-zinc-900 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 p-2 rounded-lg border border-zinc-800 transition"
                          title="Eliminar Torneo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-zinc-600 font-medium">Ver torneo →</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="Eliminar Torneo"
        message={`¿Estás completamente seguro de eliminar el campeonato "${deleteTargetName}"? Esta acción borrará permanentemente el torneo, sus equipos, jugadores, partidos y todo su historial de estadísticas de GOLAPP.`}
        onConfirm={() => {
          if (deleteTargetId) {
            onDeleteTournament(deleteTargetId);
          }
        }}
        onCancel={() => {
          setDeleteTargetId(null);
          setDeleteTargetName('');
        }}
      />

      {/* MODAL COMPARTIR APP / DESCARGA APK (IGUAL A LA PESTAÑA COMPARTIR/APK) */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-zinc-900 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-bold font-sans text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-emerald-500" />
                  <span>Compartir Aplicación & Descarga APK</span>
                </h3>
                <p className="text-zinc-500 text-xs mt-1">
                  Difunde la aplicación con los delegados, directores técnicos y jugadores
                </p>
              </div>
              <button
                id="close-share-modal-x"
                onClick={() => setIsShareModalOpen(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition cursor-pointer"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content exactly as ShareTab */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* ACTION CARDS */}
                {/* CARD 1: copiar enlace */}
                <div className="bg-zinc-900/40 border border-zinc-900 hover:border-emerald-500/20 transition p-5 rounded-2xl flex flex-col justify-between min-h-[200px] shadow-lg">
                  <div>
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-3 border border-emerald-500/20">
                      <Copy className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-white mb-1">Copiar Enlace Web</h4>
                    <p className="text-zinc-500 text-[10px] leading-relaxed">
                      Copia el link de la app y pégalo en cualquier chat grupal para que todos ingresen de inmediato.
                    </p>
                  </div>

                  <button
                    id="copy-link-modal-btn"
                    onClick={() => {
                      const appUrl = window.location.origin || 'https://golapp-torneos.com';
                      navigator.clipboard.writeText(appUrl);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2500);
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                      copiedLink 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-800 cursor-pointer'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>¡Copiado con Éxito!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Copiar Enlace</span>
                      </>
                    )}
                  </button>
                </div>

                {/* CARD 2: Enviar por whatsapp */}
                <div className="bg-zinc-900/40 border border-zinc-900 hover:border-green-500/20 transition p-5 rounded-2xl flex flex-col justify-between min-h-[200px] shadow-lg">
                  <div>
                    <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-400 mb-3 border border-green-500/20">
                      <Send className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-white mb-1">Enviar por WhatsApp</h4>
                    <p className="text-zinc-500 text-[10px] leading-relaxed">
                      Redacta y envía de forma inmediata un mensaje de invitación oficial con el enlace web de GOLAPP.
                    </p>
                  </div>

                  <button
                    id="send-whatsapp-modal-btn"
                    onClick={() => {
                      const appUrl = window.location.origin || 'https://golapp-torneos.com';
                      const textMsg = `⚽ ¡Descubre *GOLAPP*! El mejor gestor de torneos deportivos en tiempo real. Sigue los resultados, la tabla de posiciones, goleadores y sanciones en vivo aquí: ${appUrl}`;
                      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textMsg)}`;
                      window.open(url, '_blank');
                    }}
                    className="w-full bg-emerald-700 hover:bg-emerald-650 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition shadow-md shadow-emerald-950/25"
                  >
                    <span>Enviar por WhatsApp</span>
                  </button>
                </div>

                {/* CARD 3: compartir apk */}
                <div className="bg-zinc-900/40 border border-zinc-900 hover:border-yellow-500/20 transition p-5 rounded-2xl flex flex-col justify-between min-h-[200px] shadow-lg">
                  <div>
                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 mb-3 border border-amber-500/20">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-white mb-1">Compartir APK</h4>
                    <p className="text-zinc-500 text-[10px] leading-relaxed">
                      Envía de forma ágil el instructivo de instalación rápida de la aplicación móvil de GOLAPP.
                    </p>
                  </div>

                  <button
                    id="share-apk-modal-btn"
                    onClick={() => {
                      const appUrl = window.location.origin || 'https://golapp-torneos.com';
                      const textMsg = `📲 *¡Instala GOLAPP en tu celular!* Entra al enlace desde tu navegador, presiona el botón de 'Agregar a Pantalla de Inicio' e instálalo como una App nativa/APK. Es súper rápido y ligero: ${appUrl}`;
                      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textMsg)}`;
                      window.open(url, '_blank');
                    }}
                    className="w-full bg-zinc-900 hover:bg-zinc-850 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-zinc-800 cursor-pointer transition"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-amber-500" />
                    <span>Compartir Lanzador APK</span>
                  </button>
                </div>

              </div>

              {/* PWA / MOBILE INSTALL EXPLANATION BLOCK */}
              <div className="bg-zinc-900/20 border border-zinc-900/80 rounded-2xl p-5 shadow-inner">
                <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                  📱 ¿Cómo instalar GOLAPP como App de Celular (APK)?
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 leading-relaxed text-zinc-400 text-[11px]">
                  
                  <div className="space-y-3">
                    <p>
                      GOLAPP utiliza tecnología <span className="text-emerald-400 font-bold">PWA (Progressive Web App)</span>. Puedes instalarla directamente en tu Android o iOS desde tu navegador web, funcionando igual que un archivo <span className="font-semibold text-white">APK nativo</span> sin tiendas.
                    </p>

                    <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-900 space-y-2">
                      <h5 className="font-bold text-white text-[10px] tracking-wide flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Ventajas clave de la PWA:</span>
                      </h5>
                      <ul className="list-disc list-inside space-y-1 text-[10px] text-zinc-400 bg-transparent">
                        <li>Instalación súper ligera (&lt; 1MB).</li>
                        <li>Acceso directo con el icono en tu pantalla principal.</li>
                        <li>Mayor velocidad de procesamiento y carga offline.</li>
                        <li>Ahorro en el consumo de memoria del teléfono.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-900 space-y-3">
                    <h5 className="font-bold text-white text-[11px] flex items-center gap-1.5">
                      <span>Pasos de Instalación:</span>
                    </h5>

                    <div className="space-y-2.5">
                      <div className="flex gap-2">
                        <span className="w-4 h-4 bg-zinc-950 font-mono font-bold text-emerald-400 border border-zinc-900 flex items-center justify-center rounded text-[9px] shrink-0">1</span>
                        <div>
                          <p className="font-semibold text-zinc-300">Abre desde Chrome (Android) o Safari (iOS)</p>
                          <p className="text-zinc-500 text-[9px]">Usa el enlace GOLAPP en tu celular.</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <span className="w-4 h-4 bg-zinc-950 font-mono font-bold text-emerald-400 border border-zinc-900 flex items-center justify-center rounded text-[9px] shrink-0">2</span>
                        <div>
                          <p className="font-semibold text-zinc-300">Despliega el menú de opciones</p>
                          <p className="text-zinc-500 text-[9px]">Toca los 3 puntos superiores o el botón compartir.</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <span className="w-4 h-4 bg-zinc-950 font-mono font-bold text-emerald-400 border border-zinc-900 flex items-center justify-center rounded text-[9px] shrink-0">3</span>
                        <div>
                          <p className="font-semibold text-zinc-300">Elige "Instalar" o "Agregar a Pantalla de Inicio"</p>
                          <p className="text-zinc-500 text-[9px]">¡Listo! Tendrás la App en tu cajón de aplicaciones.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-zinc-900/80 pt-4 mt-6">
              <button
                id="close-share-modal-btn"
                onClick={() => setIsShareModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 hover:text-white transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
