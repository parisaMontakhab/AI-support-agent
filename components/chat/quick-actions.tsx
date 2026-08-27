const ACTIONS = [
  "Track my order",
  "Return an item",
  "Product question",
] as const;

type QuickActionsProps = {
  onSelect: (label: string) => void;
};

export function QuickActions({ onSelect }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map((label) => (
        <button
          key={label}
          type="button"
          onClick={() => onSelect(label)}
          className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink hover:border-primary hover:text-primary"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
