import React, { useState } from "react";
import { useCustomer } from "../../../contexts/CustomerContext";
import styles from "./AccountData.module.scss";

// ToDo: decide if we want to use titles in the form
type Title = "Miss" | "Ms" | "Mrs" | "Mr";

const AccountData = () => {
  const { customer } = useCustomer();

  const [formData, setFormData] = useState({
    firstName: customer?.firstName || "",
    lastName: customer?.lastName || "",
    email: customer?.email || "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.oldPassword) {
        newErrors.oldPassword = "Current password is required";
      }

      if (formData.newPassword.length < 8) {
        newErrors.newPassword = "Password must be at least 8 characters";
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("Form data submitted:", formData);

      setSuccessMessage("Account information updated successfully");

      setFormData({
        ...formData,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      console.log("Account deletion requested");
    }
  };

  return (
    <div className={styles.accountDataContainer}>
      <h2 className={styles.title}>Account data</h2>

      {successMessage && (
        <div className={styles.successMessage}>{successMessage}</div>
      )}

      <form onSubmit={handleSubmit} className={styles.accountForm}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={errors.firstName ? styles.errorInput : ""}
            />
            {errors.firstName && (
              <div className={styles.errorMessage}>{errors.firstName}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={errors.lastName ? styles.errorInput : ""}
            />
            {errors.lastName && (
              <div className={styles.errorMessage}>{errors.lastName}</div>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={errors.email ? styles.errorInput : ""}
          />
          {errors.email && (
            <div className={styles.errorMessage}>{errors.email}</div>
          )}
        </div>

        <div className={styles.passwordSection}>
          <div className={styles.formGroup}>
            <label htmlFor="oldPassword">Old password</label>
            <div className={styles.passwordInput}>
              <input
                type={showPassword ? "text" : "password"}
                id="oldPassword"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleInputChange}
                className={errors.oldPassword ? styles.errorInput : ""}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={togglePasswordVisibility}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.oldPassword && (
              <div className={styles.errorMessage}>{errors.oldPassword}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="newPassword">New password</label>
            <input
              type={showPassword ? "text" : "password"}
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className={errors.newPassword ? styles.errorInput : ""}
            />
            {errors.newPassword && (
              <div className={styles.errorMessage}>{errors.newPassword}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={errors.confirmPassword ? styles.errorInput : ""}
            />
            {errors.confirmPassword && (
              <div className={styles.errorMessage}>
                {errors.confirmPassword}
              </div>
            )}
          </div>
        </div>

        <div className={styles.deleteAccount}>
          <button
            type="button"
            className={styles.deleteButton}
            onClick={handleDeleteAccount}
          >
            Delete my account
          </button>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.saveButton}>
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountData;
