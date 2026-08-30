export interface Vector3Like {
  x: number;
  y: number;
  z: number;
}

export interface OrbitalElements {
  /** Distance from the globe centre, in scene units. */
  radius: number;
  /** Tilt of the orbital plane relative to the equator. */
  inclinationDeg: number;
  /** Rotation of the ascending node around the polar axis. */
  ascendingNodeDeg: number;
  /** Starting position around the orbit. */
  phaseDeg?: number;
  /** Angular velocity in radians per second. */
  angularVelocity: number;
  /** Use -1 for a retrograde orbit. */
  direction?: 1 | -1;
}

const DEG_TO_RAD = Math.PI / 180;
const TAU = Math.PI * 2;

export function normalizeRadians(value: number): number {
  return ((value % TAU) + TAU) % TAU;
}

export function orbitalAngleAt(elements: OrbitalElements, elapsedSeconds: number): number {
  assertElements(elements);

  const direction = elements.direction ?? 1;
  return normalizeRadians(
    (elements.phaseDeg ?? 0) * DEG_TO_RAD + elapsedSeconds * elements.angularVelocity * direction,
  );
}

/**
 * Position on a circular orbit. Earth north is +Y and the equatorial plane is XZ.
 * Keeping this transform independent of Three.js makes the orbital motion testable.
 */
export function orbitalPositionAt(elements: OrbitalElements, elapsedSeconds: number): Vector3Like {
  const angle = orbitalAngleAt(elements, elapsedSeconds);
  return positionAtAngle(elements, angle);
}

/** Unit-length direction of travel at the requested instant. */
export function orbitalTangentAt(elements: OrbitalElements, elapsedSeconds: number): Vector3Like {
  const angle = orbitalAngleAt(elements, elapsedSeconds);
  const inclination = elements.inclinationDeg * DEG_TO_RAD;
  const node = elements.ascendingNodeDeg * DEG_TO_RAD;
  const direction = elements.direction ?? 1;

  const planeX = -Math.sin(angle) * direction;
  const planeY = Math.cos(angle) * Math.sin(inclination) * direction;
  const planeZ = Math.cos(angle) * Math.cos(inclination) * direction;

  return {
    x: planeX * Math.cos(node) + planeZ * Math.sin(node),
    y: planeY,
    z: -planeX * Math.sin(node) + planeZ * Math.cos(node),
  };
}

/**
 * Samples only the recent part of an orbit for a restrained trailing arc. It deliberately
 * never creates a complete orbital ring.
 */
export function sampleTrailingArc(
  elements: OrbitalElements,
  elapsedSeconds: number,
  arcRadians = Math.PI * 0.22,
  segments = 18,
): Vector3Like[] {
  if (!Number.isFinite(arcRadians) || arcRadians <= 0 || arcRadians >= TAU) {
    throw new RangeError('arcRadians must be greater than zero and less than one complete orbit');
  }

  if (!Number.isInteger(segments) || segments < 2) {
    throw new RangeError('segments must be an integer of at least 2');
  }

  const currentAngle = orbitalAngleAt(elements, elapsedSeconds);
  const direction = elements.direction ?? 1;

  return Array.from({ length: segments + 1 }, (_, index) => {
    const distanceBehind = arcRadians * (1 - index / segments) * direction;
    return positionAtAngle(elements, currentAngle - distanceBehind);
  });
}

function positionAtAngle(elements: OrbitalElements, angle: number): Vector3Like {
  const inclination = elements.inclinationDeg * DEG_TO_RAD;
  const node = elements.ascendingNodeDeg * DEG_TO_RAD;

  const planeX = elements.radius * Math.cos(angle);
  const planeY = elements.radius * Math.sin(angle) * Math.sin(inclination);
  const planeZ = elements.radius * Math.sin(angle) * Math.cos(inclination);

  return {
    x: planeX * Math.cos(node) + planeZ * Math.sin(node),
    y: planeY,
    z: -planeX * Math.sin(node) + planeZ * Math.cos(node),
  };
}

function assertElements(elements: OrbitalElements): void {
  if (!Number.isFinite(elements.radius) || elements.radius <= 0) {
    throw new RangeError('orbit radius must be a positive finite number');
  }

  const finiteValues = [
    elements.inclinationDeg,
    elements.ascendingNodeDeg,
    elements.phaseDeg ?? 0,
    elements.angularVelocity,
  ];

  if (finiteValues.some((value) => !Number.isFinite(value))) {
    throw new RangeError('orbital elements must be finite numbers');
  }
}
