import { useState } from 'react';
import Image from 'next/image';

export function ModulImageZoom({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="flex justify-center mb-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="focus:outline-none"
          aria-label="Perbesar gambar"
        >
          <Image
            src={src}
            alt={alt}
            width={700}
            height={350}
            className="rounded-lg shadow-md object-contain max-h-80 bg-white"
            style={{ maxWidth: '100%', cursor: 'zoom-in' }}
            priority={false}
          />
        </button>
      </div>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={() => setOpen(false)}
        >
          <div className="relative">
            <Image
              src={src}
              alt={alt}
              width={1200}
              height={700}
              className="rounded-lg shadow-2xl object-contain max-h-[80vh] max-w-[95vw] bg-white"
              style={{ cursor: 'zoom-out' }}
              priority={true}
            />
            <button
              className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-1 shadow"
              onClick={() => setOpen(false)}
              aria-label="Tutup gambar"
              type="button"
            >
              <span className="text-xl">×</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
