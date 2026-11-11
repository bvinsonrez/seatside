import type { ReactNode } from 'react';

export default function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div data-testid="phone-frame" className="relative mx-auto w-[390px] max-w-full rounded-[3rem] bg-slate-950 p-3 shadow-2xl ring-1 ring-white/10">
      <div className="absolute left-1/2 top-3 z-20 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-slate-950" aria-hidden />
      <div className="relative flex h-[780px] max-h-[calc(100vh-9rem)] flex-col overflow-hidden rounded-[2.4rem] bg-slate-50 text-slate-900">
        {children}
      </div>
    </div>
  );
}
