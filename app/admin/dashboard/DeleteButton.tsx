"use client";

export default function DeleteButton({ id }: { id: number }) {
  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (!confirm("Supprimer cet article définitivement ?")) {
      e.preventDefault();
    }
  }

  return (
    <button
      type="submit"
      onClick={handleClick}
    >
      Supprimer
    </button>
  );
}