import { useState, useRef, useEffect } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import Player from '../components/LPC/Player';
import Playlist from '../components/LPC/Playlist';
import Lyrics from '../components/LPC/Lyrics';
import jsmediatags from "jsmediatags/dist/jsmediatags.min";

// Define la URL base para LRCLIB
const LRCLIB_API_URL = "https://lrclib.net/api";

function LPC() {
  const [playlist, setPlaylist] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [tab, setTab] = useState('playlist');
  const [lyricsMap, setLyricsMap] = useState({}); // {songId: { synced: [...], plain: "..." }}
  const audioRef = useRef(null);
  const currentAudioSrc = useRef(null);

  // Reproducción
  const togglePlay = () => {
    if (playlist.length === 0) return;
    setIsPlaying(!isPlaying);
  };

  const playNext = (auto = false) => {
    if (currentSongIndex < playlist.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
      setProgress(0);
      setIsPlaying(auto); // solo auto-reproduce si viene de onEnded
    }
  };

  const playPrevious = () => {
    if (currentSongIndex > 0) {
      setCurrentSongIndex(currentSongIndex - 1);
      setProgress(0);
      setIsPlaying(false); // cambio manual → pausa
    }
  };

  // Efecto para cargar una nueva canción y reiniciar el progreso
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

  // Efecto para reproducir/pausar
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

  // Efecto para actualizar el volumen
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

  // Función para obtener las letras de LRCLIB
  const fetchLyrics = async (song) => {
    if (!song) return;
    
    // Aquí puedes usar la duración del audio para una mejor búsqueda si quieres
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
        // La API de LRCLIB usa el formato LRC, que debemos parsear
        const parsedSyncedLyrics = lyricsData.syncedLyrics.split('\n').map(line => {
          const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
          if (match) {
            const min = parseInt(match[1], 10);
            const sec = parseInt(match[2], 10);
            let ms = parseInt(match[3], 10);
            if (match[3].length === 2) {
              ms = ms * 10; // "03" → 300ms
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

  // Efecto para obtener las letras cuando la canción cambia
  useEffect(() => {
    if (playlist.length > 0) {
      const currentSong = playlist[currentSongIndex];
      if (currentSong && !lyricsMap[currentSong.id]) {
        fetchLyrics(currentSong);
      }
    }
  }, [currentSongIndex, playlist, lyricsMap]);

  // Usar jsmediatags para metadatos
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

  return (
    <>
      {/* Contenedor del fondo (la imagen o el color) */}
      <div
        className={`
          bg-cover
          bg-center
          fixed
          w-screen
          h-screen
          transition-bg-image
          duration-[2500ms]
          ease-in-out
          ${currentSong?.coverArt ? '' : 'bg-neutral-900'}
        `}
        style={currentSong?.coverArt ? { backgroundImage: `url('${currentSong.coverArt}')` } : {}}
      />
      {/* Contenedor de los filtros, superpuesto al fondo */}
      <div
        className={`
          fixed
          w-screen
          h-screen
          backdrop-blur-3xl
          backdrop-brightness-50
          backdrop-contrast-95
        `}
      />
      <div className='flex flex-col lg:flex-row min-h-screen text-white gap-0 relative'>
        <audio ref={audioRef} />
        {/* Player 50% en desktop, 100% en móvil */}
        <div className='w-full lg:w-1/2 flex flex-col h-auto lg:h-screen justify-center items-center px-4 lg:px-8 py-4 lg:py-8 order-2 lg:order-1'>
          <Player
            isPlaying={isPlaying}
            playlist={playlist}
            currentSongIndex={currentSongIndex}
            togglePlay={togglePlay}
            playNext={playNext}
            playPrevious={playPrevious}
            volume={volume}
            setVolume={setVolume}
            progress={progress}
            duration={duration}
            handleSeek={handleSeek}
            noBg // para quitar fondo
            tab={tab} // Pasar el estado tab como prop
            setTab={setTab} // Pasar el setter de tab como prop
          />
        </div>
        {/* Playlist/Lyrics 50% en desktop, 100% en móvil */}
        <div className={`w-full lg:w-1/2 flex flex-col h-auto lg:h-screen items-center px-4 lg:px-8 py-4 lg:py-8 text-gray-300
          ${tab === 'playlist' ? 'justify-start' : 'justify-center'} order-1 lg:order-2`}>
          <div className="w-full max-w-3xl mx-auto">
            <div className="w-full">
              {tab==='playlist' ? (
                <div className="flex flex-col justify-start h-full">
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
                      lyrics={currentLyrics}
                      setLyrics={(songId, lyricsArr) => setLyricsMap(lm => ({...lm, [songId]: lyricsArr}))}
                      removeLyrics={(songId) => setLyricsMap(lm => {const copy={...lm};delete copy[songId];return copy;})}
                    />
                  </DndContext>
                </div>
              ) : (
                <div className="flex flex-col justify-center h-full">
                  <Lyrics 
                    lyrics={lyricsMap[playlist[currentSongIndex]?.id] || { synced: [], plain: "Cargando letra..." }}
                    progress={progress}
                    onSeek={handleSeek}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LPC;