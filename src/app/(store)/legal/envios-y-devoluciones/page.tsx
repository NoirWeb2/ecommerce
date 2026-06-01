import React from 'react';

export const metadata = {
title: 'Envíos y Devoluciones | NOIR LOVERS',
};

export default function EnviosDevolucionesPage() {
return (
  <div className="max-w-4xl mx-auto px-6 py-20"> 
    <h1 className="text-4xl font-black mb-10 uppercase tracking-widest text-black">
      Envíos y Devoluciones
    </h1>
    <div className="space-y-8 text-black leading-relaxed">
      
      <section>
        <h2 className="text-xl font-bold mb-3 uppercase tracking-widest">Envíos</h2>
        <p className="text-gray-700">
          Despachamos desde Bogotá. Tu pedido será procesado en 1 a 2 días hábiles tras la confirmación del pago. El tiempo estimado de entrega de la transportadora es de 2 a 5 días hábiles dependiendo de tu ciudad.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3 uppercase tracking-widest">Cambios y Garantías (30 Días)</h2>
        <p className="text-gray-700 mb-4">
          Tienes un máximo de <strong>30 días calendario</strong> desde que recibes tu pedido para solicitar un cambio de talla o reportar un defecto de fábrica. 
        </p>
        <p className="text-gray-700 mb-4">
          <strong>Requisitos para cambios:</strong> La prenda debe estar en su estado original, sin usar, sin lavar, sin olores y con todas las etiquetas puestas.
        </p>
        <p className="text-gray-700 font-bold mt-4">Lo que NO cubre la garantía:</p>
        <ul className="list-disc pl-5 text-gray-700 space-y-1 mt-2">
          <li>Daños causados por el cliente (quemaduras, roturas por mal uso, manchas).</li>
          <li>Desgaste natural de la prenda por el uso.</li>
          <li>Daños por no seguir las instrucciones de lavado (ej. planchar estampados, usar blanqueador).</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3 uppercase tracking-widest">Proceso</h2>
        <p className="text-gray-700">
          Para iniciar un cambio, escríbenos a nuestro canal de soporte con tu número de orden. Nuestro equipo evaluará el caso. Si el cambio es por talla, los costos de envío son asumidos por el cliente. Si es por defecto de fábrica comprobado, nosotros asumimos el envío.
        </p>
      </section>
    </div>
  </div>
);
}