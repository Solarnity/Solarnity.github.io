export const CODE_HASHES = {
  1: "04f856e8cb27739b388f906ed3cea03c2e233423b7c2086ead027a1bf80fe2a3",
  2: "814e8dddce4730943f38fc53dc6443e43a7597be98418c6385d34e18a78929d3",
  3: "1a89584a7ab6d121e565de8f7df4ababe940bf01bc7e6212a755fcb61f5f998d",
  4: "954b485b2cae43f64b87b4a524918bee850f9ad84cb7d463ecf8e6635cfe6827",
  5: "e45ff6f9f62050ae14af9ff3b78fa05833dcd963c15a9f2593dbc5d4dcc0a537",
  6: "09cd933fd8134e4a312c2c3778a6e169cc0f60c77413ad8540fbcdc89dfb8c69",
  7: "5d5a3d513d0c62f1d2ac5b0c9533dcd8dc0f4a22388d44ac4d71064f7476831d",
  8: "6a9e32e9be79bb5de28f9da2f0c65586b30a1fe2f445e3e2379e0f8b727f5704",
  9: "f64c85e73d9785a6a2e3b6eb86cb42364a9af05789fecac10b213016ca8a19f5",
};

const STORAGE_KEY = "arg_secure_progress_v1";

export async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str.trim().toUpperCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveProgress(unlockedIds) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlockedIds));
  } catch {}
}

export function clearProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}