import React from 'react';

export default function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p style={{
      margin: '6px 0 0',
      fontSize: 12,
      color: '#dc2626',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: 5,
    }}>
      <span style={{ fontSize: 14 }}>⚠</span> {error}
    </p>
  );
}
