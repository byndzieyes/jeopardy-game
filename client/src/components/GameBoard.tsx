import { useState } from 'react';
import { getDefaultPreset } from '../utils/defaultPreset';
import type { Preset } from '@shared/types';
import { CategoryHeader } from './CategoryHeader';
import { QuestionCell } from './QuestionCell';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { backdropVariants, modalContentVariants } from '../utils/motion/animations';

interface PlayBoardProps {
  isEditing: false;
  initialPreset: Preset;
  onCellClick: (categoryIndex: number, questionIndex: number) => void;
  isHost?: boolean;
  onClose?: never;
  onSave?: never;
}

interface EditBoardProps {
  isEditing: true;
  onClose: () => void;
  onSave: (preset: Preset) => void;
  initialPreset?: Preset;
  onCellClick?: never;
  isHost?: boolean;
}

type GameBoardProps = PlayBoardProps | EditBoardProps;

export function GameBoard({ isEditing, initialPreset, onClose, onSave, onCellClick, isHost = false }: GameBoardProps) {
  const [localPreset, setLocalPreset] = useState<Preset>(() => {
    if (initialPreset && initialPreset.categories && initialPreset.categories.length > 0) {
      return structuredClone(initialPreset);
    }
    return getDefaultPreset();
  });

  const [editingCatIndex, setEditingCatIndex] = useState<number | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<{ catIndex: number; qIndex: number } | null>(null);
  const [draftQuestion, setDraftQuestion] = useState<{
    value: number;
    questionText: string;
    answerText: string;
  } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleClose = () => {
    onClose?.();
  };

  const handleCategoryRename = (catIdx: number, newName: string) => {
    setLocalPreset((prev) => ({
      ...prev,
      categories: prev.categories.map((cat, idx) => (idx === catIdx ? { ...cat, name: newName } : cat)),
    }));
  };

  const handleOpenQuestion = (catIdx: number, qIdx: number) => {
    const q = localPreset.categories[catIdx].questions[qIdx];
    setActiveQuestion({ catIndex: catIdx, qIndex: qIdx });
    setDraftQuestion({
      value: q.value,
      questionText: q.questionText,
      answerText: q.answerText,
    });
  };

  const handleSaveQuestion = () => {
    if (activeQuestion && draftQuestion) {
      setLocalPreset((prev) => ({
        ...prev,
        categories: prev.categories.map((cat, cIdx) =>
          cIdx === activeQuestion.catIndex
            ? {
                ...cat,
                questions: cat.questions.map((q, qIdx) =>
                  qIdx === activeQuestion.qIndex ? { ...q, ...draftQuestion } : q,
                ),
              }
            : cat,
        ),
      }));
    }
    setActiveQuestion(null);
    setDraftQuestion(null);
  };

  const handleSave = () => {
    for (const cat of localPreset.categories) {
      if (!cat.name.trim()) {
        toast.error('Усі категорії повинні мати назву!');
        return;
      }
    }
    if (onSave) {
      onSave(localPreset);
    }
    handleClose();
  };

  const categories = isEditing ? localPreset.categories : initialPreset?.categories || [];

  const boardContent = (
    <div className={`grid grid-cols-5 gap-1.5 ${isEditing ? 'flex-1 overflow-y-auto px-2 py-4 bg-brand-bg' : ''}`}>
      {categories.map((cat, catIdx) => (
        <div key={cat.id} className="flex flex-col gap-1.5">
          {isEditing ? (
            <CategoryHeader
              name={cat.name}
              catIndex={catIdx}
              isEditing={true}
              isEditingActive={editingCatIndex === catIdx}
              onStartEdit={() => setEditingCatIndex(catIdx)}
              onEndEdit={() => setEditingCatIndex(null)}
              onRename={handleCategoryRename}
            />
          ) : (
            <CategoryHeader name={cat.name} catIndex={catIdx} isEditing={false} />
          )}

          {cat.questions.map((question, rowIdx) =>
            isEditing ? (
              <QuestionCell
                key={question.id}
                question={question}
                isEditing={true}
                onClick={() => handleOpenQuestion(catIdx, rowIdx)}
              />
            ) : (
              <QuestionCell
                key={question.id}
                question={question}
                isEditing={false}
                isHost={isHost}
                onClick={() => {
                  if (onCellClick) {
                    onCellClick(catIdx, rowIdx);
                  }
                }}
              />
            ),
          )}
        </div>
      ))}
    </div>
  );

  if (isEditing) {
    return (
      <motion.div
        variants={backdropVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 font-sans"
        onClick={handleClose}
      >
        <motion.div
          variants={modalContentVariants}
          className="w-full max-w-6xl max-h-[90vh] bg-brand-bg border border-white/5 rounded-sm shadow-2xl flex flex-col overflow-hidden"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <header className="p-5 flex items-center justify-between bg-brand-surface">
            <h2 className="text-2xl font-black text-brand-accent uppercase tracking-wider">
              Налаштування ігрового табло
            </h2>
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: 'color-mix(in srgb, var(--color-red-600) 20%, transparent)' }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 rounded-sm border border-red-500/30 bg-red-600/10 text-md font-bold uppercase tracking-wider text-red-400 shadow-lg shadow-red-900/20 cursor-pointer transition-colors duration-200"
            >
              Скинути до стандартних
            </motion.button>
          </header>

          {boardContent}

          <footer className="p-5 flex justify-end gap-3 bg-brand-surface">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: 'color-mix(in srgb, var(--color-white) 5%, transparent)' }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleClose}
              className="px-6 py-3 rounded-sm border border-white/10 text-md font-bold uppercase tracking-wider text-gray-300 cursor-pointer transition-colors duration-200"
            >
              Скасувати
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, filter: 'brightness(1.1)' }}
              whileTap={{ scale: 0.97, filter: 'brightness(0.95)' }}
              type="button"
              onClick={handleSave}
              className="px-8 py-3 rounded-sm bg-brand-primary text-md font-bold uppercase tracking-wider text-white shadow-lg shadow-black/30 cursor-pointer"
            >
              Зберегти табло
            </motion.button>
          </footer>
        </motion.div>

        <AnimatePresence>
          {activeQuestion && draftQuestion && (
            <motion.div
              variants={backdropVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed inset-0 z-60 bg-black/50 backdrop-blur-md flex items-center justify-center p-4"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                setActiveQuestion(null);
              }}
            >
              <motion.div
                variants={modalContentVariants}
                className="w-full max-w-lg bg-brand-surface border border-white/5 p-6 rounded-sm shadow-2xl flex flex-col gap-4 text-left"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-black text-brand-accent uppercase tracking-wider">Налаштування питання</h3>

                <p className="text-lg text-white font-bold border-b border-white/5 pb-2">
                  {localPreset.categories[activeQuestion.catIndex].name}
                </p>

                <div>
                  <label
                    htmlFor="points-input"
                    className="block text-md font-semibold uppercase tracking-wider text-gray-300 mb-2"
                  >
                    Номінальна вартість (бали)
                  </label>
                  <input
                    id="points-input"
                    type="number"
                    value={draftQuestion.value}
                    onChange={(e) =>
                      setDraftQuestion((prev) => (prev ? { ...prev, value: parseInt(e.target.value) || 0 } : prev))
                    }
                    className="w-full rounded-sm bg-brand-input px-4 py-3 text-lg font-bold text-white placeholder-gray-500 outline-none border border-white/5 focus:border-brand-accent transition-all duration-200"
                  />
                </div>

                <div>
                  <label
                    htmlFor="question-text-input"
                    className="block text-md font-semibold uppercase tracking-wider text-gray-300 mb-2"
                  >
                    Текст запитання
                  </label>
                  <textarea
                    id="question-text-input"
                    rows={4}
                    value={draftQuestion.questionText}
                    onChange={(e) =>
                      setDraftQuestion((prev) => (prev ? { ...prev, questionText: e.target.value } : prev))
                    }
                    placeholder="Наприклад: В якому році було збудовано Ейфелеву вежу?"
                    className="w-full rounded-sm bg-brand-input px-4 py-3 text-lg text-white placeholder-gray-500 outline-none border border-white/5 focus:border-brand-accent transition-all duration-200 resize-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="answer-text-input"
                    className="block text-md font-semibold uppercase tracking-wider text-gray-300 mb-2"
                  >
                    Правильна відповідь
                  </label>
                  <input
                    id="answer-text-input"
                    type="text"
                    value={draftQuestion.answerText}
                    onChange={(e) =>
                      setDraftQuestion((prev) => (prev ? { ...prev, answerText: e.target.value } : prev))
                    }
                    placeholder="Наприклад: 1889"
                    className="w-full rounded-sm bg-brand-input px-4 py-3 text-lg text-white placeholder-gray-500 outline-none border border-white/5 focus:border-brand-accent transition-all duration-200"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.03, filter: 'brightness(1.1)' }}
                  whileTap={{ scale: 0.97, filter: 'brightness(0.95)' }}
                  type="button"
                  onClick={handleSaveQuestion}
                  className="w-full rounded-sm bg-brand-primary py-3 mt-6 text-xl text-center font-bold uppercase tracking-wider text-white shadow-lg shadow-black/30 cursor-pointer"
                >
                  Зберегти клітинку
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showResetConfirm && (
            <motion.div
              variants={backdropVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed inset-0 z-70 bg-black/50 backdrop-blur-md flex items-center justify-center p-4"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                setShowResetConfirm(false);
              }}
            >
              <motion.div
                variants={modalContentVariants}
                className="bg-brand-surface border-2 border-red-500/30 rounded-sm shadow-2xl max-w-lg"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <div className="p-6">
                  <h3 className="text-2xl font-black text-red-400 uppercase tracking-wider mb-3">
                    Скинути налаштування?
                  </h3>
                  <p className="text-gray-300 text-lg">
                    Ви впевнені, що хочете скинути всі налаштування до стандартних? Ваші зміни буде незворотно втрачено.
                  </p>
                </div>
                <div className="p-6 bg-black/20 flex justify-end gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: 'color-mix(in srgb, var(--color-white) 5%, transparent)' }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-6 py-3 border border-white/10 text-gray-300 font-bold uppercase tracking-wider rounded-sm cursor-pointer transition-colors duration-200"
                  >
                    Скасувати
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: 'color-mix(in srgb, var(--color-red-600) 40%, transparent)', color: '#fecaca' }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setLocalPreset(getDefaultPreset());
                      setShowResetConfirm(false);
                    }}
                    className="px-6 py-3 bg-red-600/20 border border-red-500/50 text-red-400 font-bold uppercase tracking-wider rounded-sm shadow-lg shadow-red-900/20 cursor-pointer transition-colors duration-200"
                  >
                    Так, скинути
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return boardContent;
}
