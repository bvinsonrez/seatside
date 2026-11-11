import { useEffect, useState } from 'react';
import { Home, ListOrdered, Gift, UserRound } from 'lucide-react';
import { useDemo } from '../state/DemoContext';
import { isPresenterView } from '../state/reducer';
import JoinScreen from './JoinScreen';
import LobbyScreen from './LobbyScreen';
import PredictScreen from './PredictScreen';
import TriviaScreen from './TriviaScreen';
import BingoScreen from './BingoScreen';
import RanksScreen from './RanksScreen';
import RewardsScreen from './RewardsScreen';
import ProfileScreen from './ProfileScreen';

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

  const back = () => setScreen('lobby');
  const isGame = screen === 'predict' || screen === 'trivia' || screen === 'bingo';
  const canPlay = isPresenterView(state);
  const navActive = screen === 'predict' || screen === 'trivia' || screen === 'bingo' ? 'lobby' : screen;

  return (
    <>
      <main className="flex-1 overflow-y-auto">
        {screen === 'lobby' && <LobbyScreen go={setScreen} />}
        {isGame && !canPlay && (
          <p className="m-4 mt-12 rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
            You're viewing another fan. Use Back to my fan to keep playing.
          </p>
        )}
        {canPlay && screen === 'predict' && <PredictScreen onBack={back} />}
        {canPlay && screen === 'trivia' && <TriviaScreen onBack={back} />}
        {canPlay && screen === 'bingo' && <BingoScreen onBack={back} />}
        {screen === 'ranks' && <RanksScreen />}
        {screen === 'rewards' && <RewardsScreen />}
        {screen === 'profile' && <ProfileScreen />}
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
