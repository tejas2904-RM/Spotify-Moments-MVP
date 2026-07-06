import { useEffect, useState } from 'react';
import { SESSION_HINTS } from '../utils/greeting';

interface Props {
  sessionKey: string;
}

export function SessionHint({ sessionKey }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [sessionKey]);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % SESSION_HINTS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [sessionKey]);

  return (
    <p className="session-hint" key={`${sessionKey}-${index}`}>
      {SESSION_HINTS[index]}
    </p>
  );
}
