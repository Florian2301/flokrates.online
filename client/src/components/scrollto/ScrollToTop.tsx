import './ScrollToTop.css';

import React, { useEffect, useRef, useState } from 'react';

import { ChevronUp } from 'lucide-react';

const ScrollToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number | null>(null);

  const handleScroll = () => {
    setVisible(true);

    // Reset Timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Button nach 3 Sekunden ohne Scroll wieder ausblenden
    timerRef.current = window.setTimeout(() => {
      setVisible(false);
    }, 3000);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      className={`chat-scroll-to-top-btn ${visible ? 'visible' : ''}`}
      onClick={scrollToTop}
      title="Scroll to top"
    >
      <ChevronUp size={24} />
    </button>
  );
};

export default ScrollToTop;
