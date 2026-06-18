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
          <div className="bg-emerald-500/15 p-4 rounded-full border border-emerald-500/30 shadow-2xl shadow-emerald-500/20 flex items-center justify-center">
            {/* Custom SVG premium soccer ball where the central pentagon tile matches GOLAPP "APP" color (emerald-500) */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-14 h-14 text-white" 
              viewBox="0 0 24 24" 
              strokeWidth="2" 
              stroke="currentColor" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              {/* Outer circle */}
              <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" stroke="white" strokeWidth="2" />
              {/* Central pentagon representing modern soccer panels, filled with GOLAPP's emerald color */}
              <path 
                d="M12 7l4.76 3.455l-1.817 5.545h-5.886l-1.817 -5.545z" 
                className="fill-emerald-500 stroke-emerald-500" 
                strokeWidth="2" 
              />
              {/* Surrounding panel line dividers */}
              <path d="M12 7v-4" stroke="white" strokeWidth="2" />
              <path d="M16.76 10.455l3.085 -2.545" stroke="white" strokeWidth="2" />
              <path d="M14.943 16l2.057 3.5" stroke="white" strokeWidth="2" />
              <path d="M9.057 16l-2.057 3.5" stroke="white" strokeWidth="2" />
              <path d="M7.24 10.455l-3.085 -2.545" stroke="white" strokeWidth="2" />
            </svg>
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
