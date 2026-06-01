import React from 'react';

export const metadata = {
title: 'Política de Privacidad | NOIR LOVERS',
};

export default function PrivacidadPage() {
return (
  <div className="max-w-4xl mx-auto px-6 py-20"> 
    <h1 className="text-4xl font-black mb-10 uppercase tracking-widest text-black">
      Política de Privacidad
    </h1>
    <div className="space-y-8 text-black leading-relaxed">
      
      <section>
        <h2 className="text-xl font-bold mb-3 uppercase tracking-widest">Manejo de Datos (Habeas Data)</h2>
        <p className="text-gray-700">
          En cumplimiento con la ley colombiana, en NOIR LOVERS nos tomamos muy en serio tu privacidad. Los datos que nos proporcionas (nombre, correo, dirección, teléfono) se utilizan EXCLUSIVAMENTE para procesar y enviar tus pedidos, y para enviarte información relevante sobre nuevas colecciones si así lo autorizas.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3 uppercase tracking-widest">Protección de la Información</h2>
        <p className="text-gray-700">
          Jamás venderemos, alquilaremos ni compartiremos tu información personal con terceros ajenos al proceso de compra y envío (transportadoras).
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3 uppercase tracking-widest">Tus Derechos</h2>
        <p className="text-gray-700">
          Tienes derecho a conocer, actualizar y solicitar la eliminación de tus datos de nuestra base en cualquier momento. Solo envíanos un correo a nuestro equipo de soporte.
        </p>
      </section>
    </div>
  </div>
);
}