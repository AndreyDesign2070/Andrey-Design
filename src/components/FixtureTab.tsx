import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Send, 
  Trash2, 
  AlertCircle, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Tournament, FixturePDF } from '../types';
import ConfirmDialog from './ConfirmDialog';

interface FixtureTabProps {
  tournament: Tournament;
  fixturePdf: FixturePDF | undefined;
  role: 'admin' | 'visitante';
  onUpload: (pdfDataUrl: string, fileName: string) => void;
  onClear: () => void;
}

export default function FixtureTab({
  tournament,
  fixturePdf,
  role,
  onUpload,
  onClear
}: FixtureTabProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [error, setError] = useState('');
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // to reset input field

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Por favor, selecciona únicamente un archivo en formato PDF.');
        return;
      }
      
      // Limit file size to ~3MB to save localStorage quota gracefully
      if (file.size > 3 * 1024 * 1024) {
        setError('El archivo PDF supera los 3MB de límite para almacenamiento local. Por favor optimízalo.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload(reader.result as string, file.name);
        setError('');
        setFileInputKey(Date.now()); // Reset file input
      };
      reader.onerror = () => {
        setError('Ocurrió un error al procesar el archivo PDF.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger download of base64 PDF
  const handleDownload = () => {
    if (!fixturePdf) return;
    const link = document.createElement('a');
    link.href = fixturePdf.pdfDataUrl;
    link.download = fixturePdf.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pre-generate WhatsApp click-to-chat API Link
  const handleSendWhatsapp = () => {
    const message = `⚽ ¡Hola! Te comparto el Fixture Oficial del torneo *${tournament.name}* en *GOLAPP*. Puedes revisarlo, descargarlo y hacer seguimiento en línea. Ingresa aquí: ${window.location.origin}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Title & Description Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-900 pb-5 gap-3">
        <div>
          <h2 className="text-xl font-bold font-sans flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-500" />
            <span>Fixture PDF Oficial</span>
          </h2>
          <p className="text-zinc-400 text-xs mt-1">
            Visualiza, descarga y comparte el calendario general de los encuentros del torneo
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-500/30 text-red-400 text-xs py-3 px-4 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Container */}
      {!fixturePdf ? (
        // Empty State
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-10 flex flex-col items-center justify-center text-center animate-fade-in">
          <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-500 text-3xl mb-4 border border-zinc-800">
            📄
          </div>
          <h3 className="text-sm font-bold text-white mb-1.5">No se ha subido ningún Fixture</h3>
          <p className="text-zinc-500 text-xs max-w-sm mb-6">
            {role === 'admin' 
              ? 'Sube el archivo PDF que contenga el fixture de todos los encuentros del torneo para que los equipos puedan consultarlo.'
              : 'El administrador aún no ha cargado el documento de fixture oficial de este torneo.'
            }
          </p>

          {role === 'admin' && (
            <label className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition duration-150 cursor-pointer shadow-lg shadow-emerald-950/40 transform active:scale-95">
              <Upload className="w-4 h-4" />
              <span>Subir PDF de Fixture</span>
              <input
                key={fileInputKey}
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      ) : (
        // Active State with Viewer & Actions
        <div className="space-y-6">
          
          {/* PDF Viewer Block - Now at the Top and Full Width */}
          <div className="w-full space-y-3">
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[650px]">
              {/* PDF Viewer Bar */}
              <div className="bg-zinc-900/80 px-4 py-3 border-b border-zinc-950 flex justify-between items-center text-xs text-zinc-400">
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> Visor de documento embebido
                </span>
                <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-500 font-mono">HTML5 CANVAS/PDF</span>
              </div>

              {/* PDF View Frame */}
              <div className="flex-1 bg-zinc-900 relative">
                <iframe
                  id="fixture-pdf-iframe"
                  src={`${fixturePdf.pdfDataUrl}#toolbar=1`}
                  className="w-full h-full border-none"
                  title="PDF Viewer"
                />
              </div>
            </div>
          </div>

          {/* Action sidebar - Now styled as an elegant bottom deck */}
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-5">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Detalles del Archivo</h4>
              
              <div className="flex items-center gap-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-850">
                <FileText className="w-10 h-10 text-red-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{fixturePdf.fileName}</p>
                  <p className="text-xs text-zinc-500 font-mono">Formato PDF</p>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  id="download-fixture-pdf-btn"
                  onClick={handleDownload}
                  className="w-full bg-zinc-900 hover:bg-zinc-850 text-white px-4 py-3 rounded-xl text-xs font-bold border border-zinc-800 hover:border-zinc-700 transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Descargar Archivo</span>
                </button>

                <button
                  id="share-fixture-whatsapp-btn"
                  onClick={handleSendWhatsapp}
                  className="w-full bg-emerald-950/20 hover:bg-emerald-950/45 text-emerald-400 px-4 py-3 rounded-xl text-xs font-bold border border-emerald-900/40 transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span>Enviar por WhatsApp</span>
                </button>

                {role === 'admin' && (
                  <button
                    id="delete-fixture-pdf-btn"
                    onClick={() => {
                      setShowConfirmDelete(true);
                    }}
                    className="w-full bg-zinc-950 hover:bg-red-950/20 text-zinc-500 hover:text-red-400 px-4 py-3 rounded-xl text-xs font-bold border border-zinc-900 hover:border-red-900/30 transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar PDF</span>
                  </button>
                )}
              </div>
            </div>

            {/* Hint Box */}
            <div className="bg-zinc-950/40 border border-zinc-900/60 p-4 rounded-xl text-xs text-zinc-500 leading-relaxed flex gap-2.5 max-w-3xl mx-auto">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>Para descargar del navegador, haz clic en el botón de descarga superior o utiliza el panel de visualización.</span>
            </div>
          </div>

        </div>
      )}

      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Eliminar PDF de Fixture"
        message="¿Estás seguro de que deseas eliminar por completo el archivo PDF del calendario/fixture adjunto para este torneo?"
        onConfirm={() => {
          onClear();
        }}
        onCancel={() => {
          setShowConfirmDelete(false);
        }}
      />
    </div>
  );
}
