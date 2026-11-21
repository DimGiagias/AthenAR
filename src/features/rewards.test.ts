import { describe, expect, it } from 'vitest';
import { CULTURE_VENUES } from '../data/cultureVenues';
import { REWARDS } from '../data/rewards';
import { nextReward, passportCode, rewardAtCount, ticketNumber, unclaimedCount, unlockedAt, venuesFor } from './rewards';

/** `n` stamps collected one minute apart, in a shuffled order of exhibits. */
const stamps = (n: number): Record<number, number> => Object.fromEntries(Array.from({ length: n }, (_, i) => [(i * 7) % 11, 1000 + i * 60000]));
const claim = (at: number) => ({ at, venue: 0 });

describe('unlockedAt', () => {
    it('is null below the stamp count', () => {
        expect(unlockedAt(REWARDS[0], { stamps: stamps(2), rewardsClaimed: {} })).toBeNull();
    });
    it('is the time of the stamp that reached the count', () => {
        expect(unlockedAt(REWARDS[0], { stamps: stamps(5), rewardsClaimed: {} })).toBe(1000 + 2 * 60000);
    });
});

describe('unclaimedCount', () => {
    it('counts earned rewards not yet claimed', () => {
        expect(unclaimedCount({ stamps: stamps(2), rewardsClaimed: {} })).toBe(0);
        expect(unclaimedCount({ stamps: stamps(6), rewardsClaimed: {} })).toBe(2);
        expect(unclaimedCount({ stamps: stamps(6), rewardsClaimed: { 3: claim(5) } })).toBe(1);
        expect(unclaimedCount({ stamps: stamps(6), rewardsClaimed: { 3: claim(5), 6: claim(9) } })).toBe(0);
    });
});

describe('nextReward', () => {
    it('is the first reward above the stamp count', () => {
        expect(nextReward({ stamps: stamps(0), rewardsClaimed: {} })).toBe(REWARDS[0]);
        expect(nextReward({ stamps: stamps(3), rewardsClaimed: {} })).toBe(REWARDS[1]);
    });
    it('is null when every reward is earned', () => {
        expect(nextReward({ stamps: stamps(11), rewardsClaimed: {} })).toBeNull();
    });
});

describe('rewardAtCount', () => {
    it('finds the reward a count reaches exactly', () => {
        expect(rewardAtCount(6)).toBe(REWARDS[1]);
        expect(rewardAtCount(5)).toBeNull();
    });
});

describe('venuesFor', () => {
    it('every reward has at least one venue in the City data', () => {
        for (const r of REWARDS) expect(venuesFor(r, null).length).toBeGreaterThan(0);
    });
    it('keeps only the reward’s venue types', () => {
        for (const v of venuesFor(REWARDS[0], null)) expect(REWARDS[0].types).toContain(v.type);
    });
    it('puts the nearest first when the position is known', () => {
        const target = venuesFor(REWARDS[0], null)[3];
        expect(venuesFor(REWARDS[0], [target.lat, target.lng])[0]).toBe(target);
    });
    it('covers every museum and gallery in the data', () => {
        const all = CULTURE_VENUES.filter((v) => v.type === 'ΜΟΥΣΕΙΟ' || v.type === 'ΠΙΝΑΚΟΘΗΚΗ');
        expect(venuesFor(REWARDS[0], null)).toHaveLength(all.length);
    });
});

describe('passportCode', () => {
    it('is four characters from the first stamp, and stable', () => {
        const code = passportCode({ stamps: stamps(4), rewardsClaimed: {} });
        expect(code).toMatch(/^[0-9A-Z]{4}$/);
        expect(passportCode({ stamps: { ...stamps(4), 5: 9e12 }, rewardsClaimed: {} })).toBe(code);
    });
});

describe('ticketNumber', () => {
    it('is null before the reward is claimed', () => {
        expect(ticketNumber(REWARDS[0], { stamps: stamps(4), rewardsClaimed: {} })).toBeNull();
    });
    it('joins the reward, the passport and the claim', () => {
        const s = { stamps: stamps(4), rewardsClaimed: { 3: claim(1_795_269_445_641) } };
        expect(ticketNumber(REWARDS[0], s)).toMatch(new RegExp(`^03-${passportCode(s)}-[0-9A-Z]{4}$`));
    });
});
