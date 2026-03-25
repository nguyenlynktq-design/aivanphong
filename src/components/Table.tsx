import React from 'react';
import { cn } from '../lib/utils';

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export const Table = ({ headers, children, className }: TableProps) => {
  return (
    <div className={cn("admin-card overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-border-light">
              {headers.map((header, i) => (
                <th key={i} className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const TableRow = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => {
  return (
    <tr 
      className={cn("hover:bg-slate-50/50 transition-colors group cursor-pointer", className)}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

export const TableCell = ({ children, className, align = 'left', colSpan }: { children: React.ReactNode, className?: string, align?: 'left' | 'right' | 'center', colSpan?: number }) => {
  return (
    <td 
      colSpan={colSpan}
      className={cn(
        "px-6 py-4 text-sm text-text-main",
        align === 'right' && "text-right",
        align === 'center' && "text-center",
        className
      )}
    >
      {children}
    </td>
  );
};
