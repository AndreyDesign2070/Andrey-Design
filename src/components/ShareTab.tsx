import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  Smartphone, 
  Send, 
  QrCode, 
  Download, 
  Info,
  ExternalLink
} from 'lucide-react';
import { Tournament } from '../types';

interface ShareTabProps {
  tournament: Tournament;
}

export default function ShareTab({ tournament }: ShareTabProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedApkMsg, setCopiedApkMsg] = useState(false);

  // Generate URL dynamically 
  const getAppUrl = () => {
    return window.location.origin || 'https://golapp-torneos.com';
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getAppUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSendWhatsappApp = () => {
    const textMsg = `⚽ ¡Descubre *GOLAPP*! El mejor gestor de torneos deportivos en tiempo real. Sigue los resultados, la tabla de posiciones, goleadores y sanciones del torneo *${tournament.name}* en vivo aquí: ${getAppUrl()}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textMsg)}`;
    window.open(url, '_blank');
  };

  const handleShareApkWhatsapp = () => {
    const textMsg = `📲 *¡Instala GOLAPP en tu celular Android!* Sigue de cerca el torneo *${tournament.name}*. Entra al enlace desde tu navegador, presiona el botón de 'Agregar a Pantalla de Inicio' e instálalo como una App nativa (PWA/APK). Es súper rápido y ligero: ${getAppUrl()}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textMsg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title Header */}
      <div className="border-b border-zinc-900 pb-5">
        <h2 className="text-xl font-bold font-sans flex items-center gap-2">
          <Share2 className="w-5 h-5 text-emerald-500" />
          <span>Compartir Aplicación & Descarga APK</span>
        </h2>
        <p className="text-zinc-400 text-xs mt-1">
          Difunde la aplicación con los delegados, directores técnicos y jugadores del torneo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* ACTION CARDS */}
        {/* CARD 1: copiar enlace */}
        <div className="bg-zinc-950 border border-zinc-900 hover:border-emerald-500/30 transition p-6 rounded-2xl flex flex-col justify-between min-h-[220px] shadow-lg">
          <div>
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-4 border border-emerald-500/20">
              <Copy className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">Copiar Enlace Web</h3>
            <p className="text-zinc-500 text-[11px] leading-relaxed">
              Copia el link de la app y pégalo en cualquier chat grupal para que todos ingresen inmediatamente desde su navegador.
            </p>
          </div>

          <button
            id="copy-link-action-btn"
            onClick={handleCopyLink}
            className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              copiedLink 
                ? 'bg-emerald-600 text-white' 
                : 'bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-800 cursor-pointer'
            }`}
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>¡Copie con Éxito!</span>
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
        <div className="bg-zinc-950 border border-zinc-900 hover:border-green-500/30 transition p-6 rounded-2xl flex flex-col justify-between min-h-[220px] shadow-lg">
          <div>
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-400 mb-4 border border-green-500/20">
              <Send className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">Enviar por WhatsApp</h3>
            <p className="text-zinc-500 text-[11px] leading-relaxed">
              Redacta y envía de forma inmediata un mensaje de invitación oficial con el enlace web de GOLAPP a tus chats en WhatsApp.
            </p>
          </div>

          <button
            id="send-whatsapp-action-btn"
            onClick={handleSendWhatsappApp}
            className="w-full bg-emerald-700 hover:bg-emerald-650 text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/20"
          >
            <span>Enviar por WhatsApp</span>
          </button>
        </div>

        {/* CARD 3: compartir apk */}
        <div className="bg-zinc-950 border border-zinc-900 hover:border-yellow-500/30 transition p-6 rounded-2xl flex flex-col justify-between min-h-[220px] shadow-lg">
          <div>
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 mb-4 border border-amber-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">Compartir APK</h3>
            <p className="text-zinc-500 text-[11px] leading-relaxed">
              Envía por WhatsApp el instructivo de instalación rápida y enlace de la app móvil para dispositivos Android o iOS.
            </p>
          </div>

          <button
            id="share-apk-whatsapp-action-btn"
            onClick={handleShareApkWhatsapp}
            className="w-full bg-zinc-900 hover:bg-zinc-850 text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-zinc-800 cursor-pointer transition"
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-500" />
            <span>Compartir Lanzador APK</span>
          </button>
        </div>

      </div>

      {/* PWA / MOBILE INSTALL EXPLANATION BLOCK */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-xl mt-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          📱 ¿Cómo instalar GOLAPP como App de Celular (APK)?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed text-zinc-400 text-xs">
          
          <div className="space-y-4">
            <p>
              GOLAPP está construida bajo tecnología de vanguardia como una <span className="text-emerald-400 font-bold">PWA (Progressive Web App)</span>. Esto significa que puede ser instalada directamente en tu celular Android o iOS sin necesidad de pasar por la tienda de aplicaciones de Google Play ni App Store, comportándose exactamente igual que un archivo <span className="font-semibold text-white">APK nativo</span>.
            </p>

            <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-850 space-y-2.5">
              <h4 className="font-bold text-white text-[11px] tracking-wide flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Ventajas de la Aplicación Móvil PWA:</span>
              </h4>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-400">
                <li>Instalación de peso pluma (&lt; 1MB) en tu dispositivo.</li>
                <li>Acceso rápido con ícono personalizado en tu pantalla de inicio.</li>
                <li>Mayor velocidad de procesamiento y carga offline de datos.</li>
                <li>Ahorro en el consumo de memoria RAM de tu teléfono.</li>
              </ul>
            </div>
          </div>

          <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-850/80 space-y-4">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <span>Pasos para Instalar en tu Teléfono:</span>
            </h4>

            <div className="space-y-3">
              <div className="flex gap-2">
                <span className="w-5 h-5 bg-zinc-950 font-mono font-bold text-emerald-400 border border-zinc-850 flex items-center justify-center rounded text-[10px]">1</span>
                <div>
                  <p className="font-semibold text-white">Ingresa desde Google Chrome (en Android) o Safari (en iOS)</p>
                  <p className="text-zinc-500 text-[10px] mt-0.5">Abre el enlace copiado anteriormente en tu celular.</p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="w-5 h-5 bg-zinc-950 font-mono font-bold text-emerald-400 border border-zinc-850 flex items-center justify-center rounded text-[10px]">2</span>
                <div>
                  <p className="font-semibold text-white">Despliega el menú del navegador</p>
                  <p className="text-zinc-500 text-[10px] mt-0.5">Presiona los 3 puntos superiores (en Chrome) o el botón 'Compartir' (en Safari).</p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="w-5 h-5 bg-zinc-950 font-mono font-bold text-emerald-400 border border-zinc-850 flex items-center justify-center rounded text-[10px]">3</span>
                <div>
                  <p className="font-semibold text-white">Haz clic en "Instalar Aplicación" o "Agregar a Pantalla de Inicio"</p>
                  <p className="text-zinc-500 text-[10px] mt-0.5">¡Listo! Se agregará automáticamente un acceso directo elegante tipo APK a tu menú de aplicaciones.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
