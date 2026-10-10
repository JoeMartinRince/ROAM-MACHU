import { useEffect, useState } from "react";

const STORAGE_KEY = "roam-profile-avatar";
const EVENT_NAME = "roam-profile-avatar-change";

export function getStoredAvatar(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveStoredAvatar(dataUrl: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (dataUrl) {
      localStorage.setItem(STORAGE_KEY, dataUrl);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: dataUrl }));
  } catch (err) {
    console.error("Failed to save avatar to localStorage:", err);
  }
}

export function useProfileAvatar() {
  const [avatar, setAvatar] = useState<string | null>(getStoredAvatar);

  useEffect(() => {
    const handleCustom = (e: Event) => {
      const customEvent = e as CustomEvent<string | null>;
      setAvatar(customEvent.detail ?? getStoredAvatar());
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setAvatar(e.newValue);
      }
    };

    window.addEventListener(EVENT_NAME, handleCustom);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(EVENT_NAME, handleCustom);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return {
    avatar,
    setAvatar: saveStoredAvatar,
    removeAvatar: () => saveStoredAvatar(null),
  };
}

/**
 * Resizes and center-crops an uploaded file to a square avatar image.
 */
export async function processAvatarFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Selected file must be an image"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const cropSize = Math.min(img.width, img.height);
          const targetSize = Math.min(cropSize, 400); // 400px max for crisp display & low storage
          canvas.width = targetSize;
          canvas.height = targetSize;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          const sx = (img.width - cropSize) / 2;
          const sy = (img.height - cropSize) / 2;
          ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, targetSize, targetSize);

          const result = canvas.toDataURL("image/jpeg", 0.88);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
