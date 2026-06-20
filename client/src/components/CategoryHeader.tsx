interface CategoryHeaderBaseProps {
  name: string;
  catIndex: number;
}

interface PlayCategoryHeaderProps extends CategoryHeaderBaseProps {
  isEditing: false;
  isEditingActive?: never;
  onStartEdit?: never;
  onEndEdit?: never;
  onRename?: never;
}

interface EditCategoryHeaderProps extends CategoryHeaderBaseProps {
  isEditing: true;
  isEditingActive: boolean;
  onStartEdit: () => void;
  onEndEdit: () => void;
  onRename: (catIdx: number, newName: string) => void;
}

type CategoryHeaderProps = PlayCategoryHeaderProps | EditCategoryHeaderProps;

export function CategoryHeader({
  name,
  catIndex,
  isEditing,
  isEditingActive,
  onStartEdit,
  onEndEdit,
  onRename,
}: CategoryHeaderProps) {
  if (isEditing && isEditingActive) {
    return (
      <input
        type="text"
        value={name}
        autoFocus
        onBlur={onEndEdit}
        onChange={(e) => onRename(catIndex, e.target.value)}
        maxLength={25}
        className="w-full rounded-sm bg-brand-input px-2 py-4 text-center text-xl font-black uppercase tracking-wider text-brand-accent outline-none border-2 border-brand-accent transition-all duration-200"
        onFocus={(e) => e.target.select()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Escape') onEndEdit();
        }}
      />
    );
  }

  if (isEditing) {
    return (
      <button
        type="button"
        onClick={onStartEdit}
        className="w-full rounded-sm py-4 px-2 bg-brand-surface border-2 border-brand-accent/20 text-center text-xl font-black uppercase tracking-wider text-white truncate transition-all duration-200 ease-in-out cursor-pointer hover:border-brand-accent/50 hover:brightness-125"
        title="Натисніть, щоб перейменувати"
      >
        {name || 'Без назви'}
      </button>
    );
  }

  return (
    <div
      className="w-full rounded-sm py-4 px-2 bg-brand-surface border-2 border-brand-accent/20 text-center text-xl font-black uppercase tracking-wider text-white truncate transition-all duration-200 ease-in-out cursor-default"
    >
      {name || 'Без назви'}
    </div>
  );
}
