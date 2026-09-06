import { type ComponentChildren, createContext } from 'preact';
import { useEffect, useState } from 'preact/hooks';

export const CoverageNow = createContext<string | null>(null);

/** One transient clock for page and cards; no network or persisted state. */
export function CoverageClock({ children }: { children: ComponentChildren }) {
  const [now, setNow] = useState(() => new Date().toISOString());
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      clearTimeout(timer);
      const instant = Date.now();
      setNow(new Date(instant).toISOString());
      const day = 86_400_000;
      const seoulOffset = 9 * 60 * 60 * 1000;
      const nextMidnight = (Math.floor((instant + seoulOffset) / day) + 1) * day - seoulOffset;
      timer = setTimeout(refresh, nextMidnight - instant);
    };
    refresh();
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  return <CoverageNow.Provider value={now}>{children}</CoverageNow.Provider>;
}
