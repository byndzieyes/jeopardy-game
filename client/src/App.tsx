import { useState } from 'react';
import { Crown, Gamepad2 } from 'lucide-react';

type UserRole = 'player' | 'host';

function App() {
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<UserRole>('player');
  const [roomCode, setRoomCode] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return alert('Введи своє ім’я!');
    if (role === 'player' && !roomCode.trim()) return alert('Введи код кімнати!');

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-bg text-white p-4 font-sans">
        <div className="w-full max-w-md rounded-sm bg-brand-surface p-8 text-center shadow-2xl border border-white/5">
          <h2 className="text-3xl font-bold mb-3 text-brand-accent">Вітаємо, {name}!</h2>
          <p className="text-gray-300 mb-3 text-lg">
            Ти увійшов як:{' '}
            <span className="font-bold uppercase tracking-wider text-white">
              {role === 'host' ? 'Хост' : 'Гравець'}
            </span>
          </p>

          {role === 'player' && (
            <div className="mb-6 rounded-sm bg-brand-input p-4 border border-brand-accent/20">
              <span className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Код кімнати</span>
              <span className="text-3xl font-mono font-black tracking-widest text-brand-accent">{roomCode}</span>
            </div>
          )}

          <button
            onClick={() => setIsSubmitted(false)}
            className="w-full rounded-sm mt-3 bg-red-600/10 border border-red-500/30 py-3 font-bold text-red-400 hover:bg-red-600/20 active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            ВИЙТИ З КІМНАТИ
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
            className="w-full rounded-sm bg-brand-input px-4 py-3 text-white placeholder-gray-500 outline-none border border-transparent focus:border-brand-accent transition-all duration-200"
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
              className="w-full h-14 rounded-sm bg-brand-input px-4 text-center text-2xl font-mono font-black tracking-widest text-brand-accent outline-none border border-transparent focus:border-brand-accent transition-all duration-200"
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
              className="w-full h-14 rounded-sm bg-brand-input px-4 text-xl text-center font-bold text-brand-accent border border-brand-accent/20 hover:bg-brand-input/80 transition-all duration-200 cursor-pointer"
            >
              НАЛАШТУВАТИ ПРЕСЕТ
            </button>
          </div>
        </div>

        <div className="relative h-14 mt-2">
          <button
            type="submit"
            className={`absolute inset-0 w-full h-full rounded-sm bg-brand-primary text-center font-black uppercase tracking-wider text-white shadow-lg shadow-black/30 hover:brightness-110 active:scale-[0.98] transition-all duration-300 ease-in-out cursor-pointer ${
              role === 'player' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            Приєднатися до гри
          </button>

          <button
            type="submit"
            className={`absolute inset-0 w-full h-full rounded-sm bg-brand-primary text-center font-black uppercase tracking-wider text-white shadow-lg shadow-black/30 hover:brightness-110 active:scale-[0.98] transition-all duration-300 ease-in-out cursor-pointer ${
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
