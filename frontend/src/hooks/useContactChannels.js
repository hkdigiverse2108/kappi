import { useAdminStore } from '../admin/store/adminStore';

// The visible WhatsApp / phone / email cards from Admin > CMS: Contact Us Page, so every
// WhatsApp button, phone and email on the website uses the numbers saved there
export const useContactChannels = () => {
  const cards = useAdminStore((state) => state.contactSection?.cards) || [];
  const find = (type) => cards.find((c) => c.type === type && c.active !== false && c.primaryText);
  return { whatsapp: find('whatsapp'), phone: find('phone'), email: find('email') };
};

// WhatsApp chat link for a number, with an optional message typed in for the customer
export const whatsappLink = (number, message = '') => {
  const digits = (number || '').replace(/\D/g, '');
  if (!digits) return '';
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
};
