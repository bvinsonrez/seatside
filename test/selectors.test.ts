import { initialState, reducer } from '../src/state/reducer';
import { sectionStandings, crewFor, overallLeaderboard, currentFan } from '../src/state/selectors';
import { qrSeat, RETURNING_FAN_ID } from '../src/data/seed';
import { seasonPoints } from '../src/domain/scoring';

test('sectionStandings sorted desc', () => {
  const rows = sectionStandings(initialState());
  expect(rows.length).toBeGreaterThanOrEqual(5);
  for (let i = 1; i < rows.length; i++) expect(rows[i - 1].points).toBeGreaterThanOrEqual(rows[i].points);
});

test('crewFor qrSeat guest includes holder', () => {
  const s = reducer(initialState(), { type: 'signUp', name: 'Pat Demo', email: 'pat@example.com', seat: qrSeat });
  const crew = crewFor(s, s.currentFanId!);
  expect(crew.map((f) => f.name)).toContain('Dana Whitfield');
  expect(crew.map((f) => f.id)).toContain(s.currentFanId);
});

test('crewFor unlinked fan is []', () => {
  const s = reducer(initialState(), { type: 'signUp', name: 'Pat Demo', email: 'pat@example.com', seat: null });
  expect(crewFor(s, s.currentFanId!)).toEqual([]);
});

test('overallLeaderboard ranks returning fan by seasonPoints', () => {
  const s = reducer(initialState(), { type: 'viewAsFan', fanId: RETURNING_FAN_ID });
  const rows = overallLeaderboard(s);
  const me = rows.find((r) => r.fan.id === RETURNING_FAN_ID)!;
  expect(me.points).toBe(seasonPoints(currentFan(s)!));
  for (let i = 1; i < rows.length; i++) expect(rows[i - 1].points).toBeGreaterThanOrEqual(rows[i].points);
});
