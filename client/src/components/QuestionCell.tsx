import { motion } from 'motion/react';
import type { Question } from '@shared/types';

interface QuestionCellBaseProps {
  question: Question;
  onClick: () => void;
}

interface PlayQuestionCellProps extends QuestionCellBaseProps {
  isEditing: false;
  isHost: boolean;
}

interface EditQuestionCellProps extends QuestionCellBaseProps {
  isEditing: true;
  isHost?: never;
}

type QuestionCellProps = PlayQuestionCellProps | EditQuestionCellProps;

export function QuestionCell({ isEditing, question, isHost, onClick }: QuestionCellProps) {
  const isAnswered = !!question.isAnswered;

  if (isEditing) {
    const isFilled = question.questionText.trim() !== '' && question.answerText.trim() !== '';
    return (
      <motion.button
        type="button"
        whileHover={{ 
          scale: 1.04, 
          zIndex: 10,
          borderColor: isFilled 
            ? 'color-mix(in srgb, var(--color-brand-accent) 50%, transparent)'
            : 'color-mix(in srgb, var(--color-red-500) 40%, transparent)',
          filter: 'brightness(1.25)'
        }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        title={isFilled ? 'Редагувати' : 'Порожньо'}
        className={`w-full rounded-sm py-5 border-2 text-center text-4xl font-black tracking-wider cursor-pointer transition-colors duration-200 ${
          isFilled
            ? 'bg-brand-surface text-brand-accent border-brand-accent/20'
            : 'bg-red-950/20 text-red-400/50 border-red-500/15'
        }`}
      >
        ${question.value}
      </motion.button>
    );
  }

  if (isAnswered) {
    return (
      <div className="w-full rounded-sm py-5 bg-brand-bg/80 border-2 border-transparent" />
    );
  }

  if (!isHost) {
    return (
      <div className="w-full rounded-sm py-5 bg-brand-surface border-2 border-brand-accent/20 text-center text-3xl font-black tracking-wider text-brand-accent">
        ${question.value}
      </div>
    );
  }

  return (
    <motion.button
      type="button"
      whileHover={{ 
        scale: 1.04, 
        zIndex: 10,
        borderColor: 'color-mix(in srgb, var(--color-brand-accent) 50%, transparent)',
        filter: 'brightness(1.25)'
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full rounded-sm py-5 bg-brand-surface border-2 border-brand-accent/20 text-center text-3xl font-black tracking-wider text-brand-accent cursor-pointer transition-colors duration-200"
    >
      ${question.value}
    </motion.button>
  );
}
