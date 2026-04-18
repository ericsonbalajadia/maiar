'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20 MB

const ALLOWED_MIME = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
];

interface Props {
    requestId: string;
    currentTotalSize: number; // sum of existing attachments file_size
    onUploaded?: () => void;
}

export function AttachmentUploader({ requestId, currentTotalSize, onUploaded }: Props) {
    const [progress, setProgress] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setSuccess(false);
        setProgress(0);
        setUploading(true);

        // Validate file type
        if (!ALLOWED_MIME.includes(file.type)) {
            setError(`File type not allowed. Allowed: ${ALLOWED_MIME.join(', ')}`);
            setUploading(false);
            return;
        }

        // Validate per-file size
        if (file.size > MAX_FILE_SIZE) {
            setError(`File exceeds 5 MB limit. Your file: ${(file.size / (1024 * 1024)).toFixed(2)} MB`);
            setUploading(false);
            return;
        }

        // Validate total size (current + new)
        if (currentTotalSize + file.size > MAX_TOTAL_SIZE) {
            setError(`Total attachments would exceed 20 MB limit. Current total: ${(currentTotalSize / (1024 * 1024)).toFixed(2)} MB`);
            setUploading(false);
            return;
        }

        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            setError('Not authenticated');
            setUploading(false);
            return;
        }

        // Get internal user id (uploaded_by)
        const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('auth_id', session.user.id)
            .single();
        if (!userData) {
            setError('User profile not found');
            setUploading(false);
            return;
        }

        const path = `requests/${requestId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

        // Use XMLHttpRequest for progress
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) {
                setProgress(Math.round((ev.loaded / ev.total) * 100));
            }
        };
        xhr.onload = async () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                // Insert attachment record
                const { error: insertError } = await supabase.from('attachments').insert({
                    request_id: requestId,
                    file_name: file.name,
                    file_path: path,
                    file_size: file.size,
                    mime_type: file.type,
                    attachment_type: 'request',
                    uploaded_by: userData.id,
                });
                if (insertError) {
                    console.error('Insert error:', insertError);
                    setError('Failed to save attachment record.');
                } else {
                    setProgress(null);
                    setSuccess(true);
                    onUploaded?.();
                }
            } else {
                setError('Upload failed. Please try again.');
            }
            setUploading(false);
        };
        xhr.onerror = () => {
            setError('Network error. Upload failed.');
            setUploading(false);
        };

        xhr.open('POST', `${supabaseUrl}/storage/v1/object/attachments/${path}`);
        xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
        const formData = new FormData();
        formData.append('file', file);
        xhr.send(formData);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700 transition-colors">
                    <Upload className="h-4 w-4" />
                    Upload Attachment
                    <input
                        type="file"
                        accept={ALLOWED_MIME.join(',')}
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
                Max 5 MB per file. Allowed: JPEG, PNG, GIF, PDF, DOC, DOCX, TXT.
                Total attachments per request: 20 MB.
            </p>
        </div>
    );
}