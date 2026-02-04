type WithThumbnail = {
  usuarioThumbnail?: { id: number; thumbnail?: Buffer | string | null } | null;
};

export function convertThumbnailToBase64<T extends WithThumbnail>(item: T): T {
  if (item.usuarioThumbnail?.thumbnail && Buffer.isBuffer(item.usuarioThumbnail.thumbnail)) {
    item.usuarioThumbnail.thumbnail = item.usuarioThumbnail.thumbnail.toString("base64");
  }
  return item;
}

export function convertThumbnailsInResponse<T extends { items: unknown[] }>(response: T): T {
  return {
    ...response,
    items: response.items.map((item) => convertThumbnailsRecursively(item))
  };
}

export function convertThumbnailsRecursively<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => convertThumbnailsRecursively(item)) as T;
  }

  const record = obj as Record<string, unknown>;

  if ("usuarioThumbnail" in record && record.usuarioThumbnail) {
    const thumb = record.usuarioThumbnail as { id: number; thumbnail?: Buffer | string | null };
    if (thumb.thumbnail && Buffer.isBuffer(thumb.thumbnail)) {
      thumb.thumbnail = thumb.thumbnail.toString("base64");
    }
  }

  for (const key of Object.keys(record)) {
    const value = record[key];
    if (value && typeof value === "object") {
      record[key] = convertThumbnailsRecursively(value);
    }
  }

  return obj;
}
