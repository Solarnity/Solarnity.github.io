import { useEffect } from "react";

const DigitalR = () => {
  useEffect(() => {
    // Redireccionar automáticamente al YouTube
    window.location.href = "https://youtu.be/NLwLtdFMqrI";
  }, []);

  return (
    <div 
      className="fixed inset-0 w-screen h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bgDR.png')" }}
    />
  );
};

export default DigitalR;