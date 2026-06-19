import { useState } from 'react';
import { AlertTriangle, Users } from 'lucide-react';
import type { Player } from '@shared/types';
import type { UserRole } from './JoinForm';

interface LobbyProps {
  name: string;
  role: UserRole;
  roomCode: string;
  players: Player[];
  onLeave: () => void;
}

export function Lobby({ name, role, roomCode, players, onLeave }: LobbyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy room code:', err);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-brand-bg text-white p-4 font-sans">
      <div className="w-full max-w-md rounded-sm bg-brand-surface p-8 text-center shadow-2xl border border-white/5 animate-fade-in">
        <h2 className="text-5xl font-bold mb-8 text-brand-accent">Вітаємо, {name}!</h2>
        <p className="text-gray-300 mb-3 text-xl">
          Ти увійшов як:{' '}
          <span className="font-bold uppercase tracking-wider text-white">
            {role === 'host' ? 'Хост' : 'Гравець'}
          </span>
        </p>

        <div className="mb-5 rounded-sm bg-brand-input border border-brand-accent/20 overflow-hidden">
          <div
            onClick={handleCopy}
            className="p-4 text-center cursor-pointer hover:bg-white/5 active:bg-brand-input/60 transition-all duration-200 relative group select-none"
            title="Натисни, щоб скопіювати"
          >
            <div className="relative h-6 mb-2 overflow-hidden">
              <span
                className={`absolute left-0 right-0 top-0 text-md font-medium uppercase tracking-widest transition-all duration-300 ${
                  copied
                    ? 'opacity-0 -translate-y-2 pointer-events-none'
                    : 'opacity-100 translate-y-0 text-gray-400 group-hover:text-brand-accent'
                }`}
              >
                Код кімнати
              </span>
              <span
                className={`absolute left-0 right-0 top-0 text-md font-bold uppercase tracking-widest transition-all duration-300 text-green-400 ${
                  copied
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-2 pointer-events-none'
                }`}
              >
                Скопійовано!
              </span>
            </div>
            <span className="text-3xl font-mono font-black tracking-widest text-brand-accent">{roomCode}</span>
          </div>

          <div className="border-t border-white/10">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <Users className="w-5 h-5 text-brand-accent" />
              <span className="text-md font-semibold uppercase tracking-wider text-gray-300">
                Гравці ({players.length})
              </span>
            </div>

            <div className="px-4 py-3 max-h-48 overflow-y-auto">
              {players.length === 0 ? (
                <p className="text-gray-500 italic text-center py-2">Очікування гравців…</p>
              ) : (
                <ul className="space-y-2">
                  {players.map((player, index) => (
                    <li
                      key={player.id}
                      className={`flex items-center gap-3 rounded-sm bg-brand-bg/40 px-3 py-2 border border-white/5${!player.isConnected ? ' opacity-50' : ''}`}
                      title={!player.isConnected ? "Проблеми зі зв'язком. Очікування реконекту гравця..." : undefined}
                    >
                      <span className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-primary/20 text-brand-accent text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="text-lg text-white font-medium truncate">{player.username}</span>
                      {!player.isConnected && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 ml-auto" />}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {role === 'host' && (
          <button
            onClick={() => {
              /* TODO: start game logic */
            }}
            disabled={players.length < 2}
            className="w-full rounded-sm mt-3 mb-3 bg-brand-primary py-3 text-2xl font-black uppercase tracking-wider text-white shadow-lg shadow-black/30 hover:brightness-110 hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          >
            Розпочати гру
          </button>
        )}

        <button
          onClick={onLeave}
          className="w-full rounded-sm bg-red-600/10 border border-red-500/30 py-3 text-xl font-bold uppercase text-red-400 hover:bg-red-600/20 hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out cursor-pointer"
        >
          Вийти з кімнати
        </button>
      </div>
    </div>
  );
}
