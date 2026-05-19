import React from 'react';

export const AdminTable = ({ headers, children }) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-white/5 bg-surface shadow-xl">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr className="border-b border-white/5 bg-white/5 text-xs font-bold uppercase tracking-widest text-text-muted">
            {headers.map((header, index) => (
              <th key={index} className="px-6 py-4">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-sm text-text">
          {children}
        </tbody>
      </table>
    </div>
  );
};
