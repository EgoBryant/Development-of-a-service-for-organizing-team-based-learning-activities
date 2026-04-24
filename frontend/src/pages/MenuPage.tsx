import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

type MenuPageProps = {
  authenticated?: boolean;
};

export function MenuPage({ authenticated = false }: MenuPageProps) {
  const { auth, isAuthenticated, signOut } = useAuth();

  return (
    <main className="menu-page">
      <section className="menu-card">
        <div className="logo-box">
          {authenticated || isAuthenticated
            ? auth?.userName || "ГЛАВНОЕ МЕНЮ"
            : "КОМАНДНЫЙ ЗАЧЁТ"}
        </div>

        {authenticated || isAuthenticated ? (
          <div className="menu-actions">
            <div className="menu-caption">
              Это пока пустое меню. Следующим шагом сюда можно добавить навигацию по
              модулям платформы.
            </div>
            <button className="primary-button" type="button" onClick={signOut}>
              ВЫЙТИ
            </button>
          </div>
        ) : (
          <Link className="primary-button" to="/sign-in">
            СТАРТ
          </Link>
        )}
      </section>
    </main>
  );
}
