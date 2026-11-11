import type { TeamConfig } from '../types';

/** One place to rebrand the demo for a specific team pitch. All names here are fictional. */
export const teamConfig: TeamConfig = {
  appName: 'Seatside',
  home: { name: 'Harbor City Comets', short: 'HCC', primary: '#0B3D91', secondary: '#F2A900' },
  away: { name: 'Ridgeline Foxes', short: 'RLF' },
  venue: 'Lakeside Arena',
  tonightLabel: 'Tonight, 7:00 PM',
  nightSponsorId: 'sp-cu',
  sectionBattle: { sponsorId: 'sp-burger', prize: 'Free burger for everyone in the winning section' },
};
