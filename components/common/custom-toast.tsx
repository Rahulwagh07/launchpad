import type { JSX } from "react";
export const customToast = (message: string, icon: JSX.Element) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <span style={{ marginRight: '8px' }}>{icon}</span>
    {message}
  </div>
);
