import { useEffect } from 'react';
import { X } from 'lucide-react';
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
        <button className="chart-modal-close" onClick={onClose}><X size={16} strokeWidth={2.25} /> Close</button>
        <FullChart progress={progress} />
      </div>
    </div>
  );
}
