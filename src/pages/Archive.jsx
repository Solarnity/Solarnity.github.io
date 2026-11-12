import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ArrowLeft,
  Download,
  Youtube,
  Disc3,
  Music,
  Play,
  ExternalLink,
  Link as LinkIcon,
  FolderOpen,
  Headphones,
  Video,
  Loader2,
} from "lucide-react";
import { SITE_VERSION_LABEL } from "../../version";
import { APP_ROUTES } from "../App";
import BookletViewer, { ProtectedCanvas } from "../components/Archive/BookletViewer";
import {
  hashString,
  deriveArchiveCdToken,
  loadUnlockedArchiveEntries,
  saveUnlockedArchiveCd,
  removeUnlockedArchiveCd,
  fetchArchiveManifest,
  decryptCdMeta,
  decryptCdCoverImage,
  decryptCdProtectedImage,
} from "../utils/argSec";

const ALLOWED_CHARS_REGEX = /[^a-zA-Z0-9!@#$%^&*:;.,?¿\-_=]/g;
const sanitizeCode = (value) => value.replace(ALLOWED_CHARS_REGEX, "").toUpperCase();

const playAudio = (src) => {
  if (!src) return;
  const audio = new Audio(src);
  audio.currentTime = 0;
  audio.play().catch(() => {});
};

const BUTTON_ICONS = {
  download: Download,
  drive: FolderOpen,
  folder: FolderOpen,
  youtube: Youtube,
  video: Video,
  play: Play,
  music: Music,
  disc: Disc3,
  headphones: Headphones,
  link: LinkIcon,
  external: ExternalLink,
};

function renderButtonIcon(iconName) {
  const key = String(iconName || "external").trim().toLowerCase();
  const IconComp = BUTTON_ICONS[key] || ExternalLink;
  return <IconComp size={16} />;
}

function normalizeTracklistSections(rawTracklist = []) {
  if (!Array.isArray(rawTracklist) || rawTracklist.length === 0) return [];

  const sections = [];
  let currentLooseSection = null;

  for (const entry of rawTracklist) {
    if (!entry || typeof entry !== "object") continue;

    if (Array.isArray(entry.tracks)) {
      if (currentLooseSection && currentLooseSection.tracks.length > 0) {
        sections.push(currentLooseSection);
        currentLooseSection = null;
      }
      sections.push({
        section: entry.section || entry.title || "",
        tracks: entry.tracks,
      });
    } else if (entry.section && !entry.title) {
      if (currentLooseSection && currentLooseSection.tracks.length > 0) {
        sections.push(currentLooseSection);
      }
      currentLooseSection = {
        section: entry.section,
        tracks: [],
      };
    } else {
      if (!currentLooseSection) {
        currentLooseSection = { section: "", tracks: [] };
      }
      currentLooseSection.tracks.push(entry);
    }
  }

  if (currentLooseSection && currentLooseSection.tracks.length > 0) {
    sections.push(currentLooseSection);
  }

  return sections;
}



const ArchiveNavbar = ({
  routesConfig = [],
  onOpenAddModal,
  onOpenEditModal,
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const defaultNavItems = routesConfig.filter((route) => !route.hidden);
  const currentHiddenItem = routesConfig.find(
    (route) => route.hidden && route.path === currentPath
  );
  const navItems = currentHiddenItem
    ? [...defaultNavItems, currentHiddenItem]
    : defaultNavItems;

  return (
    <header className="w-full border-b border-[#181818]/20 bg-[#EDE0D8] text-[#181818] select-none">
      <div className="relative flex h-16 sm:h-20 w-full items-center justify-between px-4 sm:px-8">
        <div className="w-20" />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20 pointer-events-auto">
          <a
            href="/"
            aria-label="Logo Icon"
            className={`flex items-center justify-center p-0.5 rounded cursor-pointer outline-none border-0 bg-transparent focus-visible:ring-1 active:scale-95 transition-transform`}
          >
            <img
              src="/icons/Flower.ico"
              alt="Flower Logo"
              className="w-12 h-12 brightness-0 opacity-90 animate-spin [animation-duration:16s]"
            />
          </a>
        </div>

        <div className="ml-auto flex items-center gap-2 z-20">
          <button
            type="button"
            onClick={onOpenEditModal}
            aria-label="Editar CDs desbloqueados"
            title="Editar CDs desbloqueados"
            className="h-10 px-3 flex items-center justify-center gap-1.5 bg-[#EDE0D8] text-[#181818] transition-colors text-xs uppercase tracking-widest rounded-none cursor-pointer"
          >
            <Pencil size={14} strokeWidth={1.75} />
          </button>

          <button
            type="button"
            onClick={onOpenAddModal}
            aria-label="Agregar código"
            title="Introducir código"
            className="w-10 h-10 flex items-center justify-center bg-[#EDE0D8] text-[#181818] transition-colors rounded-none cursor-pointer"
          >
            <Plus size={18} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className="flex min-h-12 sm:min-h-14 w-full items-center justify-center px-4 pb-3 pt-1 overflow-x-auto">
        <motion.nav
          layout
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="flex items-center gap-1 sm:gap-3 px-2"
        >
          {navItems.map((item) => {
            const isActive = currentPath === item.path;

            return (
              <motion.div
                layout
                key={item.path}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              >
                <Link
                  to={item.path}
                  className={`relative px-3 py-1.5 text-xs sm:text-sm tracking-wider transition-all duration-300 inline-block rounded-none ${
                    isActive
                      ? "text-[#181818] font-bold underline underline-offset-4"
                      : "text-[#181818]/55 hover:text-[#181818] font-medium"
                  }`}
                >
                  {item.name}
                </Link>
              </motion.div>
            );
          })}
        </motion.nav>
      </div>
    </header>
  );
};

const ArchiveFooter = ({
  dullHitSound = "/sounds/dullHit.mp3",
  counterSound = "/sounds/counter.mp3",
  eeUnlockSound = "/sounds/chipbell.mp3",
  eeIconSrc = "/images/aceclidina.webp",
}) => {
  const [eeActive, setEeActive] = useState(false);
  const clickCountRef = useRef(0);
  const lastClickTimeRef = useRef(0);
  const resetTimerRef = useRef(null);

  const handleFooterIconClick = useCallback(
    (e) => {
      e.stopPropagation();
      playAudio(dullHitSound);

      const now = Date.now();
      const MAX_INTERVAL = 600;

      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }

      if (now - lastClickTimeRef.current > MAX_INTERVAL) {
        clickCountRef.current = 0;
      }

      lastClickTimeRef.current = now;
      clickCountRef.current += 1;
      const clicks = clickCountRef.current;

      resetTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, MAX_INTERVAL);

      if (!eeActive) {
        if (clicks >= 10) {
          clearTimeout(resetTimerRef.current);
          clickCountRef.current = 0;
          setEeActive(true);
          playAudio(eeUnlockSound);
        }
      } else {
        if (clicks >= 5) {
          clearTimeout(resetTimerRef.current);
          clickCountRef.current = 0;
          setEeActive(false);
          playAudio(counterSound);
        }
      }
    },
    [eeActive, dullHitSound, counterSound, eeUnlockSound]
  );

  return (
    <footer className="w-full bg-[#181818] text-[#EDE0D8] border-t border-[#181818] mt-auto select-none">
      <div className="mx-auto max-w-6xl px-4 sm:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 items-center gap-8">
        <div className="flex items-center gap-5">
          <button
            type="button"
            aria-label="Footer Icon"
            onClick={handleFooterIconClick}
            className="flex items-center justify-center p-0.5 cursor-pointer outline-none border-0 bg-transparent active:scale-95 transition-transform rounded-none shrink-0"
          >
            {eeActive ? (
              <motion.img
                key="footer-ee-photo"
                initial={{ scale: 0.5, rotate: -30, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 450, damping: 22 }}
                src={eeIconSrc}
                alt="Secret Icon"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-none object-cover"
              />
            ) : (
              <img
                src="/icons/Flower.ico"
                alt="Icon"
                className="w-14 h-14 sm:w-16 sm:h-16 brightness-0 invert opacity-90 hover:rotate-90 transition-transform duration-500 ease-out"
              />
            )}
          </button>

          <div className="space-y-1 text-xs tracking-widest uppercase">
            <div className="flex items-center gap-2">
              <p className="font-bold text-[#EDE0D8]">The Archive</p>
              <AnimatePresence>
                {eeActive && (
                  <motion.span
                    key="footer-ee-question"
                    initial={{ opacity: 0, scale: 0, x: -4, rotate: -25 }}
                    animate={{ opacity: 1, scale: 1, x: 2, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0, x: -2, rotate: 20 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 20,
                      mass: 0.8,
                    }}
                    className="font-comic font-bold text-sm text-[#EDE0D8] normal-case select-none inline-block"
                  >
                    ? xd
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            {eeActive ? (
              <p className="text-[#EDE0D8]/65">¡Es el martillo, es real! ¡Tómenme una foto con él!</p>
            ) : (
              <p className="text-[#EDE0D8]/65">By Solarnity</p>
            )}
            
          </div>
        </div>

        <div className="sm:text-right text-xs tracking-widest uppercase space-y-1 text-[#EDE0D8]/75">
          <p className="text-[#EDE0D8]/50">{SITE_VERSION_LABEL} • PLGNM</p>
        </div>
      </div>
    </footer>
  );
};

export default function Archive() {
  const location = useLocation();
  const navigate = useNavigate();

  const [manifest, setManifest] = useState({});
  const [cachedEntries, setCachedEntries] = useState(() => loadUnlockedArchiveEntries());
  const [unlockedCds, setUnlockedCds] = useState([]);
  const [coverImages, setCoverImages] = useState({});
  const [bookletPages, setBookletPages] = useState({});
  const [selectedCdId, setSelectedCdId] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadedPagesRef = useRef({});
  const loadingPagesRef = useRef({});

  useEffect(() => {
    const incomingCode = location.state?.claimCode;
    if (incomingCode) {
      setCodeInput(sanitizeCode(String(incomingCode)));
      setClaimError("");
      setIsAddModalOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    let cancelled = false;

    async function initArchive() {
      setInitialLoading(true);
      try {
        const mf = await fetchArchiveManifest();
        if (!cancelled) setManifest(mf);

        const storedEntries = loadUnlockedArchiveEntries();
        if (!cancelled) setCachedEntries(storedEntries);

        const cdEntries = Object.entries(storedEntries);
        if (cdEntries.length === 0) {
          if (!cancelled) {
            setUnlockedCds([]);
            setInitialLoading(false);
          }
          return;
        }

        const loadedList = [];
        for (const [cdId, entryData] of cdEntries) {
          const token = entryData.token;
          try {
            const meta = await decryptCdMeta(cdId, token);
            loadedList.push(meta);

            decryptCdCoverImage(
              cdId,
              token,
              meta.mimeType || "image/png",
              Boolean(meta.hasCover00)
            )
              .then((img) => {
                if (!cancelled) {
                  setCoverImages((prev) => ({ ...prev, [cdId]: img }));
                }
              })
              .catch(() => {});
          } catch {
            /* noop */
          }
        }

        if (!cancelled) {
          setUnlockedCds(loadedList);
        }
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    }

    initArchive();
    return () => {
      cancelled = true;
    };
  }, []);

  const ensureBookletLoaded = useCallback(async (cdMeta, token) => {
    if (!cdMeta || !token) return;
    const cdId = cdMeta.id;
    if (loadingPagesRef.current[cdId]) return;
    loadingPagesRef.current[cdId] = true;

    const total = Number(cdMeta.pages ?? cdMeta.pagesCount) || 24;
    const mime = cdMeta.mimeType || "image/png";

    try {
      const indices = Array.from({ length: total }, (_, i) => i + 1);
      const batchSize = 4;

      for (let i = 0; i < indices.length; i += batchSize) {
        const batch = indices.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (pageNum) => {
            if (loadedPagesRef.current[cdId]?.[pageNum]) return;
            const numStr = String(pageNum).padStart(2, "0");
            try {
              const img = await decryptCdProtectedImage(
                `/vault/${cdId}/${numStr}.enc`,
                token,
                mime
              );
              loadedPagesRef.current[cdId] = {
                ...(loadedPagesRef.current[cdId] || {}),
                [pageNum]: img,
              };
              setBookletPages((prev) => ({
                ...prev,
                [cdId]: { ...(prev[cdId] || {}), [pageNum]: img },
              }));
            } catch {
              /* noop */
            }
          })
        );
      }
    } finally {
      loadingPagesRef.current[cdId] = false;
    }
  }, []);

  const selectedCd = unlockedCds.find((c) => c.id === selectedCdId) || null;

  useEffect(() => {
    const token = selectedCd ? cachedEntries[selectedCd.id]?.token : null;
    if (selectedCd && token) {
      ensureBookletLoaded(selectedCd, token);
    }
  }, [selectedCd, cachedEntries, ensureBookletLoaded]);

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    const normalized = sanitizeCode(codeInput);
    if (!normalized || claimLoading) return;

    setClaimLoading(true);
    setClaimError("");

    try {
      const inputHash = await hashString(normalized);
      const activeManifest = await fetchArchiveManifest();
      setManifest(activeManifest);

      const matchedCdIds = Object.keys(activeManifest).filter(
        (cdId) => activeManifest[cdId] === inputHash
      );

      if (matchedCdIds.length === 0) {
        setClaimError("CÓDIGO INVÁLIDO");
        setClaimLoading(false);
        return;
      }

      let unlockedCount = 0;

      for (const matchedCdId of matchedCdIds) {
        const token = await deriveArchiveCdToken(matchedCdId, normalized);
        const meta = await decryptCdMeta(matchedCdId, token);

        saveUnlockedArchiveCd(matchedCdId, token, normalized);
        setCachedEntries((prev) => ({
          ...prev,
          [matchedCdId]: { token, code: normalized },
        }));
        setUnlockedCds((prev) => {
          const exists = prev.some((item) => item.id === matchedCdId);
          return exists
            ? prev.map((item) => (item.id === matchedCdId ? meta : item))
            : [...prev, meta];
        });

        decryptCdCoverImage(
          matchedCdId,
          token,
          meta.mimeType || "image/png",
          Boolean(meta.hasCover00)
        )
          .then((img) => {
            setCoverImages((prev) => ({ ...prev, [matchedCdId]: img }));
          })
          .catch(() => {});

        unlockedCount++;
      }

      if (unlockedCount > 0) {
        setIsAddModalOpen(false);
        setCodeInput("");
        setClaimError("");
      }
    } catch {
      setClaimError("ERROR AL DESBLOQUEAR");
    } finally {
      setClaimLoading(false);
    }
  };

  const handleDeleteCd = (cdId) => {
    const updatedMap = removeUnlockedArchiveCd(cdId);
    setCachedEntries(updatedMap);
    setUnlockedCds((prev) => prev.filter((item) => item.id !== cdId));
    setCoverImages((prev) => {
      const next = { ...prev };
      delete next[cdId];
      return next;
    });
    setBookletPages((prev) => {
      const next = { ...prev };
      delete next[cdId];
      return next;
    });
    delete loadedPagesRef.current[cdId];
    delete loadingPagesRef.current[cdId];

    if (selectedCdId === cdId) {
      setSelectedCdId(null);
    }
  };

  const editableEntriesList = useMemo(() => {
    return Object.entries(cachedEntries).map(([cdId, entryData]) => {
      const foundMeta = unlockedCds.find((c) => c.id === cdId);
      if (foundMeta) {
        return {
          id: cdId,
          title: foundMeta.title,
          subtitle: foundMeta.year || "",
          isUnknown: false,
        };
      }
      return {
        id: cdId,
        title: "DESCONOCIDO",
        subtitle: entryData?.code || cdId,
        isUnknown: true,
      };
    });
  }, [cachedEntries, unlockedCds]);

  const selectedCdButtons = useMemo(() => {
    if (!selectedCd) return [];
    if (Array.isArray(selectedCd.buttons) && selectedCd.buttons.length > 0) {
      return selectedCd.buttons.filter((b) => b && b.url).slice(0, 4);
    }
    const legacy = [];
    if (selectedCd.driveUrl) {
      legacy.push({
        label: selectedCd.downloadLabel || "DESCARGAR (DRIVE)",
        url: selectedCd.driveUrl,
        icon: "download",
      });
    }
    if (selectedCd.youtubeUrl) {
      legacy.push({
        label: selectedCd.youtubeLabel || "YOUTUBE PLAYLIST",
        url: selectedCd.youtubeUrl,
        icon: "youtube",
      });
    }
    return legacy.slice(0, 4);
  }, [selectedCd]);

  const tracklistSections = useMemo(
    () => normalizeTracklistSections(selectedCd?.tracklist || []),
    [selectedCd]
  );

  const totalTracksCount = useMemo(
    () =>
      tracklistSections.reduce(
        (acc, sec) => acc + (Array.isArray(sec.tracks) ? sec.tracks.length : 0),
        0
      ),
    [tracklistSections]
  );

  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col bg-[#EDE0D8] text-[#181818] font-mono select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      <ArchiveNavbar
        routesConfig={APP_ROUTES}
        onOpenAddModal={() => {
          setClaimError("");
          setIsAddModalOpen(true);
        }}
        onOpenEditModal={() => setIsEditModalOpen(true)}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-8 py-10 sm:py-14">
        {!selectedCd ? (
          <div>
            {initialLoading ? (
              <div className="py-28 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-[#181818]/50" />
              </div>
            ) : unlockedCds.length === 0 ? (
              <div className="py-28 flex flex-col items-center justify-center text-center gap-4">
                <Disc3 size={44} strokeWidth={1.25} className="text-[#181818]/60" />
                <p className="text-xs sm:text-sm uppercase tracking-widest text-[#181818]/75">
                  NO HAY ELEMENTOS DESBLOQUEADOS
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {unlockedCds.map((cd) => {
                  const coverImg = coverImages[cd.id];
                  return (
                    <button
                      key={cd.id}
                      type="button"
                      onClick={() => setSelectedCdId(cd.id)}
                      className="group text-left bg-[#EDE0D8] border border-[#181818]/35 hover:border-[#181818] transition-colors p-4 rounded-none cursor-pointer flex flex-col"
                    >
                      <div className="relative w-full aspect-square bg-[#EDE0D8] border border-[#181818]/20 overflow-hidden rounded-none">
                        {coverImg ? (
                          <ProtectedCanvas
                            image={coverImg}
                            className="w-full h-full object-contain block rounded-none"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Loader2 size={20} className="animate-spin text-[#181818]/40" />
                          </div>
                        )}
                      </div>

                      <div className="pt-4 text-center flex flex-col items-center">
                        <span className="text-sm sm:text-base font-bold uppercase tracking-widest text-[#181818] group-hover:underline rounded-none">
                          {cd.title}
                        </span>
                        {cd.year && (
                          <span className="mt-1 text-xs text-[#181818]/65 tracking-widest">
                            {cd.year}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            <div className="flex items-center justify-between border-b border-[#181818]/25 pb-4">
              <button
                type="button"
                onClick={() => setSelectedCdId(null)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-[#181818] bg-[#EDE0D8] text-[#181818] hover:bg-[#181818] hover:text-[#EDE0D8] transition-colors text-xs uppercase tracking-widest rounded-none cursor-pointer"
              >
                <ArrowLeft size={15} />
                VOLVER
              </button>

              <div className="text-right">
                <h1 className="text-base sm:text-xl font-bold uppercase tracking-widest text-[#181818]">
                  {selectedCd.title}
                </h1>
                {selectedCd.year && (
                  <p className="text-xs text-[#181818]/65 tracking-widest">
                    {selectedCd.year}
                  </p>
                )}
              </div>
            </div>

            <section className="py-2">
              <BookletViewer
                pageImages={bookletPages[selectedCd.id] || {}}
                totalPages={Number(selectedCd.pages ?? selectedCd.pagesCount) || 24}
              />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-[#181818]/25 pt-8">
              <div className="lg:col-span-8 border border-[#181818] bg-[#EDE0D8] p-6 rounded-none">
                <div className="border-b border-[#181818]/25 pb-3 mb-4 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#181818]">
                    TRACKLIST
                  </span>
                  <span className="text-xs text-[#181818]/65 uppercase tracking-widest">
                    {totalTracksCount} TRACKS
                  </span>
                </div>

                {tracklistSections.length > 0 ? (
                  <div className="space-y-6">
                    {tracklistSections.map((sec, secIdx) => (
                      <div key={secIdx}>
                        {sec.section && (
                          <div className="bg-[#181818] text-[#EDE0D8] px-3 py-1.5 text-xs font-bold uppercase tracking-widest mb-2">
                            {sec.section}
                          </div>
                        )}

                        <div className="divide-y divide-[#181818]/15">
                          {sec.tracks.map((track, idx) => (
                            <div
                              key={idx}
                              className="py-3 flex items-center justify-between gap-4 text-xs sm:text-sm"
                            >
                              <div className="flex items-center gap-4 min-w-0">
                                <span className="text-[#181818]/55 w-6 shrink-0">
                                  {String(track.number ?? idx + 1).padStart(2, "0")}
                                </span>
                                <span className="text-[#181818] uppercase tracking-wider truncate">
                                  {track.title}
                                </span>
                              </div>
                              {track.duration && (
                                <span className="text-[#181818]/65 shrink-0">
                                  {track.duration}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              {selectedCdButtons.length > 0 && (
                <div className="lg:col-span-4 flex flex-col gap-4">
                  {selectedCdButtons.map((btn, idx) => {
                    const isPrimary = idx === 0;
                    return (
                      <a
                        key={idx}
                        href={btn.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full py-4 px-5 border border-[#181818] transition-colors flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest rounded-none ${
                          isPrimary
                            ? "bg-[#181818] text-[#EDE0D8] hover:bg-[#EDE0D8] hover:text-[#181818]"
                            : "bg-[#EDE0D8] text-[#181818] hover:bg-[#181818] hover:text-[#EDE0D8]"
                        }`}
                      >
                        {renderButtonIcon(btn.icon)}
                        <span>{btn.label}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <ArchiveFooter />

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#181818]/80 px-4">
          <div className="w-full max-w-md border border-[#181818] bg-[#EDE0D8] text-[#181818] p-6 rounded-none relative">
            <div className="flex items-center justify-between border-b border-[#181818]/25 pb-3 mb-6">
              <span className="text-xs font-bold uppercase tracking-widest">
                INTRODUCIR CÓDIGO
              </span>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#181818]/70 hover:text-[#181818] transition-colors rounded-none cursor-pointer"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <input
                type="text"
                value={codeInput}
                onChange={(e) => {
                  setCodeInput(sanitizeCode(e.target.value));
                  if (claimError) setClaimError("");
                }}
                placeholder="CÓDIGO"
                maxLength={48}
                autoComplete="off"
                spellCheck={false}
                autoFocus
                className="w-full px-4 py-3 bg-[#EDE0D8] border border-[#181818] text-[#181818] placeholder-[#181818]/35 text-sm tracking-widest uppercase focus:outline-none rounded-none font-mono"
              />

              {claimError && (
                <p className="text-xs text-[#181818] uppercase tracking-widest border border-[#181818] px-3 py-2">
                  {claimError}
                </p>
              )}

              <button
                type="submit"
                disabled={claimLoading || !codeInput.trim()}
                className="w-full py-3 px-4 border border-[#181818] bg-[#181818] text-[#EDE0D8] hover:bg-[#EDE0D8] hover:text-[#181818] disabled:opacity-40 disabled:pointer-events-none transition-colors text-xs font-bold uppercase tracking-widest rounded-none cursor-pointer flex items-center justify-center gap-2"
              >
                {claimLoading && <Loader2 size={15} className="animate-spin" />}
                <span>RECLAMAR</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#181818]/80 px-4">
          <div className="w-full max-w-2xl border border-[#181818] bg-[#EDE0D8] text-[#181818] p-6 rounded-none relative">
            <div className="flex items-center justify-between border-b border-[#181818]/25 pb-3 mb-5">
              <span className="text-xs font-bold uppercase tracking-widest">
                GESTIONAR DESBLOQUEADOS
              </span>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-[#181818]/70 hover:text-[#181818] transition-colors rounded-none cursor-pointer"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            {editableEntriesList.length === 0 ? (
              <p className="py-6 text-center text-xs uppercase tracking-widest text-[#181818]/65">
                NO HAY CDS DESBLOQUEADOS
              </p>
            ) : (
              <div className="divide-y divide-[#181818]/20 max-h-72 overflow-y-auto">
                {editableEntriesList.map((entry) => (
                  <div
                    key={entry.id}
                    className="py-3 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#181818] truncate">
                        {entry.title}
                      </p>
                      {entry.subtitle && (
                        <p className="text-[11px] text-[#181818]/65 tracking-widest truncate">
                          {entry.subtitle}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCd(entry.id)}
                      className="px-3 py-1.5 border border-[#181818] bg-[#EDE0D8] text-[#181818] hover:bg-[#181818] hover:text-[#EDE0D8] transition-colors text-xs uppercase tracking-widest rounded-none cursor-pointer inline-flex items-center gap-1.5 shrink-0"
                    >
                      <Trash2 size={13} />
                      <span>ELIMINAR</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}