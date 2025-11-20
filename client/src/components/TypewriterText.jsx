import { useState, useEffect } from 'react';

const TypewriterText = ({ text, speed = 50 }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <div className="font-mono text-blue-700 font-semibold whitespace-pre-wrap">
      {displayedText}
      <span className="animate-pulse">|</span>
    </div>
  );
};

export default TypewriterText;
