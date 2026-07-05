import { useEffect, useState } from 'react';

export function SessionToast({ message }: { message?: string }) {
  const [visible, setVisible] = useState(!!message);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(timer);
  }, [message]);

  if (!visible || !message) return null;

  return <div className="session-toast">{message}</div>;
}
