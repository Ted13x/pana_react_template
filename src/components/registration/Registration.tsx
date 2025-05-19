import React, { useState } from "react";
import { usePanaAuth } from "../../hooks/usePanaAuth";

export interface RegistrationProps {
  className?: string;
  onSuccess?: (user: any) => void;
  onLogin?: () => void;
  onCancel?: () => void;
}

export const Registration: React.FC<RegistrationProps> = ({
  className = "pana-registration",
  onSuccess,
  onLogin,
  onCancel,
}) => {
  const { register, loading, error } = usePanaAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    agreeTerms: false,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = "Email ist erforderlich";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email ist ungültig";
    }

    if (!formData.password) {
      errors.password = "Passwort ist erforderlich";
    } else if (formData.password.length < 8) {
      errors.password = "Passwort muss mindestens 8 Zeichen lang sein";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwörter stimmen nicht überein";
    }

    if (!formData.firstName.trim()) {
      errors.firstName = "Vorname ist erforderlich";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Nachname ist erforderlich";
    }

    if (!formData.agreeTerms) {
      errors.agreeTerms = "Bitte stimme den AGB zu";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const success = await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        []
      );

      if (success && onSuccess) {
        onSuccess({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        });
      }
    } catch (error) {
      console.error("Registrierungsfehler:", error);
    }
  };

  const handleLoginClick = () => {
    if (onLogin) {
      onLogin();
    }
  };

  const handleCancelClick = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className={className}>
      <h2 className="pana-registration-title">Registrieren</h2>

      {error && <div className="pana-registration-error">{error}</div>}

      <form onSubmit={handleSubmit} className="pana-registration-form">
        <div className="pana-form-group">
          <label htmlFor="firstName" className="pana-form-label">
            Vorname*
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={`pana-form-input ${
              formErrors.firstName ? "pana-input-error" : ""
            }`}
            required
          />
          {formErrors.firstName && (
            <div className="pana-form-error">{formErrors.firstName}</div>
          )}
        </div>

        <div className="pana-form-group">
          <label htmlFor="lastName" className="pana-form-label">
            Nachname*
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={`pana-form-input ${
              formErrors.lastName ? "pana-input-error" : ""
            }`}
            required
          />
          {formErrors.lastName && (
            <div className="pana-form-error">{formErrors.lastName}</div>
          )}
        </div>

        <div className="pana-form-group">
          <label htmlFor="email" className="pana-form-label">
            Email*
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className={`pana-form-input ${
              formErrors.email ? "pana-input-error" : ""
            }`}
          />
          {formErrors.email && (
            <div className="pana-form-error">{formErrors.email}</div>
          )}
        </div>

        <div className="pana-form-group">
          <label htmlFor="phone" className="pana-form-label">
            Telefon
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="pana-form-input"
            placeholder="z.B. 00436761234567"
          />
        </div>

        <div className="pana-form-group">
          <label htmlFor="password" className="pana-form-label">
            Passwort*
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className={`pana-form-input ${
              formErrors.password ? "pana-input-error" : ""
            }`}
          />
          {formErrors.password && (
            <div className="pana-form-error">{formErrors.password}</div>
          )}
        </div>

        <div className="pana-form-group">
          <label htmlFor="confirmPassword" className="pana-form-label">
            Passwort bestätigen*
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            className={`pana-form-input ${
              formErrors.confirmPassword ? "pana-input-error" : ""
            }`}
          />
          {formErrors.confirmPassword && (
            <div className="pana-form-error">{formErrors.confirmPassword}</div>
          )}
        </div>

        <div className="pana-form-group pana-checkbox-group">
          <input
            type="checkbox"
            id="agreeTerms"
            name="agreeTerms"
            checked={formData.agreeTerms}
            onChange={handleInputChange}
            className={`pana-form-checkbox ${
              formErrors.agreeTerms ? "pana-input-error" : ""
            }`}
          />
          <label htmlFor="agreeTerms" className="pana-form-checkbox-label">
            Ich stimme den{" "}
            <a href="#" className="pana-link">
              AGB
            </a>{" "}
            und{" "}
            <a href="#" className="pana-link">
              Datenschutzbestimmungen
            </a>{" "}
            zu*
          </label>
          {formErrors.agreeTerms && (
            <div className="pana-form-error">{formErrors.agreeTerms}</div>
          )}
        </div>

        <div className="pana-form-actions">
          {onCancel && (
            <button
              type="button"
              className="pana-button pana-button-secondary"
              onClick={handleCancelClick}
            >
              Abbrechen
            </button>
          )}
          <button
            type="submit"
            className="pana-button pana-button-primary pana-register-button"
            disabled={loading}
          >
            {loading ? "Wird registriert..." : "Registrieren"}
          </button>
        </div>
      </form>

      <div className="pana-registration-footer">
        <p>
          Bereits ein Konto?{" "}
          <button onClick={handleLoginClick} className="pana-link-button">
            Anmelden
          </button>
        </p>
      </div>
    </div>
  );
};

export default Registration;
