// filepath: src/components/CloudinaryUploader.tsx
import { useRef, useState } from 'react';
import {
  uploadToCloudinary,
  isCloudinaryConfigured,
} from '../lib/cloudinary';

interface Props {
  value?: string | null;
  onChange: (url: string | null) => void;
  label: string;
  folder?: string;
  maxSizeMb?: number;
}

/**
 * Componente simple: input file + preview + upload a Cloudinary.
 * Devuelve la URL segura por onChange.
 */
export default function CloudinaryUploader({
  value,
  onChange,
  label,
  folder,
  maxSizeMb = 5,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = isCloudinaryConfigured();

  async function handleFile(file: File) {
    setError(null);
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`El archivo no puede superar ${maxSizeMb}MB`);
      return;
    }
    setUploading(true);
    try {
      const result = await uploadToCloudinary(file, folder);
      onChange(result.secure_url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 mb-1">
        {label}
      </label>

      {value ? (
        <div className="relative">
          <img
            src={value}
            alt={label}
            className="w-full h-40 object-cover rounded-lg border border-stone-200"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded"
          >
            Quitar
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={!ready || uploading}
          onClick={() => inputRef.current?.click()}
          className="w-full h-40 border-2 border-dashed border-stone-300 rounded-lg flex flex-col items-center justify-center text-stone-500 hover:border-forest-500 hover:text-forest-600 transition disabled:opacity-50"
        >
          {uploading ? (
            <>
              <span className="w-5 h-5 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
              <span className="mt-2 text-xs">Subiendo...</span>
            </>
          ) : (
            <>
              <span className="text-2xl">📷</span>
              <span className="mt-2 text-xs">Click para subir</span>
              <span className="text-[10px] text-stone-400">máx {maxSizeMb}MB</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {!ready && (
        <p className="text-[11px] text-amber-700 mt-1">
          Cloudinary no está configurado.
        </p>
      )}
      {error && (
        <p className="text-[11px] text-red-700 mt-1">{error}</p>
      )}
    </div>
  );
}