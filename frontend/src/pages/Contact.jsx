import React, { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { WhatsAppIcon } from '../components/common/WhatsAppIcon';
import { Select } from '../components/common/Select';
import { useAdminStore } from '../admin/store/adminStore';
import { createEnquiry } from '../api/contactApi';

const CHANNEL_ICONS = { phone: Phone, email: Mail, address: MapPin };

export const Contact = () => {
  // All page content comes from Admin > CMS: Contact Us Page
  const contactSection = useAdminStore((state) => state.contactSection);

  useEffect(() => {
    useAdminStore.getState().loadContactContent();
  }, []);

  const cards = (contactSection?.cards || []).filter((c) => c.active !== false);
  const whatsappCards = cards.filter((c) => c.type === 'whatsapp');
  const detailCards = cards.filter((c) => c.type !== 'whatsapp');
  const subjectOptions = contactSection?.subjectOptions || [];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createEnquiry({
        name: name.trim(),
        // Email is optional; an empty one is left out so the backend does not try to validate it
        email: email.trim() || undefined,
        phone: phone.trim(),
        subject: subject || subjectOptions[0] || '',
        message: message.trim()
      });
    } catch (err) {
      window.alert(`Could not send your message: ${err.message}`);
      return;
    }
    setSubmitted(true);
    setName('');
    setEmail('');
    setPhone('');
    setSubject('');
    setMessage('');
  };

  if (!contactSection) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald">
          {contactSection.badge}
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-ink">
          {contactSection.heading}
        </h1>
        <p className="text-xs sm:text-sm text-muted">
          {contactSection.subheading}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Contact Cards */}
        <div className="lg:col-span-5 space-y-4">
          {/* WhatsApp Card */}
          {whatsappCards.map((card) => (
            <div key={card.id} className="bg-white rounded-3xl p-6 border border-emerald-soft shadow-soft space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center">
                <WhatsAppIcon className="w-6 h-6 text-[#25D366]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-ink">{card.title}</h3>
              <p className="text-xs text-muted leading-relaxed">
                {card.subtext}
              </p>
              <a
                href={card.actionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#25D366] hover:underline pt-1"
              >
                {card.actionText}{card.primaryText ? ` (${card.primaryText})` : ''} →
              </a>
            </div>
          ))}

          {/* Phone & Email Card */}
          {detailCards.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-emerald-soft shadow-soft space-y-4 text-xs">
              {detailCards.map((card, idx) => {
                const ChannelIcon = CHANNEL_ICONS[card.type] || MapPin;
                return (
                  <div
                    key={card.id}
                    className={`flex items-start gap-3${idx > 0 ? ' pt-3 border-t border-emerald-soft' : ''}`}
                  >
                    <ChannelIcon className="w-5 h-5 text-emerald shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-ink">{card.title}</p>
                      <p className={`text-muted${card.type === 'address' ? ' leading-relaxed' : ''}`}>
                        {card.actionUrl ? <a href={card.actionUrl}>{card.primaryText}</a> : card.primaryText}
                      </p>
                      {card.subtext && <p className="text-[10px] text-muted">{card.subtext}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Inquiry Form */}
        {contactSection.showInquiryForm !== false && (
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-emerald-soft shadow-soft space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-ink">{contactSection.formTitle}</h2>
            <p className="text-xs text-muted mt-1">
              {contactSection.formSubtitle}
            </p>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-soft text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-success mx-auto" />
              <h3 className="font-serif text-lg font-bold text-emerald-deep">{contactSection.successTitle}</h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                {contactSection.successMessage}
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="btn-primary text-xs mx-auto px-5 py-2 mt-2"
              >
                {contactSection.successButtonText}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-ink mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-soft focus:border-emerald outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-soft focus:border-emerald outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-ink mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-soft focus:border-emerald outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink mb-1">Subject</label>
                  <Select
                    value={subject || subjectOptions[0] || ''}
                    onChange={setSubject}
                    options={subjectOptions.map((opt) => ({ value: opt, label: opt }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-soft focus:border-emerald outline-none bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Your Message</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we assist you today? Please share order ID if applicable..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-soft focus:border-emerald outline-none"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full text-xs sm:text-sm font-bold py-3.5 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Send Message
              </button>
            </form>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default Contact;
