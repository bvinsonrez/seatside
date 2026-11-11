import { useEffect, useState } from 'react';
import { Home, ListOrdered, Gift, UserRound } from 'lucide-react';
import { useDemo } from '../state/DemoContext';
import JoinScreen from './JoinScreen';
import LobbyScreen from './LobbyScreen';

export type FanScreen = 'join' | 'lobby' | 'predict' | 'trivia' | 'bingo' | 'ranks' | 'rewards' | 'profile';

const NAV: { id: FanScreen; label: string; Icon: typeof Home }[] = [
  { id: 'lobby', label: 'Play', Icon: Home },
  { id: 'ranks', label: 'Ranks', Icon: ListOrdered },
  { id: 'rewards', label: 'Rewards', Icon: Gift },
  { id: 'profile', label: 'Profile', Icon: UserRound },
];

export default function FanApp() {
  const { state } = useDemo();
  const [screen, setScreen] = useState<FanScreen>('lobby');

  useEffect(() => {
    setScreen('lobby');
  }, [state.currentFanId]);

  if (!state.currentFanId) return <JoinScreen />;

  const navActive = screen === 'predict' || screen === 'trivia' || screen === 'bingo' ? 'lobby' : screen;

  return (
    <>
      <main className="flex-1 overflow-y-auto">
        {screen === 'lobby' && <LobbyScreen go={setScreen} />}
        {screen !== 'lobby' && <div className="p-6 pt-12 text-sm text-slate-500">Coming up: {screen}</div>}
      </main>
      <nav className="grid grid-cols-4 border-t border-slate-200 bg-white pb-4 pt-2">
        {NAV.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setScreen(id)}
            className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold ${navActive === id ? 'text-[var(--team-primary)]' : 'text-slate-400'}`}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}
