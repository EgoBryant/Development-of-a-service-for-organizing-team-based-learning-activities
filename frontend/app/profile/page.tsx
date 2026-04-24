'use client';

import { useState } from 'react';
import AchievementModal from '../../components/profile/AchievementModal';
import ChangePasswordModal from '../../components/profile/ChangePasswordModal';
import EditProfileModal from '../../components/profile/EditProfileModal';

interface UserProfile {
  fullName: string;
  group: string;
  points: number;
  team: string;
  league: string;
  subLeague: string;
  winRate: string;
}

interface Achievement {
  id: number;
  icon: string;
  title: string;
  description: string;
}

const mockUser: UserProfile = {
  fullName: 'Екатерина Орлова',
  group: 'ИВТ-301',
  points: 1840,
  team: 'Team Spark',
  league: 'Лига A',
  subLeague: 'Сезон Весна 2026',
  winRate: '87%',
};

const achievements: Achievement[] = [
  { id: 1, icon: '🏆', title: 'Первые 1000 баллов', description: 'Набрано 1000+ очков в командном зачёте.' },
  { id: 2, icon: '🔥', title: 'Серия побед', description: '5 успешных активностей подряд.' },
  { id: 3, icon: '🤝', title: 'Командный игрок', description: 'Максимальный вклад в 3 групповых проектах.' },
  { id: 4, icon: '⚡', title: 'Быстрый старт', description: 'Выполнена активность в первые 24 часа.' },
  { id: 5, icon: '🎯', title: 'Точный план', description: '100% выполнение задач недели.' },
];

const menuItems = ['Профиль', 'Команда', 'Рейтинг', 'События', 'Новости', 'Настройки', 'Выход'];

export default function ProfilePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl bg-white p-4 shadow-sm">
          <h1 className="mb-4 text-xl font-semibold text-slate-800">Личный кабинет</h1>
          <nav>
            <ul className="space-y-2">
              {menuItems.map((item, idx) => (
                <li key={item}>
                  <button
                    type="button"
                    className={`w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition ${
                      idx === 0
                        ? 'bg-pink-500 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <section className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <article className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-pink-100 text-4xl font-semibold text-pink-600">
                  ЕО
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-slate-800">{mockUser.fullName}</h2>
                  <p className="mt-1 text-sm text-slate-500">Группа: {mockUser.group}</p>
                  <p className="text-sm text-slate-500">Команда: {mockUser.team}</p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(true)}
                      className="rounded-xl bg-pink-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-pink-600"
                    >
                      Редактировать данные
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="rounded-xl border border-pink-200 bg-pink-50 px-4 py-2 text-sm font-medium text-pink-600 transition hover:bg-pink-100"
                    >
                      Сменить пароль
                    </button>
                  </div>
                </div>
              </div>
            </article>

            <article className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Лига</p>
                <p className="mt-2 text-2xl font-semibold text-slate-800">{mockUser.league}</p>
                <p className="mt-1 text-sm text-slate-500">{mockUser.subLeague}</p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Баллы</p>
                <p className="mt-2 text-3xl font-semibold text-pink-600">{mockUser.points}</p>
                <p className="mt-1 text-sm text-slate-500">Win Rate: {mockUser.winRate}</p>
              </div>
            </article>
          </div>

          <article className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-slate-800">Достижения</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {achievements.map((achievement) => (
                <button
                  type="button"
                  key={achievement.id}
                  onClick={() => setSelectedAchievement(achievement)}
                  className="group flex min-w-24 flex-col items-center gap-2 rounded-2xl bg-slate-50 p-3 transition hover:bg-pink-50"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm transition group-hover:scale-105">
                    {achievement.icon}
                  </span>
                  <span className="text-center text-xs font-medium text-slate-600">{achievement.title}</span>
                </button>
              ))}
            </div>
          </article>
        </section>
      </div>

      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
      <AchievementModal
        isOpen={Boolean(selectedAchievement)}
        onClose={() => setSelectedAchievement(null)}
        title={selectedAchievement?.title ?? ''}
        description={selectedAchievement?.description ?? ''}
      />
    </main>
  );
}
