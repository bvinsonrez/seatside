import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';
import { hockey } from '../src/content/hockey';

test('presenter bar is not inside the phone frame', () => {
  render(<App />);
  const phone = screen.getByTestId('phone-frame');
  const bar = screen.getByTestId('presenter-bar');
  expect(phone.contains(bar)).toBe(false);
  expect(screen.getByTestId('dashboard')).toBeInTheDocument();
});

test('Next play is disabled after the last event', () => {
  render(<App />);
  const btn = screen.getByRole('button', { name: /next play/i });
  for (let i = 0; i < hockey.events.length; i++) fireEvent.click(btn);
  expect(btn).toBeDisabled();
});

test('Next break is disabled after the last break', () => {
  render(<App />);
  const btn = screen.getByRole('button', { name: /next break/i });
  for (let i = 0; i < hockey.breaks.length; i++) fireEvent.click(btn);
  expect(btn).toBeDisabled();
});

test('theme variable is set from config', () => {
  render(<App />);
  const stage = screen.getByTestId('demo-stage');
  expect(stage.style.getPropertyValue('--team-primary')).toBe('#0B3D91');
});
