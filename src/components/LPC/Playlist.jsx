import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, ChevronUp, ChevronDown, Plus, AudioLines, GripVertical } from 'lucide-react';

const iconBtn =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-25 cursor-pointer';

const SortableSong = ({
  song,
  index,
  currentSongIndex,
  setCurrentSongIndex,
  setIsPlaying,
  removeSong,
  moveSong,
  playlistLength,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: song.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };
  const isCurrent = index === currentSongIndex;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors ${
        isCurrent ? 'bg-white/[0.09]' : 'hover:bg-white/[0.05]'
      } ${isDragging ? 'bg-[#2a2a2a] shadow-xl' : ''}`}
      onClick={() => {
        setCurrentSongIndex(index);
        setIsPlaying(false);
      }}
    >
      <button
        type="button"
        aria-label="Reordenar"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        style={{ touchAction: 'none' }}
        className="hidden h-9 w-6 shrink-0 cursor-grab items-center justify-center text-white/30 hover:text-white/70 active:cursor-grabbing sm:flex"
      >
        <GripVertical size={16} />
      </button>

      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-[#222]">
        {song.coverArt ? (
          <img src={song.coverArt} alt="Cover Art" className="h-full w-full object-cover" />
        ) : (
          <AudioLines size={20} className="text-white/50" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-white lg:text-base">{song.title}</div>
        <div className="truncate text-xs text-white/50 lg:text-sm">
          {song.artist} • {song.album}
        </div>
      </div>

      <div className="flex shrink-0 items-center">
        <button
          className={`${iconBtn} hidden lg:flex`}
          aria-label="Subir"
          onClick={(e) => {
            e.stopPropagation();
            moveSong(index, index - 1);
          }}
          disabled={index === 0}
        >
          <ChevronUp size={16} />
        </button>
        <button
          className={`${iconBtn} hidden lg:flex`}
          aria-label="Bajar"
          onClick={(e) => {
            e.stopPropagation();
            moveSong(index, index + 1);
          }}
          disabled={index === playlistLength - 1}
        >
          <ChevronDown size={16} />
        </button>
        <button
          className={iconBtn}
          aria-label="Quitar"
          onClick={(e) => {
            e.stopPropagation();
            removeSong(song.id);
          }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

const Playlist = ({
  playlist,
  currentSongIndex,
  setCurrentSongIndex,
  setIsPlaying,
  handleFiles,
  removeSong,
  moveSong,
  removeAllSongs,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles({ target: { files: e.dataTransfer.files } });
    }
  };

  return (
    <div
      className={`flex h-full min-h-0 w-full flex-col rounded-lg border border-dashed transition-colors ${
        isDragActive ? 'border-white/50 bg-white/[0.04]' : 'border-transparent'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="relative flex shrink-0 items-center justify-center pb-3 text-sm text-white">
        <span>Playlist{playlist.length > 0 ? ` · ${playlist.length}` : ''}</span>
        <div className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center">
          {playlist.length > 0 && (
            <button className={iconBtn} aria-label="Vaciar lista" onClick={removeAllSongs}>
              <Trash2 size={16} />
            </button>
          )}
          <label htmlFor="file-upload" className={iconBtn} aria-label="Agregar canciones">
            <Plus size={18} />
            <input
              id="file-upload"
              type="file"
              accept="audio/*"
              multiple
              onChange={handleFiles}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        {playlist.length > 0 ? (
          playlist.map((song, index) => (
            <SortableSong
              key={song.id}
              song={song}
              index={index}
              currentSongIndex={currentSongIndex}
              setCurrentSongIndex={setCurrentSongIndex}
              setIsPlaying={setIsPlaying}
              removeSong={removeSong}
              moveSong={moveSong}
              playlistLength={playlist.length}
            />
          ))
        ) : (
          <label
            htmlFor="file-upload"
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg bg-white/[0.04] p-8 transition-colors hover:bg-white/[0.07]"
          >
            <p className="text-center text-sm text-white/60">Tu lista de reproducción está vacía.</p>
            <p className="text-center text-xs text-white/40">
              Toca para agregar o arrastra y suelta archivos aquí.
            </p>
          </label>
        )}
      </div>
    </div>
  );
};

export default Playlist;