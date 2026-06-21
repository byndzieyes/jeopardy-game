import { useState } from 'react';
import { Gamepad2, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { GameBoard } from './GameBoard';
import type { Preset } from '@shared/types';

export type UserRole = 'player' | 'host';

interface JoinFormProps {
  initialName: string;
  initialRole: UserRole;
  initialRoomCode: string;
  onSubmit: (name: string, role: UserRole, roomCode: string, preset: Preset) => void;
}

export function JoinForm({ initialName, initialRole, initialRoomCode, onSubmit }: JoinFormProps) {
  const [name, setName] = useState<string>(initialName);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [roomCode, setRoomCode] = useState<string>(initialRoomCode);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [preset, setPreset] = useState<Preset>({ categories: [] });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedCode = roomCode.trim().toUpperCase();

    if (!trimmedName) {
      toast.warning('Введи своє ім’я!');
      return;
    }

    if (role === 'player') {
      if (!trimmedCode) {
        toast.warning('Введи код кімнати!');
        return;
      }
    } else {
      if (preset.categories.length === 0) {
        toast.warning('Налаштуй гру перед створенням кімнати!');
        return;
      }
    }

    onSubmit(trimmedName, role, trimmedCode, preset);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-brand-bg font-sans px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-sm bg-brand-surface p-8 text-white shadow-2xl border border-white/5 animate-fade-in"
      >
        <h1 className="text-center text-5xl text-brand-accent font-black tracking-wide mb-8 drop-shadow-lg">
          JEOPARDY GAME
        </h1>

        <div className="mb-5">
          <label
            htmlFor="username-input"
            className="block text-md font-semibold uppercase tracking-wider text-gray-300 mb-2"
          >
            Твій нікнейм
          </label>
          <input
            id="username-input"
            name="username"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Наприклад, Владислав"
            maxLength={12}
            autoComplete="off"
            className="w-full rounded-sm bg-brand-input px-4 py-3 text-white placeholder-gray-500 outline-none border border-white/5 focus:border-brand-accent transition-all duration-200"
          />
        </div>

        <fieldset className="mb-5 border-none p-0 m-0">
          <legend className="block text-md font-semibold uppercase tracking-wider text-gray-300 mb-2">
            Хто ти сьогодні?
          </legend>

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
        </fieldset>

        <div className="relative h-24 mb-6">
          <div
            className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
              role === 'player' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <label
              htmlFor="roomcode-input"
              className="block text-md font-semibold uppercase tracking-wider text-gray-300 mb-2"
            >
              Код кімнати
            </label>
            <input
              id="roomcode-input"
              name="roomCode"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="XF4G"
              maxLength={4}
              autoComplete="off"
              className="w-full h-14 rounded-sm bg-brand-input px-4 text-center text-2xl font-mono font-black tracking-widest text-brand-accent outline-none border border-white/5 focus:border-brand-accent transition-all duration-200"
            />
          </div>

          <div
            className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
              role === 'host' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <label
              htmlFor="preset-btn"
              className="block text-md font-semibold uppercase tracking-wider text-gray-300 mb-2"
            >
              Опції гри
            </label>
            <button
              id="preset-btn"
              type="button"
              onClick={() => setIsEditorOpen(true)}
              className="w-full h-14 rounded-sm bg-brand-input px-4 text-xl text-center font-bold uppercase text-brand-accent border border-brand-accent/20 hover:bg-brand-input/80 hover:border-brand-accent hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
            >
              {preset.categories.length > 0 ? 'Пресет налаштовано' : 'Налаштувати пресет'}
            </button>
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className="w-full h-16 rounded-sm bg-brand-primary text-2xl text-center font-black uppercase tracking-wider text-white shadow-lg shadow-black/30 hover:brightness-110 hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out cursor-pointer"
          >
            {role === 'host' ? 'Створити кімнату' : 'Приєднатися до гри'}
          </button>
        </div>
      </form>

      {isEditorOpen && (
        <GameBoard
          isEditing={true}
          onClose={() => setIsEditorOpen(false)}
          initialPreset={preset}
          onSave={(updatedPreset) => {
            setPreset(updatedPreset);
            toast.success('Налаштування гри успішно збережено!');
          }}
        />
      )}
    </div>
  );
}
