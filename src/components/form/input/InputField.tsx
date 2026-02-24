import React, { forwardRef } from "react";

// ✨ Tambahan aman: extend atribut bawaan HTML input biar kompatibel dengan React Hook Form
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  name?: string;
  label?: string;
  hint?: string;
  success?: boolean;
  error?: boolean;
}

// ⬇️ tambahin forwardRef tanpa hapus logika lama
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      name,
      label,
      type = "text",
      placeholder,
      defaultValue,
      onChange,
      onBlur,
      disabled = false,
      success = false,
      error = false,
      hint,
      className = "",
      ...rest
    },
    ref
  ) => {
    let inputClasses = `h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${className}`;

    // Add styles for the different states
    if (disabled) {
      inputClasses += ` text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
    } else if (error) {
      inputClasses += ` text-error-800 border-error-500 focus:ring-3 focus:ring-error-500/10  dark:text-error-400 dark:border-error-500`;
    } else if (success) {
      inputClasses += ` text-success-500 border-success-400 focus:ring-success-500/10 focus:border-success-300  dark:text-success-400 dark:border-success-500`;
    } else {
      inputClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-gray-400 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800`;
    }

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}

        {/* ref dari forwardRef supaya bisa dipakai register() */}
        <input
          ref={ref}
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          defaultValue={defaultValue}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={`${inputClasses} ${className}`}
          {...rest}
        />

        {hint && (
          <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {hint}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;