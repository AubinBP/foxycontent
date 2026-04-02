"use client";

export default function DeleteButton({ id, className }: { id: number, className?: string }) {
  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
  if (!confirm("Supprimer cet article définitivement ?")) {
      e.preventDefault();
    }
  }

  return (
    <button
      type="submit"
      onClick={handleClick}
      className={className}
    >
      Supprimer
    </button>
  );
}