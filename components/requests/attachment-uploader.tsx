"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Upload, Lock, Info } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_TOTAL_SIZE = 20 * 1024 * 1024;

const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

interface Props {
  requestId: string;
  currentTotalSize: number;
  canUpload: boolean;
  disabledReason?: string;
}

export function AttachmentUploader({
  requestId,
  currentTotalSize,
  canUpload,
  disabledReason,
}: Props) {
  const router = useRouter();
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  // If upload is not allowed, show a disabled message
  if (!canUpload) {
    return (
      <div className="flex justify-end items-center mt-1">
        <div className="relative group">
          <Info className="h-3.5 w-3.5 text-gray-300 hover:text-gray-400 transition-colors cursor-help" />
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block z-10">
            <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
              Attachments can only be uploaded while the request is pending.
              <div className="absolute top-full right-2 w-2 h-2 bg-gray-800 rotate-45 translate-y-[-4px]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // ... rest of the function unchanged
    // (keep the same code as you have, but ensure it's inside the conditional)
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700 transition-colors">
          <Upload className="h-4 w-4" />
          Upload Attachment
          <input
            type="file"
            accept={ALLOWED_MIME.join(",")}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
        {uploading && progress !== null && (
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{progress}% uploaded</p>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Upload successful!</p>}
      <p className="text-xs text-gray-400">
        Max 5 MB per file. Allowed: JPEG, PNG, GIF, PDF, DOC, DOCX, TXT. Total
        attachments per request: 20 MB.
      </p>
    </div>
  );
}
