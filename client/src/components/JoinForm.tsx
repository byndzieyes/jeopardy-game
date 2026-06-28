import { useState } from 'react';
import { Gamepad2, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { GameBoard } from './GameBoard';
import { fadeInOutVariants } from '../utils/motion/animations';
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
      <motion.form
        variants={fadeInOutVariants}
        initial="initial"
        animate="animate"
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-sm bg-brand-surface p-8 text-white shadow-2xl border border-white/5"
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
            <button
              type="button"
              onClick={() => setRole('player')}
              className={`relative z-10 flex-1 rounded-sm py-2.5 font-bold text-sm tracking-wide transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                role === 'player' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {role === 'player' && (
                <motion.div
                  layoutId="activeRole"
                  className="absolute inset-0 rounded-sm bg-brand-primary shadow-md -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Gamepad2 className="w-5 h-5" />
              ГРАВЕЦЬ
            </button>

            <button
              type="button"
              onClick={() => setRole('host')}
              className={`relative z-10 flex-1 rounded-sm py-2.5 font-bold text-sm tracking-wide transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                role === 'host' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {role === 'host' && (
                <motion.div
                  layoutId="activeRole"
                  className="absolute inset-0 rounded-sm bg-brand-primary shadow-md -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Crown className="w-5 h-5" />
              ХОСТ
            </button>
          </div>
        </fieldset>

        <div className="relative h-24 mb-6">
          <AnimatePresence mode="wait">
            {role === 'player' ? (
              <motion.div
                key="player"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
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
              </motion.div>
            ) : (
              <motion.div
                key="host"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <label
                  htmlFor="preset-btn"
                  className="block text-md font-semibold uppercase tracking-wider text-gray-300 mb-2"
                >
                  Опції гри
                </label>
                 <motion.button
                  id="preset-btn"
                  type="button"
                  whileHover={{ 
                    scale: 1.02, 
                    backgroundColor: 'color-mix(in srgb, var(--color-brand-input) 80%, transparent)', 
                    borderColor: 'var(--color-brand-accent)' 
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditorOpen(true)}
                  className="w-full h-14 rounded-sm bg-brand-input px-4 text-xl text-center font-bold uppercase text-brand-accent border border-brand-accent/20 cursor-pointer transition-colors duration-200"
                >
                  {preset.categories.length > 0 ? 'Пресет налаштовано' : 'Налаштувати пресет'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8">
          <motion.button
            whileHover={{ scale: 1.03, filter: 'brightness(1.1)' }}
            whileTap={{ scale: 0.97, filter: 'brightness(0.95)' }}
            type="submit"
            className="relative w-full h-16 rounded-sm bg-brand-primary text-2xl text-center font-black uppercase tracking-wider text-white shadow-lg shadow-black/30 cursor-pointer overflow-hidden flex items-center justify-center"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={role}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute"
              >
                {role === 'host' ? 'Створити кімнату' : 'Приєднатися до гри'}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.form>

      <AnimatePresence>
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
      </AnimatePresence>
    </div>
  );
}
