import React from 'react';

export const metadata = {
title: 'Términos y Condiciones | NOIR LOVERS',
};

export default function TerminosPage() {
return (
  <div className="max-w-4xl mx-auto px-6 py-20"> 
    <h1 className="text-4xl font-black mb-10 uppercase tracking-widest text-black">
      Términos y Condiciones
    </h1>
    <div className="space-y-8 text-black leading-relaxed">
      
      <section>
        <p className="text-gray-700">
          Al acceder y comprar en <strong>NOIR LOVERS</strong>, aceptas los siguientes términos. Somos una marca dedicada a la moda oscura de alta calidad, operando desde Colombia.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3 uppercase tracking-widest">Pagos y Seguridad</h2>
        <p className="text-gray-700">
          Todas las transacciones se realizan a través de pasarelas de pago certificadas (Wompi, MercadoPago, etc.). NOIR LOVERS no captura ni almacena los datos de tus tarjetas de crédito. Los pagos están sujetos a verificación por parte de las entidades bancarias para prevenir fraudes.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3 uppercase tracking-widest">Disponibilidad e Inventario</h2>
        <p className="text-gray-700">
          Nuestro inventario se actualiza en tiempo real. Sin embargo, si por un error del sistema compras una prenda que ya no tiene stock, nos comunicaremos contigo de inmediato para ofrecerte un cambio o el reembolso total de tu dinero.
        </p>
      </section>
    </div>
  </div>
);
}