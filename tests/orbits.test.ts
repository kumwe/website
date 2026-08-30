import { describe, expect, it } from 'vitest';

import {
  normalizeRadians,
  orbitalPositionAt,
  orbitalTangentAt,
  sampleTrailingArc,
  type OrbitalElements,
} from '../src/lib/orbits';

const orbit: OrbitalElements = {
  radius: 72,
  inclinationDeg: 51.6,
  ascendingNodeDeg: 28,
  phaseDeg: 12,
  angularVelocity: 0.12,
};

describe('orbitalPositionAt', () => {
  it('keeps objects on a constant-radius 3D orbit', () => {
    for (const elapsed of [0, 2.5, 19, 1000]) {
      const position = orbitalPositionAt(orbit, elapsed);
      const radius = Math.hypot(position.x, position.y, position.z);
      expect(radius).toBeCloseTo(orbit.radius, 10);
    }
  });

  it('moves an inclined object above and below the equatorial plane', () => {
    const quarterPeriod = Math.PI / (2 * orbit.angularVelocity);
    const above = orbitalPositionAt({ ...orbit, phaseDeg: 0 }, quarterPeriod);
    const below = orbitalPositionAt({ ...orbit, phaseDeg: 180 }, quarterPeriod);

    expect(above.y).toBeGreaterThan(0);
    expect(below.y).toBeLessThan(0);
  });

  it('returns a tangent perpendicular to the radius', () => {
    const position = orbitalPositionAt(orbit, 13);
    const tangent = orbitalTangentAt(orbit, 13);
    const dot = position.x * tangent.x + position.y * tangent.y + position.z * tangent.z;

    expect(Math.hypot(tangent.x, tangent.y, tangent.z)).toBeCloseTo(1, 10);
    expect(dot).toBeCloseTo(0, 10);
  });
});

describe('sampleTrailingArc', () => {
  it('ends at the satellite and never samples a complete ring', () => {
    const elapsed = 8;
    const trail = sampleTrailingArc(orbit, elapsed, Math.PI / 5, 12);
    const satellite = orbitalPositionAt(orbit, elapsed);

    expect(trail).toHaveLength(13);
    expect(trail.at(-1)).toEqual(satellite);
    expect(trail[0]).not.toEqual(satellite);
    expect(() => sampleTrailingArc(orbit, elapsed, Math.PI * 2)).toThrow(RangeError);
  });
});

describe('normalizeRadians', () => {
  it('wraps positive and negative angles into a single revolution', () => {
    expect(normalizeRadians(-Math.PI / 2)).toBeCloseTo((Math.PI * 3) / 2);
    expect(normalizeRadians(Math.PI * 5)).toBeCloseTo(Math.PI);
  });
});
