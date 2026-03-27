import React from 'react';

const colorMap = {
  // Client status
  Client: { bg: '#dcfce7', color: '#15803d' },
  Prospect: { bg: '#fef3c7', color: '#b45309' },
  Lead: { bg: '#e0e7ff', color: '#4338ca' },
  Inactive: { bg: '#f1f5f9', color: '#64748b' },
  // Policy status
  Active: { bg: '#dcfce7', color: '#15803d' },
  Pending: { bg: '#fef3c7', color: '#b45309' },
  Lapsed: { bg: '#fee2e2', color: '#dc2626' },
  Cancelled: { bg: '#f1f5f9', color: '#64748b' },
  Issued: { bg: '#ede9fe', color: '#7c3aed' },
  // Priority
  High: { bg: '#fee2e2', color: '#dc2626' },
  Medium: { bg: '#fef3c7', color: '#b45309' },
  Low: { bg: '#f1f5f9', color: '#64748b' },
  // Pipeline
  'Quote Sent': { bg: '#ede9fe', color: '#7c3aed' },
  'Application Submitted': { bg: '#dbeafe', color: '#1d4ed8' },
};

export default function Badge({ label, size = 'md' }) {
  const style = colorMap[label] || { bg: '#f1f5f9', color: '#64748b' };
  const fontSize = size === 'sm' ? '0.7rem' : '0.75rem';
  const padding = size === 'sm' ? '2px 6px' : '3px 8px';

  return (
    <span style={{
      backgroundColor: style.bg,
      color: style.color,
      fontSize,
      fontWeight: 600,
      padding,
      borderRadius: '20px',
      display: 'inline-block',
      lineHeight: 1.4,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}
