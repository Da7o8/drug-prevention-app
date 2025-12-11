import React from 'react';
import type { InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, ...rest }) => {
  return (
    <div className={styles.inputGroup}>
      <label className={styles.label}>{label}</label>
      <input className={`${styles.input} ${error ? styles.inputError : ''}`} {...rest} />
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
};

export default Input;