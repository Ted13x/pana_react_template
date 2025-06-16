import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomer } from "../../../contexts/CustomerContext";
import styles from "./Login.module.scss";

const Login = () => {
  const navigate = useNavigate();
  const { customer, isAuthenticated, login, logout } = useCustomer();
  const [showDropdown, setShowDropdown] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    setEmail("");
    setPassword("");
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  const handleNavigateToAccount = () => {
    navigate("/account");
    setShowDropdown(false);
  };

  return (
    <div className={styles.loginContainer}>
      <div
        className={styles.loginButton}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        {isAuthenticated ? customer?.firstName || customer?.email : "Login"}
      </div>

      {showDropdown && (
        <div className={styles.dropdown} ref={dropdownRef}>
          {isAuthenticated ? (
            <div className={styles.userMenu}>
              <div
                className={styles.menuItem}
                onClick={handleNavigateToAccount}
              >
                Benutzereinstellungen
              </div>
              <div className={styles.menuItem}>Bestellungen</div>
              <div className={styles.menuItem} onClick={handleLogout}>
                Abmelden
              </div>
            </div>
          ) : (
            <form className={styles.loginForm} onSubmit={handleLogin}>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="password">Passwort</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className={styles.submitButton}>
                Login
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default Login;
