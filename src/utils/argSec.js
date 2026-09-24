export const CODE_HASHES = {
  1: "7eaa0d737f5245ea02b7e2fbde6ced36e943eed26bd956962db6dd22146d7d51",
  2: "4d5f7f93445f09d2809b1deb12591ee8bdc5773cfa74dccdcc860c31a843a550",
  3: "b26446d510c9ec61812773b518bac7e5b1570cb6e7a4aea096747c3e24eff278",
  4: "acc0712cb0116d8ac18bf5050e07c13bf951e539e9a6688a851296362cb07658",
  5: "9592589e06f5f6757e82aeaaeb23d9f5e661bfc0d7f5d79e6935c1f6a4f0df52",
  6: "41ec0fb1da76944197bafccc29f068e486340e88006def588f3bc7cdf857225b",
  7: "3bb5f466b36e266299062e7798de0cfd780d7f4ec8c2a9823161ed3f7f2fcd7c",
  8: "395a4301c2f729c08cfdac330688a3bd97e2e6398728b175e1bd9fd8293590a8",
  9: "c1cdb12c153a6b211226c016691397af3f61b3d1f81b895e37f739e0483a95d9",
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

    if (parsed && typeof parsed === "object" && parsed.entries) {
      const valid = [];
      for (const [idStr, savedHash] of Object.entries(parsed.entries)) {
        const id = Number(idStr);
        if (CODE_HASHES[id] && CODE_HASHES[id] === savedHash) {
          valid.push(id);
        }
      }
      return valid.sort((a, b) => a - b);
    }

    return [];
  } catch {
    return [];
  }
}

export function saveProgress(unlockedIds) {
  try {
    const entries = {};
    for (const id of unlockedIds) {
      if (CODE_HASHES[id]) entries[id] = CODE_HASHES[id];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ entries }));
  } catch {}
}

export function clearProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}