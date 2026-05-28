import { Suspense } from "react";
import RestablecerForm from "./RestablecerForm";

export default function RestablecerContrasenaPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><span className="w-6 h-6 border-2 border-noir-gray-2 border-t-noir-black rounded-full animate-spin" /></div>}>
      <RestablecerForm />
    </Suspense>
  );
}
