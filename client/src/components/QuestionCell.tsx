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
      <button
        type="button"
        onClick={onClick}
        title={isFilled ? 'Редагувати' : 'Порожньо'}
        className={`w-full rounded-sm py-5 border-2 text-center text-4xl font-black tracking-wider transition-all duration-200 ease-in-out cursor-pointer ${
          isFilled
            ? 'bg-brand-surface text-brand-accent border-brand-accent/20 hover:border-brand-accent/50 hover:brightness-125'
            : 'bg-red-950/20 text-red-400/50 border-red-500/15 hover:border-red-500/40 hover:brightness-125'
        }`}
      >
        ${question.value}
      </button>
    );
  }

  if (isAnswered) {
    return (
      <div className="w-full rounded-sm py-5 bg-brand-bg/80 border-2 border-transparent transition-all duration-200 ease-in-out" />
    );
  }

  if (!isHost) {
    return (
      <div className="w-full rounded-sm py-5 bg-brand-surface border-2 border-brand-accent/20 text-center text-3xl font-black tracking-wider text-brand-accent transition-all duration-200 ease-in-out">
        ${question.value}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-sm py-5 bg-brand-surface border-2 border-brand-accent/20 text-center text-3xl font-black tracking-wider text-brand-accent transition-all duration-200 ease-in-out cursor-pointer hover:border-brand-accent/50 hover:brightness-125"
    >
      ${question.value}
    </button>
  );
}
