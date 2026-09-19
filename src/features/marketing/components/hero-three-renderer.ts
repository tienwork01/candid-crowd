import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { photos } from "../data/marketing";

export type HeroRenderer = {
  update: (progress: number, active: boolean, angle: number) => void;
  dispose: () => void;
};

// Imported only after the SSR hero has painted. No renderer in the initial bundle.
export async function createHeroRenderer(
  host: HTMLDivElement,
  signal: AbortSignal,
  onFailure: () => void,
): Promise<HeroRenderer> {
  const images = await Promise.all(
    [photos.celebration, photos.couple, photos.table].map(async (photo) => {
      const image = new Image();

      image.src = photo.src;
      await image.decode();

      return image;
    }),
  );

  signal.throwIfAborted();

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    // The scene is opt-in and already bypassed on constrained devices. Give
    // its short, user-triggered transfer enough GPU headroom to stay smooth.
    powerPreference: "high-performance",
  });

  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  // PCFSoft keeps the physical depth cue without VSM's extra blur pass.
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 40);

  camera.position.set(0, 0, 12);

  const root = new THREE.Group();

  scene.add(root, new THREE.HemisphereLight(0xffffff, 0x707961, 1.8));

  const light = new THREE.DirectionalLight(0xfff2d9, 2.4);

  light.position.set(-2, 3, 10);
  light.castShadow = true;
  light.shadow.mapSize.set(384, 384);
  Object.assign(light.shadow.camera, {
    left: -5,
    right: 5,
    top: 5,
    bottom: -5,
    near: 0.5,
    far: 20,
  });
  light.shadow.bias = -0.002;
  light.shadow.radius = 4;
  scene.add(light);

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    new THREE.ShadowMaterial({ opacity: 0.075, depthWrite: false }),
  );

  shadow.position.z = -0.8;
  shadow.receiveShadow = true;
  scene.add(shadow);

  const rim = new THREE.DirectionalLight(0xffffff, 2);

  rim.position.set(4, 1, -2);
  scene.add(rim);

  const textures: THREE.Texture[] = [];
  const style = getComputedStyle(host);
  const ink = style.getPropertyValue("--ink").trim() || "#2d352b";
  const paper = style.getPropertyValue("--surface").trim() || "#fffefa";
  const primary = style.getPropertyValue("--primary").trim() || "#46533a";
  const muted = style.getPropertyValue("--sage").trim() || "#e4e8db";

  function texture(
    width: number,
    height: number,
    paint: (ctx: CanvasRenderingContext2D) => void,
  ) {
    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, width, height);
    paint(ctx);

    const map = new THREE.CanvasTexture(canvas);

    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    textures.push(map);

    return map;
  }

  function photo(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number,
  ) {
    const scale = Math.max(w / image.width, h / image.height);
    const sw = w / scale,
      sh = h / scale;

    ctx.drawImage(
      image,
      (image.width - sw) / 2,
      (image.height - sh) / 2,
      sw,
      sh,
      x,
      y,
      w,
      h,
    );
  }

  const phoneMap = texture(512, 1024, (ctx) => {
    ctx.fillStyle = ink;
    ctx.font = "22px sans-serif";
    ctx.fillText("9:41", 34, 48);
    ctx.font = "18px sans-serif";
    ctx.fillText("YOUR GUEST’S PHONE", 100, 136);
    photo(ctx, images[0], 24, 175, 464, 595);
    ctx.fillStyle = ink;
    ctx.font = "italic 32px Georgia";
    ctx.fillText("One little moment.", 110, 825);
    ctx.fillStyle = primary;
    ctx.fillRect(24, 874, 464, 76);
    ctx.fillStyle = paper;
    ctx.font = "24px sans-serif";
    ctx.fillText("Ready to share  ↗", 145, 922);
  });
  const galleryMap = texture(768, 900, (ctx) => {
    ctx.fillStyle = ink;
    ctx.font = "20px sans-serif";
    ctx.fillText("THE SHARED GALLERY", 44, 60);
    ctx.font = "48px Georgia";
    ctx.fillText("Emma & James", 44, 124);
    ctx.fillStyle = muted;
    ctx.fillRect(394, 604, 338, 214);
    ctx.fillStyle = ink;
    ctx.font = "26px Georgia";
    ctx.fillText("Your next memory", 418, 718);
    ctx.font = "italic 26px Georgia";
    ctx.fillText("Every guest. A different perspective.", 155, 869);
  });
  const memoryMap = texture(512, 352, (ctx) =>
    photo(ctx, images[0], 12, 12, 488, 304),
  );

  function box(
    parent: THREE.Object3D,
    w: number,
    h: number,
    depth: number,
    color: string,
    radius: number,
  ) {
    const mesh = new THREE.Mesh(
      new RoundedBoxGeometry(w, h, depth, 3, radius),
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.42,
        metalness: 0.15,
      }),
    );

    parent.add(mesh);

    return mesh;
  }

  function face(
    parent: THREE.Object3D,
    map: THREE.Texture,
    w: number,
    h: number,
    z: number,
  ) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map }),
    );

    mesh.position.z = z;
    parent.add(mesh);

    return mesh;
  }

  const phone = new THREE.Group();

  phone.position.set(-1.55, -0.22, 0.9);
  phone.rotation.set(-0.08, 0.35, -0.12);
  root.add(phone);

  const phoneBody = box(phone, 2.04, 4.02, 0.28, ink, 0.19);

  phoneBody.castShadow = true;
  face(phone, phoneMap, 1.83, 3.67, 0.148);

  const speaker = box(phone, 0.56, 0.1, 0.04, ink, 0.04);

  speaker.position.set(0, 1.7, 0.18);

  const sideButton = box(phone, 0.06, 0.52, 0.09, primary, 0.02);

  sideButton.position.set(-1.04, 0.62, 0);

  const uploadTrack = box(phone, 1.65, 0.035, 0.012, muted, 0.006);

  uploadTrack.position.set(0, -1.63, 0.16);

  const uploadBar = box(phone, 1.65, 0.035, 0.014, primary, 0.006);

  uploadBar.position.set(0, -1.63, 0.17);

  const gallery = new THREE.Group();

  gallery.position.set(1.05, 0.5, -0.1);
  gallery.rotation.set(0.04, -0.19, 0.06);
  root.add(gallery);

  const backing = box(gallery, 3.55, 4.18, 0.08, muted, 0.07);

  backing.position.set(0.12, -0.1, -0.12);
  backing.rotation.z = -0.045;

  const galleryBody = box(gallery, 3.55, 4.18, 0.13, paper, 0.09);

  galleryBody.castShadow = true;
  face(gallery, galleryMap, 3.4, 3.99, 0.071);

  const galleryTiles = [
    { image: images[1], x: 36, y: 164, w: 696, h: 420, lift: 0.24 },
    { image: images[2], x: 36, y: 604, w: 338, h: 214, lift: 0.18 },
  ].map((tile) => {
    const group = new THREE.Group();
    const w = (tile.w / 768) * 3.4;
    const h = (tile.h / 900) * 3.99;
    const map = texture(tile.w, tile.h, (ctx) =>
      photo(ctx, tile.image, 0, 0, tile.w, tile.h),
    );
    const body = box(group, w + 0.06, h + 0.06, 0.055, paper, 0.02);

    body.castShadow = true;
    face(group, map, w, h, 0.03);
    group.position.set(
      ((tile.x + tile.w / 2) / 768 - 0.5) * 3.4,
      (0.5 - (tile.y + tile.h / 2) / 900) * 3.99,
      tile.lift,
    );
    gallery.add(group);

    return { group, lift: tile.lift };
  });

  const prints = new THREE.Group();

  root.add(prints);

  const printLayouts = [
    { x: -2.85, y: 1.7, z: -0.5, angle: -0.18, image: images[2] },
    { x: 2.8, y: -1.6, z: 0.25, angle: 0.16, image: images[1] },
  ];

  for (const layout of printLayouts) {
    const print = new THREE.Group();
    const map = texture(384, 448, (ctx) =>
      photo(ctx, layout.image, 16, 16, 352, 368),
    );

    const printBody = box(print, 1.2, 1.4, 0.045, paper, 0.02);

    printBody.castShadow = true;
    face(print, map, 1.18, 1.38, 0.025);
    print.position.set(layout.x, layout.y, layout.z);
    print.rotation.set(-0.08, layout.x < 0 ? 0.18 : -0.22, layout.angle);
    prints.add(print);
  }

  const memory = new THREE.Group();

  const memoryBody = box(memory, 1.55, 1.09, 0.06, paper, 0.03);

  memoryBody.castShadow = true;
  face(memory, memoryMap, 1.5, 1.03, 0.035);
  root.add(memory);

  const start = new THREE.Vector3(-1.55, -0.15, 1.25);
  // Convert the receiving tile's texture coordinates into the gallery's space.
  const destination = new THREE.Vector3(
    (563 / 768 - 0.5) * 3.4,
    (0.5 - 711 / 900) * 3.99,
    0.18,
  );
  const end = new THREE.Vector3();
  let targetProgress = 0,
    progress = 0,
    active = true,
    disposed = false,
    frame = 0;
  let pointerX = 0,
    pointerY = 0;
  let drawn = 0;
  let lastTime = 0;
  let entrance = 0;
  let viewAngle = 0;
  let compact = false;
  let phoneState = "idle";

  function render(time = performance.now()) {
    frame = 0;
    if (disposed || !active || document.hidden) return;

    const delta = Math.min((time - lastTime) / 1000, 0.05);

    lastTime = time;
    entrance = Math.min(1, entrance + delta / 1.6);

    const reveal = 1 - Math.pow(1 - entrance, 3);
    const targetRotation = pointerX + viewAngle;

    progress = THREE.MathUtils.damp(progress, targetProgress, 14, delta);
    if (Math.abs(progress - targetProgress) < 0.001) progress = targetProgress;
    root.rotation.y = THREE.MathUtils.damp(
      root.rotation.y,
      targetRotation,
      10,
      delta,
    );
    root.rotation.x = THREE.MathUtils.damp(
      root.rotation.x,
      pointerY - (1 - reveal) * 0.12,
      10,
      delta,
    );
    phone.position.x = -1.55 - (1 - reveal) * 0.6;
    phone.position.y = -0.22 - (1 - reveal) * 0.5;
    phone.rotation.z = -0.12 - (1 - reveal) * 0.2;
    gallery.rotation.y = -0.19 + (1 - reveal) * 0.45;
    gallery.position.y = 0.5 + (1 - reveal) * 0.4;
    galleryTiles.forEach(({ group, lift }, index) => {
      const unfold = THREE.MathUtils.smoothstep(entrance, index * 0.12, 0.85);

      group.position.z = lift + (1 - unfold) * 0.75;
      group.rotation.x = (1 - unfold) * -0.18;
    });
    // Different depth responses keep the paper layers feeling physical.
    prints.children.forEach((print, index) => {
      const layout = printLayouts[index];
      const depth = index === 0 ? -0.65 : 0.9;

      print.position.x =
        layout.x * (0.72 + reveal * 0.28) + root.rotation.y * depth;
      print.position.y =
        layout.y - root.rotation.x * depth - (1 - reveal) * 0.5;
      print.rotation.z =
        layout.angle + root.rotation.y * depth * 0.7 + (1 - reveal) * depth;
    });
    light.position.x = -2 + root.rotation.y * 3;

    const flight = Math.sin(progress * Math.PI);
    const arrival = Math.sin(
      THREE.MathUtils.smoothstep(progress, 0.84, 1) * Math.PI,
    );

    const nextPhoneState =
      targetProgress === 0
        ? "idle"
        : targetProgress === 1
          ? "shared"
          : "sharing";

    if (nextPhoneState !== phoneState) {
      phoneState = nextPhoneState;

      const ctx = (phoneMap.image as HTMLCanvasElement).getContext("2d")!;

      ctx.fillStyle = primary;
      ctx.fillRect(24, 874, 464, 76);
      ctx.fillStyle = paper;
      ctx.font = "24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        phoneState === "shared"
          ? "Memory shared"
          : phoneState === "sharing"
            ? "Sharing your memory..."
            : "Ready to share",
        256,
        922,
      );
      phoneMap.needsUpdate = true;
    }

    end.copy(destination).applyEuler(gallery.rotation).add(gallery.position);
    memory.visible = progress > 0;
    memory.position.lerpVectors(start, end, progress);
    memory.position.y += Math.sin(progress * Math.PI) * 1.3;
    memory.position.z += Math.sin(progress * Math.PI) * (compact ? 1.6 : 2.1);
    memory.rotation.set(
      0.04 * progress,
      gallery.rotation.y * progress + flight * 0.42,
      flight * -0.4 + 0.06 * progress,
    );
    memory.scale.setScalar(1 + flight * 0.12 + arrival * 0.035);
    memory.position.z += arrival * 0.12;
    backing.position.x = 0.12 + arrival * 0.035;
    backing.rotation.z = -0.045 - arrival * 0.012;
    uploadBar.visible = progress > 0;
    uploadBar.scale.x = Math.max(progress, 0.001);
    uploadBar.position.x = (-(1 - progress) * 1.65) / 2;
    phone.rotation.y = 0.35 + (1 - reveal) * 0.55 - flight * 0.22;
    renderer.render(scene, camera);
    host.dataset.frames = String(++drawn);
    host.dataset.progress = String(targetProgress);
    host.dataset.entrance = entrance === 1 ? "complete" : "playing";
    host.dataset.angle = String(viewAngle);
    if (
      entrance < 1 ||
      progress !== targetProgress ||
      Math.abs(root.rotation.y - targetRotation) > 0.0001 ||
      Math.abs(root.rotation.x - pointerY) > 0.0001
    )
      request();
  }

  function request() {
    if (!frame && !disposed && active && !document.hidden)
      frame = requestAnimationFrame(render);
  }

  function resize() {
    const { width, height } = host.getBoundingClientRect();

    if (!width || !height) return;

    compact = width < 480;

    prints.visible = !compact;
    renderer.shadowMap.enabled = !compact;
    shadow.visible = !compact;
    renderer.setPixelRatio(Math.min(devicePixelRatio, compact ? 1 : 1.5));
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.position.z = Math.max(
      10.5,
      (compact ? 5.8 : 7.4) /
        (2 * Math.tan(THREE.MathUtils.degToRad(17.5)) * camera.aspect),
    );
    camera.updateProjectionMatrix();
    request();
  }

  function pointer(event: PointerEvent) {
    if (event.pointerType !== "mouse") return;

    const rect = host.getBoundingClientRect();

    pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.5;
    pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.22;
    request();
  }

  function leave() {
    pointerX = 0;
    pointerY = 0;
    request();
  }

  function visibility() {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else request();
  }

  function lost(event: Event) {
    event.preventDefault();
    onFailure();
  }

  const observer = new ResizeObserver(resize);

  observer.observe(host);
  host.addEventListener("pointermove", pointer);
  host.addEventListener("pointerleave", leave);
  renderer.domElement.addEventListener("webglcontextlost", lost);
  document.addEventListener("visibilitychange", visibility);
  resize();
  // Paint before the DOM fallback is removed.
  cancelAnimationFrame(frame);
  render();

  return {
    update(next, visible, angle) {
      targetProgress = next;
      viewAngle = angle;
      if (next > 0 || angle !== 0) entrance = 1;

      if (next === 0) {
        progress = 0;
        memory.visible = false;
        uploadBar.visible = false;
        uploadBar.scale.x = 0.001;
      }

      active = visible;
      if (!active) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else request();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      host.removeEventListener("pointermove", pointer);
      host.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibility);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();

          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          materials.forEach((material) => material.dispose());
        }
      });
      textures.forEach((map) => map.dispose());
      light.shadow.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
