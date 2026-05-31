import React from 'react';

export const metadata = {
title: 'Envíos y Devoluciones | NOIR LOVERS',
description: 'Políticas de envío, cambios y devoluciones de NOIR LOVERS.',
};

export default function EnviosDevolucionesPage() {
return (
  <div className="max-w-4xl mx-auto px-4 py-16 bg-[#dfe1e6]"> 
    <h1 className="text-3xl font-bold mb-8 uppercase tracking-widest text-black">
      Envíos y Devoluciones
    </h1>
    
    <div className="space-y-6 text-gray-800 leading-relaxed">
      <section>
        <h2 className="text-xl font-semibold mb-3 text-black">Tiempos de Envío</h2>
        <p>
          Todos nuestros envíos se despachan en un plazo de 1 a 3 días hábiles tras la confirmación del pago. Los tiempos de tránsito dependen de la transportadora y la ciudad de destino (generalmente 2 a 5 días hábiles a nivel nacional). Te enviaremos un número de guía tan pronto tu pedido salga de nuestra bodega.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3 text-black">Políticas de Cambio</h2>
        <p>
          Dado el carácter premium de nuestras prendas, aceptamos cambios de talla dentro de los primeros <strong>15 días calendario</strong> posteriores a la entrega. La prenda debe estar en perfectas condiciones, sin uso, sin lavar, sin olores y con todas sus etiquetas y empaques originales intactos. Los costos de envío por cambios de talla son asumidos por el cliente.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3 text-black">Derecho de Retracto</h2>
        <p>
          De acuerdo con la Ley colombiana, tienes derecho al retracto dentro de los <strong>5 días hábiles</strong> siguientes a la entrega del producto. Debes devolver la prenda en las mismas condiciones en que la recibiste. Los costos de transporte para la devolución corren por cuenta del comprador.
        </p>
      </section>
    </div>
  </div>
);
}