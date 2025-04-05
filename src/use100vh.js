// filepath: /Users/sumo/leave-time-system-copy-copy/src/hooks/use100vh.js
import React from 'react';
import { useWindowSize } from 'react-use';

// 100vh is broken on mobile (Chrome, Safari):
// https://chanind.github.io/javascript/2019/09/28/avoid-100vh-on-mobile-web.html

export default function use100vh() {
  const ref = React.useRef();
  const { height } = useWindowSize();

  React.useEffect(() => {
    if (!ref.current) {
      return;
    }
    ref.current.style.minHeight = height + 'px';
  }, [height]);

  return ref;
}