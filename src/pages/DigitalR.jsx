import { useState, useEffect } from "react";
import { Link } from "react-router";

const DigitalR = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Fecha objetivo: 16 de Marzo de 2026 a las 16:00:00
    const targetDate = new Date("March 16, 2026 16:00:00").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        // Cálculos de tiempo
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        // Si ya pasó la fecha, mostrar 00:00:00:00
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Actualizar inmediatamente al montar el componente
    updateCountdown();
    
    // Actualizar cada segundo
    const timer = setInterval(updateCountdown, 1000);

    // Limpiar el intervalo al desmontar el componente
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Fondo de imagen sin repetir */}
      <div 
        className="fixed inset-0 w-screen h-screen z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bgDR.png')" }}
      />
      
      {/* Overlay oscuro para mejorar legibilidad */}
      <div className="fixed inset-0 z-1" />

      <div className="w-full h-full text-white relative z-10">

        {/* Contenedor principal centrado */}
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="text-center max-w-4xl mx-auto">

            {/* Contador en tiempo real - Formato horizontal para todos los tamaños */}
            <div className="font-mono bg-black/40 rounded-lg p-6 md:p-8 border border-white/20 shadow-2xl">
              
              {/* Formato horizontal con dos puntos - visible en todos los tamaños */}
              <div className="flex flex-row items-center justify-center gap-1 md:gap-2">
                <span className="text-5xl md:text-7xl lg:text-8xl font-bold">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="text-5xl md:text-7xl lg:text-8xl font-bold">:</span>
                <span className="text-5xl md:text-7xl lg:text-8xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-5xl md:text-7xl lg:text-8xl font-bold">:</span>
                <span className="text-5xl md:text-7xl lg:text-8xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-5xl md:text-7xl lg:text-8xl font-bold">:</span>
                <span className="text-5xl md:text-7xl lg:text-8xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DigitalR;