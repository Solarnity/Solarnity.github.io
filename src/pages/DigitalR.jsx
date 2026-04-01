import { useState, useEffect } from "react";

const DigitalR = () => {
  // Lista de 18 canciones de ejemplo
  const tracklist = [
    { id: 1, title: "OVERCOMPENSATE", duration: "04:35" },
    { id: 2, title: "NEXT SEMESTER", duration: "04:40" },
    { id: 3, title: "BACKSLIDE", duration: "03:00" },
    { id: 4, title: "MIDWEST INDIGO", duration: "03:27" },
    { id: 5, title: "ROUTINES IN THE NIGHT", duration: "03:42" },
    { id: 6, title: "VIGNETTE", duration: "03:22" },
    { id: 7, title: "THE CRAVING (JENNA'S VERSION)", duration: "02:54" },
    { id: 8, title: "LAVISH", duration: "02:38" },
    { id: 9, title: "NAVIGATING", duration: "03:46" },
    { id: 10, title: "SNAP BACK", duration: "03:57" },
    { id: 11, title: "OLDIES STATION", duration: "03:48" },
    { id: 12, title: "AT THE RISK OF FEELING DUMB", duration: "03:23" },
    { id: 13, title: "PALADIN STRAIT", duration: "06:05" },
    { id: 14, title: "SIDE-SWIPE", duration: "04:58" },
    { id: 15, title: "OVERCOMPENSATE (LIVE FROM AEWTOP)", duration: "04:20" },
    { ID: 16, title: "NEXT SEMESTER (LIVE FROM AEWTOP)", duration: "04:07" },
    { ID: 17, title: "BACKSLIDE (LIVE FROM AEWTOP)", duration: "03:01" },
    { ID: 18, title: "THE CRAVING (JENNA'S VERSION) (LIVE FROM AEWTOP)", duration: "03:09" }
  ];

  return (
    <>
      {/* Fondo base color #EDE0D8 */}
      <div className="fixed inset-0 w-screen h-screen z-0 bg-[#EDE0D8]" />
      
      {/* Textura general que cubre toda la página pero permite interacción */}
      <div 
        className="fixed inset-0 w-screen h-screen z-100 pointer-events-none bg-[url(/texture.png)] bg-cover mix-blend-multiply"
      />

      <div className="relative z-10 w-full min-h-screen py-8 px-4 font-mono font-bold">
        <div className="max-w-4xl mx-auto">

          {/* Tracklist - completamente transparente, solo texto visible */}
          <div className="mb-8 mt-10">
            {/* Título centrado con el mismo tamaño que los items */}
            <div className="text-center mb-6">
              <h2 className="text-md md:text-xl font-mono font-bold text-gray-800 tracking-wide">
                CLANCY: DIGITAL REMAINS
              </h2>
            </div>
            
            {/* Lista de canciones sin fondo */}
            <div className="space-y-3 md:space-y-4">
              {tracklist.map((track, index) => (
                <div 
                  key={track.id}
                  className="flex justify-between items-center px-2"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <span className="text-gray-800 opacity-75 font-mono font-medium text-sm md:text-xl w-6">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-gray-800 font-mono font-bold text-sm md:text-xl">
                      {track.title}
                    </span>
                  </div>
                  <span className="text-gray-800 opacity-90 font-mono font-bold text-sm md:text-xl">
                    {track.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Video de YouTube */}
          <div className="rounded-xl overflow-hidden shadow-xl mt-10">
            <div className="relative w-full" style={{ paddingBottom: "56.25%" /* 16:9 aspect ratio */ }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/NLwLtdFMqrI"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DigitalR;