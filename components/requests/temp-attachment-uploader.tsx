'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

interface Props {
  onUpload: (fileData: {
    tempPath: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }) => void;
}

export function TempAttachmentUploader({ onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    if (!ALLOWED_MIME.includes(file.type)) {
      setError('File type not allowed.');
      setUploading(false);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File exceeds 5 MB limit.');
      setUploading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Not authenticated');
      setUploading(false);
      return;
    }

    const path = `temp/${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${supabaseUrl}/storage/v1/object/attachments/${path}`);
    xhr.setRequestHeader('Authorization', `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`);
    const formData = new FormData();
    formData.append('file', file);
    xhr.send(formData);

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onUpload({
          tempPath: path,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        });
        setUploading(false);
      } else {
        setError('Upload failed');
        setUploading(false);
      }
    };
    xhr.onerror = () => {
      setError('Network error');
      setUploading(false);
    };
  };

  return (
    <div className="space-y-2">
      <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700">
        <Upload className="h-4 w-4" />
        Upload Attachment
        <input type="file" accept={ALLOWED_MIME.join(',')} onChange={handleFileChange} disabled={uploading} className="hidden" />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}