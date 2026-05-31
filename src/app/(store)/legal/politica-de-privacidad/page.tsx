import React from 'react';

export const metadata = {
title: 'Política de Privacidad | NOIR LOVERS',
description: 'Política de tratamiento de datos personales de NOIR LOVERS.',
};

export default function PrivacidadPage() {
return (
  <div className="max-w-4xl mx-auto px-4 py-16 bg-[#dfe1e6]"> 
    <h1 className="text-3xl font-bold mb-8 uppercase tracking-widest text-black">
      Política de Privacidad
    </h1>
    
    <div className="space-y-6 text-gray-800 leading-relaxed">
      <section>
        <h2 className="text-xl font-semibold mb-3">1. Tratamiento de Datos (Habeas Data)</h2>
        <p>
          En cumplimiento de la Ley 1581 de 2012 de Colombia, NOIR LOVERS garantiza el manejo adecuado y confidencial de tus datos personales. La información que recolectamos (nombre, dirección, correo, teléfono) se usa exclusivamente para el procesamiento de tus pedidos y envíos.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">2. Compartición de Información</h2>
        <p>
          Tus datos de pago son procesados de manera encriptada por nuestra pasarela de pagos (Wompi). NOIR LOVERS no almacena, ni tiene acceso a la información de tus tarjetas de crédito o cuentas bancarias.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">3. Tus Derechos</h2>
        <p>
          Tienes derecho a conocer, actualizar, rectificar y solicitar la eliminación de tus datos personales de nuestra base de datos en cualquier momento escribiendo a nuestro correo de soporte.
        </p>
      </section>
    </div>
  </div>
);
}