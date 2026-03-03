import { useEffect, useRef, useState } from "react";

export function useTextOverflow() {
  const [hasOverflow, setHasOverflow] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current) {
        const element = textRef.current;
        const hasOverflow = element.scrollHeight > element.clientHeight;
        setHasOverflow(hasOverflow);
      }
    };

    checkOverflow();

    // Check again after a short delay to ensure content is loaded
    const timeout = setTimeout(checkOverflow, 100);

    return () => clearTimeout(timeout);
  }, []);

  return { textRef, hasOverflow };
}
