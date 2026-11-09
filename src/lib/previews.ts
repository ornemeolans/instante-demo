import "server-only";

import { buildPreviews } from "@/lib/images/watermark";
import { downloadFile, uploadPublicJpeg } from "@/lib/storage";

export interface StoredPreviews {
  previewUrl: string;
  thumbUrl: string;
  width: number;
  height: number;
}

/**
 * Lee el original privado, genera vista previa y miniatura con la marca de
 * agua actual y las sube (sobrescribiendo las anteriores si existían).
 */
export async function generateAndStorePreviews(
  eventId: string,
  photoId: string,
  originalPath: string,
  watermarkText: string,
): Promise<StoredPreviews> {
  const original = await downloadFile(originalPath);
  const { preview, thumb } = await buildPreviews(original, watermarkText);
  const [previewUrl, thumbUrl] = await Promise.all([
    uploadPublicJpeg(`previews/${eventId}/${photoId}.jpg`, preview.buffer),
    uploadPublicJpeg(`thumbs/${eventId}/${photoId}.jpg`, thumb.buffer),
  ]);
  return { previewUrl, thumbUrl, width: preview.width, height: preview.height };
}
