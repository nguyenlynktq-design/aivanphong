import React from 'react';
import { cn } from '../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const Card = ({ children, className, title, subtitle, icon }: CardProps) => {
  return (
    <div className={cn("admin-card p-6", className)}>
      {(title || icon) && (
        <div className="flex items-center gap-4 mb-6">
          {icon && (
            <div className="w-12 h-12 bg-red-50 text-brand-red rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
              {icon}
            </div>
          )}
          <div>
            {title && <h3 className="text-lg font-bold text-brand-dark">{title}</h3>}
            {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export const StatCard = ({ title, value, icon, trend, trendValue }: { title: string, value: string, icon: React.ReactNode, trend?: 'up' | 'down', trendValue?: string }) => {
  return (
    <Card className="flex flex-col justify-between h-full">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-text-muted">{title}</p>
          <h2 className="text-3xl font-black text-brand-dark">{value}</h2>
        </div>
        <div className="p-3 bg-slate-50 text-brand-red rounded-xl">
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2 text-xs font-bold">
          <span className={cn(
            "px-2 py-0.5 rounded-full",
            trend === 'up' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
          )}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </span>
          <span className="text-text-muted">so với tháng trước</span>
        </div>
      )}
    </Card>
  );
};
