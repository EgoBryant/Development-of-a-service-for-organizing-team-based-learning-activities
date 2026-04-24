import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { AuthLayout } from "../components/AuthLayout";

export function SignUpPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signUp({ userName, email, password });
      navigate("/app", { replace: true });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Не удалось зарегистрироваться.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="РЕГИСТРАЦИЯ"
      promoLabel="ВХОД"
      promoHref="/sign-in"
      sidePosition="left"
    >
      <form className="form-fields" onSubmit={handleSubmit}>
        <input
          name="userName"
          type="text"
          placeholder="ИМЯ ПОЛЬЗОВАТЕЛЯ"
          value={userName}
          onChange={(event) => setUserName(event.target.value)}
          required
        />
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
          minLength={6}
        />

        <div className="text-link text-link--left text-link--muted">
          Минимум 6 символов. После регистрации вы сразу попадете в меню.
        </div>

        {error ? <div className="error-banner">{error}</div> : null}

        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? "ЗАГРУЗКА..." : "ПРИСОЕДИНИТЬСЯ"}
        </button>
      </form>
    </AuthLayout>
  );
}
