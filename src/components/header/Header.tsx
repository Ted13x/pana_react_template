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
  const { isAuthenticated, customer, login, logout, register, loading, error } =
    usePanaAuth();
  const { cart, cartItems, cartTotal, itemCount, refreshCart } = usePanaCart();
  const { wishlists, refreshWishlists } = usePanaWishlist();

  const [showFavsDropdown, setShowFavsDropdown] = useState(false);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);

  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const favsDropdownRef = useRef<HTMLDivElement>(null);
  const cartDropdownRef = useRef<HTMLDivElement>(null);
  const loginDropdownRef = useRef<HTMLDivElement>(null);

  const cartItemCount = itemCount;
  const wishlistItemCount =
    wishlists?.reduce((total, wishlist) => {
      return total + (wishlist.variants?.length || 0);
    }, 0) || 0;

  const displayName = customer
    ? customer.firstName && customer.lastName
      ? `${customer.firstName} ${customer.lastName}`
      : customer.firstName
      ? customer.firstName
      : customer.email
      ? customer.email.split("@")[0]
      : "Benutzer"
    : "";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFavsDropdown, showCartDropdown, showLoginDropdown]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
      refreshWishlists();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    console.log("Header Debug - States:", {
      isAuthenticated,
      customer: customer?.firstName || customer?.email,
      showLoginDropdown,
      showCartDropdown,
      showFavsDropdown,
      loading,
      error,
    });
  }, [
    isAuthenticated,
    customer,
    showLoginDropdown,
    showCartDropdown,
    showFavsDropdown,
    loading,
    error,
  ]);

  useEffect(() => {
    if (isAuthenticated) {
      if (showLoginDropdown) {
        setShowLoginDropdown(false);
      }
      resetForm();
    }
  }, [isAuthenticated]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setShowRegistrationForm(false);
  };

  const formatPrice = (price: number, currency: string = "EUR") => {
    return price.toLocaleString("de-DE", {
      style: "currency",
      currency: currency,
    });
  };

  const getMainCurrency = () => {
    if (cartItems.length > 0) {
      const firstItemWithPrice = cartItems.find(
        (item) => item.variant?.prices && item.variant.prices.length > 0
      );
      return firstItemWithPrice?.variant?.prices?.[0]?.currency || "EUR";
    }
    return "EUR";
  };

  const handleLoginDropdownToggle = () => {
    console.log("Toggle login dropdown, current state:", showLoginDropdown);
    setShowLoginDropdown((prev) => {
      console.log("Setting showLoginDropdown from", prev, "to", !prev);
      return !prev;
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    try {
      const success = await login(email, password);
      if (success) {
        console.log("Login erfolgreich");
      }
    } catch (error) {
      console.error("Login Fehler:", error);
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !firstName || !lastName) {
      return;
    }

    try {
      const success = await register(email, password, firstName, lastName, []);
      if (success) {
        console.log("Registrierung erfolgreich");
      }
    } catch (error) {
      console.error("Registrierung Fehler:", error);
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowLoginDropdown(false);
  };

  const navigateToCart = () => {
    setShowCartDropdown(false);
    navigate("/cart");
  };

  const navigateToWishlist = () => {
    setShowFavsDropdown(false);
    navigate("/favorites");
  };

  const navigateToProfile = () => {
    setShowLoginDropdown(false);
    navigate("/profile");
  };

  const navigateToHome = () => {
    navigate("/");
  };

  return (
    <header className={styles.header} data-pana-shopid={shopId}>
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

      <div className={styles.actions}>
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
                      {cartItems.slice(0, 3).map((item) => (
                        <div key={item.id} className={styles.cartItem}>
                          {item.variant?.medias &&
                            item.variant.medias.length > 0 && (
                              <div className={styles.cartItemImage}>
                                <img
                                  src={item.variant.medias[0].url}
                                  alt={item.variant.name || "Produkt"}
                                />
                              </div>
                            )}
                          <div className={styles.cartItemInfo}>
                            <p className={styles.cartItemName}>
                              {item.variant?.name || "Unbekanntes Produkt"}
                            </p>
                            <p className={styles.cartItemPrice}>
                              {item.amount}x{" "}
                              {item.variant?.prices &&
                              item.variant.prices.length > 0
                                ? formatPrice(
                                    parseFloat(
                                      item.variant.prices[0].value.toString()
                                    ),
                                    item.variant.prices[0].currency
                                  )
                                : "Preis nicht verfügbar"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {cartItems.length > 3 && (
                      <p className={styles.moreItems}>
                        +{cartItems.length - 3} weitere Artikel
                      </p>
                    )}

                    <div className={styles.cartTotal}>
                      <span>Gesamt:</span>
                      <span>{formatPrice(cartTotal, getMainCurrency())}</span>
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
            onClick={() => {
              console.log("Login button clicked!");
              setShowLoginDropdown(!showLoginDropdown);
            }}
            aria-label={isAuthenticated ? "Konto" : "Login"}
            type="button"
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
                  {isAuthenticated ? `Hallo, ${displayName}!` : "Anmelden"}
                </h3>
              </div>

              <div className={styles.dropdownContent}>
                {isAuthenticated ? (
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
                      <form className={styles.authForm} onSubmit={handleLogin}>
                        {error && (
                          <p className={styles.errorMessage}>{error}</p>
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

                        <button
                          type="submit"
                          className={styles.submitButton}
                          disabled={loading}
                        >
                          {loading ? "Anmelden..." : "Anmelden"}
                        </button>
                      </form>
                    ) : (
                      <form
                        className={styles.authForm}
                        onSubmit={handleRegistration}
                      >
                        {error && (
                          <p className={styles.errorMessage}>{error}</p>
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

                        <button
                          type="submit"
                          className={styles.submitButton}
                          disabled={loading}
                        >
                          {loading ? "Registrieren..." : "Konto erstellen"}
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
