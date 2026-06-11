import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Lock, User } from 'lucide-react';

interface LoginProps {
  onLogin: (role: 'admin' | 'visitante') => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPassword = password.trim().toLowerCase();

    if (cleanPassword === 'admin') {
      onLogin('admin');
    } else if (cleanPassword === 'visitante') {
      onLogin('visitante');
    } else {
      setError('Contraseña incorrecta.');
      setPassword('');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between bg-black text-white px-4 py-8 select-none">
      {/* Background Image of a Stadium at Night */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 opacity-60 filter saturate-120"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.95)), url('/src/assets/images/night_stadium_1781116820002.png')`
        }} 
      />

      {/* Decorative Night Stadium Glow Accent */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-green-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="relative z-10 text-center mt-8 animate-fade-in">
        <div className="flex justify-center mb-2">
          <div className="bg-emerald-500/15 p-4 rounded-full border border-emerald-500/30 shadow-2xl shadow-emerald-500/20">
            <span className="text-4xl">⚽</span>
          </div>
        </div>
        <h1 className="font-display text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
          GOL<span className="text-emerald-500">APP</span>
        </h1>
        <p className="text-xs uppercase tracking-[0.25em] text-zinc-400 mt-1 font-medium">
          Gestor de Torneos
        </p>
      </div>

      {/* Glassmorphic Login Card */}
      <div className="relative z-10 w-full max-w-md bg-zinc-950/80 backdrop-blur-md rounded-2xl border border-zinc-800/80 p-8 shadow-2xl shadow-black/80 my-auto">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold font-sans text-white">Ingresar Credenciales</h2>
          <p className="text-zinc-400 text-xs mt-1">Ingresa tu contraseña secreta para acceder</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Contraseña Secreta
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                className="w-full bg-zinc-900/90 hover:bg-zinc-900 focus:bg-zinc-900 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-10 pr-10 text-white placeholder-zinc-600 outline-none transition-all duration-200 text-center font-mono tracking-widest text-lg"
                autoFocus
                required
              />
              <button
                id="toggle-password-btn"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-950/50 border border-red-500/30 text-red-400 text-xs py-2.5 px-3 rounded-lg text-center font-medium">
              ⚠️ {error}
            </div>
          )}

          <button
            id="login-submit-btn"
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition duration-150 transform active:scale-95 shadow-xl shadow-emerald-950/20 flex items-center justify-center gap-2 cursor-pointer font-sans"
          >
            <span>Acceder</span>
            <Shield className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Required Footer Credits */}
      <div className="relative z-10 text-center text-zinc-600 text-xs tracking-wide">
        App By: <span className="text-zinc-500 font-semibold font-display">Andrey Design</span>
      </div>
    </div>
  );
}
