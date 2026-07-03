import { useEffect } from 'react';
import FullChart from './FullChart.jsx';

export default function ChartModal({ progress, onClose }) {
  // Close on Escape key
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="chart-modal-backdrop" onClick={onClose}>
      <div className="chart-modal-sheet" onClick={e => e.stopPropagation()}>
        <button className="chart-modal-close" onClick={onClose}>✕ Close</button>
        <FullChart progress={progress} />
      </div>
    </div>
  );
}
