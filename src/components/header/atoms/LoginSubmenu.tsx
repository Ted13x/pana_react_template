import React, { useRef, useEffect, useState } from "react";
import { usePanaAuth } from "../../../hooks/usePanaAuth";
import { Registration } from "../../../components/registration/Registration";

export interface LoginSubmenuProps {
  onClose: () => void;
  onLoginSuccess: () => void;
  initialView?: "login" | "register";
}

export const LoginSubmenu: React.FC<LoginSubmenuProps> = ({
  onClose,
  onLoginSuccess,
  initialView = "login",
}) => {
  const { login, loading, error } = usePanaAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showRegistration, setShowRegistration] = useState(
    initialView === "register"
  );
  const submenuRef = useRef<HTMLDivElement>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!email) {
      setLoginError("Bitte gib deine E-Mail-Adresse ein");
      return;
    }

    if (!password) {
      setLoginError("Bitte gib dein Passwort ein");
      return;
    }

    try {
      const success = await login(email, password);
      if (success) {
        onLoginSuccess();
        onClose();
      } else {
        setLoginError(
          "Login fehlgeschlagen. Bitte überprüfe deine Zugangsdaten."
        );
      }
    } catch (err) {
      setLoginError(
        "Ein Fehler ist aufgetreten. Bitte versuche es später erneut."
      );
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        submenuRef.current &&
        !submenuRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleRegistrationSuccess = () => {
    setShowRegistration(false);
    onLoginSuccess();
  };

  return (
    <div className="pana-login-submenu" ref={submenuRef}>
      {showRegistration ? (
        <Registration
          onSuccess={handleRegistrationSuccess}
          onLogin={() => setShowRegistration(false)}
          onCancel={() => setShowRegistration(false)}
        />
      ) : (
        <>
          <div className="pana-login-submenu-header">
            <h3>Anmelden</h3>
            <button
              className="pana-login-close-button"
              onClick={onClose}
              aria-label="Schließen"
            >
              ×
            </button>
          </div>
          <form onSubmit={handleLogin} className="pana-login-form">
            {(loginError || error) && (
              <div className="pana-login-error">{loginError || error}</div>
            )}
            <div className="pana-form-group">
              <label htmlFor="email">E-Mail</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pana-form-input"
                placeholder="deine@email.de"
              />
            </div>
            <div className="pana-form-group">
              <label htmlFor="password">Passwort</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pana-form-input"
                placeholder="••••••••"
              />
            </div>

            <div className="pana-forgot-password">
              <button type="button" className="pana-text-button">
                Passwort vergessen?
              </button>
            </div>

            <button
              type="submit"
              className="pana-button pana-button-primary pana-login-button"
              disabled={loading}
            >
              {loading ? "Anmelden..." : "Anmelden"}
            </button>
          </form>

          <div className="pana-register-link">
            <span>Noch kein Konto?</span>
            <button
              type="button"
              className="pana-text-button"
              onClick={() => setShowRegistration(true)}
            >
              Registrieren
            </button>
          </div>
        </>
      )}
    </div>
  );
};
