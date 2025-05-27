import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useConfig } from "../../hooks/useConfig";
import { usePanaAuth } from "../../hooks/usePanaAuth";
import { usePanaCart } from "../../hooks/usePanaCart";
import { usePanaWishlist } from "../../hooks/usePanaWishlist";
import styles from "./Header.module.scss";

const Header = () => {
  const navigate = useNavigate();
  const { shopId } = useConfig();
  const { isAuthenticated, customer, login, logout, register } = usePanaAuth();
  const { cart, refreshCart } = usePanaCart();
  const { wishlists, refreshWishlists } = usePanaWishlist();

  // Dropdown-Zustände
  const [showFavsDropdown, setShowFavsDropdown] = useState(false);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);

  // Formular-Zustände
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loginError, setLoginError] = useState("");
  const [registrationError, setRegistrationError] = useState("");

  // Refs für Dropdown-Elemente (zur Erkennung von Klicks außerhalb)
  const favsDropdownRef = useRef<HTMLDivElement>(null);
  const cartDropdownRef = useRef<HTMLDivElement>(null);
  const loginDropdownRef = useRef<HTMLDivElement>(null);

  // Berechnen von Anzahlen
  const cartItemCount = cart?.shoppingCartItems?.length || 0;
  const wishlistItemCount =
    wishlists?.reduce((total, wishlist) => {
      return total + (wishlist.variants?.length || 0);
    }, 0) || 0;

  // Benutzername für Anzeige
  const displayName = customer
    ? "firstName" in customer
      ? customer.firstName
      : "email" in customer
      ? customer.email.split("@")[0]
      : ""
    : "";

  // Effekt zum Schließen der Dropdowns bei Klick außerhalb
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Prüfen, ob der Klick außerhalb der Dropdowns war
      if (
        showFavsDropdown &&
        favsDropdownRef.current &&
        !favsDropdownRef.current.contains(event.target as Node)
      ) {
        setShowFavsDropdown(false);
      }

      if (
        showCartDropdown &&
        cartDropdownRef.current &&
        !cartDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCartDropdown(false);
      }

      if (
        showLoginDropdown &&
        loginDropdownRef.current &&
        !loginDropdownRef.current.contains(event.target as Node)
      ) {
        setShowLoginDropdown(false);
      }
    };

    // Event-Listener hinzufügen/entfernen
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFavsDropdown, showCartDropdown, showLoginDropdown]);

  // Aktualisieren des Carts und der Wunschliste nach Login
  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
      refreshWishlists();
    }
  }, [isAuthenticated]);

  // Handler für Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const success = await login(email, password);
      if (success) {
        setShowLoginDropdown(false);
        setEmail("");
        setPassword("");
      }
      /* else {
        setLoginError(
          "Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben."
        );
      } */
    } catch (error) {
      setLoginError(
        "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
      );
    }
  };

  // Handler für Registrierung
  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationError("");

    if (!email || !password || !firstName || !lastName) {
      setRegistrationError("Bitte füllen Sie alle Felder aus.");
      return;
    }

    try {
      const success = await register(email, password, firstName, lastName, []);
      if (success) {
        setShowLoginDropdown(false);
        setShowRegistrationForm(false);
        setEmail("");
        setPassword("");
        setFirstName("");
        setLastName("");
      } else {
        setRegistrationError(
          "Registrierung fehlgeschlagen. Bitte versuchen Sie es später erneut."
        );
      }
    } catch (error) {
      setRegistrationError(
        "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
      );
    }
  };

  // Handler für Logout
  const handleLogout = async () => {
    await logout();
    setShowLoginDropdown(false);
  };

  // Navigation zum Warenkorb
  const navigateToCart = () => {
    setShowCartDropdown(false);
    navigate("/cart");
  };

  // Navigation zur Wunschliste
  const navigateToWishlist = () => {
    setShowFavsDropdown(false);
    navigate("/favorites");
  };

  // Navigation zum Profil
  const navigateToProfile = () => {
    setShowLoginDropdown(false);
    navigate("/profile");
  };

  // Navigation zur Startseite (Logo-Klick)
  const navigateToHome = () => {
    navigate("/");
  };

  return (
    <header className={styles.header} data-pana-shopid={shopId}>
      {/* Logo-Bereich */}
      <div className={styles.logoContainer} onClick={navigateToHome}>
        <svg
          className={styles.logo}
          viewBox="0 0 100 40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <text x="5" y="30" className={styles.logoText}>
            PANA
          </text>
        </svg>
      </div>

      {/* Aktions-Bereich */}
      <div className={styles.actions}>
        {/* Favoriten-Icon und Dropdown */}
        <div className={styles.actionItem} ref={favsDropdownRef}>
          <button
            className={styles.iconButton}
            onClick={() => setShowFavsDropdown(!showFavsDropdown)}
            aria-label="Wunschliste"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            {wishlistItemCount > 0 && (
              <span className={styles.badge}>{wishlistItemCount}</span>
            )}
          </button>

          {showFavsDropdown && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <h3>Meine Wunschliste</h3>
              </div>
              <div className={styles.dropdownContent}>
                {wishlistItemCount > 0 ? (
                  <>
                    {wishlists?.map((wishlist) => (
                      <div key={wishlist.id} className={styles.wishlistItem}>
                        <h4>{wishlist.name}</h4>
                        <p>{wishlist.variants?.length || 0} Artikel</p>
                      </div>
                    ))}
                    <button
                      className={styles.dropdownButton}
                      onClick={navigateToWishlist}
                    >
                      Zur Wunschliste
                    </button>
                  </>
                ) : (
                  <p className={styles.emptyMessage}>
                    Ihre Wunschliste ist leer.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Warenkorb-Icon und Dropdown */}
        <div className={styles.actionItem} ref={cartDropdownRef}>
          <button
            className={styles.iconButton}
            onClick={() => setShowCartDropdown(!showCartDropdown)}
            aria-label="Warenkorb"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartItemCount > 0 && (
              <span className={styles.badge}>{cartItemCount}</span>
            )}
          </button>

          {showCartDropdown && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <h3>Mein Warenkorb</h3>
              </div>
              <div className={styles.dropdownContent}>
                {cartItemCount > 0 ? (
                  <>
                    <div className={styles.cartItems}>
                      {cart?.shoppingCartItems?.slice(0, 3).map((item) => (
                        <div key={item.id} className={styles.cartItem}>
                          {item.variant?.medias &&
                            item.variant.medias.length > 0 && (
                              <div className={styles.cartItemImage}>
                                <img
                                  src={item.variant.medias[0].url}
                                  alt={item.variant.name}
                                />
                              </div>
                            )}
                          <div className={styles.cartItemInfo}>
                            <p className={styles.cartItemName}>
                              {item.variant?.name}
                            </p>
                            <p className={styles.cartItemPrice}>
                              {item.amount} x{" "}
                              {item.variant?.prices &&
                              item.variant.prices.length > 0
                                ? parseFloat(
                                    item.variant.prices[0].value.toString()
                                  ).toLocaleString("de-DE", {
                                    style: "currency",
                                    currency: item.variant.prices[0].currency,
                                  })
                                : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {cart?.shoppingCartItems &&
                      cart.shoppingCartItems.length > 3 && (
                        <p className={styles.moreItems}>
                          +{cart.shoppingCartItems.length - 3} weitere Artikel
                        </p>
                      )}

                    <div className={styles.cartTotal}>
                      <span>Gesamt:</span>
                      <span>
                        {/*  {cart?.total ? 
                          parseFloat(cart.total.toString()).toLocaleString("de-DE", {
                            style: "currency",
                            currency: "EUR", // Annahme: Euro als Standardwährung
                          }) : ""} */}
                      </span>
                    </div>

                    <button
                      className={styles.dropdownButton}
                      onClick={navigateToCart}
                    >
                      Zum Warenkorb
                    </button>
                  </>
                ) : (
                  <p className={styles.emptyMessage}>Ihr Warenkorb ist leer.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Login-Icon und Dropdown */}
        <div className={styles.actionItem} ref={loginDropdownRef}>
          <button
            className={styles.iconButton}
            onClick={() => setShowLoginDropdown(!showLoginDropdown)}
            aria-label={isAuthenticated ? "Konto" : "Login"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>

          {showLoginDropdown && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <h3>
                  {isAuthenticated ? `Hallo, ${displayName}` : "Anmelden"}
                </h3>
              </div>

              <div className={styles.dropdownContent}>
                {isAuthenticated ? (
                  // Angemeldet: Zeige Benutzermenü
                  <>
                    <button
                      className={styles.accountButton}
                      onClick={navigateToProfile}
                    >
                      Mein Konto
                    </button>
                    <button
                      className={styles.accountButton}
                      onClick={() => navigate("/orders")}
                    >
                      Meine Bestellungen
                    </button>
                    <button
                      className={styles.logoutButton}
                      onClick={handleLogout}
                    >
                      Abmelden
                    </button>
                  </>
                ) : (
                  // Nicht angemeldet: Zeige Login/Registrierung
                  <>
                    <div className={styles.tabs}>
                      <button
                        className={`${styles.tab} ${
                          !showRegistrationForm ? styles.activeTab : ""
                        }`}
                        onClick={() => setShowRegistrationForm(false)}
                      >
                        Anmelden
                      </button>
                      <button
                        className={`${styles.tab} ${
                          showRegistrationForm ? styles.activeTab : ""
                        }`}
                        onClick={() => setShowRegistrationForm(true)}
                      >
                        Registrieren
                      </button>
                    </div>

                    {!showRegistrationForm ? (
                      // Login-Formular
                      <form className={styles.authForm} onSubmit={handleLogin}>
                        {loginError && (
                          <p className={styles.errorMessage}>{loginError}</p>
                        )}

                        <div className={styles.formGroup}>
                          <label htmlFor="email">E-Mail</label>
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
                          Anmelden
                        </button>
                      </form>
                    ) : (
                      // Registrierungs-Formular
                      <form
                        className={styles.authForm}
                        onSubmit={handleRegistration}
                      >
                        {registrationError && (
                          <p className={styles.errorMessage}>
                            {registrationError}
                          </p>
                        )}

                        <div className={styles.formGroup}>
                          <label htmlFor="register-email">E-Mail</label>
                          <input
                            id="register-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>

                        <div className={styles.formRow}>
                          <div className={styles.formGroup}>
                            <label htmlFor="first-name">Vorname</label>
                            <input
                              id="first-name"
                              type="text"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              required
                            />
                          </div>

                          <div className={styles.formGroup}>
                            <label htmlFor="last-name">Nachname</label>
                            <input
                              id="last-name"
                              type="text"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className={styles.formGroup}>
                          <label htmlFor="register-password">Passwort</label>
                          <input
                            id="register-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>

                        <button type="submit" className={styles.submitButton}>
                          Konto erstellen
                        </button>
                      </form>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
