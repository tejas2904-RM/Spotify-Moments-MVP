import { useEffect, useState } from 'react';

const TOAST_SUBTITLES: Record<string, string> = {
  'Exploration Increased': 'Session opened to more discovery tracks',
  'Returning to familiar music': 'Based on your skip timing this session',
};

interface Props {
  message?: string;
}

export function SessionToast({ message }: Props) {
  const [visible, setVisible] = useState(!!message);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  if (!visible || !message) return null;

  const subtitle = TOAST_SUBTITLES[message];

  return (
    <div className="session-toast" role="status">
      <span className="session-toast-title">{message}</span>
      {subtitle && <span className="session-toast-sub">{subtitle}</span>}
    </div>
  );
}
