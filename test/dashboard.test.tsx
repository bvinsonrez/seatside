import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../src/App';
import { hockey } from '../src/content/hockey';

const phone = () => within(screen.getByTestId('phone-frame'));
const dash = () => within(screen.getByTestId('dashboard'));
const presenter = (name: RegExp) => fireEvent.click(within(screen.getByTestId('presenter-bar')).getByRole('button', { name }));

function join(seat: { section: string; row: string; seat: string } | 'scan' | null) {
  fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Pat Demo' } });
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'pat@example.com' } });
  if (seat === 'scan') fireEvent.click(phone().getByRole('button', { name: /scan the code on your seat/i }));
  else if (seat) {
    fireEvent.change(screen.getByLabelText(/section/i), { target: { value: seat.section } });
    fireEvent.change(screen.getByLabelText(/^row/i), { target: { value: seat.row } });
    fireEvent.change(screen.getByLabelText(/^seat/i), { target: { value: seat.seat } });
  }
  fireEvent.click(phone().getByRole('button', { name: /join tonight's game/i }));
}

test('new sign-up appears first with Probable guest wording and Seat match chip', () => {
  render(<App />);
  join('scan');
  const first = dash().getAllByTestId('fan-row')[0];
  expect(first).toHaveTextContent('Pat Demo');
  expect(first).toHaveTextContent('Probable guest of Dana Whitfield');
  expect(first).toHaveTextContent('Seat match');
  expect(first).toHaveAttribute('data-highlight', 'true');
});

test('holder sign-in shows Account holder and no Seat match chip', () => {
  render(<App />);
  join({ section: '112', row: 'F', seat: '4' });
  const first = dash().getAllByTestId('fan-row')[0];
  expect(first).toHaveTextContent('Account holder');
  expect(first).not.toHaveTextContent('Seat match');
});

test('typed seat with no order shows No seat match', () => {
  render(<App />);
  join({ section: '300', row: 'A', seat: '1' });
  expect(dash().getAllByTestId('fan-row')[0]).toHaveTextContent('No seat match');
});

test('shadow fan tile increments after a qrSeat sign-up', () => {
  render(<App />);
  const before = Number(dash().getByTestId('tile-shadow').dataset.value);
  join('scan');
  expect(Number(dash().getByTestId('tile-shadow').dataset.value)).toBe(before + 1);
});

test('sponsor card plays increments after playing the active break', () => {
  render(<App />);
  join('scan');
  presenter(/next break/i);
  const card = () => dash().getByTestId(`sponsor-card-${hockey.breaks[0].id}`);
  const before = Number(within(card()).getByTestId('stat-plays').dataset.value);
  fireEvent.click(phone().getByRole('button', { name: /play now/i }));
  fireEvent.click(phone().getByRole('button', { name: hockey.predictionOptions[0] }));
  expect(Number(within(card()).getByTestId('stat-plays').dataset.value)).toBe(before + 1);
});

test('End game shows prize owed line', () => {
  render(<App />);
  expect(dash().queryByText(/prize owed to/i)).toBeNull();
  presenter(/end game/i);
  expect(dash().getByText(/prize owed to \d+ fans in section \d+/i)).toBeInTheDocument();
});

test('no text on the dashboard contains "confirmed" or "verified"', () => {
  render(<App />);
  join('scan');
  expect(screen.getByTestId('dashboard').textContent).not.toMatch(/confirmed|verified/i);
});
