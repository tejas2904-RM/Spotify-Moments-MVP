import { useState } from 'react';

interface Props {
  onRefine: (text: string) => void;
  sessionMessage?: string;
}

export function RefinePanel({ onRefine, sessionMessage }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');

  const handleApply = () => {
    if (!text.trim()) return;
    onRefine(text);
    setText('');
  };

  return (
    <section className="card refine">
      <button type="button" className="refine-toggle" onClick={() => setOpen(!open)}>
        Refine this Session {open ? '▴' : '▾'}
      </button>
      {open && (
        <div className="refine-form">
          <input
            type="text"
            placeholder='e.g. "Something upbeat but not EDM"'
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          />
          <button type="button" className="btn-primary" onClick={handleApply}>
            Apply
          </button>
        </div>
      )}
      {sessionMessage && <p className="session-msg">{sessionMessage}</p>}
    </section>
  );
}
