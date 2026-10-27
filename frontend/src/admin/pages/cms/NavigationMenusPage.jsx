import React, { useState } from 'react';
import { Compass, Plus, Trash2, Edit, ExternalLink, Save } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { triggerKapeeCelebration } from '../../components/common/Confetti';
import { confirmDelete } from '../../../store/useConfirmStore';

export const NavigationMenusPage = () => {
  const { addToast } = useAdminStore();
  const [headerLinks, setHeaderLinks] = useState([
    { id: '1', title: 'Home', path: '/' },
    { id: '2', title: 'Shop All', path: '/shop' },
    { id: '3', title: 'Combos & Packs', path: '/combos' },
    { id: '4', title: 'Contact Support', path: '/contact' },
    { id: '5', title: 'Guides', path: '/guides' },
    { id: '6', title: 'About Us', path: '/about' },
  ]);

  const [footerColumns, setFooterColumns] = useState([
    { title: 'Shop & Clean', links: ['Standard Sponges', 'Jumbo Value Packs', 'Bathroom Tile Erasers', 'Kitchen Cleaners'] },
    { title: 'Customer Care', links: ['Track Order', 'Return & Refund Policy', 'Shipping Policy', 'FAQs & Usage'] },
    { title: 'Brand Story', links: ['About KAPEE', '0% Chemical Promise', 'Contact Us', 'Terms & Conditions'] }
  ]);

  const handleSaveMenus = () => {
    triggerKapeeCelebration();
    addToast({
      type: 'success',
      title: 'Menus Saved',
      message: 'Header navigation and footer links updated across the site.'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink dark:text-stone-100">
            CMS: Navigation Menus
          </h1>
          <p className="text-xs sm:text-sm text-muted dark:text-stone-400 mt-1">
            Manage header links, mobile drawer menu structure, and footer sitemap links.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveMenus}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-deep hover:bg-emerald-800 text-white shadow-md hover:shadow-lg transition-all active:scale-95 whitespace-nowrap self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Menus</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Header Links */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-ink dark:text-stone-100">
              Main Header Menu ({headerLinks.length})
            </h3>
            <button
              onClick={() => {
                const title = prompt('Enter link title:');
                const path = prompt('Enter link path (e.g. /offers):');
                if (title && path) {
                  setHeaderLinks([...headerLinks, { id: Date.now().toString(), title, path }]);
                  addToast({ type: 'success', title: 'Link Added', message: `Added ${title} to header.` });
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-deep text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Link</span>
            </button>
          </div>

          <div className="divide-y border rounded-xl overflow-hidden text-xs">
            {headerLinks.map((link) => (
              <div key={link.id} className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-stone-800 dark:text-stone-200">{link.title}</p>
                  <p className="font-mono text-stone-400 text-[11px]">{link.path}</p>
                </div>
                <button
                  onClick={() =>
                    confirmDelete({
                      title: 'Delete Menu Link?',
                      message: `Delete the "${link.title}" link from the menu?`,
                      onConfirm: () => {
                        setHeaderLinks(headerLinks.filter((l) => l.id !== link.id));
                        addToast({ type: 'info', title: 'Link Removed', message: 'Removed navigation link.' });
                      }
                    })
                  }
                  className="text-stone-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Columns */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border p-6 space-y-4">
          <h3 className="font-serif font-bold text-base text-ink dark:text-stone-100">
            Footer Sitemap Columns
          </h3>
          <div className="space-y-4 text-xs">
            {footerColumns.map((col, idx) => (
              <div key={idx} className="p-3.5 bg-stone-50 dark:bg-stone-800/40 rounded-xl border space-y-1.5">
                <p className="font-bold text-emerald-deep dark:text-emerald-400">{col.title}</p>
                <p className="text-stone-500">{col.links.join(' • ')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
