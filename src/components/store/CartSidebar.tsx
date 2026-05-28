"use client";

import { X, ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } =
    useCartStore();
  const router = useRouter();

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-noir-gray-2">
              <h2 className="text-sm font-bold tracking-widest uppercase">
                TU CARRO ({items.length})
              </h2>
              <button onClick={closeCart}>
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
                  <ShoppingBag size={48} className="text-noir-gray-3" />
                  <p className="text-noir-gray-4 text-sm">Tu carro está vacío</p>
                  <Link
                    href="/tienda"
                    onClick={closeCart}
                    className="text-xs font-bold tracking-widest uppercase underline underline-offset-4"
                  >
                    EXPLORAR COLECCIÓN
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-noir-gray-2">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-4 p-4">
                      <div className="relative w-20 h-24 bg-noir-gray flex-shrink-0 overflow-hidden">
                        <Image
                          src={item.image || "/placeholder-product.jpg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/producto/${item.slug}`}
                          onClick={closeCart}
                          className="text-sm font-medium line-clamp-2 hover:underline"
                        >
                          {item.name}
                        </Link>
                        {item.size && (
                          <p className="text-xs text-noir-gray-4 mt-1">Talla: {item.size}</p>
                        )}
                        <p className="text-sm font-bold mt-2">
                          {formatPrice(item.price)}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 border border-noir-gray-2 flex items-center justify-center hover:border-noir-black transition-colors"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="text-sm w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 border border-noir-gray-2 flex items-center justify-center hover:border-noir-black transition-colors"
                          >
                            <Plus size={10} />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-auto text-noir-gray-4 hover:text-noir-black transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-noir-gray-2 p-6 space-y-4">
                <div className="flex justify-between text-sm font-bold">
                  <span>SUBTOTAL</span>
                  <span>{formatPrice(totalPrice())}</span>
                </div>
                <p className="text-xs text-noir-gray-4 text-center">
                  Envíos y descuentos calculados en el checkout
                </p>
                <button
                  onClick={handleCheckout}
                  className="block w-full bg-noir-black text-white text-center py-4 text-sm font-bold tracking-widest uppercase hover:bg-noir-black/90 transition-colors"
                >
                  FINALIZAR COMPRA
                </button>
                <button
                  onClick={closeCart}
                  className="block w-full text-center text-xs text-noir-gray-4 hover:text-noir-black transition-colors underline underline-offset-2"
                >
                  Continuar comprando
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
