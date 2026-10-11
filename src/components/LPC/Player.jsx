import { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  AudioLines,
  Mic,
  ListMusic,
} from 'lucide-react';

export const formatTime = (time) => {
  if (!time || isNaN(time)) return '00:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const ProgressBar = ({ progress, duration, onSeek, disabled, thin = false }) => {
  const pct = duration ? Math.min(100, (progress / duration) * 100) : 0;
  return (
    <input
      type="range"
      className={`lpc-range ${thin ? 'lpc-range-thin' : ''}`}
      style={{ '--pct': `${pct}%` }}
      value={progress || 0}
      max={duration || 0}
      step="0.1"
      onChange={onSeek}
      disabled={disabled}
      aria-label="Progreso"
    />
  );
};

const Cover = ({ song, className = '', iconSize = 96 }) =>
  song?.coverArt ? (
    <img
      src={song.coverArt}
      alt="Cover Art"
      className={`aspect-square w-full object-cover ${className}`}
    />
  ) : (
    <div
      className={`flex aspect-square w-full items-center justify-center bg-[#222] ${className}`}
    >
      <AudioLines size={iconSize} className="text-white/60" />
    </div>
  );

const Player = ({
  variant = 'desktop',
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
}) => {
  const currentSong = playlist[currentSongIndex];
  const [isVolumeHovered, setIsVolumeHovered] = useState(false);
  const isMobile = variant === 'mobile';

  const iconBtn =
    'flex h-11 w-11 items-center justify-center rounded-full text-white transition-all duration-200 hover:scale-110 active:scale-95 disabled:pointer-events-none disabled:opacity-30 cursor-pointer';

  if (isMobile) {
    return (
      <div className="mx-auto flex h-full w-full max-w-md flex-col justify-center gap-4 px-6 py-3 text-white">
        <div
          className="mx-auto w-full"
          style={{ maxWidth: 'min(100%, 36dvh, 18rem)' }}
        >
          <Cover
            song={currentSong}
            className="rounded-xl shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
            iconSize={72}
          />
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold leading-tight">
            {currentSong ? currentSong.title : 'Sin canción'}
          </h2>
          <p className="truncate text-sm text-white/60">
            {currentSong ? currentSong.artist : 'Agrega música desde la lista'}
          </p>
        </div>

        <div>
          <ProgressBar
            progress={progress}
            duration={duration}
            onSeek={handleSeek}
            disabled={!currentSong}
          />
          <div className="-mt-1 flex justify-between text-xs tabular-nums text-white/55">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-8">
          <button
            onClick={playPrevious}
            className={iconBtn}
            disabled={currentSongIndex === 0 || playlist.length === 0}
            aria-label="Anterior"
          >
            <SkipBack size={30} fill="currentColor" />
          </button>
          <button
            onClick={togglePlay}
            disabled={playlist.length === 0}
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black transition-transform active:scale-95 disabled:opacity-30 cursor-pointer"
          >
            {isPlaying ? (
              <Pause size={28} fill="currentColor" />
            ) : (
              <Play size={28} fill="currentColor" className="translate-x-0.5" />
            )}
          </button>
          <button
            onClick={playNext}
            className={iconBtn}
            disabled={currentSongIndex === playlist.length - 1 || playlist.length === 0}
            aria-label="Siguiente"
          >
            <SkipForward size={30} fill="currentColor" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-[34rem] flex-col items-center text-white">
      <div className="w-full text-center">
        <h2 className="text-sm leading-tight lg:text-base">
          {currentSong ? `Track ${currentSong.track}` : '\u00A0'}
        </h2>
        <h2 className="mb-4 truncate text-lg leading-tight lg:text-xl">
          {currentSong ? currentSong.album : '\u00A0'}
        </h2>

        <div className="mx-auto mb-5 w-full" style={{ maxWidth: 'min(100%, 34cqh, 300px)' }}>
          <Cover song={currentSong} className="rounded-lg" />
        </div>

        <h2 className="truncate px-2 text-2xl font-bold leading-tight lg:text-3xl">
          {currentSong ? currentSong.title : '-'}
        </h2>
        <p className="mb-6 px-2 text-base lg:text-xl">
          {currentSong ? currentSong.artist : '-'}
        </p>
      </div>

      <div className="flex w-full items-center gap-4">
        <span className="shrink-0 text-sm tabular-nums">{formatTime(progress)}</span>
        <div className="flex-1">
          <ProgressBar
            progress={progress}
            duration={duration}
            onSeek={handleSeek}
            disabled={!currentSong}
          />
        </div>
        <span className="shrink-0 text-sm tabular-nums">{formatTime(duration)}</span>
      </div>

      <div className="mt-6 grid w-full grid-cols-3 items-center">
        <div
          className="relative flex justify-start"
          onMouseEnter={() => setIsVolumeHovered(true)}
          onMouseLeave={() => setIsVolumeHovered(false)}
        >
          <button
            onClick={() => setVolume(volume === 0 ? 0.15 : 0)}
            className={iconBtn}
            aria-label="Silenciar"
          >
            {volume > 0 ? (
              <Volume2 size={28} fill="currentColor" />
            ) : (
              <VolumeX size={28} fill="currentColor" />
            )}
          </button>
          <div
            className={`absolute bottom-full left-0 pb-2 transition-all duration-200 ${
              isVolumeHovered ? 'opacity-100' : 'pointer-events-none translate-y-1 opacity-0'
            }`}
          >
            <div className="w-28 rounded-full bg-[#262626] px-3 py-1.5 shadow-xl">
              <input
                type="range"
                className="lpc-range lpc-range-thin"
                style={{ '--pct': `${volume * 100}%` }}
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                aria-label="Volumen"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button
            onClick={playPrevious}
            className={iconBtn}
            disabled={currentSongIndex === 0 || playlist.length === 0}
            aria-label="Anterior"
          >
            <SkipBack size={30} fill="currentColor" />
          </button>
          <button
            onClick={togglePlay}
            className={iconBtn}
            disabled={playlist.length === 0}
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? (
              <Pause size={34} fill="currentColor" />
            ) : (
              <Play size={34} fill="currentColor" />
            )}
          </button>
          <button
            onClick={playNext}
            className={iconBtn}
            disabled={currentSongIndex === playlist.length - 1 || playlist.length === 0}
            aria-label="Siguiente"
          >
            <SkipForward size={30} fill="currentColor" />
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setTab(tab === 'playlist' ? 'lyrics' : 'playlist')}
            className={iconBtn}
            aria-label={tab === 'playlist' ? 'Ver letra' : 'Ver lista'}
          >
            {tab === 'playlist' ? <Mic size={28} /> : <ListMusic size={28} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Player;