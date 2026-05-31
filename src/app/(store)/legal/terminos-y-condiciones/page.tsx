import React from 'react';

export const metadata = {
 title: 'Términos y Condiciones | NOIR LOVERS',
 description: 'Términos y condiciones de uso de NOIR LOVERS.',
};

export default function TerminosPage() {
 return (
   <div className="max-w-4xl mx-auto px-4 py-16 text-white bg-[#dfe1e6]"> 
     {/* Ojo: ajusta los colores de texto y fondo según el diseño de tu web. Como tu marca es negra, quizás el fondo aquí deba ser oscuro y el texto claro, o fondo gris claro como las fotos. */}
     
     <h1 className="text-3xl font-bold mb-8 uppercase tracking-widest text-black">
       Términos y Condiciones
     </h1>
     
     <div className="space-y-6 text-gray-800 leading-relaxed">
       <section>
         <h2 className="text-xl font-semibold mb-3">1. Información General</h2>
         <p>
           Bienvenido a NOIR LOVERS. Al acceder y utilizar este sitio web, aceptas estar sujeto a los siguientes términos y condiciones...
         </p>
       </section>

       <section>
         <h2 className="text-xl font-semibold mb-3">2. Compras y Pagos</h2>
         <p>
           Todos los pagos son procesados de forma segura a través de Wompi. NOIR LOVERS no almacena información de tarjetas de crédito...
         </p>
       </section>

       {/* Añade más secciones según necesites */}
     </div>
   </div>
 );
}