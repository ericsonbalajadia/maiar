'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FileText, Image, File, X, Download, Trash2 } from 'lucide-react';

interface Attachment {
    id: string;
    file_name: string;
    file_path: string;
    mime_type: string | null;
    file_size: number;
    uploaded_by?: string;
}

interface Props {
    attachments: Attachment[];
    requestId: string;
    canDelete?: boolean; // true for requester (own request) or admin
    onDelete?: () => void;
}

export function AttachmentPreview({ attachments, requestId, canDelete = false, onDelete }: Props) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<string>('');
    const [deleting, setDeleting] = useState<string | null>(null);
    const supabase = createClient();

    const openPreview = async (att: Attachment) => {
        const { data } = await supabase.storage
            .from('attachments')
            .createSignedUrl(att.file_path, 60); // 60 seconds expiry
        if (data?.signedUrl) {
            setPreviewUrl(data.signedUrl);
            setPreviewType(att.mime_type ?? '');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this attachment? This action cannot be undone.')) return;
        setDeleting(id);
        const { error } = await supabase.from('attachments').delete().eq('id', id);
        if (!error) {
            onDelete?.();
        } else {
            alert('Failed to delete attachment.');
        }
        setDeleting(null);
    };

    const getFileIcon = (mime: string | null) => {
        if (mime?.startsWith('image/')) return <Image className="h-5 w-5 text-blue-500" />;
        if (mime === 'application/pdf') return <FileText className="h-5 w-5 text-red-500" />;
        return <File className="h-5 w-5 text-gray-500" />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <>
            <div className="space-y-2">
                {attachments.map((att) => (
                    <div key={att.id} className="flex items-center justify-between gap-2 border rounded-lg p-3 bg-white dark:bg-slate-900">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            {getFileIcon(att.mime_type)}
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{att.file_name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(att.file_size)}</p>
                            </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                            {(att.mime_type?.startsWith('image/') || att.mime_type === 'application/pdf') && (
                                <button
                                    onClick={() => openPreview(att)}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="Preview"
                                >
                                    <FileText className="h-4 w-4" />
                                </button>
                            )}
                            <a
                                href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/attachments/${att.file_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                title="Download"
                            >
                                <Download className="h-4 w-4" />
                            </a>
                            {canDelete && (
                                <button
                                    onClick={() => handleDelete(att.id)}
                                    disabled={deleting === att.id}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Preview Modal */}
            {previewUrl && (
                <div
                    className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                    onClick={() => setPreviewUrl(null)}
                >
                    <div
                        className="bg-white dark:bg-slate-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white dark:bg-slate-900 p-2 border-b flex justify-between items-center">
                            <span className="text-sm font-medium">Preview</span>
                            <button onClick={() => setPreviewUrl(null)} className="p-1 hover:bg-gray-100 rounded">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            {previewType.startsWith('image/') ? (
                                <img src={previewUrl} alt="Preview" className="max-w-full h-auto mx-auto" />
                            ) : previewType === 'application/pdf' ? (
                                <embed src={previewUrl} type="application/pdf" className="w-full h-[70vh]" />
                            ) : (
                                <p>Preview not available for this file type.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}