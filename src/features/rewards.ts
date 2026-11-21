// Which passport rewards are earned or claimed, and where they can be used.
// A reward is claimed once, for one venue, with a swipe on its ticket; that is
// kept on this phone.
import type { CultureVenue } from '../data/culture';
import { CULTURE_VENUES } from '../data/cultureVenues';
import { REWARDS, type Reward } from '../data/rewards';
import { distanceMeters } from '../platform/geoMath';
import { getState, setState, type AppState } from '../state/store';

type Passport = Pick<AppState, 'stamps' | 'rewardsClaimed'>;

/** When the reward was earned: the time of the stamp that reached its count, or null. */
export function unlockedAt(reward: Reward, s: Passport): number | null {
    const times = Object.values(s.stamps).sort((a, b) => a - b);
    return times.length >= reward.stamps ? times[reward.stamps - 1] : null;
}

/** How many rewards are earned but not yet claimed. */
export function unclaimedCount(s: Passport): number {
    return REWARDS.filter((r) => unlockedAt(r, s) !== null && s.rewardsClaimed[r.stamps] === undefined).length;
}

/** The next reward still to earn, or null when all are earned. */
export function nextReward(s: Passport): Reward | null {
    const count = Object.keys(s.stamps).length;
    return REWARDS.find((r) => r.stamps > count) ?? null;
}

/** The reward a stamp count has just reached, if any. */
export function rewardAtCount(count: number): Reward | null {
    return REWARDS.find((r) => r.stamps === count) ?? null;
}

export const venueById = (id: number): CultureVenue | undefined => CULTURE_VENUES.find((v) => v.id === id);

/** The visitor's position (real or Demo Mode) when the app has one. */
export const knownPosition = (s: Pick<AppState, 'gps' | 'coords'>): [number, number] | null => (s.gps === 'active' && s.coords ? s.coords : null);

/** Metres from a position to a venue. */
export const metresToVenue = (from: [number, number], v: CultureVenue): number => distanceMeters(from[0], from[1], v.lat, v.lng);

/** The venues a reward can be used at: nearest first when the position is known, else by name. */
export function venuesFor(reward: Reward, from: [number, number] | null): CultureVenue[] {
    const venues = CULTURE_VENUES.filter((v) => reward.types.includes(v.type));
    return from ? venues.sort((a, b) => metresToVenue(from, a) - metresToVenue(from, b)) : venues.sort((a, b) => a.name.localeCompare(b.name, 'el'));
}

const code4 = (ms: number): string => ms.toString(36).slice(-4).toUpperCase().padStart(4, '0');

/** A short code for this passport, from its first stamp. */
export function passportCode(s: Passport): string {
    const first = Math.min(...Object.values(s.stamps));
    return Number.isFinite(first) ? code4(first) : '----';
}

/** The claimed ticket's number, e.g. "03-N1SZ-K7Q2", or null before it is claimed. */
export function ticketNumber(reward: Reward, s: Passport): string | null {
    const claimed = s.rewardsClaimed[reward.stamps];
    return claimed === undefined ? null : `${String(reward.stamps).padStart(2, '0')}-${passportCode(s)}-${code4(claimed.at)}`;
}

/** Claim an earned reward for one of its venues. */
export function claimReward(index: number, venueId: number): void {
    const s = getState();
    const reward = REWARDS[index];
    const venue = venueById(venueId);
    if (!reward || !venue || !reward.types.includes(venue.type)) return;
    if (unlockedAt(reward, s) === null || s.rewardsClaimed[reward.stamps] !== undefined) return;
    setState({ rewardsClaimed: { ...s.rewardsClaimed, [reward.stamps]: { at: Date.now(), venue: venueId } } });
}
