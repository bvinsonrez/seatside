import { useMemo, useState } from 'react';
import { useDemo } from '../state/DemoContext';
import { activeBreak } from '../state/selectors';
import { TRIVIA_POINTS_PER_CORRECT } from '../domain/scoring';
import GameHeader from './GameHeader';
import { useCountdown } from './useCountdown';

const PER_ROUND = 3;
const SECONDS = 15;

export default function TriviaScreen({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useDemo();
  const brk = activeBreak(state);
  const isTrivia = brk?.mode === 'trivia';
  const done = isTrivia && state.play.triviaDoneBreakIds.includes(brk.id);
  const questions = useMemo(() => {
    const n = state.pack.trivia.length;
    const start = ((state.activeBreakIndex * PER_ROUND) % n + n) % n;
    return Array.from({ length: PER_ROUND }, (_, i) => state.pack.trivia[(start + i) % n]);
  }, [state.pack, state.activeBreakIndex]);

  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const answering = isTrivia && !done && !finished && picked === null;
  const left = useCountdown(SECONDS, answering, i);
  const timedOut = answering && left === 0;
  const revealed = picked !== null || timedOut;
  const q = questions[i];

  const pick = (idx: number) => {
    if (revealed) return;
    setPicked(idx);
    if (idx === q.answerIndex) setCorrect((c) => c + 1);
  };

  const next = () => {
    if (i + 1 < questions.length) {
      setI(i + 1);
      setPicked(null);
    } else {
      setFinished(true);
      dispatch({ type: 'completeTrivia', correctCount: correct });
    }
  };

  return (
    <div>
      <GameHeader title={isTrivia ? brk.label : 'Trivia'} sponsorId={isTrivia ? brk.sponsorId : undefined} onBack={onBack} />
      <div className="p-4">
        {!isTrivia && <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">Trivia opens at the next {state.pack.terms.breakName}.</p>}

        {isTrivia && (finished || done) && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Round complete</p>
            {finished ? (
              <>
                <p className="mt-2 text-2xl font-extrabold">{correct} of {questions.length} right</p>
                <p className="text-4xl font-black text-emerald-600">+{correct * TRIVIA_POINTS_PER_CORRECT}</p>
              </>
            ) : (
              <p className="mt-2 text-lg font-bold">You've played this round.</p>
            )}
          </div>
        )}

        {isTrivia && !finished && !done && (
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Question {i + 1} of {questions.length}</span>
              <span className={left <= 5 && !revealed ? 'text-rose-600' : ''}>{revealed ? '' : `${left}s`}</span>
            </div>
            <p data-testid="trivia-question" className="text-lg font-bold leading-snug">{q.question}</p>
            <div className="mt-4 space-y-2">
              {q.choices.map((c, idx) => {
                const state =
                  !revealed ? 'bg-slate-100 hover:bg-slate-200'
                  : idx === q.answerIndex ? 'bg-emerald-500 text-white'
                  : idx === picked ? 'bg-rose-500 text-white'
                  : 'bg-slate-100 opacity-50';
                return (
                  <button key={c} onClick={() => pick(idx)} className={`w-full rounded-xl px-4 py-3 text-left font-semibold ${state}`}>
                    {c}
                  </button>
                );
              })}
            </div>
            {timedOut && <p className="mt-3 text-sm font-semibold text-rose-600">Time's up.</p>}
            {revealed && (
              <button onClick={next} className="mt-4 w-full rounded-xl bg-[var(--team-primary)] py-3 font-bold text-white">
                {i + 1 < questions.length ? 'Next question' : 'See score'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
