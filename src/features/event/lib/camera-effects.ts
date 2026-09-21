export type CameraEffectId =
  "original" | "film" | "blackAndWhite" | "warm" | "vintage" | "disposable";

export type CameraEffect = {
  id: CameraEffectId;
  labelKey: string;
  cssFilter: string;
  canvasFilter: string;
};

export const cameraEffects: Record<CameraEffectId, CameraEffect> = {
  original: {
    id: "original",
    labelKey: "camera.effectOriginal",
    cssFilter: "none",
    canvasFilter: "none",
  },
  film: {
    id: "film",
    labelKey: "camera.effectFilm",
    cssFilter: "contrast(1.08) saturate(0.88) brightness(1.02) sepia(0.08)",
    canvasFilter: "contrast(108%) saturate(88%) brightness(102%) sepia(8%)",
  },
  blackAndWhite: {
    id: "blackAndWhite",
    labelKey: "camera.effectBlackAndWhite",
    cssFilter: "grayscale(1) contrast(1.22) brightness(0.98)",
    canvasFilter: "grayscale(100%) contrast(122%) brightness(98%)",
  },
  warm: {
    id: "warm",
    labelKey: "camera.effectWarm",
    cssFilter: "sepia(0.2) saturate(1.18) brightness(1.04) contrast(1.02)",
    canvasFilter: "sepia(20%) saturate(118%) brightness(104%) contrast(102%)",
  },
  vintage: {
    id: "vintage",
    labelKey: "camera.effectVintage",
    cssFilter: "sepia(0.32) contrast(0.96) brightness(0.95) saturate(0.92)",
    canvasFilter: "sepia(32%) contrast(96%) brightness(95%) saturate(92%)",
  },
  disposable: {
    id: "disposable",
    labelKey: "camera.effectDisposable",
    cssFilter:
      "contrast(1.18) saturate(1.2) brightness(1.06) hue-rotate(-4deg)",
    canvasFilter:
      "contrast(118%) saturate(120%) brightness(106%) hue-rotate(-4deg)",
  },
};

export const cameraEffectList = Object.values(cameraEffects);
