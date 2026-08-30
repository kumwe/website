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
  kind: 'satellite' | 'station';
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
  body: THREE.ColorRepresentation;
  marker: THREE.ColorRepresentation;
  panel: THREE.ColorRepresentation;
  panelEdge: THREE.ColorRepresentation;
  star: THREE.ColorRepresentation;
  trail: THREE.ColorRepresentation;
}

const EARTH_RADIUS = 52;
const INITIAL_EARTH_ROTATION = -Math.PI / 2;
const NAMIBIA = { latitude: -22.56, longitude: 17.08 };
const TRAIL_SEGMENTS = 18;
const TRAIL_RADIANS = Math.PI * 0.24;

const PALETTES: Record<ResolvedTheme, ScenePalette> = {
  dark: {
    atmosphere: '#2bd8ff',
    body: '#d8f7ff',
    marker: '#57f3e9',
    panel: '#116e91',
    panelEdge: '#50dff3',
    star: '#c8f5ff',
    trail: '#3bd9ee',
  },
  light: {
    atmosphere: '#087fa8',
    body: '#eafcff',
    marker: '#007d79',
    panel: '#075e7f',
    panelEdge: '#069f9b',
    star: '#3a718c',
    trail: '#087f99',
  },
};

const ORBITERS: OrbiterDefinition[] = [
  {
    id: 'relay-a',
    kind: 'satellite',
    size: 0.86,
    colour: 0x57e9f4,
    elements: {
      radius: 67,
      inclinationDeg: 28,
      ascendingNodeDeg: -18,
      phaseDeg: 214,
      angularVelocity: 0.105,
    },
  },
  {
    id: 'relay-b',
    kind: 'satellite',
    size: 1.08,
    colour: 0x46d8ff,
    elements: {
      radius: 75,
      inclinationDeg: 63,
      ascendingNodeDeg: 42,
      phaseDeg: 74,
      angularVelocity: 0.074,
      direction: -1,
    },
  },
  {
    id: 'relay-c',
    kind: 'satellite',
    size: 0.72,
    colour: 0x67f2dc,
    elements: {
      radius: 82,
      inclinationDeg: 81,
      ascendingNodeDeg: 118,
      phaseDeg: 302,
      angularVelocity: 0.052,
    },
  },
  {
    id: 'relay-d',
    kind: 'satellite',
    size: 0.94,
    colour: 0x9adff3,
    elements: {
      radius: 64,
      inclinationDeg: -41,
      ascendingNodeDeg: 202,
      phaseDeg: 18,
      angularVelocity: 0.124,
    },
  },
  {
    id: 'orbital-station',
    kind: 'station',
    size: 1.42,
    colour: 0x8feaff,
    elements: {
      radius: 71,
      inclinationDeg: 51.6,
      ascendingNodeDeg: -38,
      phaseDeg: 142,
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
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 650);
  camera.position.set(0, 0, 210);
  camera.lookAt(0, -7, 0);

  const globeSystem = new THREE.Group();
  const earthSurface = new THREE.Group();
  globeSystem.add(earthSurface);
  scene.add(globeSystem);

  const earthGeometry = new THREE.SphereGeometry(
    EARTH_RADIUS,
    simplified ? 56 : 88,
    simplified ? 36 : 56,
  );
  const earthMaterial = new THREE.MeshStandardMaterial({
    color: 0x0b3e58,
    emissive: 0x041a2c,
    emissiveIntensity: 0.34,
    metalness: 0.04,
    roughness: 0.86,
  });
  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  earth.receiveShadow = false;
  earthSurface.add(earth);

  // A low-opacity unlit layer keeps coastlines and Namibia readable in the
  // dark scene without flattening the lit globe underneath it.
  const twilightMaterial = new THREE.MeshBasicMaterial({
    blending: THREE.NormalBlending,
    color: 0x76919a,
    depthTest: true,
    depthWrite: false,
    opacity: 0.6,
    transparent: true,
  });
  const twilightSurface = new THREE.Mesh(earthGeometry, twilightMaterial);
  twilightSurface.renderOrder = 2;
  twilightSurface.scale.setScalar(1.0015);
  earthSurface.add(twilightSurface);

  const atmosphereMaterial = createAtmosphereMaterial();
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS * 1.065, simplified ? 48 : 72, simplified ? 32 : 48),
    atmosphereMaterial,
  );
  atmosphere.renderOrder = 3;
  earthSurface.add(atmosphere);

  const locationMarker = createLocationMarker();
  earthSurface.add(locationMarker.group);

  const starMaterial = createStarMaterial(renderer.getPixelRatio());
  const stars = createStars(compact ? 420 : simplified ? 540 : 780, starMaterial);
  scene.add(stars);

  const ambientLight = new THREE.HemisphereLight(0x9de9ff, 0x03101c, 1.15);
  const sunLight = new THREE.DirectionalLight(0xc8f3ff, 3.2);
  sunLight.position.set(-85, 74, 120);
  const rimLight = new THREE.DirectionalLight(0x0ba5dc, 1.4);
  rimLight.position.set(95, -20, -45);
  scene.add(ambientLight, sunLight, rimLight);

  const sharedMaterials = createOrbiterMaterials();
  const orbiters = ORBITERS.map((definition) =>
    createOrbiterRuntime(definition, globeSystem, sharedMaterials),
  );

  const textures: Partial<Record<ResolvedTheme, THREE.Texture>> = {};
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
    const dayTexture = textures.light;
    const nightTexture = textures.dark;
    const surfaceTexture = dayTexture ?? nightTexture;

    earthMaterial.color.set(0x7ab0bf);
    earthMaterial.emissive.set(0x073340);
    earthMaterial.emissiveIntensity = 0.08;
    earthMaterial.map = surfaceTexture ?? null;
    earthMaterial.emissiveMap = null;
    earthMaterial.needsUpdate = true;
    twilightMaterial.map = dayTexture ?? null;
    twilightMaterial.visible = resolvedTheme === 'dark' && Boolean(dayTexture);
    twilightMaterial.needsUpdate = true;

    atmosphereMaterial.uniforms.uColour.value.set(palette.atmosphere);
    atmosphereMaterial.uniforms.uOpacity.value = resolvedTheme === 'dark' ? 0.68 : 0.42;
    starMaterial.uniforms.uColour.value.set(palette.star);
    starMaterial.uniforms.uThemeOpacity.value = resolvedTheme === 'dark' ? 1 : 0.46;
    sharedMaterials.body.color.set(palette.body);
    sharedMaterials.panel.color.set(palette.panel);
    sharedMaterials.panel.emissive.set(palette.panelEdge);
    sharedMaterials.detail.color.set(palette.panelEdge);
    locationMarker.dotMaterial.color.set(palette.marker);
    locationMarker.ringMaterial.color.set(palette.marker);

    renderer.toneMappingExposure = resolvedTheme === 'dark' ? 0.96 : 1.08;
    ambientLight.intensity = 1.55;
    sunLight.intensity = 4.0;
    rimLight.intensity = resolvedTheme === 'dark' ? 1.4 : 0.75;

    for (const orbiter of orbiters) {
      updateTrailColours(orbiter, palette.trail);
    }

    renderOnce();
  };

  const requestTexture = (theme: ResolvedTheme, url: string | undefined): void => {
    if (!url) return;

    textureLoader.load(
      url,
      (texture) => {
        if (destroyed) {
          texture.dispose();
          return;
        }

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        texture.wrapS = THREE.RepeatWrapping;
        textures[theme]?.dispose();
        textures[theme] = texture;
        updateTheme();
      },
      undefined,
      () => {
        // The procedural ocean material remains as a resilient offline fallback.
      },
    );
  };

  const updateScene = (deltaSeconds: number): void => {
    elapsed += deltaSeconds;
    const animatedTime = reducedMotion ? 0 : elapsed;

    earthSurface.rotation.set(0, INITIAL_EARTH_ROTATION + animatedTime * 0.0042, 0);
    stars.rotation.z = animatedTime * 0.0016;
    starMaterial.uniforms.uTime.value = animatedTime;
    atmosphereMaterial.uniforms.uTime.value = animatedTime;

    const markerPulse = reducedMotion ? 1 : 1 + Math.sin(animatedTime * 1.8) * 0.13;
    locationMarker.ring.scale.setScalar(markerPulse);
    locationMarker.ringMaterial.opacity = reducedMotion
      ? 0.48
      : 0.31 + (Math.sin(animatedTime * 1.8) + 1) * 0.11;

    for (const orbiter of orbiters) {
      const position = orbitalPositionAt(orbiter.elements, animatedTime);
      const tangent = orbitalTangentAt(orbiter.elements, animatedTime);
      orbiter.model.position.set(position.x, position.y, position.z);
      orientAlongTangent(orbiter.model, tangent);

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
  };

  const renderFrame = (time: number): void => {
    frameRequest = 0;
    if (destroyed) return;

    const delta = Math.min(Math.max((time - lastFrameTime) / 1000, 0), 0.05);
    lastFrameTime = time;
    updateScene(reducedMotion ? 0 : delta);
    renderer.render(scene, camera);

    if (firstFrame) {
      firstFrame = false;
      container.classList.add('is-ready');
    }

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
    if (firstFrame) {
      firstFrame = false;
      container.classList.add('is-ready');
    }
  }

  const resize = (): void => {
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    const isNarrow = width / height < 0.84;

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    starMaterial.uniforms.uPixelRatio.value = renderer.getPixelRatio();

    if (isNarrow) {
      globeSystem.position.set(8, -39, -5);
      globeSystem.scale.setScalar(0.84);
    } else if (width < 960) {
      globeSystem.position.set(28, -32, -2);
      globeSystem.scale.setScalar(0.92);
    } else {
      globeSystem.position.set(47, -27, 0);
      globeSystem.scale.setScalar(1);
    }

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
  requestTexture('light', options.lightTextureUrl);
  requestTexture('dark', options.darkTextureUrl);
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

      for (const texture of Object.values(textures)) texture?.dispose();
      disposeScene(scene);
      renderer.dispose();
      renderer.domElement.remove();
      container.classList.remove('is-ready');
    },
    render: renderOnce,
  };
}

function createAtmosphereMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    blending: THREE.AdditiveBlending,
    depthTest: true,
    depthWrite: false,
    side: THREE.FrontSide,
    transparent: true,
    uniforms: {
      uColour: { value: new THREE.Color(PALETTES.dark.atmosphere) },
      uOpacity: { value: 0.68 },
      uTime: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vViewDirection;

      void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vViewDirection = normalize(-viewPosition.xyz);
        gl_Position = projectionMatrix * viewPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColour;
      uniform float uOpacity;
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vViewDirection;

      void main() {
        float rim = pow(1.0 - max(0.0, dot(vNormal, vViewDirection)), 2.45);
        float pulse = 0.92 + 0.08 * sin(uTime * 0.72);
        float alpha = rim * uOpacity * pulse;
        gl_FragColor = vec4(uColour, alpha);
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
      attribute float aSize;
      uniform float uPixelRatio;
      uniform float uTime;
      varying float vBrightness;

      void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        float wave = sin(uTime * (0.72 + fract(aPhase) * 1.4) + aPhase * 6.28318);
        vBrightness = 0.58 + 0.42 * wave;
        gl_PointSize = max(0.75, aSize * uPixelRatio * (175.0 / -viewPosition.z) * (0.82 + vBrightness * 0.32));
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
      }
    `,
  });
}

function createStars(count: number, material: THREE.ShaderMaterial): THREE.Points {
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const sizes = new Float32Array(count);

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
    sizes[index] = 2.1 + Math.pow(random(), 3) * 5.4;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  return new THREE.Points(geometry, material);
}

function createLocationMarker(): {
  group: THREE.Group;
  ring: THREE.Mesh;
  dotMaterial: THREE.MeshBasicMaterial;
  ringMaterial: THREE.MeshBasicMaterial;
} {
  const group = new THREE.Group();
  const normal = latitudeLongitudeToNormal(NAMIBIA.latitude, NAMIBIA.longitude);
  const position = normal.clone().multiplyScalar(EARTH_RADIUS * 1.008);

  const dotMaterial = new THREE.MeshBasicMaterial({
    color: PALETTES.dark.marker,
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
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.72, 24), dotMaterial);
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.15, 1.42, 36), ringMaterial);
  const facing = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

  dot.position.copy(position);
  ring.position.copy(normal.clone().multiplyScalar(EARTH_RADIUS * 1.011));
  dot.quaternion.copy(facing);
  ring.quaternion.copy(facing);
  group.add(dot, ring);

  return { group, ring, dotMaterial, ringMaterial };
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
} {
  return {
    body: new THREE.MeshStandardMaterial({
      color: PALETTES.dark.body,
      metalness: 0.72,
      roughness: 0.28,
    }),
    detail: new THREE.MeshStandardMaterial({
      color: PALETTES.dark.panelEdge,
      emissive: 0x064860,
      emissiveIntensity: 0.45,
      metalness: 0.48,
      roughness: 0.32,
    }),
    panel: new THREE.MeshStandardMaterial({
      color: PALETTES.dark.panel,
      emissive: PALETTES.dark.panelEdge,
      emissiveIntensity: 0.16,
      metalness: 0.35,
      roughness: 0.5,
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
      : createSatelliteModel(definition.size, materials);
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
  scale: number,
  materials: ReturnType<typeof createOrbiterMaterials>,
): THREE.Group {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.55, 2.8), materials.body);
  const panelGeometry = new THREE.BoxGeometry(4.4, 0.12, 1.65);
  const leftPanel = new THREE.Mesh(panelGeometry, materials.panel);
  const rightPanel = new THREE.Mesh(panelGeometry, materials.panel);
  const boomGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4, 8);
  const leftBoom = new THREE.Mesh(boomGeometry, materials.detail);
  const rightBoom = new THREE.Mesh(boomGeometry, materials.detail);
  const antenna = new THREE.Mesh(new THREE.ConeGeometry(0.74, 0.58, 20, 1, true), materials.detail);

  leftPanel.position.x = -4.35;
  rightPanel.position.x = 4.35;
  leftBoom.rotation.z = Math.PI / 2;
  rightBoom.rotation.z = Math.PI / 2;
  leftBoom.position.x = -2.25;
  rightBoom.position.x = 2.25;
  antenna.rotation.x = Math.PI / 2;
  antenna.position.z = 1.7;
  group.add(body, leftBoom, rightBoom, leftPanel, rightPanel, antenna);
  group.scale.setScalar(scale);
  return group;
}

function createStationModel(
  scale: number,
  materials: ReturnType<typeof createOrbiterMaterials>,
): THREE.Group {
  const group = new THREE.Group();
  const articulation = new THREE.Group();
  const truss = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 9.5, 10), materials.detail);
  truss.rotation.z = Math.PI / 2;
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 3.6, 18), materials.body);
  core.rotation.x = Math.PI / 2;

  for (const x of [-3.8, -1.35, 1.35, 3.8]) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.12, 4.4), materials.panel);
    panel.position.x = x;
    articulation.add(panel);
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
): void {
  const direction = new THREE.Vector3(tangent.x, tangent.y, tangent.z).normalize();
  model.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
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
