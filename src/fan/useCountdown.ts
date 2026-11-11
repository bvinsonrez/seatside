import { useEffect, useState } from 'react';

/** Counts down once per second from `seconds` while `running`. Restarts (in the same render) when `key` changes. */
export function useCountdown(seconds: number, running: boolean, key: unknown): number {
  const [state, setState] = useState({ key, left: seconds });
  if (state.key !== key) setState({ key, left: seconds });
  const left = state.key === key ? state.left : seconds;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setState((s) => ({ ...s, left: s.left <= 1 ? 0 : s.left - 1 })), 1000);
    return () => clearInterval(id);
  }, [running, key]);
  return left;
}
