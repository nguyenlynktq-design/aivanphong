import React from 'react';
import { cn } from '../lib/utils';
import { ChevronDown } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = ({ label, error, icon, className, ...props }: InputProps) => {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-bold text-text-main">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </div>
        )}
        <input 
          className={cn(
            "input-base",
            icon && "pl-10",
            error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
            className
          )} 
          {...props} 
        />
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string, label: string }[];
}

export const Select = ({ label, error, options, className, ...props }: SelectProps) => {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-bold text-text-main">{label}</label>}
      <div className="relative">
        <select 
          className={cn(
            "input-base appearance-none pr-10",
            error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
            className
          )} 
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export const TextArea = ({ label, error, className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string, error?: string }) => {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-bold text-text-main">{label}</label>}
      <textarea 
        className={cn(
          "input-base min-h-[120px] resize-y",
          error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
          className
        )} 
        {...props} 
      />
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};
