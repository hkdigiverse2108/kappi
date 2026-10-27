import React, { useState } from 'react';
import { Image as ImageIcon, UploadCloud, Copy, Trash2, Search, Check, Folder, Save } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { triggerKapeeCelebration } from '../../components/common/Confetti';
import { confirmDelete } from '../../../store/useConfirmStore';

export const MediaLibraryPage = () => {
  const { mediaLibrary, addMedia, deleteMedia, addToast } = useAdminStore();
  const [activeFolder, setActiveFolder] = useState('All');
  const [search, setSearch] = useState('');

  const folders = ['All', 'Products', 'Banners', 'Before/After'];

  const filteredMedia = mediaLibrary.filter((m) => {
    const matchesFolder = activeFolder === 'All' || m.folder === activeFolder;
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const handleSimulateUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      addMedia({
        name: file.name,
        url: '/products/magic_eraser.jpg',
        size: `${Math.round(file.size / 1024)} KB`,
        folder: activeFolder === 'All' ? 'Products' : activeFolder,
        type: file.type
      });
      addToast({ type: 'success', title: 'Asset Uploaded', message: `Added ${file.name} to media vault.` });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink dark:text-stone-100">
            CMS: Media Library
          </h1>
          <p className="text-xs sm:text-sm text-muted dark:text-stone-400 mt-1">
            Storefront product photography assets, campaign banners, and lifestyle clean imagery.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              triggerKapeeCelebration();
              addToast({
                type: 'success',
                title: 'Media Vault Saved',
                message: 'All media assets and folder classifications saved successfully.'
              });
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-deep hover:bg-emerald-800 text-white shadow-md hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
          >
            <Save className="w-4 h-4" />
            <span>Save Media</span>
          </button>

          <label className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 transition-all cursor-pointer active:scale-95">
            <UploadCloud className="w-4 h-4" />
            <span>Upload Asset</span>
            <input type="file" onChange={handleSimulateUpload} className="hidden" accept="image/*" />
          </label>
        </div>
      </div>

      {/* Filter and Folders */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-4 rounded-2xl border shadow-2xs">
        <div className="flex items-center gap-2">
          {folders.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFolder(f)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeFolder === f ? 'bg-emerald-deep text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>{f}</span>
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search filenames..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredMedia.map((m) => (
          <div
            key={m.id}
            className="group bg-white dark:bg-stone-900 rounded-2xl border overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="h-36 bg-stone-100 dark:bg-stone-800 relative overflow-hidden flex items-center justify-center p-2">
              <img src={m.url} alt="" className="max-h-full max-w-full object-contain" />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(m.url);
                  addToast({ type: 'info', title: 'URL Copied', message: `Copied path for ${m.name}.` });
                }}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-stone-700 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white"
                title="Copy relative URL"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3 border-t flex items-center justify-between text-[11px]">
              <div className="truncate pr-2">
                <p className="font-semibold text-stone-800 dark:text-stone-200 truncate">{m.name}</p>
                <p className="text-stone-400 text-[10px]">{m.size}</p>
              </div>
              <button
                onClick={() =>
                  confirmDelete({
                    title: 'Delete File?',
                    message: `Delete ${m.name} from the media library?`,
                    onConfirm: () => {
                      deleteMedia(m.id);
                      addToast({ type: 'info', title: 'Asset Deleted', message: `Removed ${m.name}.` });
                    }
                  })
                }
                className="text-stone-400 hover:text-rose-600 p-1 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
