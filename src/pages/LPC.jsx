import { useState, useRef, useEffect } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import Player from '../components/LPC/Player';
import Playlist from '../components/LPC/Playlist';
import Lyrics from '../components/LPC/Lyrics';
import jsmediatags from "jsmediatags/dist/jsmediatags.min";
import { Play, Pause, Disc3, Mic, ListMusic, AudioLines } from 'lucide-react';
import { ProgressBar } from '../components/LPC/Player';

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
};

const useViewport = () => {
  const read = () => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    return {
      w: Math.round(vv?.width ?? window.innerWidth),
      h: Math.round(vv?.height ?? window.innerHeight),
    };
  };
  const [vp, setVp] = useState(read);
  useEffect(() => {
    const update = () => setVp(read());
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    window.visualViewport?.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      window.visualViewport?.removeEventListener('resize', update);
    };
  }, []);
  return vp;
};

const DESKTOP_DESIGN_HEIGHT = 520;
const NAVBAR_HEIGHT = 48;

const LPC_CSS = `
  .lpc-range { -webkit-appearance: none; appearance: none; width: 100%; height: 20px; background: transparent; cursor: pointer; margin: 0; }
  .lpc-range:disabled { cursor: default; opacity: .5; }
  .lpc-range:focus { outline: none; }
  .lpc-range::-webkit-slider-runnable-track { height: 6px; border-radius: 999px; background: linear-gradient(to right, #fff var(--pct, 0%), #4d4d4d var(--pct, 0%)); }
  .lpc-range::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #fff; margin-top: -4px; border: 0; }
  .lpc-range::-moz-range-track { height: 6px; border-radius: 999px; background: #4d4d4d; }
  .lpc-range::-moz-range-progress { height: 6px; border-radius: 999px; background: #fff; }
  .lpc-range::-moz-range-thumb { width: 14px; height: 14px; border: 0; border-radius: 50%; background: #fff; }
  .lpc-range-thin { height: 16px; }
  .lpc-range-thin::-webkit-slider-runnable-track { height: 3px; }
  .lpc-range-thin::-webkit-slider-thumb { width: 10px; height: 10px; margin-top: -3.5px; }
  .lpc-range-thin::-moz-range-track, .lpc-range-thin::-moz-range-progress { height: 3px; }
  .lpc-range-thin::-moz-range-thumb { width: 10px; height: 10px; }
`;

const LRCLIB_API_URL = "https://lrclib.net/api";

function LPC() {
  const [playlist, setPlaylist] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [tab, setTab] = useState('playlist');
  const [mView, setMView] = useState('now');
  const viewport = useViewport();
  const isDesktop = useMediaQuery('(min-width: 1024px), (orientation: landscape)');
  const [lyricsMap, setLyricsMap] = useState({});
  const audioRef = useRef(null);
  const currentAudioSrc = useRef(null);

  const togglePlay = () => {
    if (playlist.length === 0) return;
    setIsPlaying(!isPlaying);
  };

  const playNext = (auto = false) => {
    if (currentSongIndex < playlist.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
      setProgress(0);
      setIsPlaying(auto);
    }
  };

  const playPrevious = () => {
    if (currentSongIndex > 0) {
      setCurrentSongIndex(currentSongIndex - 1);
      setProgress(0);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (!audioRef.current || playlist.length === 0) return;
    const song = playlist[currentSongIndex];
    if (!song) return;

    if (audioRef.current.src !== song.src) {
      audioRef.current.src = song.src;
      audioRef.current.load();
      setProgress(0);
      setDuration(0);
    }
  }, [currentSongIndex, playlist]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      const tryPlay = () => {
        audio.play().catch((e) => console.error("Error al reproducir el audio:", e));
      };

      if (audio.readyState >= 2) {
        tryPlay();
      } else {
        audio.addEventListener('canplay', tryPlay, { once: true });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSongIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => {
      if (currentSongIndex < playlist.length - 1) {
        setCurrentSongIndex(currentSongIndex + 1);
        setProgress(0);
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    };

    audio.volume = volume;
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [volume, currentSongIndex, playlist]);

  const fetchLyrics = async (song) => {
    if (!song) return;
    
    const duration = audioRef.current?.duration || 0; 
    const query = new URLSearchParams({ 
      track_name: song.title, 
      artist_name: song.artist,
      duration: Math.round(duration)
    });

    try {
      const response = await fetch(`${LRCLIB_API_URL}/search?${query.toString()}`);
      if (!response.ok) {
        throw new Error('Error al buscar la letra');
      }
      const data = await response.json();
      
      const lyricsData = data.find(item => item.syncedLyrics && item.plainLyrics);
      if (lyricsData) {
        const parsedSyncedLyrics = lyricsData.syncedLyrics.split('\n').map(line => {
          const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
          if (match) {
            const min = parseInt(match[1], 10);
            const sec = parseInt(match[2], 10);
            let ms = parseInt(match[3], 10);
            if (match[3].length === 2) {
              ms = ms * 10;
            }
            return {
              time: min * 60 + sec + ms / 1000,
              text: match[4].trim(),
            };
          }
          return null;
        }).filter(Boolean);

        const newLyrics = {
          synced: parsedSyncedLyrics,
          plain: lyricsData.plainLyrics,
        };

        setLyricsMap(lm => ({ ...lm, [song.id]: newLyrics }));
      } else {
        setLyricsMap(lm => ({ ...lm, [song.id]: { synced: [], plain: "No se encontró letra para esta canción." } }));
      }
    } catch (error) {
      console.error("Error fetching lyrics from LRCLIB:", error);
      setLyricsMap(lm => ({ ...lm, [song.id]: { synced: [], plain: "Error al cargar la letra." } }));
    }
  };

  useEffect(() => {
    if (playlist.length > 0) {
      const currentSong = playlist[currentSongIndex];
      if (currentSong && !lyricsMap[currentSong.id]) {
        fetchLyrics(currentSong);
      }
    }
  }, [currentSongIndex, playlist, lyricsMap]);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    const newSongs = await Promise.all(files.map(file => {
      return new Promise((resolve) => {
        jsmediatags.read(file, {
          onSuccess: (tag) => {
            let title = tag.tags.title || file.name;
            let artist = tag.tags.artist || 'Desconocido';
            let album = tag.tags.album || 'Desconocido';
            let year = tag.tags.year || 'Desconocido';
            let track = tag.tags.track || 'Desconocido';
            let coverArt = null;
            if (tag.tags.picture) {
              const { data, format } = tag.tags.picture;
              let base64String = "";
              for (let i = 0; i < data.length; i++) {
                base64String += String.fromCharCode(data[i]);
              }
              coverArt = `data:${format};base64,${btoa(base64String)}`;
            }
            resolve({
              id: file.name + file.size,
              title,
              artist,
              album,
              year,
              track,
              file,
              coverArt,
              src: URL.createObjectURL(file)
            });
          },
          onError: () => {
            resolve({
              id: file.name + file.size,
              title: file.name,
              artist: 'Desconocido',
              album: 'Desconocido',
              year: 'Desconocido',
              track: 'Desconocido',
              file,
              coverArt: null
            });
          }
        });
      });
    }));

    if (playlist.length === 0 && newSongs.length > 0) {
      setTab('lyrics');
      setMView('now');
    }
    setPlaylist((prev) => [...prev, ...newSongs]);
  };

  const handleDragEnd = ({ active, over }) => {
    if (over && active.id !== over.id) {
      setPlaylist((items) => {
        const oldIndex = items.findIndex((song) => song.id === active.id);
        const newIndex = items.findIndex((song) => song.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        if (oldIndex === currentSongIndex) {
            setCurrentSongIndex(newIndex);
        } else if (newIndex <= currentSongIndex && oldIndex > currentSongIndex) {
            setCurrentSongIndex(currentSongIndex + 1);
        } else if (newIndex >= currentSongIndex && oldIndex < currentSongIndex) {
            setCurrentSongIndex(currentSongIndex - 1);
        }
        return newArray;
      });
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current) {
      audioRef.current.currentTime = e.target.value;
      setProgress(e.target.value);
    }
  };

  const removeSong = (songId) => {
    const songIndex = playlist.findIndex(song => song.id === songId);
    if (songIndex > -1) {
      const toRemove = playlist[songIndex];
      if (toRemove?.src) URL.revokeObjectURL(toRemove.src);
      const newPlaylist = playlist.filter(song => song.id !== songId);
      setPlaylist(newPlaylist);
      if (currentSongIndex === songIndex) {
        if (newPlaylist.length > 0) {
          setCurrentSongIndex(0);
        } else {
          setCurrentSongIndex(0);
          setIsPlaying(false);
          if (audioRef.current) audioRef.current.src = '';
        }
      } else if (currentSongIndex > songIndex) {
        setCurrentSongIndex(currentSongIndex - 1);
      }
    }
  };

  const removeAllSongs = () => {
    playlist.forEach(song => {
      if (song.src) URL.revokeObjectURL(song.src);
    });
    setPlaylist([]);
    setCurrentSongIndex(0);
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.src = '';
  };

  const moveSong = (fromIndex, toIndex) => {
    if (fromIndex < 0 || fromIndex >= playlist.length || toIndex < 0 || toIndex >= playlist.length) return;
    const newPlaylist = arrayMove(playlist, fromIndex, toIndex);
    setPlaylist(newPlaylist);
    if (currentSongIndex === fromIndex) {
      setCurrentSongIndex(toIndex);
    } else if (fromIndex < currentSongIndex && toIndex >= currentSongIndex) {
      setCurrentSongIndex(currentSongIndex - 1);
    } else if (fromIndex > currentSongIndex && toIndex <= currentSongIndex) {
      setCurrentSongIndex(currentSongIndex + 1);
    }
  };

  const currentSong = playlist[currentSongIndex];

  const currentLyrics = currentSong ? lyricsMap[currentSong.id] : null;

  const playerProps = {
    isPlaying,
    playlist,
    currentSongIndex,
    togglePlay,
    playNext,
    playPrevious,
    volume,
    setVolume,
    progress,
    duration,
    handleSeek,
    tab,
    setTab,
  };

  const lyricsEl = (
    <Lyrics
      lyrics={lyricsMap[playlist[currentSongIndex]?.id] || { synced: [], plain: "Cargando letra..." }}
      progress={progress}
      onSeek={handleSeek}
      label={isDesktop ? 'Lyrics' : ''}
    />
  );

  const playlistEl = (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <Playlist
        playlist={playlist}
        currentSongIndex={currentSongIndex}
        setCurrentSongIndex={setCurrentSongIndex}
        setIsPlaying={setIsPlaying}
        handleFiles={handleFiles}
        removeSong={removeSong}
        moveSong={moveSong}
        removeAllSongs={removeAllSongs}
      />
    </DndContext>
  );

  const desktopScale = Math.max(
    0.45,
    Math.min(1, (viewport.h - NAVBAR_HEIGHT) / DESKTOP_DESIGN_HEIGHT)
  );

  const mobileTabs = [
    { id: 'now', label: 'Música', Icon: Disc3 },
    { id: 'lyrics', label: 'Letra', Icon: Mic },
    { id: 'playlist', label: 'Playlist', Icon: ListMusic },
  ];

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#141414] pt-12 text-white">
      <style>{LPC_CSS}</style>
      <audio ref={audioRef} />

      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-0 overflow-hidden transition-opacity duration-[1500ms] ease-in-out ${
          currentSong?.coverArt ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className="absolute inset-[-10%] bg-cover bg-center will-change-[filter]"
          style={{
            backgroundImage: currentSong?.coverArt ? `url('${currentSong.coverArt}')` : 'none',
            filter: 'blur(64px) brightness(0.45) saturate(1.15)',
            transform: 'scale(1.15)',
          }}
        />
      </div>

      <div className="relative z-10 h-full">
      {isDesktop ? (
        <div
          style={{
            width: `${viewport.w / desktopScale}px`,
            height: `${(viewport.h - NAVBAR_HEIGHT) / desktopScale}px`,
            transform: desktopScale < 1 ? `scale(${desktopScale})` : undefined,
            transformOrigin: 'top left',
            containerType: 'size',
          }}
        >
          <div className="grid h-full grid-cols-2">
            <div className="flex h-full min-h-0 items-center justify-center px-8 pb-4">
              <Player variant="desktop" {...playerProps} />
            </div>
            <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-col px-8 pb-10 pt-8 xl:px-12">
              {tab === 'lyrics' ? lyricsEl : playlistEl}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <div className="min-h-0 flex-1">
            {mView === 'now' && <Player variant="mobile" {...playerProps} />}
            {mView === 'lyrics' && <div className="h-full px-6 pt-2">{lyricsEl}</div>}
            {mView === 'playlist' && <div className="h-full px-4 pt-2">{playlistEl}</div>}
          </div>

          {mView !== 'now' && (
            <div className="shrink-0 border-t border-white/10 bg-[#1c1c1c]">
              <div className="px-3 pt-1">
                <ProgressBar
                  progress={progress}
                  duration={duration}
                  onSeek={handleSeek}
                  disabled={!currentSong}
                  thin
                />
              </div>
              <div className="flex items-center gap-3 px-3 pb-2">
                <button
                  type="button"
                  onClick={() => setMView('now')}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
                  aria-label="Abrir reproductor"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-[#2a2a2a]">
                    {currentSong?.coverArt ? (
                      <img src={currentSong.coverArt} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <AudioLines size={18} className="text-white/50" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">
                      {currentSong ? currentSong.title : 'Sin canción'}
                    </div>
                    <div className="truncate text-xs text-white/50">
                      {currentSong ? currentSong.artist : '-'}
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={togglePlay}
                  disabled={playlist.length === 0}
                  aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                  className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-white disabled:opacity-30"
                >
                  {isPlaying ? (
                    <Pause size={24} fill="currentColor" />
                  ) : (
                    <Play size={24} fill="currentColor" />
                  )}
                </button>
              </div>
            </div>
          )}

          <nav className="grid shrink-0 grid-cols-3 border-t border-white/10 bg-[#141414] pb-[env(safe-area-inset-bottom)]">
            {mobileTabs.map(({ id, label, Icon }) => {
              const active = mView === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMView(id)}
                  className={`flex cursor-pointer flex-col items-center gap-0.5 border-t-2 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                    active
                      ? 'border-white text-white'
                      : 'border-transparent text-white/45 hover:text-white/80'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              );
            })}
          </nav>
        </div>
      )}
      </div>
    </div>
  );
}

export default LPC;