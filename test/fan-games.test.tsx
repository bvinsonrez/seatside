import { render, screen, fireEvent, within, act } from '@testing-library/react';
import App from '../src/App';
import { hockey } from '../src/content/hockey';
import { sponsorById } from '../src/data/sponsors';

const phone = () => within(screen.getByTestId('phone-frame'));
const presenter = (name: RegExp) => fireEvent.click(within(screen.getByTestId('presenter-bar')).getByRole('button', { name }));

function joinAndOpen(breaks: number) {
  render(<App />);
  fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Pat Demo' } });
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'pat@example.com' } });
  fireEvent.click(phone().getByRole('button', { name: /join tonight's game/i }));
  for (let i = 0; i < breaks; i++) presenter(/next break/i);
  fireEvent.click(phone().getByRole('button', { name: /play now/i }));
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

test('prediction buttons disable after 12 seconds', () => {
  joinAndOpen(1);
  const option = phone().getByRole('button', { name: hockey.predictionOptions[0] });
  expect(option).toBeEnabled();
  act(() => vi.advanceTimersByTime(12_000));
  expect(option).toBeDisabled();
  expect(phone().getByText(/time's up/i)).toBeInTheDocument();
});

test('locking a prediction then Next play resolves it', () => {
  joinAndOpen(1);
  fireEvent.click(phone().getByRole('button', { name: hockey.events[0].predictionOutcome! }));
  expect(phone().getByText(/waiting on the next play/i)).toBeInTheDocument();
  presenter(/next play/i);
  expect(phone().getByText('+50')).toBeInTheDocument();
});

test('prediction screen shows its sponsor', () => {
  joinAndOpen(1);
  expect(phone().getByText(sponsorById(hockey.breaks[0].sponsorId).name)).toBeInTheDocument();
});

test('trivia round scores correct answers', () => {
  joinAndOpen(2);
  for (let i = 0; i < 3; i++) {
    const qText = phone().getByTestId('trivia-question').textContent!;
    const q = hockey.trivia.find((t) => t.question === qText)!;
    fireEvent.click(phone().getByRole('button', { name: q.choices[q.answerIndex] }));
    fireEvent.click(phone().getByRole('button', { name: i < 2 ? /next question/i : /see score/i }));
  }
  expect(phone().getByText('+60')).toBeInTheDocument();
  expect(phone().getByText(/3 of 3/i)).toBeInTheDocument();
});

test('trivia question times out as a miss', () => {
  joinAndOpen(2);
  act(() => vi.advanceTimersByTime(15_000));
  expect(phone().getByText(/time's up/i)).toBeInTheDocument();
});

test('bingo center square shows the sponsor', () => {
  joinAndOpen(3);
  const center = phone().getByTestId('bingo-square-4');
  expect(center).toHaveTextContent(sponsorById(hockey.breaks[2].sponsorId).name);
  expect(center).toHaveTextContent(/sample sponsor/i);
});

test('bingo marks squares from presenter plays', () => {
  joinAndOpen(3);
  presenter(/next play/i);
  const label = hockey.bingoSquares.find((b) => b.id === hockey.events[0].bingoSquareIds[0])!.label;
  expect(phone().getByText(label).closest('[data-marked]')).toHaveAttribute('data-marked', 'true');
});

test('reset during trivia returns to join', () => {
  const err = vi.spyOn(console, 'error').mockImplementation(() => {});
  joinAndOpen(2);
  presenter(/reset/i);
  act(() => vi.advanceTimersByTime(20_000));
  expect(phone().getByRole('button', { name: /join tonight's game/i })).toBeInTheDocument();
  expect(err).not.toHaveBeenCalled();
  err.mockRestore();
});
