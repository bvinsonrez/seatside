import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../src/App';

const phone = () => within(screen.getByTestId('phone-frame'));
const nav = (name: string) => fireEvent.click(phone().getByRole('button', { name }));

function join(scan = true) {
  render(<App />);
  fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Pat Demo' } });
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'pat@example.com' } });
  if (scan) fireEvent.click(phone().getByRole('button', { name: /scan the code on your seat/i }));
  fireEvent.click(phone().getByRole('button', { name: /join tonight's game/i }));
}

test('section battle highlights my section', () => {
  join();
  nav('Ranks');
  const mine = phone().getByTestId('rank-row-mine');
  expect(mine).toHaveTextContent('112');
});

test('no-seat fan sees add-your-seat prompt', () => {
  join(false);
  nav('Ranks');
  expect(phone().getByText(/add your seat to join the battle/i)).toBeInTheDocument();
});

test('crew tab lists the order holder for a qrSeat fan', () => {
  join();
  nav('Ranks');
  fireEvent.click(phone().getByRole('tab', { name: 'Crew' }));
  expect(phone().getByText('Dana Whitfield')).toBeInTheDocument();
});

test('crew tab empty state for unlinked fan', () => {
  join(false);
  nav('Ranks');
  fireEvent.click(phone().getByRole('tab', { name: 'Crew' }));
  expect(phone().getByText(/no crew linked to your seat yet/i)).toBeInTheDocument();
});

test('redeem moves an unlocked reward to redeemed', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /view returning fan/i }));
  nav('Rewards');
  const card = phone().getAllByTestId('reward-card')[0];
  fireEvent.click(within(card).getByRole('button', { name: /redeem/i }));
  expect(card).toHaveTextContent(/redeemed/i);
});

test('locked rewards cannot be redeemed', () => {
  join();
  nav('Rewards');
  const card = phone().getAllByTestId('reward-card')[0];
  expect(within(card).queryByRole('button', { name: /redeem/i })).toBeNull();
  expect(card).toHaveTextContent(/more points/i);
});

test('returning fan profile shows 6 games attended', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /view returning fan/i }));
  nav('Profile');
  expect(phone().getByTestId('games-attended')).toHaveTextContent('6');
});

test('first-game profile shows the come-back line', () => {
  join();
  nav('Profile');
  expect(phone().getByTestId('games-attended')).toHaveTextContent('1');
  expect(phone().getByText(/come back next game to start your streak/i)).toBeInTheDocument();
});
