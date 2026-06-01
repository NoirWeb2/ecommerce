import React from 'react';

export const metadata = {
title: 'FAQ | NOIR LOVERS',
};

export default function FAQPage() {
return (
  <div className="max-w-4xl mx-auto px-6 py-20 bg-[#dfe1e6]"> 
    <h1 className="text-4xl font-black mb-10 uppercase tracking-widest text-black">
      Preguntas Frecuentes
    </h1>
    <div className="space-y-8 text-black">
      <div>
        <h3 className="font-bold text-lg">¿Cuánto tarda el envío?</h3>
        <p className="text-gray-700 mt-2">Nuestros envíos a toda Colombia toman de 2 a 5 días hábiles.</p>
      </div>
      <div>
        <h3 className="font-bold text-lg">¿Hacen cambios de talla?</h3>
        <p className="text-gray-700 mt-2">Sí, tienes 15 días para solicitar un cambio si la prenda está intacta. Visita nuestra página de devoluciones.</p>
      </div>
      {/* Aquí le pides a ChatGPT que te llene más preguntas */}
    </div>
  </div>
);
}