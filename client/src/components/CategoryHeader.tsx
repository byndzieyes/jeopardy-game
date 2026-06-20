interface CategoryHeaderProps {
  name: string;
  catIndex: number;
  isEditing: boolean;
  isEditingActive: boolean;
  onStartEdit: () => void;
  onEndEdit: () => void;
  onRename: (catIdx: number, newName: string) => void;
}

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
        onKeyDown={(e) => {
          if (e.key === 'Enter') onEndEdit();
        }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={isEditing ? onStartEdit : undefined}
      className={`w-full rounded-sm py-4 px-2 bg-brand-surface border-2 border-brand-accent/20 text-center text-xl font-black uppercase tracking-wider text-white truncate transition-all duration-200 ease-in-out ${
        isEditing ? 'cursor-pointer hover:border-brand-accent/50 hover:brightness-125' : 'cursor-default'
      }`}
      title={isEditing ? 'Натисніть, щоб перейменувати' : undefined}
    >
      {name || 'Без назви'}
    </button>
  );
}
