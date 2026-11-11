import type { Reward, Sponsor } from '../types';

/** Fictional sample sponsors. Every placement in the UI is labeled "Sample sponsor". */
export const sponsors: Sponsor[] = [
  { id: 'sp-burger', name: 'Northside Burger Co.', category: 'Food' },
  { id: 'sp-cu', name: 'Summit Credit Union', category: 'Banking' },
  { id: 'sp-energy', name: 'Brightline Energy', category: 'Utilities' },
  { id: 'sp-cola', name: 'Fizz Cola', category: 'Beverage' },
];

export const rewards: Reward[] = [
  { id: 'rw-cola', name: '$5 off any Fizz Cola', sponsorId: 'sp-cola', unlockAt: 100 },
  { id: 'rw-fries', name: 'Free fries', sponsorId: 'sp-burger', unlockAt: 250 },
  { id: 'rw-scarf', name: 'Team scarf', sponsorId: 'sp-energy', unlockAt: 500 },
  { id: 'rw-upgrade', name: 'Seat upgrade next game', sponsorId: 'sp-cu', unlockAt: 1000 },
];

export const sponsorById = (id: string): Sponsor => sponsors.find((s) => s.id === id) ?? sponsors[0];
