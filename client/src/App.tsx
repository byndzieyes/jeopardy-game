import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Crown, Gamepad2, Users } from 'lucide-react';
import { socket } from './socket';
import { getOrCreateUserId } from './utils/user';
import type { Player } from '@shared/types';

type UserRole = 'player' | 'host';

function App() {
  const [userId] = useState<string>(() => getOrCreateUserId());
  const [name, setName] = useState<string>(() => {
    return localStorage.getItem('jeopardy_username') || '';
  });
  const [role, setRole] = useState<UserRole>(() => {
    return (sessionStorage.getItem('jeopardy_role') as UserRole) || 'player';
  });
  const [roomCode, setRoomCode] = useState<string>(() => {
    return sessionStorage.getItem('jeopardy_roomcode') || '';
  });
  const [isSubmitted, setIsSubmitted] = useState<boolean>(() => {
    const savedRole = sessionStorage.getItem('jeopardy_role');
    const savedCode = sessionStorage.getItem('jeopardy_roomcode');
    const savedName = localStorage.getItem('jeopardy_username');
    return !!(savedRole && savedCode && savedName);
  });
  const [players, setPlayers] = useState<Player[]>([]);
  const prevPlayerCountRef = useRef(0);
  const joinSoundRef = useRef<HTMLAudioElement | null>(null);
  const leaveSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    socket.on('room_created', (generatedCode: string) => {
      setRoomCode(generatedCode);
      setIsSubmitted(true);

      sessionStorage.setItem('jeopardy_role', 'host');
      sessionStorage.setItem('jeopardy_roomcode', generatedCode);
    });

    socket.on('room_joined_success', ({ isActive, roomCode: serverCode, role: serverRole }) => {
      console.log(`Successfully joined room ${serverCode} as ${serverRole}. Game active: ${isActive}`);

      setIsSubmitted(true);

      sessionStorage.setItem('jeopardy_role', serverRole);
      sessionStorage.setItem('jeopardy_roomcode', serverCode);

      if (isActive) {
        // setIsGameStarted(true);
      }
    });

    socket.on('update_players', (serverPlayers: Player[]) => {
      console.log('Updated player list:', serverPlayers);
      console.log(`prev: ${prevPlayerCountRef.current}, new: ${serverPlayers.length}`);

      if (serverPlayers.length > prevPlayerCountRef.current) {
        if (!joinSoundRef.current) {
          joinSoundRef.current = new Audio('/sounds/join_room.mp3');
        }
        joinSoundRef.current.currentTime = 0;
        joinSoundRef.current.volume = 0.4;
        joinSoundRef.current.play().catch((error) => {
          console.warn('Browser blocked autoplay:', error);
        });
      } else if (serverPlayers.length < prevPlayerCountRef.current && prevPlayerCountRef.current > 0) {
        if (!leaveSoundRef.current) {
          leaveSoundRef.current = new Audio('/sounds/leave_room.mp3');
        }
        leaveSoundRef.current.currentTime = 0;
        leaveSoundRef.current.volume = 0.4;
        leaveSoundRef.current.play().catch((error) => {
          console.warn('Browser blocked autoplay:', error);
        });
      }

      prevPlayerCountRef.current = serverPlayers.length;
      setPlayers(serverPlayers);
    });

    socket.on('error_message', (message: string) => {
      alert(message);
      sessionStorage.removeItem('jeopardy_role');
      sessionStorage.removeItem('jeopardy_roomcode');

      setIsSubmitted(false);
      setRoomCode('');
      setPlayers([]);
      prevPlayerCountRef.current = 0;
    });

    return () => {
      socket.off('room_created');
      socket.off('room_joined_success');
      socket.off('update_players');
      socket.off('error_message');
    };
  }, []);

  useEffect(() => {
    const savedRole = sessionStorage.getItem('jeopardy_role');
    const savedCode = sessionStorage.getItem('jeopardy_roomcode');
    const savedName = localStorage.getItem('jeopardy_username');

    if (savedRole && savedCode && savedName) {
      console.log(`Autoreconnect: ${savedCode}`);

      socket.emit('join_room', { id: getOrCreateUserId(), username: savedName, roomCode: savedCode });
    }
  }, []);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedCode = roomCode.trim().toUpperCase();

    if (!trimmedName) return alert('Введи своє ім’я!');

    localStorage.setItem('jeopardy_username', trimmedName);

    if (role === 'host') {
      socket.emit('create_room', { id: userId, username: trimmedName });
    } else {
      if (!trimmedCode) return alert('Введи код кімнати!');

      socket.emit('join_room', { id: userId, username: trimmedName, roomCode: trimmedCode });
    }
  };

  const handleLeaveRoom = () => {
    socket.emit('leave_room', { id: userId, username: name, roomCode: roomCode });

    sessionStorage.removeItem('jeopardy_role');
    sessionStorage.removeItem('jeopardy_roomcode');

    setRoomCode('');
    setPlayers([]);
    setIsSubmitted(false);
  };

  if (isSubmitted) {
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
            <div className="p-4 text-center">
              <span className="block text-md font-medium uppercase tracking-widest text-gray-400 mb-1">
                Код кімнати
              </span>
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
            onClick={handleLeaveRoom}
            className="w-full rounded-sm bg-red-600/10 border border-red-500/30 py-3 text-xl font-bold uppercase text-red-400 hover:bg-red-600/20 hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out cursor-pointer"
          >
            Вийти з кімнати
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-brand-bg font-sans px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-sm bg-brand-surface p-8 text-white shadow-2xl border border-white/5"
      >
        <h1 className="text-center text-5xl text-brand-accent font-black tracking-wide mb-8 drop-shadow-lg">
          JEOPARDY GAME
        </h1>

        <div className="mb-5">
          <label className="block text-md font-semibold uppercase tracking-wider text-gray-300 mb-2">
            Твій нікнейм
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Наприклад, Владислав"
            maxLength={12}
            className="w-full rounded-sm bg-brand-input px-4 py-3 text-white placeholder-gray-500 outline-none border border-white/5 focus:border-brand-accent transition-all duration-200"
          />
        </div>

        <div className="mb-5">
          <label className="block text-md font-semibold uppercase tracking-wider text-gray-300 mb-2">
            Хто ти сьогодні?
          </label>

          <div className="relative flex rounded-sm bg-brand-input p-1.5 overflow-hidden border border-white/5">
            <div
              className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] rounded-sm bg-brand-primary shadow-md transition-transform duration-300 ease-out ${
                role === 'host' ? 'translate-x-full' : 'translate-x-0'
              }`}
            />

            <button
              type="button"
              onClick={() => setRole('player')}
              className={`z-10 flex-1 rounded-sm py-2.5 font-bold text-sm tracking-wide transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                role === 'player' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Gamepad2 className="w-5 h-5" />
              ГРАВЕЦЬ
            </button>

            <button
              type="button"
              onClick={() => setRole('host')}
              className={`z-10 flex-1 rounded-sm py-2.5 font-bold text-sm tracking-wide transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                role === 'host' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Crown className="w-5 h-5" />
              ХОСТ
            </button>
          </div>
        </div>

        <div className="relative h-24 mb-6">
          <div
            className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
              role === 'player' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <label className="block text-md font-semibold uppercase tracking-wider text-gray-300 mb-2">
              Код кімнати
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="XF4G"
              maxLength={4}
              className="w-full h-14 rounded-sm bg-brand-input px-4 text-center text-2xl font-mono font-black tracking-widest text-brand-accent outline-none border border-white/5 focus:border-brand-accent transition-all duration-200"
            />
          </div>

          <div
            className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
              role === 'host' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <label className="block text-md font-semibold uppercase tracking-wider text-gray-300 mb-2">Опції гри</label>
            <button
              type="button"
              // onClick={() => setIsConfiguring(true)}
              className="w-full h-14 rounded-sm bg-brand-input px-4 text-xl text-center font-bold uppercase text-brand-accent border border-brand-accent/20 hover:bg-brand-input/80 hover:border-brand-accent hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
            >
              Налаштувати пресет
            </button>
          </div>
        </div>

        <div className="relative h-16 mt-8">
          <button
            type="submit"
            className={`absolute inset-0 w-full h-full rounded-sm bg-brand-primary text-2xl text-center font-black uppercase tracking-wider text-white shadow-lg shadow-black/30 hover:brightness-110 hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out cursor-pointer ${
              role === 'player' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            Приєднатися до гри
          </button>

          <button
            type="submit"
            className={`absolute inset-0 w-full h-full rounded-sm bg-brand-primary text-2xl text-center font-black uppercase tracking-wider text-white shadow-lg shadow-black/30 hover:brightness-110 hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out cursor-pointer ${
              role === 'host' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            Створити кімнату
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
