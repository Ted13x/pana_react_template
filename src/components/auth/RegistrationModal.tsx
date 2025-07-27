import React, { useState } from "react";
import { useStore } from "../../contexts/StoreContext";
import { register } from "../../services/customer";
import { RegistrationFormData } from "../../panaTypes";
import styles from "./RegistrationModal.module.scss";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { store } = useStore();
  const [formData, setFormData] = useState<RegistrationFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Sortiere die benutzerdefinierten Eigenschaften nach sortOrder
  const sortedCustomProperties = store?.customerCustomProperties?.sort(
    (a, b) => a.sortOrder - b.sortOrder
  ) || [];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCustomFieldChange = (field: string, value: string | File, type?: string) => {
    if (value instanceof File) {
      // Für Dateien speichern wir den Dateinamen
      setFormData(prev => ({
        ...prev,
        [field]: value.name
      }));
    } else if (type === 'number') {
      // Für Zahlen konvertieren wir zu Number
      const numValue = parseFloat(value);
      setFormData(prev => ({
        ...prev,
        [field]: isNaN(numValue) ? '' : numValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwörter stimmen nicht überein.");
      setIsLoading(false);
      return;
    }

    try {
      // Erstelle customPropertyValues Array
      const customPropertyValues = sortedCustomProperties
        .filter(prop => formData[`custom_${prop.id}`])
        .map(prop => {
          const value = formData[`custom_${prop.id}`];
          // Für Number-Felder übergeben wir den Number-Wert direkt
          if (prop.type === 'number' && typeof value === 'number') {
            return {
              propertyId: prop.id,
              value: value
            };
          }
          // Für alle anderen Felder als String
          return {
            propertyId: prop.id,
            value: value.toString()
          };
        });

      await register(
        formData.email,
        formData.firstName,
        formData.lastName,
        formData.password,
        customPropertyValues
      );
      
      onSuccess();
    } catch (error) {
      setError("Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderCustomField = (property: any) => {
    const fieldId = `custom_${property.id}`;
    
    const getInputType = (type: string) => {
      switch (type) {
        case 'email':
          return 'email';
        case 'number':
          return 'number';
        case 'date':
          return 'date';
        case 'file':
          return 'file';
        default:
          return 'text';
      }
    };


    
    return (
      <div key={property.id} className={styles.formGroup}>
        <label htmlFor={fieldId}>
          {property.name}
          {property.required && <span className={styles.required}>*</span>}
        </label>
        <input
          id={fieldId}
          type={getInputType(property.type)}
          value={property.type === 'file' ? undefined : (formData[fieldId] || "")}
          onChange={(e) => {
            if (property.type === 'file') {
              const file = e.target.files?.[0];
              if (file) {
                handleCustomFieldChange(fieldId, file);
              }
            } else if (property.type === 'number') {
              handleCustomFieldChange(fieldId, e.target.value, 'number');
            } else {
              handleInputChange(fieldId, e.target.value);
            }
          }}
          required={property.required}
          className={styles.formInput}
          accept={property.type === 'file' ? '*' : undefined}
        />
      </div>
    );
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
        onClick={handleOverlayClick}
      />
      
      {/* Registration Modal */}
      <div className={`${styles.registrationModal} ${isOpen ? styles.registrationModalOpen : ''}`}>
        {/* Fixed Header */}
        <div className={styles.registrationHeader}>
          <h2 className={styles.registrationTitle}>REGISTRIERUNG</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className={styles.registrationContent}>
          <form onSubmit={handleSubmit} className={styles.registrationForm}>
            {error && <div className={styles.errorMessage}>{error}</div>}
            
            {/* Standard-Felder */}
            <div className={styles.formGroup}>
              <label htmlFor="firstName">
                Vorname <span className={styles.required}>*</span>
              </label>
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                required
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="lastName">
                Nachname <span className={styles.required}>*</span>
              </label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                required
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">
                E-Mail <span className={styles.required}>*</span>
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">
                Passwort <span className={styles.required}>*</span>
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">
                Passwort bestätigen <span className={styles.required}>*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                required
                className={styles.formInput}
              />
            </div>

            {/* Benutzerdefinierte Felder */}
            {sortedCustomProperties.map(renderCustomField)}

            <div className={styles.formActions}>
              <button
                type="submit"
                disabled={isLoading}
                className={styles.submitButton}
              >
                {isLoading ? "Registriere..." : "Registrieren"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className={styles.cancelButton}
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default RegistrationModal; 