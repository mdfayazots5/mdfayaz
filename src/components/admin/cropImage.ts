// Canvas-based crop → compressed blob helper for the Admin Media cropper.
// Takes the source image URL + the pixel crop area produced by react-easy-crop and returns a
// compressed raster blob (webp by default) ready to hand to `uploadFile`. Downscaling caps the
// longest edge so exports stay comfortably under the Worker's 5 MB limit.

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Failed to load image for cropping")));
    // Local object URLs don't need CORS, but set it defensively for remote sources.
    image.crossOrigin = "anonymous";
    image.src = url;
  });
}

export async function getCroppedBlob(
  imageSrc: string,
  crop: PixelCrop,
  mimeType: string = "image/webp",
  quality: number = 0.9,
  maxDimension: number = 1600
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas rendering context");

  const scale = Math.min(1, maxDimension / Math.max(crop.width, crop.height));
  const targetW = Math.max(1, Math.round(crop.width * scale));
  const targetH = Math.max(1, Math.round(crop.height * scale));

  canvas.width = targetW;
  canvas.height = targetH;

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    targetW,
    targetH
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas export produced an empty image"));
      },
      mimeType,
      quality
    );
  });
}

// Read a File's intrinsic dimensions (used for the "too small" quality warning).
export function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const dims = { width: image.naturalWidth, height: image.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(dims);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image dimensions"));
    };
    image.src = url;
  });
}
