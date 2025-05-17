/**
 * Hilfsfunktionen für die sichere Speicherung von sensiblen Daten
 * Verwendet localStorage mit Verschlüsselung oder, falls verfügbar, eine sicherere Alternative
 */

// Verschlüsselungsschlüssel aus einem Shop-spezifischen Wert ableiten
const deriveEncryptionKey = (shopId: string): string => {
  // In einer echten Implementierung würde hier eine sichere Schlüsselableitung stattfinden
  // z.B. mit PBKDF2 oder einem ähnlichen Algorithmus
  return `${shopId}-encryption-key`;
};

// Einfache Verschlüsselung für localStorage
// In einer Produktionsumgebung sollte eine richtige Kryptografie-Bibliothek verwendet werden
const encrypt = (data: string, shopId: string): string => {
  // Dies ist nur ein Platzhalter - in Produktion eine echte Verschlüsselung implementieren
  // z.B. mit crypto-js oder einer ähnlichen Bibliothek
  const key = deriveEncryptionKey(shopId);
  return btoa(`${key}:${data}`); // Base64 Codierung als Beispiel
};

// Entschlüsselung für localStorage
const decrypt = (encryptedData: string, shopId: string): string => {
  // Dies ist nur ein Platzhalter - in Produktion eine echte Entschlüsselung implementieren
  try {
    const decoded = atob(encryptedData);
    const key = deriveEncryptionKey(shopId);
    if (decoded.startsWith(`${key}:`)) {
      return decoded.substring(key.length + 1);
    }
    throw new Error('Ungültiger Verschlüsselungsschlüssel');
  } catch (error) {
    console.error('Entschlüsselungsfehler:', error);
    return '';
  }
};

let currentShopId: string = '';

/**
 * Initialisiert die Sicherheitsutilities mit einer Shop-ID
 * @param shopId Die eindeutige ID des Shops
 */
export const initSecurity = (shopId: string): void => {
  currentShopId = shopId;
};

/**
 * Ein sicherer Speicher für sensible Daten
 * Wrapper um localStorage mit Verschlüsselung oder einer sichereren Alternative
 */
export const secureStorage = {
  /**
   * Speichert einen Wert sicher
   * @param key Der Schlüssel unter dem der Wert gespeichert wird
   * @param value Der zu speichernde Wert
   */
  setItem: async (key: string, value: string): Promise<void> => {
    if (!currentShopId) {
      throw new Error('Security nicht initialisiert. Bitte initSecurity() aufrufen.');
    }

    try {
      // Prüfen ob der Browser sessionStorage unterstützt (bevorzugt für sensible Tokens)
      if (typeof sessionStorage !== 'undefined') {
        // Am besten in sessionStorage speichern (wird bei Schließen des Tabs gelöscht)
        const encrypted = encrypt(value, currentShopId);
        sessionStorage.setItem(`pana_${key}`, encrypted);
      } else if (typeof localStorage !== 'undefined') {
        // Fallback auf localStorage, wenn sessionStorage nicht verfügbar ist
        const encrypted = encrypt(value, currentShopId);
        localStorage.setItem(`pana_${key}`, encrypted);
      } else {
        // Wenn weder sessionStorage noch localStorage verfügbar sind
        console.error('Weder sessionStorage noch localStorage ist verfügbar');
        // In-Memory-Speicher als letzte Möglichkeit (wird bei Seiten-Reload verloren)
        (window as any).__PANA_SECURE_STORAGE = (window as any).__PANA_SECURE_STORAGE || {};
        (window as any).__PANA_SECURE_STORAGE[`pana_${key}`] = value;
      }
    } catch (error) {
      console.error('Fehler beim sicheren Speichern:', error);
      throw error;
    }
  },

  /**
   * Liest einen sicher gespeicherten Wert
   * @param key Der Schlüssel unter dem der Wert gespeichert wurde
   * @returns Der gespeicherte Wert oder null, wenn kein Wert gefunden wurde
   */
  getItem: async (key: string): Promise<string | null> => {
    if (!currentShopId) {
      throw new Error('Security nicht initialisiert. Bitte initSecurity() aufrufen.');
    }

    try {
      let value: string | null = null;

      // Zuerst in sessionStorage suchen
      if (typeof sessionStorage !== 'undefined') {
        value = sessionStorage.getItem(`pana_${key}`);
      }

      // Wenn nicht in sessionStorage, dann in localStorage suchen
      if (!value && typeof localStorage !== 'undefined') {
        value = localStorage.getItem(`pana_${key}`);
      }

      // Wenn nicht in localStorage, dann im In-Memory-Speicher suchen
      if (!value && (window as any).__PANA_SECURE_STORAGE) {
        value = (window as any).__PANA_SECURE_STORAGE[`pana_${key}`] || null;
      }

      // Wenn ein Wert gefunden wurde und er verschlüsselt ist, entschlüsseln
      if (value) {
        // Prüfen ob der Wert im In-Memory-Speicher ist (dann ist er nicht verschlüsselt)
        if (
          (window as any).__PANA_SECURE_STORAGE &&
          (window as any).__PANA_SECURE_STORAGE[`pana_${key}`] === value
        ) {
          return value;
        }

        // Ansonsten entschlüsseln
        return decrypt(value, currentShopId);
      }

      return null;
    } catch (error) {
      console.error('Fehler beim sicheren Lesen:', error);
      return null;
    }
  },

  /**
   * Entfernt einen sicher gespeicherten Wert
   * @param key Der Schlüssel unter dem der Wert gespeichert wurde
   */
  removeItem: async (key: string): Promise<void> => {
    try {
      // Aus allen möglichen Speicherorten entfernen
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(`pana_${key}`);
      }

      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(`pana_${key}`);
      }

      if ((window as any).__PANA_SECURE_STORAGE) {
        delete (window as any).__PANA_SECURE_STORAGE[`pana_${key}`];
      }
    } catch (error) {
      console.error('Fehler beim sicheren Entfernen:', error);
      throw error;
    }
  },

  /**
   * Löscht alle sicher gespeicherten Werte
   */
  clear: async (): Promise<void> => {
    try {
      // Alle pana_-Einträge aus sessionStorage entfernen
      if (typeof sessionStorage !== 'undefined') {
        Object.keys(sessionStorage)
          .filter(key => key.startsWith('pana_'))
          .forEach(key => sessionStorage.removeItem(key));
      }

      // Alle pana_-Einträge aus localStorage entfernen
      if (typeof localStorage !== 'undefined') {
        Object.keys(localStorage)
          .filter(key => key.startsWith('pana_'))
          .forEach(key => localStorage.removeItem(key));
      }

      // In-Memory-Speicher leeren
      if ((window as any).__PANA_SECURE_STORAGE) {
        (window as any).__PANA_SECURE_STORAGE = {};
      }
    } catch (error) {
      console.error('Fehler beim Leeren des sicheren Speichers:', error);
      throw error;
    }
  },
};

// CSRF-Schutz
export const csrfProtection = {
  /**
   * Generiert ein CSRF-Token
   * @returns Das generierte CSRF-Token
   */
  generateToken: (): string => {
    // In einer echten Implementierung würde hier ein kryptografisch sicheres Token generiert werden
    return (
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  },

  /**
   * Speichert ein CSRF-Token sicher
   * @param token Das zu speichernde CSRF-Token
   */
  storeToken: async (token: string): Promise<void> => {
    await secureStorage.setItem('csrf_token', token);
  },

  /**
   * Liest das gespeicherte CSRF-Token
   * @returns Das gespeicherte CSRF-Token oder null, wenn keines gefunden wurde
   */
  getToken: async (): Promise<string | null> => {
    return await secureStorage.getItem('csrf_token');
  },
};

// API-Hilfe mit Sicherheitsheader
export const secureApiHeaders = async (
  token: string | null = null
): Promise<Record<string, string>> => {
  // Basis-Header
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Authentifizierungs-Header, wenn Token vorhanden
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // CSRF-Token, wenn verfügbar
  const csrfToken = await csrfProtection.getToken();
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  return headers;
};
