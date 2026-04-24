import type { PropsWithChildren, ReactNode } from "react";
import { Link } from "react-router-dom";

type AuthLayoutProps = PropsWithChildren<{
  title: string;
  promoLabel: string;
  promoHref: string;
  footer?: ReactNode;
  sidePosition?: "left" | "right";
}>;

export function AuthLayout({
  title,
  promoLabel,
  promoHref,
  footer,
  sidePosition = "right",
  children,
}: AuthLayoutProps) {
  return (
    <main className="auth-page">
      <section className="auth-layout">
        {sidePosition === "left" ? (
          <>
            <aside className="promo-panel">
              <Link className="panel-button" to={promoHref}>
                {promoLabel}
              </Link>
            </aside>
            <section className="form-panel">
              <div className="auth-form">
                <h1>{title}</h1>
                {children}
                {footer}
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="form-panel">
              <div className="auth-form">
                <h1>{title}</h1>
                {children}
                {footer}
              </div>
            </section>
            <aside className="promo-panel">
              <Link className="panel-button" to={promoHref}>
                {promoLabel}
              </Link>
            </aside>
          </>
        )}
      </section>
    </main>
  );
}
