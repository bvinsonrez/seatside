import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../src/App';
import { qrSeat } from '../src/data/seed';

const fill = (label: RegExp, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const phone = () => within(screen.getByTestId('phone-frame'));

test('scan fills the seat fields with qrSeat', () => {
  render(<App />);
  fireEvent.click(phone().getByRole('button', { name: /scan the code on your seat/i }));
  expect(screen.getByLabelText(/section/i)).toHaveValue(qrSeat.section);
  expect(screen.getByLabelText(/^row/i)).toHaveValue(qrSeat.row);
  expect(screen.getByLabelText(/^seat/i)).toHaveValue(qrSeat.seat);
  expect(phone().getByText(/seat found/i)).toBeInTheDocument();
});

test('join button disabled until name and email are filled', () => {
  render(<App />);
  const join = phone().getByRole('button', { name: /join tonight's game/i });
  expect(join).toBeDisabled();
  fill(/your name/i, 'Pat Demo');
  expect(join).toBeDisabled();
  fill(/email/i, 'pat@example.com');
  expect(join).toBeEnabled();
});

test('joining with the scanned seat shows the lobby and the dashboard receives the fan', () => {
  render(<App />);
  fill(/your name/i, 'Pat Demo');
  fill(/email/i, 'pat@example.com');
  fireEvent.click(phone().getByRole('button', { name: /scan the code on your seat/i }));
  fireEvent.click(phone().getByRole('button', { name: /join tonight's game/i }));
  expect(phone().getByText(/points tonight/i)).toBeInTheDocument();
  expect(within(screen.getByTestId('dashboard')).getAllByText('Pat Demo').length).toBeGreaterThan(0);
});

test('join without seat is allowed', () => {
  render(<App />);
  fill(/your name/i, 'Pat Demo');
  fill(/email/i, 'pat@example.com');
  fireEvent.click(phone().getByRole('button', { name: /join tonight's game/i }));
  expect(phone().getByText(/points tonight/i)).toBeInTheDocument();
  expect(phone().getByText(/add your seat/i)).toBeInTheDocument();
});

test('lobby shows the live break with its sponsor', () => {
  render(<App />);
  fill(/your name/i, 'Pat Demo');
  fill(/email/i, 'pat@example.com');
  fireEvent.click(phone().getByRole('button', { name: /join tonight's game/i }));
  expect(phone().getByText(/next up at the tv timeout/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /next break/i }));
  expect(phone().getByText('Power Prediction')).toBeInTheDocument();
  expect(phone().getAllByText(/sample sponsor/i).length).toBeGreaterThan(0);
});
