import { useEffect } from 'react';
import { Lock, CheckCircle2, XCircle } from 'lucide-react';
import { useDemo } from '../state/DemoContext';
import { activeBreak } from '../state/selectors';
import { PREDICTION_POINTS } from '../domain/scoring';
import GameHeader from './GameHeader';
import { useCountdown } from './useCountdown';
import { celebrate } from './celebrate';

const SECONDS = 12;

export default function PredictScreen({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useDemo();
  const brk = activeBreak(state);
  const pred = state.play.prediction;
  const open = brk?.mode === 'prediction' && !pred;
  const left = useCountdown(SECONDS, open, brk?.id);
  const sponsorId = brk?.mode === 'prediction' ? brk.sponsorId : state.pack.breaks.find((b) => b.mode === 'prediction')?.sponsorId;

  useEffect(() => {
    if (pred?.result === 'correct') celebrate();
  }, [pred?.result]);

  return (
    <div>
      <GameHeader title={brk?.mode === 'prediction' ? brk.label : 'Prediction'} sponsorId={sponsorId} onBack={onBack} />
      <div className="p-4">
        {!pred && brk?.mode !== 'prediction' && (
          <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">Predictions open at the next {state.pack.terms.breakName}.</p>
        )}

        {open && (
          <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
            <p className="text-lg font-bold">{state.pack.predictionPrompt}</p>
            <div className={`mx-auto my-4 flex h-20 w-20 items-center justify-center rounded-full border-4 text-3xl font-black transition-colors ${left > 5 ? 'border-[var(--team-primary)]' : 'border-rose-500 text-rose-600'}`}>
              {left}
            </div>
            {left === 0 && <p className="mb-2 text-sm font-semibold text-rose-600">Time's up. Catch the next one.</p>}
            <div className="grid grid-cols-2 gap-3">
              {state.pack.predictionOptions.map((o) => (
                <button
                  key={o}
                  disabled={left === 0}
                  onClick={() => dispatch({ type: 'lockPrediction', choice: o })}
                  className="rounded-xl bg-slate-100 px-3 py-4 font-semibold hover:bg-slate-200 disabled:opacity-40"
                >
                  {o}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-400">Right call = {PREDICTION_POINTS} points</p>
          </div>
        )}

        {pred?.result === 'pending' && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <Lock className="mx-auto text-emerald-500" size={36} />
            <p className="mt-2 text-xl font-extrabold">Locked: {pred.choice}</p>
            <p className="text-sm text-slate-500">Waiting on the next play...</p>
          </div>
        )}

        {pred && pred.result !== 'pending' && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            {pred.result === 'correct' ? (
              <>
                <CheckCircle2 className="mx-auto text-emerald-500" size={40} />
                <p className="mt-2 text-xl font-extrabold">You called it!</p>
                <p className="text-4xl font-black text-emerald-600">+{PREDICTION_POINTS}</p>
              </>
            ) : (
              <>
                <XCircle className="mx-auto text-rose-500" size={40} />
                <p className="mt-2 text-xl font-extrabold">Not this time</p>
              </>
            )}
            <p className="mt-2 text-sm text-slate-500">You picked {pred.choice}. {state.lastEventLabel}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
