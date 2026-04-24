'use client';

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

export default function AchievementModal({
  isOpen,
  onClose,
  title,
  description,
}: AchievementModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-pink-100 text-3xl">
            🏅
          </div>
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          <p className="mt-2 text-sm text-slate-600">{description}</p>

          <button
            onClick={onClose}
            className="mt-6 rounded-xl bg-pink-500 px-5 py-2.5 font-medium text-white transition hover:bg-pink-600"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
}
