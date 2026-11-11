import type { Seat, SeatLink, TicketOrder } from '../types';

const stripZeros = (v: string) => v.replace(/^0+(?=\d)/, '');

/** Trim, uppercase the row, and drop leading zeros so "06" and "6" match. */
export function normalizeSeat(s: Seat): Seat {
  return { section: stripZeros(s.section.trim()).toUpperCase(), row: s.row.trim().toUpperCase(), seat: stripZeros(s.seat.trim()).toUpperCase() };
}

const key = (s: Seat) => `${s.section}|${s.row}|${s.seat}`;

/**
 * Link a sign-up to tonight's ticket orders by seat. The holder's own seat is the account holder;
 * any other seat in the order is a probable guest of that holder ("seat match").
 */
export function matchSeat(orders: TicketOrder[], seat: Seat | null): SeatLink {
  if (!seat) return { kind: 'no-seat' };
  const n = normalizeSeat(seat);
  if (!n.section || !n.row || !n.seat) return { kind: 'no-seat' };
  const k = key(n);
  const order = orders.find((o) => o.seats.some((s) => key(normalizeSeat(s)) === k));
  if (!order) return { kind: 'no-match' };
  if (key(normalizeSeat(order.holderSeat)) === k) return { kind: 'holder', orderId: order.id };
  return { kind: 'seat-match', orderId: order.id, holderName: order.holderName };
}
