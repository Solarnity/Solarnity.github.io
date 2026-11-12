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

export const DEFAULT_ARCHIVE_CD_HASHES = {
  "001": "5ca5167ebfa0a1c9bba01c23ee623cb8dfd4d6a7a97aae9a17bd70294a056406",
};

const DR_STORAGE_KEY_V2 = "arg_secure_progress_v2";
const DR_STORAGE_KEY_V3 = "arg_secure_progress_v3";
const ARCHIVE_STORAGE_KEY = "archive_unlocked_v1";
const ARCHIVE_TOKEN_PREFIX = "ARCHIVE_CD_TOKEN_V1";
const PBKDF2_ITERATIONS = 100000;
const SALT_SECRET = "SLRNTY_9X_SALT_2026_V2";

export async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str.trim().toUpperCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function deriveArchiveCdToken(cdId, rawCode) {
  const normalized = rawCode.trim().toUpperCase();
  return hashString(`${ARCHIVE_TOKEN_PREFIX}:${String(cdId).trim()}:${normalized}`);
}

function generateChecksum(idsArray) {
  const sorted = [...idsArray].sort((a, b) => a - b).join(",");
  const raw = `${sorted}|${SALT_SECRET}`;
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 33) ^ raw.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

export function loadProgress() {
  const unlockedSet = new Set();

  // Compatibilidad con progreso guardado en v2
  try {
    const rawV2 = localStorage.getItem(DR_STORAGE_KEY_V2);
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      if (parsed && Array.isArray(parsed.d) && typeof parsed.s === "string") {
        const expected = generateChecksum(parsed.d);
        if (expected === parsed.s) {
          parsed.d
            .filter((n) => typeof n === "number" && n >= 1 && n <= 9)
            .forEach((n) => unlockedSet.add(n));
        }
      }
    }
  } catch {
    /* noop */
  }

  // Compatibilidad con progreso guardado en v3
  try {
    const rawV3 = localStorage.getItem(DR_STORAGE_KEY_V3);
    if (rawV3) {
      const parsed = JSON.parse(rawV3);
      if (parsed && typeof parsed.tokens === "object" && parsed.tokens !== null) {
        for (let i = 1; i <= 9; i++) {
          const val = parsed.tokens[i] || parsed.tokens[String(i)];
          if (typeof val === "string" && val.length > 0) {
            unlockedSet.add(i);
          }
        }
      }
    }
  } catch {
    /* noop */
  }

  return Array.from(unlockedSet).sort((a, b) => a - b);
}

export function saveProgress(idsArray) {
  try {
    const clean = Array.from(new Set(idsArray))
      .filter((n) => typeof n === "number" && n >= 1 && n <= 9)
      .sort((a, b) => a - b);
    const signature = generateChecksum(clean);
    localStorage.setItem(
      DR_STORAGE_KEY_V2,
      JSON.stringify({ d: clean, s: signature })
    );
  } catch {
    /* noop */
  }
}

export async function saveUnlockedCode(id) {
  const current = loadProgress();
  if (!current.includes(Number(id))) {
    current.push(Number(id));
  }
  saveProgress(current);
}

export function clearProgress() {
  try {
    localStorage.removeItem(DR_STORAGE_KEY_V2);
    localStorage.removeItem(DR_STORAGE_KEY_V3);
  } catch {
    /* noop */
  }
}

export function getDrRewardPassphrase() {
  const list = [];
  for (let i = 1; i <= 9; i++) {
    list.push(CODE_HASHES[i]);
  }
  return `DR_REWARD_KEY_V1:${list.join("|")}`;
}

async function deriveAesKey(passphrase, saltBytes) {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
}

export async function decryptBufferWithPassphrase(encryptedBuffer, passphrase) {
  if (!passphrase) {
    throw new Error("MISSING_KEY");
  }

  const bytes = new Uint8Array(encryptedBuffer);
  if (bytes.byteLength <= 28) {
    throw new Error("INVALID_PAYLOAD");
  }

  const salt = bytes.slice(0, 16);
  const iv = bytes.slice(16, 28);
  const ciphertext = bytes.slice(28);

  const aesKey = await deriveAesKey(passphrase, salt);
  return crypto.subtle.decrypt({ name: "AES-GCM", iv }, aesKey, ciphertext);
}

/**
 * Obtiene un archivo binario o JSON desde `/vault/...`.
 * Si el servidor de desarrollo de Vite devuelve el fallback HTML (`text/html`) para carpetas
 * creadas dinámicamente sin reiniciar Vite, reintenta automáticamente con `/public/vault/...`.
 */
async function fetchVaultAsset(vaultUrl, options = {}) {
  const res = await fetch(vaultUrl, options);
  const contentType = (res.headers.get("content-type") || "").toLowerCase();

  if (res.ok && !contentType.includes("text/html")) {
    return res;
  }

  if (vaultUrl.startsWith("/vault/")) {
    const fallbackRes = await fetch(`/public${vaultUrl}`, options);
    const fallbackType = (fallbackRes.headers.get("content-type") || "").toLowerCase();
    if (fallbackRes.ok && !fallbackType.includes("text/html")) {
      return fallbackRes;
    }
  }

  throw new Error(`ASSET_NOT_FOUND:${vaultUrl}`);
}

/**
 * Desencripta el código de recompensa de Digital Remains (/vault/dr-reward.enc)
 * para pre-rellenar el modal en /archive al completar los 9 códigos.
 */
export async function decryptDrRewardCode() {
  const passphrase = getDrRewardPassphrase();
  try {
    const res = await fetchVaultAsset("/vault/dr-reward.enc", { cache: "no-cache" });
    const buf = await res.arrayBuffer();
    const dec = await decryptBufferWithPassphrase(buf, passphrase);
    const data = JSON.parse(new TextDecoder().decode(dec));
    return data?.rewardCode || null;
  } catch {
    return null;
  }
}

/* ================= GESTIÓN DE CDS EN /ARCHIVE (CACHE LOCALSTORAGE) ================= */

/**
 * Carga todas las entradas guardadas en caché para /archive:
 * Devuelve `{ [cdId]: { token, code } }`.
 * Soporta tanto el formato `{ token, code }` como el formato anterior donde el valor era solo el string `token`.
 */
export function loadUnlockedArchiveEntries() {
  try {
    const raw = localStorage.getItem(ARCHIVE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.cds === "object" && parsed.cds !== null) {
      const clean = {};
      for (const [cdId, entry] of Object.entries(parsed.cds)) {
        if (typeof entry === "string" && /^[a-f0-9]{64}$/.test(entry)) {
          clean[cdId] = { token: entry, code: "" };
        } else if (
          entry &&
          typeof entry === "object" &&
          typeof entry.token === "string" &&
          /^[a-f0-9]{64}$/.test(entry.token)
        ) {
          clean[cdId] = {
            token: entry.token,
            code: typeof entry.code === "string" ? entry.code : "",
          };
        }
      }
      return clean;
    }
    return {};
  } catch {
    return {};
  }
}

export function loadUnlockedArchiveCds() {
  const entries = loadUnlockedArchiveEntries();
  const map = {};
  for (const [cdId, data] of Object.entries(entries)) {
    map[cdId] = data.token;
  }
  return map;
}

export function saveUnlockedArchiveCd(cdId, token, rawCode = "") {
  try {
    const current = loadUnlockedArchiveEntries();
    const normalizedCode = String(rawCode || "").trim().toUpperCase();
    current[cdId] = {
      token,
      code: normalizedCode || current[cdId]?.code || "",
    };
    localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify({ cds: current }));
  } catch {
    /* noop */
  }
}

export function removeUnlockedArchiveCd(cdId) {
  try {
    const current = loadUnlockedArchiveEntries();
    delete current[cdId];
    localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify({ cds: current }));
    return current;
  } catch {
    return {};
  }
}

export async function fetchArchiveManifest() {
  try {
    const res = await fetchVaultAsset("/vault/manifest.json", { cache: "no-cache" });
    const data = await res.json();
    if (
      data &&
      typeof data.cds === "object" &&
      data.cds !== null &&
      Object.keys(data.cds).length > 0
    ) {
      return data.cds;
    }
    return DEFAULT_ARCHIVE_CD_HASHES;
  } catch {
    return DEFAULT_ARCHIVE_CD_HASHES;
  }
}

export async function decryptCdMeta(cdId, cdToken) {
  const res = await fetchVaultAsset(`/vault/${cdId}/meta.enc`, { cache: "no-cache" });
  const encryptedBuffer = await res.arrayBuffer();
  const decryptedBuffer = await decryptBufferWithPassphrase(encryptedBuffer, cdToken);
  const text = new TextDecoder().decode(decryptedBuffer);
  return JSON.parse(text);
}

/**
 * Desencripta una imagen .enc y devuelve un HTMLImageElement listo para dibujarse en <canvas>,
 * revocando inmediatamente el Blob URL temporal para impedir su descarga o extracción del DOM.
 */
export async function decryptCdProtectedImage(url, cdToken, mimeType = "image/png") {
  const res = await fetchVaultAsset(url);
  const encryptedBuffer = await res.arrayBuffer();
  const decryptedBuffer = await decryptBufferWithPassphrase(encryptedBuffer, cdToken);
  const blob = new Blob([decryptedBuffer], { type: mimeType });
  const tempUrl = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(tempUrl);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(tempUrl);
      reject(err);
    };
    img.src = tempUrl;
  });
}

/**
 * Desencripta la portada del CD buscando primero 00.enc (o cover.enc) y usando 01.enc como respaldo.
 */
export async function decryptCdCoverImage(cdId, cdToken, mimeType = "image/png", hasCover00 = false) {
  const candidates = hasCover00
    ? [`/vault/${cdId}/00.enc`, `/vault/${cdId}/cover.enc`, `/vault/${cdId}/01.enc`]
    : [`/vault/${cdId}/cover.enc`, `/vault/${cdId}/01.enc`];

  for (const url of candidates) {
    try {
      const img = await decryptCdProtectedImage(url, cdToken, mimeType);
      return img;
    } catch {
      // Intentar siguiente candidato
    }
  }
  throw new Error("COVER_NOT_FOUND");
}
