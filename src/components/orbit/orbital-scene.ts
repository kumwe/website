import * as THREE from 'three';

import {
  orbitalPositionAt,
  orbitalTangentAt,
  sampleTrailingArc,
  type OrbitalElements,
} from '../../lib/orbits';

export type OrbitalRenderMode = 'webgl' | 'fallback';

export interface OrbitalSceneOptions {
  darkTextureUrl?: string;
  lightTextureUrl?: string;
  cloudTextureUrl?: string;
  topologyTextureUrl?: string;
  waterTextureUrl?: string;
  /** `high` opts out of automatic low-spec simplification, but never bypasses Save-Data. */
  quality?: 'auto' | 'high';
}

export interface OrbitalSceneController {
  readonly mode: OrbitalRenderMode;
  destroy(): void;
  render(): void;
}

type ResolvedTheme = 'dark' | 'light';

interface NavigatorWithHints extends Navigator {
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
  deviceMemory?: number;
}

interface OrbiterDefinition {
  id: string;
  kind: 'satellite' | 'spacecraft' | 'station';
  variant: 'cube' | 'relay' | 'scout' | 'station' | 'weather';
  size: number;
  elements: OrbitalElements;
  colour: number;
}

interface OrbiterRuntime extends OrbiterDefinition {
  model: THREE.Group;
  trail: THREE.Line;
  trailPositions: Float32Array;
  trailColours: Float32Array;
}

interface ScenePalette {
  atmosphere: THREE.ColorRepresentation;
  marker: THREE.ColorRepresentation;
  star: THREE.ColorRepresentation;
  trail: THREE.ColorRepresentation;
}

type EarthTextureRole = 'bump' | 'clouds' | 'day' | 'night' | 'water';

const EARTH_RADIUS = 52;
const INITIAL_EARTH_ROTATION = THREE.MathUtils.degToRad(-120);
const NAMIBIA = { latitude: -22.56, longitude: 17.08 };
const TRAIL_SEGMENTS = 18;
const TRAIL_RADIANS = Math.PI * 0.24;
const EARTH_ROTATION_SPEED = 0.001;
const CLOUD_ROTATION_SPEED = 0.000085;
const AXIAL_VIEW_TILT = THREE.MathUtils.degToRad(-58);
const ATTITUDE_FORWARD = new THREE.Vector3();
const ATTITUDE_OUTWARD = new THREE.Vector3();
const ATTITUDE_RIGHT = new THREE.Vector3();
const ATTITUDE_UP = new THREE.Vector3();
const ATTITUDE_BASIS = new THREE.Matrix4();

const PALETTES: Record<ResolvedTheme, ScenePalette> = {
  dark: {
    atmosphere: '#2bd8ff',
    marker: '#57f3e9',
    star: '#c8f5ff',
    trail: '#3bd9ee',
  },
  light: {
    atmosphere: '#087fa8',
    marker: '#007d79',
    star: '#3a718c',
    trail: '#087f99',
  },
};

const ORBITERS: OrbiterDefinition[] = [
  {
    id: 'relay-a',
    kind: 'satellite',
    variant: 'relay',
    size: 0.46,
    colour: 0x57e9f4,
    elements: {
      radius: 67,
      inclinationDeg: 28,
      ascendingNodeDeg: -18,
      phaseDeg: 90,
      angularVelocity: 0.105,
    },
  },
  {
    id: 'relay-b',
    kind: 'satellite',
    variant: 'weather',
    size: 0.55,
    colour: 0x46d8ff,
    elements: {
      radius: 75,
      inclinationDeg: 63,
      ascendingNodeDeg: 42,
      phaseDeg: 115,
      angularVelocity: 0.074,
      direction: -1,
    },
  },
  {
    id: 'kumwe-scout',
    kind: 'spacecraft',
    variant: 'scout',
    size: 0.92,
    colour: 0x67f2dc,
    elements: {
      radius: 78,
      inclinationDeg: 46,
      ascendingNodeDeg: 118,
      phaseDeg: 78,
      angularVelocity: 0.068,
    },
  },
  {
    id: 'relay-d',
    kind: 'satellite',
    variant: 'relay',
    size: 0.49,
    colour: 0x9adff3,
    elements: {
      radius: 64,
      inclinationDeg: -41,
      ascendingNodeDeg: 202,
      phaseDeg: 280,
      angularVelocity: 0.124,
    },
  },
  {
    id: 'orbital-station',
    kind: 'station',
    variant: 'station',
    size: 0.72,
    colour: 0x8feaff,
    elements: {
      radius: 71,
      inclinationDeg: 51.6,
      ascendingNodeDeg: -38,
      phaseDeg: 125,
      angularVelocity: 0.059,
    },
  },
];

export function mountOrbitalScene(
  container: HTMLElement,
  options: OrbitalSceneOptions = {},
): OrbitalSceneController {
  const fallbackReason = getFallbackReason(options.quality ?? 'auto');
  if (fallbackReason) {
    return fallbackController(container, fallbackReason);
  }

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      depth: true,
      powerPreference: 'high-performance',
      premultipliedAlpha: true,
    });
  } catch {
    return fallbackController(container, 'webgl-initialisation');
  }

  const compact = Math.min(container.clientWidth || window.innerWidth, window.innerHeight) < 720;
  const navigatorHints = navigator as NavigatorWithHints;
  const simplified =
    options.quality !== 'high' &&
    ((navigatorHints.deviceMemory ?? 8) <= 4 || (navigator.hardwareConcurrency ?? 8) <= 4);
  const pixelRatioCap = simplified ? 1 : compact ? 1.2 : 1.5;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  renderer.domElement.setAttribute('role', 'presentation');
  renderer.domElement.tabIndex = -1;
  Object.assign(renderer.domElement.style, {
    height: '100%',
    inset: '0',
    pointerEvents: 'none',
    position: 'absolute',
    width: '100%',
  });
  container.append(renderer.domElement);
  container.dataset.orbitStatus = 'webgl';
  container.removeAttribute('data-orbit-reason');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 720);
  camera.position.set(0, 0, 118);
  camera.lookAt(0, -7, 0);

  const globeSystem = new THREE.Group();
  globeSystem.rotation.x = AXIAL_VIEW_TILT;
  const earthSurface = new THREE.Group();
  globeSystem.add(earthSurface);
  scene.add(globeSystem);

  const earthGeometry = new THREE.SphereGeometry(
    EARTH_RADIUS,
    simplified ? 56 : 88,
    simplified ? 36 : 56,
  );
  const earthMaterial = createEarthMaterial();
  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  earth.receiveShadow = false;
  earth.visible = false;
  earthSurface.add(earth);

  const cloudMaterial = new THREE.MeshPhongMaterial({
    color: 0xf4fbff,
    depthTest: true,
    depthWrite: false,
    opacity: 0.64,
    shininess: 1,
    transparent: true,
  });
  const clouds = new THREE.Mesh(earthGeometry, cloudMaterial);
  clouds.renderOrder = 2;
  clouds.scale.setScalar(1.007);
  clouds.visible = false;
  earthSurface.add(clouds);

  const atmosphereGeometry = new THREE.SphereGeometry(
    EARTH_RADIUS,
    simplified ? 48 : 72,
    simplified ? 32 : 48,
  );
  const innerAtmosphereMaterial = createAtmosphereMaterial(2.75);
  const outerAtmosphereMaterial = createAtmosphereMaterial(4.2);
  const innerAtmosphere = new THREE.Mesh(atmosphereGeometry, innerAtmosphereMaterial);
  const outerAtmosphere = new THREE.Mesh(atmosphereGeometry, outerAtmosphereMaterial);
  innerAtmosphere.renderOrder = 3;
  innerAtmosphere.scale.setScalar(1.014);
  outerAtmosphere.renderOrder = 4;
  outerAtmosphere.scale.setScalar(1.043);
  earthSurface.add(innerAtmosphere, outerAtmosphere);

  const locationMarker = createLocationMarker();
  earthSurface.add(locationMarker.group);
  const locationReadout = container.querySelector<HTMLElement>('[data-location-readout]');
  const markerWorldPosition = new THREE.Vector3();
  const earthWorldPosition = new THREE.Vector3();
  const markerOutward = new THREE.Vector3();
  const markerToCamera = new THREE.Vector3();

  const updateLocationReadout = (): void => {
    if (!locationReadout) return;

    scene.updateMatrixWorld(true);
    locationMarker.group.getWorldPosition(markerWorldPosition);
    earthSurface.getWorldPosition(earthWorldPosition);
    markerOutward.copy(markerWorldPosition).sub(earthWorldPosition).normalize();
    markerToCamera.copy(camera.position).sub(markerWorldPosition).normalize();

    const facesCamera = markerOutward.dot(markerToCamera) > 0.02;
    markerWorldPosition.project(camera);
    const inView =
      markerWorldPosition.z >= -1 &&
      markerWorldPosition.z <= 1 &&
      Math.abs(markerWorldPosition.x) <= 1.05 &&
      Math.abs(markerWorldPosition.y) <= 1.05;

    locationReadout.style.setProperty(
      '--origin-x',
      `${(markerWorldPosition.x * 0.5 + 0.5) * container.clientWidth}px`,
    );
    locationReadout.style.setProperty(
      '--origin-y',
      `${(-markerWorldPosition.y * 0.5 + 0.5) * container.clientHeight}px`,
    );
    locationReadout.dataset.tracking = 'true';
    locationReadout.dataset.visible = String(facesCamera && inView);
  };

  const starMaterial = createStarMaterial(renderer.getPixelRatio());
  const stars = createStars(compact ? 420 : simplified ? 540 : 780, starMaterial);
  scene.add(stars);

  const ambientLight = new THREE.HemisphereLight(0xc9e8f5, 0x020711, 0.4);
  const sunLight = new THREE.DirectionalLight(0xf8fbff, 3.1);
  sunLight.position.set(-95, 62, 105);
  scene.add(sunLight.target);
  const rimLight = new THREE.DirectionalLight(0x1bbce9, 0.9);
  rimLight.position.set(110, -25, -70);
  scene.add(ambientLight, sunLight, rimLight);

  const sharedMaterials = createOrbiterMaterials();
  const orbiters = ORBITERS.map((definition) =>
    createOrbiterRuntime(definition, globeSystem, sharedMaterials),
  );

  const textures: Partial<Record<EarthTextureRole, THREE.Texture>> = {};
  const textureLoader = new THREE.TextureLoader();
  textureLoader.setCrossOrigin('anonymous');

  let resolvedTheme = resolveTheme();
  let elapsed = 0;
  let lastFrameTime = performance.now();
  let frameRequest = 0;
  let destroyed = false;
  let firstFrame = true;
  let onScreen = true;
  let documentVisible = !document.hidden;
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const colourSchemeQuery = window.matchMedia('(prefers-color-scheme: light)');
  let reducedMotion = reducedMotionQuery.matches;

  const updateTheme = (): void => {
    resolvedTheme = resolveTheme();
    const palette = PALETTES[resolvedTheme];

    earthMaterial.uniforms.uAmbient.value = resolvedTheme === 'dark' ? 0.14 : 0.25;
    earthMaterial.uniforms.uNightStrength.value = resolvedTheme === 'dark' ? 1.38 : 0.88;
    innerAtmosphereMaterial.uniforms.uColour.value.set(palette.atmosphere);
    innerAtmosphereMaterial.uniforms.uOpacity.value = resolvedTheme === 'dark' ? 0.3 : 0.19;
    outerAtmosphereMaterial.uniforms.uColour.value.set(palette.atmosphere);
    outerAtmosphereMaterial.uniforms.uOpacity.value = resolvedTheme === 'dark' ? 0.21 : 0.13;
    starMaterial.uniforms.uColour.value.set(palette.star);
    starMaterial.uniforms.uThemeOpacity.value = resolvedTheme === 'dark' ? 1 : 0.26;
    cloudMaterial.color.set(resolvedTheme === 'dark' ? 0xddebf2 : 0xffffff);
    cloudMaterial.opacity = resolvedTheme === 'dark' ? 0.43 : 0.34;
    locationMarker.coreMaterial.color.set(resolvedTheme === 'dark' ? 0xf4ffff : palette.marker);
    locationMarker.ringMaterial.color.set(palette.marker);
    locationMarker.glowMaterial.uniforms.uColour.value.set(palette.marker);

    renderer.toneMappingExposure = resolvedTheme === 'dark' ? 1.02 : 1.08;
    ambientLight.intensity = resolvedTheme === 'dark' ? 0.38 : 0.62;
    sunLight.intensity = resolvedTheme === 'dark' ? 3.05 : 3.35;
    rimLight.intensity = resolvedTheme === 'dark' ? 0.95 : 0.55;

    for (const orbiter of orbiters) {
      updateTrailColours(orbiter, palette.trail);
    }

    renderOnce();
  };

  const requestTexture = (role: EarthTextureRole, url: string | undefined): void => {
    if (!url) return;

    textureLoader.load(
      url,
      (texture) => {
        if (destroyed) {
          texture.dispose();
          return;
        }

        texture.colorSpace =
          role === 'day' || role === 'night' || role === 'clouds'
            ? THREE.SRGBColorSpace
            : THREE.NoColorSpace;
        texture.anisotropy = Math.min(
          role === 'bump' || role === 'water' ? 2 : 4,
          renderer.capabilities.getMaxAnisotropy(),
        );
        texture.wrapS = THREE.RepeatWrapping;
        textures[role]?.dispose();
        textures[role] = texture;

        if (role === 'day') {
          earthMaterial.uniforms.uDayMap.value = texture;
          if (!textures.night) earthMaterial.uniforms.uNightMap.value = texture;
          earth.visible = true;
        } else if (role === 'night') {
          earthMaterial.uniforms.uNightMap.value = texture;
        } else if (role === 'clouds') {
          cloudMaterial.map = texture;
          cloudMaterial.needsUpdate = true;
          clouds.visible = true;
        } else if (role === 'bump') {
          earthMaterial.uniforms.uBumpMap.value = texture;
          earthMaterial.uniforms.uHasBump.value = 1;
        } else {
          earthMaterial.uniforms.uWaterMap.value = texture;
          earthMaterial.uniforms.uHasWater.value = 1;
        }

        updateTheme();
        if (role === 'day') revealScene();
      },
      undefined,
      () => {
        // The photographic CSS still remains visible when the primary day map fails.
      },
    );
  };

  const updateScene = (deltaSeconds: number): void => {
    elapsed += deltaSeconds;
    const animatedTime = reducedMotion ? 0 : elapsed;

    earthSurface.rotation.set(0, INITIAL_EARTH_ROTATION + animatedTime * EARTH_ROTATION_SPEED, 0);
    clouds.rotation.y = animatedTime * CLOUD_ROTATION_SPEED;
    stars.rotation.z = animatedTime * 0.0016;
    starMaterial.uniforms.uTime.value = animatedTime;
    innerAtmosphereMaterial.uniforms.uTime.value = animatedTime;
    outerAtmosphereMaterial.uniforms.uTime.value = animatedTime;

    const markerPulse = reducedMotion ? 1 : 1 + Math.sin(animatedTime * 1.65) * 0.095;
    locationMarker.ring.scale.setScalar(markerPulse);
    locationMarker.glow.scale.setScalar(
      reducedMotion ? 1 : 1 + Math.sin(animatedTime * 1.65) * 0.075,
    );
    locationMarker.ringMaterial.opacity = reducedMotion
      ? 0.45
      : 0.26 + (Math.sin(animatedTime * 1.65) + 1) * 0.075;
    locationMarker.glowMaterial.uniforms.uOpacity.value = reducedMotion
      ? 0.26
      : 0.2 + (Math.sin(animatedTime * 1.65) + 1) * 0.045;

    for (const orbiter of orbiters) {
      const position = orbitalPositionAt(orbiter.elements, animatedTime);
      const tangent = orbitalTangentAt(orbiter.elements, animatedTime);
      orbiter.model.position.set(position.x, position.y, position.z);
      orientAlongTangent(orbiter.model, tangent, position);

      if (orbiter.kind === 'station') {
        const articulation = orbiter.model.userData.articulation as THREE.Group | undefined;
        if (articulation) articulation.rotation.z = animatedTime * 0.055;
      }

      const points = sampleTrailingArc(
        orbiter.elements,
        animatedTime,
        TRAIL_RADIANS,
        TRAIL_SEGMENTS,
      );
      for (let index = 0; index < points.length; index += 1) {
        const point = points[index];
        const offset = index * 3;
        orbiter.trailPositions[offset] = point.x;
        orbiter.trailPositions[offset + 1] = point.y;
        orbiter.trailPositions[offset + 2] = point.z;
      }
      const positionAttribute = orbiter.trail.geometry.getAttribute(
        'position',
      ) as THREE.BufferAttribute;
      positionAttribute.needsUpdate = true;
      orbiter.trail.geometry.computeBoundingSphere();
    }

    updateLocationReadout();
  };

  const renderFrame = (time: number): void => {
    frameRequest = 0;
    if (destroyed) return;

    const delta = Math.min(Math.max((time - lastFrameTime) / 1000, 0), 0.05);
    lastFrameTime = time;
    updateScene(reducedMotion ? 0 : delta);
    renderer.render(scene, camera);
    revealScene();

    scheduleAnimation();
  };

  function scheduleAnimation(resetClock = false): void {
    if (destroyed || frameRequest !== 0 || reducedMotion || !onScreen || !documentVisible) {
      return;
    }

    if (resetClock) lastFrameTime = performance.now();
    frameRequest = window.requestAnimationFrame(renderFrame);
  }

  function renderOnce(): void {
    if (destroyed) return;
    updateScene(0);
    renderer.render(scene, camera);
    revealScene();
  }

  function revealScene(): void {
    if (!firstFrame || !textures.day) return;
    firstFrame = false;
    container.classList.add('is-ready');
  }

  const resize = (): void => {
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    const isNarrow = width / height < 0.84;

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    starMaterial.uniforms.uPixelRatio.value = renderer.getPixelRatio();

    if (isNarrow) {
      camera.fov = 39;
      camera.position.set(0, 0, 205);
      globeSystem.position.set(7, -36, -5);
      globeSystem.scale.setScalar(0.9);
    } else if (width < 960) {
      camera.fov = 36;
      camera.position.set(0, 0, 158);
      globeSystem.position.set(23, -40, -3);
      globeSystem.scale.setScalar(0.94);
    } else {
      camera.fov = 33;
      camera.position.set(0, 0, 118);
      globeSystem.position.set(25, -49, 0);
      globeSystem.scale.setScalar(1);
    }

    camera.lookAt(0, -7, 0);
    camera.updateProjectionMatrix();
    sunLight.target.position.copy(globeSystem.position);
    earthMaterial.uniforms.uSunDirection.value
      .copy(sunLight.position)
      .sub(sunLight.target.position)
      .normalize();
    renderOnce();
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      onScreen = entry?.isIntersecting ?? false;
      if (onScreen) scheduleAnimation(true);
    },
    { rootMargin: '80px', threshold: 0.01 },
  );
  intersectionObserver.observe(container);

  const handleVisibility = (): void => {
    documentVisible = !document.hidden;
    if (documentVisible) scheduleAnimation(true);
  };

  const handleReducedMotion = (): void => {
    reducedMotion = reducedMotionQuery.matches;
    if (reducedMotion && frameRequest) {
      cancelAnimationFrame(frameRequest);
      frameRequest = 0;
      renderOnce();
    } else {
      scheduleAnimation(true);
    }
  };

  const handleColourScheme = (): void => updateTheme();
  const handleContextLost = (event: Event): void => {
    event.preventDefault();
    if (frameRequest) {
      cancelAnimationFrame(frameRequest);
      frameRequest = 0;
    }
    container.classList.remove('is-ready');
    container.dataset.orbitStatus = 'fallback';
    container.dataset.orbitReason = 'webgl-context-lost';
  };
  const handleContextRestored = (): void => {
    container.dataset.orbitStatus = 'webgl';
    container.removeAttribute('data-orbit-reason');
    firstFrame = true;
    resize();
    updateTheme();
    scheduleAnimation(true);
  };
  const themeObserver = new MutationObserver(updateTheme);
  themeObserver.observe(document.documentElement, {
    attributeFilter: ['class', 'data-theme', 'data-resolved-theme', 'style'],
    attributes: true,
  });

  document.addEventListener('visibilitychange', handleVisibility);
  reducedMotionQuery.addEventListener('change', handleReducedMotion);
  colourSchemeQuery.addEventListener('change', handleColourScheme);
  renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
  renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

  resize();
  updateTheme();
  requestTexture('day', options.lightTextureUrl);
  requestTexture('night', options.darkTextureUrl);
  requestTexture('clouds', options.cloudTextureUrl);
  if (!simplified) {
    requestTexture('bump', options.topologyTextureUrl);
    requestTexture('water', options.waterTextureUrl);
  }
  renderOnce();
  scheduleAnimation(true);

  return {
    mode: 'webgl',
    destroy(): void {
      if (destroyed) return;
      destroyed = true;
      if (frameRequest) cancelAnimationFrame(frameRequest);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      reducedMotionQuery.removeEventListener('change', handleReducedMotion);
      colourSchemeQuery.removeEventListener('change', handleColourScheme);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);

      if (locationReadout) {
        delete locationReadout.dataset.tracking;
        delete locationReadout.dataset.visible;
        locationReadout.style.removeProperty('--origin-x');
        locationReadout.style.removeProperty('--origin-y');
      }

      for (const texture of Object.values(textures)) texture?.dispose();
      disposeScene(scene);
      renderer.dispose();
      renderer.domElement.remove();
      container.classList.remove('is-ready');
    },
    render: renderOnce,
  };
}

function createEarthMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    depthTest: true,
    depthWrite: true,
    toneMapped: true,
    uniforms: {
      uAmbient: { value: 0.14 },
      uBumpMap: { value: null as THREE.Texture | null },
      uBumpScale: { value: 2.2 },
      uBumpTexel: { value: new THREE.Vector2(1 / 2048, 1 / 1024) },
      uDayMap: { value: null as THREE.Texture | null },
      uHasBump: { value: 0 },
      uHasWater: { value: 0 },
      uNightMap: { value: null as THREE.Texture | null },
      uNightStrength: { value: 1.38 },
      uSunDirection: { value: new THREE.Vector3(-0.55, 0.32, 0.77).normalize() },
      uWaterMap: { value: null as THREE.Texture | null },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vWorldBitangent;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPosition;
      varying vec3 vWorldTangent;

      void main() {
        vec3 localNormal = normalize(normal);
        vec3 localTangent = vec3(-localNormal.z, 0.0, localNormal.x);
        if (dot(localTangent, localTangent) < 0.0001) {
          localTangent = vec3(1.0, 0.0, 0.0);
        }

        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        mat3 worldNormalMatrix = mat3(modelMatrix);
        vUv = uv;
        vWorldNormal = normalize(worldNormalMatrix * localNormal);
        vWorldPosition = worldPosition.xyz;
        vWorldTangent = normalize(worldNormalMatrix * normalize(localTangent));
        vWorldBitangent = normalize(cross(vWorldNormal, vWorldTangent));
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uAmbient;
      uniform sampler2D uBumpMap;
      uniform float uBumpScale;
      uniform vec2 uBumpTexel;
      uniform sampler2D uDayMap;
      uniform float uHasBump;
      uniform float uHasWater;
      uniform sampler2D uNightMap;
      uniform float uNightStrength;
      uniform vec3 uSunDirection;
      uniform sampler2D uWaterMap;
      varying vec2 vUv;
      varying vec3 vWorldBitangent;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPosition;
      varying vec3 vWorldTangent;

      void main() {
        vec3 normal = normalize(vWorldNormal);
        if (uHasBump > 0.5) {
          float heightLeft = texture2D(uBumpMap, vUv - vec2(uBumpTexel.x, 0.0)).r;
          float heightRight = texture2D(uBumpMap, vUv + vec2(uBumpTexel.x, 0.0)).r;
          float heightDown = texture2D(uBumpMap, vUv - vec2(0.0, uBumpTexel.y)).r;
          float heightUp = texture2D(uBumpMap, vUv + vec2(0.0, uBumpTexel.y)).r;
          float poleFade = smoothstep(0.015, 0.08, vUv.y) * smoothstep(0.015, 0.08, 1.0 - vUv.y);
          vec3 perturbation =
            vWorldTangent * (heightLeft - heightRight) +
            vWorldBitangent * (heightDown - heightUp);
          normal = normalize(normal + perturbation * uBumpScale * poleFade);
        }

        vec3 sunDirection = normalize(uSunDirection);
        vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
        float sunAmount = dot(normal, sunDirection);
        float dayMix = smoothstep(-0.12, 0.18, sunAmount);
        float diffuse = uAmbient + max(sunAmount, 0.0) * (1.08 - uAmbient);

        vec3 dayColour = texture2D(uDayMap, vUv).rgb * diffuse;
        vec3 nightColour = texture2D(uNightMap, vUv).rgb * uNightStrength;

        float water = uHasWater > 0.5 ? texture2D(uWaterMap, vUv).r : 0.0;
        vec3 halfVector = normalize(sunDirection + viewDirection);
        float specular =
          pow(max(dot(normal, halfVector), 0.0), 56.0) *
          max(sunAmount, 0.0) *
          water *
          0.22;

        vec3 colour = mix(nightColour, dayColour, dayMix);
        colour += vec3(0.62, 0.82, 1.0) * specular;
        gl_FragColor = vec4(colour, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}

function createAtmosphereMaterial(rimPower: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    blending: THREE.AdditiveBlending,
    depthTest: true,
    depthWrite: false,
    side: THREE.FrontSide,
    transparent: true,
    uniforms: {
      uColour: { value: new THREE.Color(PALETTES.dark.atmosphere) },
      uOpacity: { value: 0.32 },
      uRimPower: { value: rimPower },
      uTime: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vViewDirection;
      varying vec3 vWorldNormal;

      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vec4 viewPosition = viewMatrix * worldPosition;
        vNormal = normalize(normalMatrix * normal);
        vViewDirection = normalize(-viewPosition.xyz);
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColour;
      uniform float uOpacity;
      uniform float uRimPower;
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vViewDirection;
      varying vec3 vWorldNormal;

      void main() {
        float rim = pow(1.0 - max(0.0, dot(vNormal, vViewDirection)), uRimPower);
        float flowA = sin(vWorldNormal.y * 10.0 + vWorldNormal.x * 6.0 + uTime * 0.19);
        float flowB = sin((vWorldNormal.x - vWorldNormal.z) * 14.0 - uTime * 0.13);
        float movement = 0.965 + flowA * 0.022 + flowB * 0.013;
        float alpha = rim * uOpacity * movement;
        gl_FragColor = vec4(uColour, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}

function createStarMaterial(pixelRatio: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    blending: THREE.AdditiveBlending,
    depthTest: true,
    depthWrite: false,
    transparent: true,
    uniforms: {
      uColour: { value: new THREE.Color(PALETTES.dark.star) },
      uPixelRatio: { value: pixelRatio },
      uThemeOpacity: { value: 1 },
      uTime: { value: 0 },
    },
    vertexShader: /* glsl */ `
      attribute float aPhase;
      attribute float aRate;
      attribute float aSize;
      attribute float aTwinkle;
      uniform float uPixelRatio;
      uniform float uTime;
      varying float vBrightness;

      void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        float wave = 0.5 + 0.5 * sin(uTime * aRate + aPhase * 6.28318);
        vBrightness = mix(1.0, 0.26 + wave * 0.74, aTwinkle);
        gl_PointSize = max(0.75, aSize * uPixelRatio * (175.0 / -viewPosition.z) * (0.88 + vBrightness * 0.18));
        gl_Position = projectionMatrix * viewPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColour;
      uniform float uThemeOpacity;
      varying float vBrightness;

      void main() {
        float distanceToCentre = distance(gl_PointCoord, vec2(0.5));
        float core = 1.0 - smoothstep(0.04, 0.48, distanceToCentre);
        float glow = 1.0 - smoothstep(0.0, 0.5, distanceToCentre);
        float alpha = (core * 0.72 + glow * 0.28) * (0.5 + vBrightness * 0.5) * uThemeOpacity;
        if (alpha < 0.015) discard;
        gl_FragColor = vec4(uColour, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}

function createStars(count: number, material: THREE.ShaderMaterial): THREE.Points {
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const rates = new Float32Array(count);
  const sizes = new Float32Array(count);
  const twinkles = new Float32Array(count);

  // A deterministic generator prevents the constellation jumping between navigations.
  let seed = 0x4b554d57;
  const random = (): number => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x1_0000_0000;
  };

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    positions[offset] = (random() - 0.5) * 380;
    positions[offset + 1] = (random() - 0.5) * 235;
    positions[offset + 2] = -75 - random() * 210;
    phases[index] = random();
    rates[index] = 0.35 + random() * 1.55;
    sizes[index] = 1.9 + Math.pow(random(), 3) * 5.1;
    twinkles[index] = random() < 0.18 ? 0.46 + random() * 0.46 : 0.04 + random() * 0.12;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('aRate', new THREE.BufferAttribute(rates, 1));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aTwinkle', new THREE.BufferAttribute(twinkles, 1));
  return new THREE.Points(geometry, material);
}

function createLocationMarker(): {
  coreMaterial: THREE.MeshBasicMaterial;
  glow: THREE.Mesh;
  glowMaterial: THREE.ShaderMaterial;
  group: THREE.Group;
  ring: THREE.Mesh;
  ringMaterial: THREE.MeshBasicMaterial;
} {
  const group = new THREE.Group();
  const normal = latitudeLongitudeToNormal(NAMIBIA.latitude, NAMIBIA.longitude);
  const position = normal.clone().multiplyScalar(EARTH_RADIUS * 1.012);

  const coreMaterial = new THREE.MeshBasicMaterial({
    blending: THREE.AdditiveBlending,
    color: 0xf4ffff,
    depthTest: true,
    depthWrite: false,
    transparent: true,
  });
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: PALETTES.dark.marker,
    depthTest: true,
    depthWrite: false,
    opacity: 0.5,
    side: THREE.DoubleSide,
    transparent: true,
  });
  const glowMaterial = new THREE.ShaderMaterial({
    blending: THREE.AdditiveBlending,
    depthTest: true,
    depthWrite: false,
    transparent: true,
    uniforms: {
      uColour: { value: new THREE.Color(PALETTES.dark.marker) },
      uOpacity: { value: 0.26 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColour;
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        float radius = distance(vUv, vec2(0.5));
        float alpha = (1.0 - smoothstep(0.02, 0.5, radius)) * uOpacity;
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(uColour, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const core = new THREE.Mesh(new THREE.CircleGeometry(0.3, 20), coreMaterial);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.82, 32), ringMaterial);
  const glow = new THREE.Mesh(new THREE.CircleGeometry(1.65, 36), glowMaterial);
  const facing = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

  core.position.copy(position);
  ring.position.copy(normal.clone().multiplyScalar(EARTH_RADIUS * 1.013));
  glow.position.copy(normal.clone().multiplyScalar(EARTH_RADIUS * 1.0115));
  core.quaternion.copy(facing);
  ring.quaternion.copy(facing);
  glow.quaternion.copy(facing);
  core.renderOrder = 7;
  ring.renderOrder = 6;
  glow.renderOrder = 5;
  group.add(glow, ring, core);

  return { coreMaterial, glow, glowMaterial, group, ring, ringMaterial };
}

function latitudeLongitudeToNormal(latitude: number, longitude: number): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(longitude + 180);
  const theta = THREE.MathUtils.degToRad(90 - latitude);
  return new THREE.Vector3(
    -Math.cos(phi) * Math.sin(theta),
    Math.cos(theta),
    Math.sin(phi) * Math.sin(theta),
  ).normalize();
}

function createOrbiterMaterials(): {
  body: THREE.MeshStandardMaterial;
  detail: THREE.MeshStandardMaterial;
  panel: THREE.MeshStandardMaterial;
  panelFrame: THREE.MeshStandardMaterial;
} {
  return {
    body: new THREE.MeshStandardMaterial({
      color: 0xd9e2e7,
      metalness: 0.42,
      roughness: 0.32,
    }),
    detail: new THREE.MeshStandardMaterial({
      color: 0xc99545,
      emissive: 0x2e1704,
      emissiveIntensity: 0.2,
      metalness: 0.56,
      roughness: 0.3,
    }),
    panel: new THREE.MeshStandardMaterial({
      color: 0x0a315c,
      emissive: 0x041426,
      emissiveIntensity: 0.24,
      metalness: 0.28,
      roughness: 0.42,
    }),
    panelFrame: new THREE.MeshStandardMaterial({
      color: 0x7bbbd0,
      emissive: 0x062b3a,
      emissiveIntensity: 0.18,
      metalness: 0.5,
      roughness: 0.3,
    }),
  };
}

function createOrbiterRuntime(
  definition: OrbiterDefinition,
  parent: THREE.Group,
  materials: ReturnType<typeof createOrbiterMaterials>,
): OrbiterRuntime {
  const model =
    definition.kind === 'station'
      ? createStationModel(definition.size, materials)
      : definition.kind === 'spacecraft'
        ? createMascotScoutModel(definition.size, materials)
        : createSatelliteModel(definition, materials);
  model.name = definition.id;
  parent.add(model);

  const trailPositions = new Float32Array((TRAIL_SEGMENTS + 1) * 3);
  const trailColours = new Float32Array((TRAIL_SEGMENTS + 1) * 3);
  const trailGeometry = new THREE.BufferGeometry();
  trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
  trailGeometry.setAttribute('color', new THREE.BufferAttribute(trailColours, 3));
  const trail = new THREE.Line(
    trailGeometry,
    new THREE.LineBasicMaterial({
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      opacity: definition.kind === 'station' ? 0.54 : 0.38,
      transparent: true,
      vertexColors: true,
    }),
  );
  trail.frustumCulled = false;
  parent.add(trail);

  const runtime = { ...definition, model, trail, trailPositions, trailColours };
  updateTrailColours(runtime, PALETTES.dark.trail);
  return runtime;
}

function createSatelliteModel(
  definition: OrbiterDefinition,
  materials: ReturnType<typeof createOrbiterMaterials>,
): THREE.Group {
  const accent = materials.panelFrame.clone();
  accent.color.set(definition.colour);
  accent.emissive.set(definition.colour).multiplyScalar(0.12);

  if (definition.variant === 'cube') {
    return createCubeSatellite(definition.size, materials, accent);
  }

  if (definition.variant === 'weather') {
    return createWeatherSatellite(definition.size, materials, accent);
  }

  return createRelaySatellite(definition.size, materials, accent);
}

function createRelaySatellite(
  scale: number,
  materials: ReturnType<typeof createOrbiterMaterials>,
  accent: THREE.MeshStandardMaterial,
): THREE.Group {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.5, 2.7), materials.body);
  const panelGeometry = new THREE.BoxGeometry(4.3, 0.1, 1.65);
  const leftPanel = new THREE.Mesh(panelGeometry, materials.panel);
  const rightPanel = new THREE.Mesh(panelGeometry, materials.panel);
  const boomGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4, 8);
  const leftBoom = new THREE.Mesh(boomGeometry, materials.detail);
  const rightBoom = new THREE.Mesh(boomGeometry, materials.detail);
  const antenna = new THREE.Mesh(new THREE.ConeGeometry(0.74, 0.58, 20, 1, true), materials.detail);
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 8), accent);

  leftPanel.position.x = -4.35;
  rightPanel.position.x = 4.35;
  leftBoom.rotation.z = Math.PI / 2;
  rightBoom.rotation.z = Math.PI / 2;
  leftBoom.position.x = -2.25;
  rightBoom.position.x = 2.25;
  antenna.rotation.x = Math.PI / 2;
  antenna.position.z = 1.7;
  beacon.position.set(0, 0.88, 0.25);
  group.add(body, leftBoom, rightBoom, leftPanel, rightPanel, antenna, beacon);
  group.scale.setScalar(scale);
  return group;
}

function createCubeSatellite(
  scale: number,
  materials: ReturnType<typeof createOrbiterMaterials>,
  accent: THREE.MeshStandardMaterial,
): THREE.Group {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.65, 1.65, 2.3), materials.body);
  const panelGeometry = new THREE.BoxGeometry(2.8, 0.09, 1.25);
  const leftPanel = new THREE.Mesh(panelGeometry, materials.panel);
  const rightPanel = new THREE.Mesh(panelGeometry, materials.panel);
  const aerial = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 2.7, 8), accent);
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 8), accent);

  leftPanel.position.x = -2.2;
  rightPanel.position.x = 2.2;
  aerial.rotation.x = Math.PI / 2;
  aerial.position.z = 2.25;
  beacon.position.set(0, 0.92, 0.2);
  group.add(body, leftPanel, rightPanel, aerial, beacon);
  group.scale.setScalar(scale);
  return group;
}

function createWeatherSatellite(
  scale: number,
  materials: ReturnType<typeof createOrbiterMaterials>,
  accent: THREE.MeshStandardMaterial,
): THREE.Group {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.72, 2.7, 18), materials.body);
  const panel = new THREE.Mesh(new THREE.BoxGeometry(5.7, 0.1, 1.8), materials.panel);
  const panelRail = new THREE.Mesh(new THREE.BoxGeometry(5.9, 0.16, 0.09), accent);
  const dish = new THREE.Mesh(new THREE.ConeGeometry(1.05, 0.58, 24, 1, true), materials.detail);
  const dishMast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.1, 8), accent);

  body.rotation.x = Math.PI / 2;
  panel.position.y = -0.15;
  panelRail.position.set(0, -0.22, 0);
  dish.rotation.x = -Math.PI / 2;
  dish.position.z = 1.75;
  dishMast.rotation.x = Math.PI / 2;
  dishMast.position.z = 1.2;
  group.add(body, panel, panelRail, dish, dishMast);
  group.scale.setScalar(scale);
  return group;
}

function createMascotScoutModel(
  scale: number,
  materials: ReturnType<typeof createOrbiterMaterials>,
): THREE.Group {
  const group = new THREE.Group();
  const hullMaterial = materials.panelFrame.clone();
  hullMaterial.color.set(0x45e1df);
  hullMaterial.emissive.set(0x063f4a);
  hullMaterial.emissiveIntensity = 0.36;

  const canopyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x8deaff,
    emissive: 0x092c45,
    emissiveIntensity: 0.45,
    metalness: 0.08,
    opacity: 0.52,
    roughness: 0.08,
    side: THREE.DoubleSide,
    transparent: true,
  });
  const furMaterial = new THREE.MeshStandardMaterial({
    color: 0xb78a5f,
    emissive: 0x3a1d0e,
    emissiveIntensity: 0.32,
    roughness: 0.88,
  });
  const darkFurMaterial = new THREE.MeshStandardMaterial({
    color: 0x34251f,
    emissive: 0x120a07,
    emissiveIntensity: 0.18,
    roughness: 0.9,
  });
  const engineMaterial = new THREE.MeshBasicMaterial({
    blending: THREE.AdditiveBlending,
    color: 0x62f5ff,
    depthWrite: false,
    transparent: true,
  });

  const fuselage = new THREE.Mesh(new THREE.ConeGeometry(0.82, 3.8, 18), hullMaterial);
  fuselage.rotation.x = Math.PI / 2;
  const wing = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.12, 1.35), materials.panel);
  wing.position.z = -0.55;
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.15, 1.2), hullMaterial);
  tail.position.set(0, 0.55, -1.35);

  const pilot = new THREE.Group();
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 12), furMaterial);
  head.scale.set(0.92, 1.08, 0.88);
  const leftEar = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 8), darkFurMaterial);
  const rightEar = leftEar.clone();
  leftEar.position.set(-0.28, 0.26, -0.02);
  rightEar.position.set(0.28, 0.26, -0.02);
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 8), darkFurMaterial);
  muzzle.scale.set(0.78, 0.62, 1.15);
  muzzle.position.set(0, -0.06, 0.3);
  pilot.add(leftEar, rightEar, head, muzzle);
  pilot.position.set(0, 0.28, 0.22);

  const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.86, 20, 14), canopyMaterial);
  canopy.scale.set(1, 0.72, 1.18);
  canopy.position.set(0, 0.25, 0.2);
  canopy.renderOrder = 8;

  const engine = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.46, 0.5, 14), materials.detail);
  engine.rotation.x = Math.PI / 2;
  engine.position.z = -1.88;
  const engineGlow = new THREE.Mesh(new THREE.CircleGeometry(0.31, 18), engineMaterial);
  engineGlow.rotation.y = Math.PI;
  engineGlow.position.z = -2.15;
  engineGlow.renderOrder = 9;

  group.add(fuselage, wing, tail, pilot, canopy, engine, engineGlow);
  group.scale.setScalar(scale);
  return group;
}

function createStationModel(
  scale: number,
  materials: ReturnType<typeof createOrbiterMaterials>,
): THREE.Group {
  const group = new THREE.Group();
  const articulation = new THREE.Group();
  const truss = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 9.5, 10),
    materials.panelFrame,
  );
  truss.rotation.z = Math.PI / 2;
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 3.6, 18), materials.body);
  core.rotation.x = Math.PI / 2;

  for (const x of [-3.8, -1.35, 1.35, 3.8]) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.12, 4.4), materials.panel);
    panel.position.x = x;
    articulation.add(panel);
  }

  for (const x of [-1.15, 1.15]) {
    const radiator = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 2.2), materials.body);
    radiator.position.set(x, 0.18, -1.45);
    articulation.add(radiator);
  }

  for (const x of [-2.3, 0, 2.3]) {
    const module = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.9, 14), materials.body);
    module.rotation.z = Math.PI / 2;
    module.position.x = x;
    group.add(module);
  }

  articulation.add(truss);
  group.add(core, articulation);
  group.userData.articulation = articulation;
  group.scale.setScalar(scale);
  return group;
}

function orientAlongTangent(
  model: THREE.Group,
  tangent: { x: number; y: number; z: number },
  position: { x: number; y: number; z: number },
): void {
  ATTITUDE_FORWARD.set(tangent.x, tangent.y, tangent.z).normalize();
  ATTITUDE_OUTWARD.set(position.x, position.y, position.z).normalize();
  ATTITUDE_RIGHT.crossVectors(ATTITUDE_OUTWARD, ATTITUDE_FORWARD).normalize();
  ATTITUDE_UP.crossVectors(ATTITUDE_FORWARD, ATTITUDE_RIGHT).normalize();
  ATTITUDE_BASIS.makeBasis(ATTITUDE_RIGHT, ATTITUDE_UP, ATTITUDE_FORWARD);
  model.quaternion.setFromRotationMatrix(ATTITUDE_BASIS);
}

function updateTrailColours(orbiter: OrbiterRuntime, colour: THREE.ColorRepresentation): void {
  const base = new THREE.Color(colour);
  for (let index = 0; index <= TRAIL_SEGMENTS; index += 1) {
    const strength = Math.pow(index / TRAIL_SEGMENTS, 1.65);
    const offset = index * 3;
    orbiter.trailColours[offset] = base.r * strength;
    orbiter.trailColours[offset + 1] = base.g * strength;
    orbiter.trailColours[offset + 2] = base.b * strength;
  }
  const attribute = orbiter.trail.geometry.getAttribute('color') as THREE.BufferAttribute;
  attribute.needsUpdate = true;
}

function resolveTheme(): ResolvedTheme {
  const root = document.documentElement;
  const explicit = root.dataset.resolvedTheme ?? root.dataset.theme;
  if (explicit === 'light' || explicit === 'dark') return explicit;
  if (root.classList.contains('light')) return 'light';
  if (root.classList.contains('dark')) return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function getFallbackReason(quality: 'auto' | 'high'): string | null {
  const hints = navigator as NavigatorWithHints;
  if (hints.connection?.saveData) return 'save-data';
  if (hints.connection?.effectiveType === 'slow-2g') return 'slow-connection';
  if (
    quality === 'auto' &&
    ((hints.deviceMemory !== undefined && hints.deviceMemory <= 2) ||
      (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 2))
  ) {
    return 'low-power-device';
  }

  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2', {
      failIfMajorPerformanceCaveat: true,
      powerPreference: 'high-performance',
    });
    if (!context) return 'webgl-unavailable';
    context.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    return 'webgl-unavailable';
  }

  return null;
}

function fallbackController(container: HTMLElement, reason: string): OrbitalSceneController {
  container.dataset.orbitStatus = 'fallback';
  container.dataset.orbitReason = reason;
  container.classList.remove('is-ready');
  return {
    mode: 'fallback',
    destroy(): void {},
    render(): void {},
  };
}

function disposeScene(scene: THREE.Scene): void {
  const disposedMaterials = new Set<THREE.Material>();
  const disposedGeometries = new Set<THREE.BufferGeometry>();
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.geometry && !disposedGeometries.has(mesh.geometry)) {
      mesh.geometry.dispose();
      disposedGeometries.add(mesh.geometry);
    }

    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : mesh.material
        ? [mesh.material]
        : [];
    for (const material of materials) {
      if (!disposedMaterials.has(material)) {
        material.dispose();
        disposedMaterials.add(material);
      }
    }
  });
}
