import { useState, type CSSProperties } from 'react';
import { Smartphone, LayoutDashboard } from 'lucide-react';
import { useDemo } from '../state/DemoContext';
import PresenterBar from './PresenterBar';
import PhoneFrame from './PhoneFrame';
import FanApp from '../fan/FanApp';
import Dashboard from '../team/Dashboard';

export default function DemoStage() {
  const { state } = useDemo();
  const [tab, setTab] = useState<'fan' | 'team'>('fan');
  const style = { '--team-primary': state.config.home.primary, '--team-secondary': state.config.home.secondary } as CSSProperties;
  const tabBtn = (t: 'fan' | 'team') =>
    `flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${tab === t ? 'bg-white text-slate-900' : 'text-slate-300'}`;

  return (
    <div data-testid="demo-stage" style={style} className="min-h-screen bg-slate-800 text-slate-100">
      <PresenterBar />
      <div className="mx-4 mt-3 flex gap-1 rounded-xl bg-slate-900 p-1 lg:hidden">
        <button className={tabBtn('fan')} onClick={() => setTab('fan')}><Smartphone size={16} /> Fan</button>
        <button className={tabBtn('team')} onClick={() => setTab('team')}><LayoutDashboard size={16} /> Team</button>
      </div>
      <div className="flex flex-col gap-6 p-4 lg:flex-row lg:items-start lg:gap-8 lg:p-6">
        <div className={`${tab === 'fan' ? 'block' : 'hidden'} lg:block lg:shrink-0`}>
          <PhoneFrame>
            <FanApp />
          </PhoneFrame>
        </div>
        <div className={`${tab === 'team' ? 'block' : 'hidden'} min-w-0 flex-1 lg:block`}>
          <Dashboard />
        </div>
      </div>
    </div>
  );
}
