"use client";

import { useEffect, useMemo, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_TOTAL_SIZE = 20 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/gif", "image/webp"];

type PreviewPhoto = {
  file: File;
  url: string;
};

interface RequestPhotoPickerProps {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}

interface SelectedPhotoGridProps {
  files: File[];
  removable?: boolean;
  disabled?: boolean;
  onRemove?: (index: number) => void;
}

function formatSize(size: number) {
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.-]/g, "_");
}

export async function uploadRequestPhotos(requestId: string, files: File[]) {
  if (files.length === 0) return;

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("You must be signed in to upload photos.");

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", session.user.id)
    .single();

  if (userError || !userData) throw new Error("User profile not found.");

  for (const [index, file] of files.entries()) {
    const path = `requests/${requestId}/${Date.now()}_${index}_${safeFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from("attachments")
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);

    const { error: insertError } = await supabase.from("attachments").insert({
      request_id: requestId,
      file_name: file.name,
      file_path: path,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: userData.id,
    });

    if (insertError) {
      await supabase.storage.from("attachments").remove([path]);
      throw new Error(`Failed to save ${file.name}: ${insertError.message}`);
    }
  }
}

export function SelectedPhotoGrid({ files, removable, disabled, onRemove }: SelectedPhotoGridProps) {
  const previews = useMemo<PreviewPhoto[]>(() => {
    return files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [files]);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  if (previews.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {previews.map(({ file, url }, index) => (
        <div
          key={`${file.name}-${file.lastModified}-${index}`}
          className="group relative overflow-hidden rounded-lg border border-[#ADEBB3]/70 bg-white/60 dark:border-white/10 dark:bg-white/[0.04]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={file.name}
            className="h-24 w-full object-cover"
          />
          {removable && onRemove && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              disabled={disabled}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/65 text-white opacity-90 transition-opacity hover:opacity-100 disabled:cursor-not-allowed"
              aria-label={`Remove ${file.name}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <div className="px-2 py-1.5">
            <p className="truncate text-xs font-medium text-slate-700 dark:text-white/75">{file.name}</p>
            <p className="text-[11px] text-slate-400 dark:text-white/45">{formatSize(file.size)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RequestPhotoPicker({ files, onChange, disabled }: RequestPhotoPickerProps) {
  const [error, setError] = useState<string | null>(null);

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    setError(null);

    if (selected.length === 0) return;

    const invalidType = selected.find((file) => !ALLOWED_MIME.includes(file.type));
    if (invalidType) {
      setError("Only image files are allowed: JPEG, PNG, GIF, or WebP.");
      return;
    }

    const oversized = selected.find((file) => file.size > MAX_FILE_SIZE);
    if (oversized) {
      setError(`${oversized.name} exceeds the 5 MB per-photo limit.`);
      return;
    }

    const nextFiles = [...files, ...selected];
    const nextTotalSize = nextFiles.reduce((sum, file) => sum + file.size, 0);
    if (nextTotalSize > MAX_TOTAL_SIZE) {
      setError(`Photos exceed the 20 MB total limit. Current total: ${formatSize(totalSize)}.`);
      return;
    }

    onChange(nextFiles);
  };

  const removeFile = (index: number) => {
    setError(null);
    onChange(files.filter((_, fileIndex) => fileIndex !== index));
  };

  return (
    <div className="space-y-3">
      <label
        className={cn(
          "flex min-h-[96px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#8dc192] bg-white/45 px-4 py-5 text-center transition-colors hover:bg-[#ADEBB3]/20 dark:border-white/15 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        <ImagePlus className="mb-2 h-5 w-5 text-[#527255] dark:text-emerald-300" />
        <span className="text-sm font-semibold text-slate-700 dark:text-white/80">Attach photos</span>
        <span className="mt-1 text-xs text-slate-400 dark:text-white/45">
          JPEG, PNG, GIF, or WebP. 5 MB each, 20 MB total.
        </span>
        <input
          type="file"
          accept={ALLOWED_MIME.join(",")}
          multiple
          disabled={disabled}
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      <SelectedPhotoGrid files={files} removable disabled={disabled} onRemove={removeFile} />

      {error && (
        <p className="text-xs text-rose-500 flex items-center gap-1">
          <span className="inline-block h-1 w-1 rounded-full bg-rose-500" />
          {error}
        </p>
      )}
    </div>
  );
}
