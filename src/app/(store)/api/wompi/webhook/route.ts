import { NextResponse } from 'next/server';

// Wompi siempre hace peticiones POST a los webhooks
export async function POST(request: Request) {
try {
  // 1. Leemos la información que nos manda Wompi
  const body = await request.json();
  
  // Wompi manda eventos, el que nos importa es cuando la transacción se actualiza
  const eventType = body.event;
  
  if (eventType === 'transaction.updated') {
    const transaction = body.data.transaction;
    const status = transaction.status; // 'APPROVED', 'DECLINED', 'ERROR'
    const orderReference = transaction.reference; // Esta es la referencia de tu pedido (ej: NOIR-12345)
    const amount = transaction.amount_in_cents / 100; // Viene en centavos, lo pasamos a pesos/dólares normales

    console.log(`Webhook recibido: Pedido ${orderReference} | Estado: ${status} | Total: $${amount}`);

    if (status === 'APPROVED') {
      // TODO: Lógica de Base de Datos
      // Aquí buscas el pedido 'orderReference' en tu BD (Prisma, Supabase, etc.)
      // y le cambias el estado a "PAGADO". 
      // También aquí es donde restas el stock de la chaqueta/pantalón.
      
      console.log(`✅ ¡Pago exitoso para la orden ${orderReference}!`);
      
    } else if (status === 'DECLINED' || status === 'ERROR') {
      // TODO: Lógica de Base de Datos
      // Cambiar estado a "RECHAZADO" o "FALLIDO" y liberar el inventario reservado.
      
      console.log(`❌ Pago fallido para la orden ${orderReference}`);
    }
  }

  // 2. MUY IMPORTANTE: Siempre debes responderle un 200 OK a Wompi rápidamente.
  // Si no le respondes 200, Wompi pensará que tu servidor está caído y seguirá enviando el mensaje.
  return NextResponse.json({ received: true }, { status: 200 });

} catch (error) {
  console.error("Error procesando el webhook de Wompi:", error);
  return NextResponse.json({ error: "Error procesando webhook" }, { status: 500 });
}
}