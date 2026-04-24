import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { AuthLayout } from "../components/AuthLayout";

export function SignInPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signIn({ email, password });
      navigate("/app", { replace: true });
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Не удалось войти.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="ВХОД"
      promoLabel="РЕГИСТРАЦИЯ"
      promoHref="/sign-up"
      footer={
        <Link className="text-link text-link--center" to="/sign-up">
          Зарегистрироваться, если нет аккаунта
        </Link>
      }
    >
      <form className="form-fields" onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="ЭЛЕКТРОННАЯ ПОЧТА"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="ПАРОЛЬ"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <Link className="text-link text-link--left" to="/sign-up">
          Если пароля нет, зарегистрируйтесь
        </Link>

        {error ? <div className="error-banner">{error}</div> : null}

        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? "ЗАГРУЗКА..." : "ПРИСОЕДИНИТЬСЯ"}
        </button>
      </form>
    </AuthLayout>
  );
}
