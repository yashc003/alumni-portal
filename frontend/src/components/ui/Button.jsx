import React from 'react';

/*
 * ============================================================
 * 🔘 Button.jsx — Reusable UI Component
 * ============================================================
 * Why reusable components?
 * Instead of copy-pasting the long string of Tailwind classes
 * for every button, we create ONE component.
 * 
 * If we ever want to change how buttons look (e.g., make them rounder),
 * we only change it here, and the entire app updates!
 *
 * Props:
 * - children: the text or elements inside the button (e.g., "Submit")
 * - variant: "primary", "secondary", or "danger"
 * - className: allows adding extra custom classes when using the button
 * - ...props: captures any other standard button attributes (onClick, disabled, type)
 * ============================================================
 */

export function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) {
  
  // Base classes that apply to ALL buttons
  const baseClasses = "inline-flex items-center justify-center font-medium py-2.5 px-5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed";
  
  // Specific classes based on the "variant"
  const variants = {
    primary: "bg-primary-600 hover:bg-primary-500 text-white shadow-sm focus:ring-primary-500",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200 focus:ring-gray-500",
    danger: "bg-red-600 hover:bg-red-500 text-white shadow-sm focus:ring-red-500"
  };

  // Combine them all
  const combinedClasses = `${baseClasses} ${variants[variant]} ${className}`;

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
}
