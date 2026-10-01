import * as THREE from "three";
import {
  CSS3DObject,
  CSS3DRenderer,
} from "three/addons/renderers/CSS3DRenderer.js";

export type LiveWallPortalPhoto = {
  id: string;
  url: string;
  focusUrl?: string;
  dominantColor?: string;
};

export type LiveWallPortalRenderer = {
  sync: (
    photos: LiveWallPortalPhoto[],
    focusedId: string,
    active: boolean,
  ) => Promise<void>;
  dispose: () => void;
};

type CloudCard = {
  id: string;
  url: string;
  object: CSS3DObject;
  element: HTMLDivElement;
  falloffElement: HTMLDivElement;
  home: THREE.Vector3;
  homeRotation: THREE.Euler;
  homeScale: number;
  focusX: number;
  foreground: boolean;
  tone: THREE.Color;
  revealStartedAt: number | null;
  phase: number;
  width: number;
  height: number;
};

type Arrival = {
  id: string;
  startedAt: number;
};

type FocusTransition = {
  fromId: string;
  toId: string;
  startedAt: number;
};

type SceneReaction = {
  attraction: number;
  separation: number;
  targetX: number;
  targetY: number;
};

const MAX_CLOUD_PHOTOS = 16;
const MAX_PENDING_ARRIVALS = 2;
const ARRIVAL_DURATION_MS = 8_800;
const FOCUS_TRANSITION_MS = 2_700;
const SIGNATURE_PULL_MS = 210;
const IDLE_FOCUS_DELAY_MS = 16_000;
const IDLE_FOCUS_INTERVAL_MS = 14_000;
const HOME_SCALE = 0.004;
const NO_REACTION: SceneReaction = {
  attraction: 0,
  separation: 0,
  targetX: 0,
  targetY: 0,
};

function seededValue(seed: string, offset: number) {
  let value = 2166136261 ^ offset;

  for (let index = 0; index < seed.length; index += 1) {
    value = Math.imul(value ^ seed.charCodeAt(index), 16777619);
  }

  return ((value >>> 0) % 10_000) / 10_000;
}

function smoothStep(value: number) {
  const clamped = THREE.MathUtils.clamp(value, 0, 1);

  return clamped * clamped * (3 - 2 * clamped);
}

function phaseProgress(progress: number, start: number, end: number) {
  return smoothStep((progress - start) / (end - start));
}

function signaturePull(elapsedMs: number) {
  const progress = THREE.MathUtils.clamp(elapsedMs / SIGNATURE_PULL_MS, 0, 1);

  return Math.sin(progress * Math.PI);
}

function getFocusOffset(id: string) {
  const offsetChance = seededValue(id, 71);

  if (offsetChance < 0.58) return 0;

  const direction = seededValue(id, 73) < 0.5 ? -1 : 1;

  return direction * (0.24 + seededValue(id, 79) * 0.34);
}

function getPhotoTone(id: string, requestedColor?: string) {
  if (requestedColor && CSS.supports("color", requestedColor)) {
    return new THREE.Color(requestedColor);
  }

  return new THREE.Color().setHSL(
    0.055 + seededValue(id, 83) * 0.3,
    0.2 + seededValue(id, 89) * 0.13,
    0.16 + seededValue(id, 97) * 0.08,
  );
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.alt = "";
    image.decoding = "async";
    image.draggable = false;
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Live Wall photo could not load"));
    // CSS3D displays the DOM image directly, so unlike a WebGL texture it
    // never reads cross-origin pixels and does not require R2 CORS headers.
    image.src = url;
  });
}

function setCardAppearance(card: CloudCard, opacity: number, falloff = 0) {
  card.element.style.opacity = opacity.toFixed(3);
  card.falloffElement.style.opacity = (falloff * 0.18).toFixed(3);

  if (falloff > 0.12) {
    card.element.dataset.falloff = "true";
  } else {
    delete card.element.dataset.falloff;
  }

  // Keep filters off the transformed card itself. Chromium can otherwise
  // flatten several CSS3D siblings into one soft raster surface.
  card.element.style.filter = "none";
}

function disposeCard(cloud: THREE.Group, card: CloudCard) {
  cloud.remove(card.object);
  card.element.remove();
}

export function createLiveWallPortalRenderer(
  container: HTMLDivElement,
): LiveWallPortalRenderer {
  container.replaceChildren();

  const renderer = new CSS3DRenderer({ element: container });
  const sceneElement = container.firstElementChild as HTMLDivElement;
  const atmosphereElements = [
    document.createElement("div"),
    document.createElement("div"),
  ];
  const scene = new THREE.Scene();
  const cloud = new THREE.Group();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
  const glowElement = document.createElement("div");
  const arrivalGlow = new CSS3DObject(glowElement);
  const cards = new Map<string, CloudCard>();
  const loadingCards = new Map<string, Promise<void>>();
  const knownPhotoIds = new Set<string>();
  const arrivalQueue: string[] = [];
  const observer = new ResizeObserver(resize);
  let desiredPhotoIds = new Set<string>();
  let arrival: Arrival | null = null;
  let focusedId = "";
  let visualFocusId = "";
  let focusTransition: FocusTransition | null = null;
  let completedArrivalId = "";
  let atmosphereIndex = 0;
  let atmosphereId = "";
  let active = true;
  let initialized = false;
  let disposed = false;
  let frame = 0;
  let lastTime = performance.now();
  let lastArrivalAt = lastTime;
  let lastFocusRequestAt = lastTime;
  let lastIdleFocusAt = lastTime;
  let idleAmount = 0;
  let idleCursor = 0;
  let focusAmount = 0;

  sceneElement.className = "live-wall-player__portal-scene";
  atmosphereElements.forEach((element, index) => {
    element.className = `live-wall-player__portal-atmosphere live-wall-player__portal-atmosphere--${index === 0 ? "primary" : "secondary"}`;
    element.style.opacity = index === 0 ? "1" : "0";
  });
  container.prepend(atmosphereElements[1]);
  container.prepend(atmosphereElements[0]);
  glowElement.className = "live-wall-player__portal-glow";
  camera.position.set(0, 0, 8);
  scene.add(cloud, arrivalGlow);
  arrivalGlow.visible = false;
  observer.observe(container);

  function getFocusScale(card: CloudCard) {
    const viewHeight =
      2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 5.45;
    const viewWidth = viewHeight * camera.aspect;

    return Math.min(
      (viewHeight * 0.78) / card.height,
      (viewWidth * 0.82) / card.width,
    );
  }

  function setAtmosphere(card: CloudCard | undefined) {
    if (!card || atmosphereId === card.id) return;

    atmosphereId = card.id;

    const previous = atmosphereElements[atmosphereIndex];
    const nextIndex = atmosphereIndex === 0 ? 1 : 0;
    const next = atmosphereElements[nextIndex];
    const red = Math.round(card.tone.r * 255);
    const green = Math.round(card.tone.g * 255);
    const blue = Math.round(card.tone.b * 255);

    // The heavily zoomed, darkened photo supplies its real color character
    // without canvas pixel access (signed R2 URLs may not permit CORS reads).
    // The metadata/fallback tone keeps the ambience stable while it loads.
    next.style.backgroundImage = `radial-gradient(circle at ${50 + card.focusX * 4}% 42%, rgba(${red}, ${green}, ${blue}, 0.44) 0%, rgba(${red}, ${green}, ${blue}, 0.1) 42%, transparent 72%), linear-gradient(rgba(3, 5, 4, 0.76), rgba(3, 5, 4, 0.86)), url(${JSON.stringify(card.url)})`;
    next.style.opacity = "1";
    previous.style.opacity = "0";
    atmosphereIndex = nextIndex;
  }

  function beginFocusTransition(nextId: string, now: number) {
    if (!nextId || nextId === visualFocusId) return;

    focusTransition = visualFocusId
      ? { fromId: visualFocusId, toId: nextId, startedAt: now }
      : null;
    visualFocusId = nextId;
    setAtmosphere(cards.get(nextId));
  }

  function createCard(
    id: string,
    url: string,
    image: HTMLImageElement,
    dominantColor?: string,
  ): CloudCard {
    const aspect = THREE.MathUtils.clamp(
      image.naturalWidth / Math.max(image.naturalHeight, 1),
      0.58,
      1.82,
    );
    const height = 640;
    const width = height * aspect;
    const element = document.createElement("div");
    const falloffElement = document.createElement("div");
    const object = new CSS3DObject(element);
    const foreground = seededValue(id, 67) > 0.8;
    const horizontalSeed = seededValue(id, 11) - 0.5;
    const edgeDirection = horizontalSeed < 0 ? -1 : 1;
    const depth = foreground
      ? 0.3 + seededValue(id, 69) * 0.85
      : -1.4 - seededValue(id, 7) * 9.5;
    const home = new THREE.Vector3(
      foreground
        ? edgeDirection * (4.85 + seededValue(id, 75) * 1.15)
        : horizontalSeed * 9.2,
      (seededValue(id, 17) - 0.5) * (foreground ? 4.2 : 5.2),
      depth,
    );
    const homeRotation = new THREE.Euler(
      (seededValue(id, 23) - 0.5) * 0.12,
      (seededValue(id, 29) - 0.5) * 0.2,
      (seededValue(id, 31) - 0.5) * 0.15,
    );
    const homeScale = foreground
      ? 0.5 + seededValue(id, 37) * 0.2
      : 0.68 + seededValue(id, 37) * 0.62;

    element.className = "live-wall-player__portal-card";
    element.dataset.mediaId = id;
    element.dataset.state = "cloud";
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
    image.className = "live-wall-player__portal-image";
    falloffElement.className = "live-wall-player__portal-falloff";
    element.append(image, falloffElement);
    object.position.copy(home);
    object.rotation.copy(homeRotation);
    object.scale.setScalar(HOME_SCALE * homeScale);
    cloud.add(object);

    return {
      id,
      url,
      object,
      element,
      falloffElement,
      home,
      homeRotation,
      homeScale,
      focusX: getFocusOffset(id),
      foreground,
      tone: getPhotoTone(id, dominantColor),
      revealStartedAt: null,
      phase: seededValue(id, 41) * Math.PI * 2,
      width,
      height,
    };
  }

  function ensureCard(
    photo: LiveWallPortalPhoto,
    isNew: boolean,
    shouldArrive: boolean,
    isFocused: boolean,
  ) {
    const existing = cards.get(photo.id);
    const hadCard = Boolean(existing);
    const preferredUrl =
      shouldArrive || isFocused ? photo.focusUrl || photo.url : photo.url;
    const existingIsFullQuality =
      !isNew && !isFocused && existing?.url === photo.focusUrl;

    if (existing?.url === preferredUrl || existingIsFullQuality) {
      return Promise.resolve();
    }

    if (loadingCards.has(photo.id)) return loadingCards.get(photo.id)!;

    const pending = loadImage(preferredUrl)
      .then((image) => {
        if (disposed || !desiredPhotoIds.has(photo.id)) return;

        const stale = cards.get(photo.id);
        let card: CloudCard;

        if (stale) {
          const currentImage = stale.element.querySelector(
            ".live-wall-player__portal-image",
          );

          image.className = "live-wall-player__portal-image";
          currentImage?.replaceWith(image);
          stale.url = preferredUrl;
          card = stale;
        } else {
          card = createCard(photo.id, preferredUrl, image, photo.dominantColor);
          cards.set(photo.id, card);
        }

        card.element.dataset.quality =
          preferredUrl === photo.focusUrl ? "full" : "preview";

        if (shouldArrive && !hadCard) {
          card.object.position.set(
            (seededValue(photo.id, 53) - 0.5) * 2.4,
            (seededValue(photo.id, 59) - 0.5) * 1.6,
            -15,
          );
          card.object.scale.setScalar(0.0002);
          setCardAppearance(card, 0);
          card.element.dataset.state = "arrival";
          arrivalQueue.push(photo.id);
          startNextArrival();
        } else if (isNew && !hadCard) {
          card.revealStartedAt = performance.now();
          card.element.dataset.state = "reveal";
          setCardAppearance(card, 0);
        }
      })
      // One expired signed URL must not tear down the entire cloud.
      .catch(() => undefined)
      .finally(() => loadingCards.delete(photo.id));

    loadingCards.set(photo.id, pending);

    return pending;
  }

  function startNextArrival() {
    if (arrival || !arrivalQueue.length) return;

    const id = arrivalQueue.shift()!;

    if (!cards.has(id)) {
      startNextArrival();

      return;
    }

    const now = performance.now();

    arrival = { id, startedAt: now };
    lastArrivalAt = now;
    lastIdleFocusAt = now;
    completedArrivalId = "";
    focusTransition = null;
    setAtmosphere(cards.get(id));
    requestFrame();
  }

  function settleArrival() {
    if (!arrival) return;

    const card = cards.get(arrival.id);

    if (card) {
      card.object.position.copy(card.home);
      card.object.rotation.copy(card.homeRotation);
      card.object.scale.setScalar(HOME_SCALE * card.homeScale);
      setCardAppearance(card, 0.86);
      card.element.dataset.state = "cloud";
    }

    completedArrivalId = arrival.id;
    arrival = null;
    arrivalGlow.visible = false;
    lastArrivalAt = performance.now();
    startNextArrival();
  }

  function updateArrival(now: number): SceneReaction {
    if (!arrival) return NO_REACTION;

    const card = cards.get(arrival.id);

    if (!card) {
      arrival = null;
      startNextArrival();

      return NO_REACTION;
    }

    const progress = Math.min(
      (now - arrival.startedAt) / ARRIVAL_DURATION_MS,
      1,
    );
    const materialize = phaseProgress(progress, 0, 0.14);
    const approach = phaseProgress(progress, 0.1, 0.4);
    const opening = phaseProgress(progress, 0.026, 0.34);
    const retreat = phaseProgress(progress, 0.78, 1);
    const centerScale = getFocusScale(card);
    const origin = new THREE.Vector3(
      (seededValue(card.id, 53) - 0.5) * 2.4,
      (seededValue(card.id, 59) - 0.5) * 1.6,
      -15,
    );
    const center = new THREE.Vector3(card.focusX, 0, 2.55);
    const incomingPosition = origin.clone().lerp(center, approach);
    const settle =
      Math.sin(phaseProgress(progress, 0.34, 0.47) * Math.PI) *
      (progress < 0.47 ? 1 : 0);

    incomingPosition.y += Math.sin(approach * Math.PI) * 0.42;
    incomingPosition.x += card.focusX * settle * 0.016;
    incomingPosition.z += settle * 0.1;
    card.object.position.copy(incomingPosition).lerp(card.home, retreat);
    card.object.rotation.set(
      THREE.MathUtils.lerp(
        THREE.MathUtils.lerp(-0.08, 0, approach),
        card.homeRotation.x,
        retreat,
      ),
      THREE.MathUtils.lerp(
        THREE.MathUtils.lerp(-0.22, 0, approach),
        card.homeRotation.y,
        retreat,
      ),
      THREE.MathUtils.lerp(
        THREE.MathUtils.lerp(0.06, 0, approach),
        card.homeRotation.z,
        retreat,
      ),
    );

    const microZoom =
      1 +
      settle * 0.012 +
      Math.sin(phaseProgress(progress, 0.48, 0.74) * Math.PI) * 0.007;
    const arrivingScale =
      THREE.MathUtils.lerp(0.0002, centerScale, approach) * microZoom;

    card.object.scale.setScalar(
      THREE.MathUtils.lerp(arrivingScale, HOME_SCALE * card.homeScale, retreat),
    );
    setCardAppearance(card, THREE.MathUtils.lerp(materialize, 0.86, retreat));

    arrivalGlow.visible = progress < 0.34;
    arrivalGlow.position.copy(origin.clone().lerp(center, approach * 0.92));
    arrivalGlow.scale.setScalar(THREE.MathUtils.lerp(0.003, 0.012, approach));
    glowElement.style.opacity = (
      Math.sin(Math.min(progress / 0.34, 1) * Math.PI) * 0.3
    ).toFixed(3);

    if (progress >= 1) settleArrival();

    // CandidCrowd's signature reaction: the cloud is pulled briefly toward
    // the new moment before it opens and recedes for the hero.
    return {
      attraction: signaturePull(now - arrival.startedAt),
      separation: opening * (1 - retreat),
      targetX: center.x,
      targetY: center.y,
    };
  }

  function render(now = performance.now()) {
    frame = 0;
    if (disposed || !active || document.hidden) return;

    const delta = Math.min((now - lastTime) / 1000, 0.05);
    const elapsed = now / 1000;
    const arrivalReaction = updateArrival(now);

    if (
      !arrival &&
      cards.size > 1 &&
      now - lastFocusRequestAt > IDLE_FOCUS_DELAY_MS &&
      now - lastIdleFocusAt > IDLE_FOCUS_INTERVAL_MS
    ) {
      const idleCandidates = [...cards.keys()].filter(
        (id) => id !== visualFocusId,
      );
      const nextIdleId = idleCandidates[idleCursor % idleCandidates.length];

      idleCursor += 1;
      lastIdleFocusAt = now;
      beginFocusTransition(nextIdleId, now);
    }

    const activeFocusId =
      arrival || visualFocusId === completedArrivalId ? "" : visualFocusId;
    let focusBlend = 1;
    let focusSettle = 0;
    let focusAttraction = 0;

    if (focusTransition && !arrival) {
      const transitionElapsed = now - focusTransition.startedAt;
      const transitionProgress = THREE.MathUtils.clamp(
        transitionElapsed / FOCUS_TRANSITION_MS,
        0,
        1,
      );

      focusAttraction = signaturePull(transitionElapsed);
      focusBlend = phaseProgress(transitionProgress, 0.075, 0.76);
      focusSettle =
        Math.sin(phaseProgress(transitionProgress, 0.68, 0.9) * Math.PI) *
        (transitionProgress < 0.9 ? 1 : 0);

      if (transitionProgress >= 1) focusTransition = null;
    }

    focusAmount = THREE.MathUtils.damp(
      focusAmount,
      activeFocusId ? 1 : 0,
      2.2,
      delta,
    );

    const idleTarget = !arrival && now - lastArrivalAt > 9_000 ? 1 : 0;

    idleAmount = THREE.MathUtils.damp(idleAmount, idleTarget, 0.42, delta);
    camera.position.x =
      Math.sin(elapsed * 0.055) * THREE.MathUtils.lerp(0.12, 0.3, idleAmount);
    camera.position.y =
      Math.cos(elapsed * 0.043) * THREE.MathUtils.lerp(0.07, 0.16, idleAmount);
    // The idle dolly has a 29-second cycle and less than a quarter-unit travel.
    // It reads as a living space rather than an actively controlled camera.
    camera.position.z =
      8 +
      Math.sin(elapsed * 0.215) * THREE.MathUtils.lerp(0.09, 0.22, idleAmount);
    camera.lookAt(0, 0, -1.8);

    const transitionTarget = focusTransition
      ? cards.get(focusTransition.toId)
      : undefined;
    const stableTarget = cards.get(activeFocusId);
    const focusTarget = transitionTarget ?? stableTarget;
    const sceneReaction: SceneReaction = arrival
      ? arrivalReaction
      : {
          attraction: focusAttraction,
          separation: focusAmount,
          targetX: focusTarget?.focusX ?? 0,
          targetY: 0,
        };

    cards.forEach((card) => {
      if (arrival?.id === card.id) return;

      let heroWeight = card.id === activeFocusId ? 1 : 0;

      if (focusTransition && !arrival) {
        if (card.id === focusTransition.fromId) {
          heroWeight = 1 - focusBlend;
        } else if (card.id === focusTransition.toId) {
          heroWeight = focusBlend;
        } else {
          heroWeight = 0;
        }
      }

      const floatX = Math.sin(elapsed * 0.13 + card.phase) * 0.08;
      const floatY = Math.cos(elapsed * 0.11 + card.phase) * 0.09;
      const depthBreath =
        Math.sin(elapsed * 0.072 + card.phase * 0.83) *
        (card.foreground ? 0.1 : 0.18);
      const side = card.home.x >= sceneReaction.targetX ? 1 : -1;
      const separation = sceneReaction.separation * (1 - heroWeight);
      const attraction = sceneReaction.attraction * (1 - heroWeight) * 0.055;
      const cloudX =
        THREE.MathUtils.lerp(
          card.home.x + floatX,
          sceneReaction.targetX,
          attraction,
        ) +
        side * separation * 1.34 -
        sceneReaction.targetX * separation * 0.24;
      const cloudY = THREE.MathUtils.lerp(
        card.home.y + floatY,
        sceneReaction.targetY,
        attraction * 0.72,
      );
      const cloudZ =
        card.home.z +
        depthBreath -
        separation * (card.foreground ? 1.95 : 1.48) +
        sceneReaction.attraction * 0.08;
      const isIncomingHero = focusTransition?.toId === card.id;
      const heroPosition = new THREE.Vector3(
        card.focusX,
        0,
        2.55 + (isIncomingHero ? focusSettle * 0.09 : 0),
      );
      const target = new THREE.Vector3(cloudX, cloudY, cloudZ).lerp(
        heroPosition,
        heroWeight,
      );
      const cloudScale = HOME_SCALE * card.homeScale;
      const heroScale =
        getFocusScale(card) *
        (1 +
          Math.sin(elapsed * 0.8) * 0.006 * heroWeight +
          (isIncomingHero ? focusSettle * 0.012 : 0));
      const targetScale = THREE.MathUtils.lerp(
        cloudScale,
        heroScale,
        heroWeight,
      );

      card.object.position.x = THREE.MathUtils.damp(
        card.object.position.x,
        target.x,
        2.1,
        delta,
      );
      card.object.position.y = THREE.MathUtils.damp(
        card.object.position.y,
        target.y,
        2.1,
        delta,
      );
      card.object.position.z = THREE.MathUtils.damp(
        card.object.position.z,
        target.z,
        1.8,
        delta,
      );
      card.object.rotation.x = THREE.MathUtils.damp(
        card.object.rotation.x,
        card.homeRotation.x * (1 - heroWeight),
        2.3,
        delta,
      );
      card.object.rotation.y = THREE.MathUtils.damp(
        card.object.rotation.y,
        card.homeRotation.y * (1 - heroWeight),
        2.3,
        delta,
      );
      card.object.rotation.z = THREE.MathUtils.damp(
        card.object.rotation.z,
        card.homeRotation.z * (1 - heroWeight),
        2.3,
        delta,
      );

      const nextScale = THREE.MathUtils.damp(
        card.object.scale.x,
        targetScale,
        2,
        delta,
      );
      const distanceFade = THREE.MathUtils.clamp(
        1 - Math.max(0, -card.object.position.z - 2) / 18,
        0.42,
        0.9,
      );
      let reveal = 1;

      if (card.revealStartedAt !== null) {
        reveal = phaseProgress((now - card.revealStartedAt) / 1_200, 0, 1);

        if (reveal >= 1) {
          card.revealStartedAt = null;
          card.element.dataset.state = "cloud";
        }
      }

      card.object.scale.setScalar(nextScale);
      setCardAppearance(
        card,
        THREE.MathUtils.lerp(distanceFade, 1, heroWeight) * reveal,
        separation,
      );
    });

    renderer.render(scene, camera);
    lastTime = now;
    requestFrame();
  }

  function requestFrame() {
    if (!frame && active && !disposed && !document.hidden) {
      frame = requestAnimationFrame(render);
    }
  }

  function resize() {
    const { width, height } = container.getBoundingClientRect();

    if (!width || !height || disposed) return;

    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }

  function visibility() {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else {
      lastTime = performance.now();
      requestFrame();
    }
  }

  document.addEventListener("visibilitychange", visibility);

  return {
    async sync(photos, nextFocusedId, nextActive) {
      const newPhotoIds = new Set(
        initialized
          ? photos
              .filter((photo) => !knownPhotoIds.has(photo.id))
              .map((photo) => photo.id)
          : [],
      );
      const selected: LiveWallPortalPhoto[] = [];

      const append = (photo: LiveWallPortalPhoto | undefined) => {
        if (
          photo &&
          selected.length < MAX_CLOUD_PHOTOS &&
          !selected.some(({ id }) => id === photo.id)
        ) {
          selected.push(photo);
        }
      };

      photos.forEach((photo) => knownPhotoIds.add(photo.id));
      photos
        .filter((photo) => newPhotoIds.has(photo.id))
        .slice(0, 6)
        .forEach(append);
      append(photos.find((photo) => photo.id === nextFocusedId));
      photos.forEach(append);

      const selectedIds = new Set(selected.map((photo) => photo.id));
      const availableArrivalSlots = Math.max(
        0,
        MAX_PENDING_ARRIVALS - arrivalQueue.length - (arrival ? 1 : 0),
      );
      // A burst contributes to the cloud immediately, but only one photo from
      // each snapshot earns the full New Moment choreography. A second can
      // wait in the short queue; the rest reveal quietly at their home depth.
      const arrivalIds = new Set(
        [...newPhotoIds].slice(0, Math.min(1, availableArrivalSlots)),
      );

      desiredPhotoIds = selectedIds;
      cards.forEach((card, id) => {
        if (selectedIds.has(id) || arrival?.id === id) return;
        disposeCard(cloud, card);
        cards.delete(id);
      });

      const pendingCards = selected.map((photo) =>
        ensureCard(
          photo,
          newPhotoIds.has(photo.id),
          arrivalIds.has(photo.id),
          photo.id === nextFocusedId,
        ),
      );

      initialized = true;
      await Promise.all(pendingCards);

      if (!cards.size && selected.length) {
        throw new Error("Live Wall photo cloud has no loadable photos");
      }

      if (nextFocusedId !== focusedId) {
        const now = performance.now();

        focusedId = nextFocusedId;
        lastFocusRequestAt = now;
        lastIdleFocusAt = now;
        beginFocusTransition(nextFocusedId, now);
        if (completedArrivalId !== nextFocusedId) completedArrivalId = "";
      } else if (!visualFocusId && nextFocusedId) {
        visualFocusId = nextFocusedId;
        setAtmosphere(cards.get(nextFocusedId));
      }

      active = nextActive;

      if (active) {
        lastTime = performance.now();
        requestFrame();
      } else {
        cancelAnimationFrame(frame);
        frame = 0;
        renderer.render(scene, camera);
      }
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      cards.forEach((card) => disposeCard(cloud, card));
      cards.clear();
      container.replaceChildren();
    },
  };
}
