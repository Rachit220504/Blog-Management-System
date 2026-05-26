import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, Upload, Trash2, ImagePlus } from 'lucide-react';
import { mediaApi } from '../services/api';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import toast from 'react-hot-toast';

const MediaLibrary = () => {
  const queryClient = useQueryClient();
  const [files, setFiles] = useState([]);

  const { data } = useQuery({
    queryKey: ['media-library'],
    queryFn: async () => (await mediaApi.list()).data,
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData) => mediaApi.uploadGallery(formData),
    onSuccess: () => {
      toast.success('Media uploaded');
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
      setFiles([]);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Upload failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (url) => mediaApi.remove(url),
    onSuccess: () => {
      toast.success('Media deleted');
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Delete failed'),
  });

  const handleUpload = () => {
    if (!files.length) return;
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    uploadMutation.mutate(formData);
  };

  const copyUrl = async (url) => {
    await navigator.clipboard.writeText(url);
    toast.success('URL copied');
  };

  const items = data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Assets"
        title="Media Library"
        description="Upload images, copy URLs, and delete unused assets. Local uploads are listed here, with Cloudinary support available through the backend configuration."
      />

      <Card className="p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-3xl border border-dashed border-white/15 bg-white/5 px-5 py-10 text-sm text-slate-300 transition hover:border-sky-500/40 hover:bg-sky-500/10">
            <ImagePlus className="h-5 w-5" />
            <span>{files.length ? `${files.length} file(s) selected` : 'Choose images'}</span>
            <input type="file" accept="image/*" multiple onChange={(event) => setFiles(Array.from(event.target.files || []))} className="hidden" />
          </label>
          <button onClick={handleUpload} disabled={!files.length || uploadMutation.isPending} className="inline-flex items-center justify-center gap-2 rounded-3xl bg-white px-5 py-4 text-sm font-semibold text-slate-950 disabled:opacity-50 lg:min-w-44">
            <Upload className="h-4 w-4" />
            {uploadMutation.isPending ? 'Uploading...' : 'Upload Selected'}
          </button>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <Card key={item.url} className="overflow-hidden">
            <img src={item.url} alt={item.filename} className="h-52 w-full object-cover" />
            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="truncate text-sm font-medium text-white">{item.filename}</p>
                  <p className="text-xs text-slate-500">{Math.round((item.size || 0) / 1024)} KB</p>
                </div>
                <Badge tone="info">Image</Badge>
              </div>
              <div className="flex gap-2">
                <button onClick={() => copyUrl(item.url)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white transition hover:bg-white/10">
                  <Copy className="h-4 w-4" />
                  Copy URL
                </button>
                <button onClick={() => deleteMutation.mutate(item.url)} className="inline-flex items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-rose-200 transition hover:bg-rose-500/20">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MediaLibrary;
