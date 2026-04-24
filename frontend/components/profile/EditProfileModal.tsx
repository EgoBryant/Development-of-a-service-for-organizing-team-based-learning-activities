'use client';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">Редактирование данных</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <form className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-600">ФИО</label>
            <input
              type="text"
              defaultValue="Екатерина Орлова"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 outline-none ring-pink-300 transition focus:ring-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-600">Группа</label>
            <input
              type="text"
              defaultValue="ИВТ-301"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 outline-none ring-pink-300 transition focus:ring-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-600">О себе</label>
            <textarea
              rows={4}
              placeholder="Расскажите о себе"
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 outline-none ring-pink-300 transition focus:ring-2"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-slate-700 transition hover:bg-slate-100"
            >
              Отмена
            </button>
            <button
              type="button"
              className="rounded-xl bg-pink-500 px-4 py-2 font-medium text-white transition hover:bg-pink-600"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
