import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export type HeroRenderer = {
  update: (progress: number, active: boolean) => void;
  dispose: () => void;
};

// Imported only after the SSR hero has painted. No renderer in the initial bundle.
export async function createHeroRenderer(
  host: HTMLDivElement,
  signal: AbortSignal,
  onFailure: () => void,
): Promise<HeroRenderer> {
  const images = await Promise.all(
    ["celebration", "couple", "table"].map(async (name) => {
      const image = new Image();
      image.src = `/images/${name}.jpg`;
      await image.decode();
      return image;
    }),
  );
  signal.throwIfAborted();
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 40);
  camera.position.set(0, 0, 12);
  const root = new THREE.Group();
  scene.add(root, new THREE.HemisphereLight(0xffffff, 0x707961, 2.7));
  const light = new THREE.DirectionalLight(0xfff2d9, 4);
  light.position.set(-3, 5, 6);
  scene.add(light);
  const rim = new THREE.DirectionalLight(0xffffff, 2);
  rim.position.set(4, 1, -2);
  scene.add(rim);
  const textures: THREE.Texture[] = [];
  const style = getComputedStyle(host);
  const ink = style.getPropertyValue("--ink").trim() || "#2d352b";
  const paper = style.getPropertyValue("--surface").trim() || "#fffefa";
  const primary = style.getPropertyValue("--primary").trim() || "#46533a";

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
    photo(ctx, images[1], 36, 164, 696, 420);
    photo(ctx, images[2], 36, 604, 338, 214);
    ctx.fillStyle = "#eceee4";
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
  box(phone, 2.04, 4.02, 0.28, ink, 0.19);
  face(phone, phoneMap, 1.83, 3.67, 0.148);
  const speaker = box(phone, 0.56, 0.1, 0.04, ink, 0.04);
  speaker.position.set(0, 1.7, 0.18);
  const sideButton = box(phone, 0.06, 0.52, 0.09, primary, 0.02);
  sideButton.position.set(-1.04, 0.62, 0);
  const gallery = new THREE.Group();
  gallery.position.set(1.05, 0.5, -0.1);
  gallery.rotation.set(0.04, -0.19, 0.06);
  root.add(gallery);
  box(gallery, 3.55, 4.18, 0.13, paper, 0.09);
  face(gallery, galleryMap, 3.4, 3.99, 0.071);
  const memory = new THREE.Group();
  box(memory, 1.55, 1.09, 0.06, paper, 0.03);
  face(memory, memoryMap, 1.5, 1.03, 0.035);
  root.add(memory);
  const start = new THREE.Vector3(-1.55, -0.15, 1.25);
  const end = new THREE.Vector3(1.94, -0.62, 0.15);
  let targetProgress = 0,
    progress = 0,
    active = true,
    disposed = false,
    frame = 0;
  let pointerX = 0,
    pointerY = 0;
  let drawn = 0;
  function render() {
    frame = 0;
    if (disposed || !active || document.hidden) return;
    progress = THREE.MathUtils.damp(progress, targetProgress, 14, 1 / 60);
    if (Math.abs(progress - targetProgress) < 0.001) progress = targetProgress;
    root.rotation.y = THREE.MathUtils.damp(
      root.rotation.y,
      pointerX,
      10,
      1 / 60,
    );
    root.rotation.x = THREE.MathUtils.damp(
      root.rotation.x,
      pointerY,
      10,
      1 / 60,
    );
    memory.visible = progress > 0;
    memory.position.lerpVectors(start, end, progress);
    memory.position.y += Math.sin(progress * Math.PI) * 1.3;
    memory.position.z += Math.sin(progress * Math.PI) * 1.5;
    memory.rotation.set(
      0.04 * progress,
      -0.19 * progress,
      Math.sin(progress * Math.PI) * -0.28 + 0.06 * progress,
    );
    renderer.render(scene, camera);
    host.dataset.frames = String(++drawn);
    host.dataset.progress = String(targetProgress);
    if (
      progress !== targetProgress ||
      Math.abs(root.rotation.y - pointerX) > 0.0001 ||
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
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.position.z = Math.max(
      10.5,
      5.8 / (2 * Math.tan(THREE.MathUtils.degToRad(17.5)) * camera.aspect),
    );
    camera.updateProjectionMatrix();
    request();
  }
  function pointer(event: PointerEvent) {
    if (event.pointerType !== "mouse") return;
    const rect = host.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.24;
    pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.12;
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
    update(next, visible) {
      targetProgress = next;
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
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
