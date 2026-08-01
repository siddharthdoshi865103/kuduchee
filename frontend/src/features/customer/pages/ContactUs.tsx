import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { MapPin, Phone, Mail, Clock, Send, Sparkles } from 'lucide-react';
import { SEO } from '../../../components/SEO';

export const ContactUs: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      toast.success('Thank you! Your message has been sent to Kuduchee Studio.');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setSubmitting(false);
    }, 600);
  };

  return (
    <div className="animate-fadeIn font-sans text-charcoal space-y-12 py-8 md:py-12 px-4 md:px-12 max-w-screen-xl mx-auto">
      <SEO
        title="Contact Kuduchee Studio (Kudu Chee) — Customer Support & Inquiry"
        description="Contact Kuduchee (Kudu Chee) Studio by Anil Panda & Kaviz Creations Private Limited. Studio Phone: +91 9971118219, Email: anil.panda@kuduchee.com, Ashram Road, Ahmedabad."
        canonicalUrl="https://kuduchee.in/contact"
      />
      
      {/* ─── PAGE HEADER ─── */}
      <div className="border-b border-warm-gray/40 pb-6">
        <span className="text-label block mb-1">Get In Touch</span>
        <h1 className="font-brand text-3xl md:text-5xl text-charcoal">Contact Kuduchee Studio</h1>
        <p className="text-xs md:text-sm text-mid-gray font-light mt-1">
          Have questions about our studio ceramics, bulk orders, or shipping? We're here to assist you.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Contact Cards & Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-warm-white border border-warm-gray/60 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-warm-gray/30">
              <div className="w-10 h-10 rounded-full bg-brass/15 text-brass flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5 text-brass" />
              </div>
              <div>
                <h3 className="font-brand text-lg text-charcoal">Kuduchee Studio</h3>
                <span className="text-[11px] text-mid-gray block">Kaviz Creations Pvt Ltd</span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4.5 h-4.5 text-brass shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-charcoal block">Corporate Office &amp; Studio Location</span>
                  <span className="text-mid-gray leading-relaxed font-light block">
                    510 A, Sun West Bank, Ashram Road, Ahmedabad, Gujarat 380009, India
                  </span>
                  <span className="inline-block text-[10px] font-mono font-bold text-brass bg-brass/10 border border-brass/20 px-2 py-0.5 rounded mt-1.5">
                    GSTIN: 24AAICK1328G1ZT
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Phone className="w-4.5 h-4.5 text-brass shrink-0" />
                <div>
                  <span className="font-bold text-charcoal block">Phone / WhatsApp</span>
                  <a href="tel:9971118219" className="text-mid-gray hover:text-brass transition-colors font-mono">
                    +91 9971118219
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Mail className="w-4.5 h-4.5 text-brass shrink-0" />
                <div>
                  <span className="font-bold text-charcoal block">Official Email Address</span>
                  <a href="mailto:anil.panda@kuduchee.com" className="text-mid-gray hover:text-brass transition-colors font-mono">
                    anil.panda@kuduchee.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Clock className="w-4.5 h-4.5 text-brass shrink-0" />
                <div>
                  <span className="font-bold text-charcoal block">Studio Hours</span>
                  <span className="text-mid-gray font-light">Monday – Saturday: 10:00 AM – 7:00 PM IST</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick WhatsApp Banner */}
          <a
            href="https://wa.me/919971118219?text=Hello%20Kuduchee%20Studio!%20I%20have%20an%20inquiry."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl p-5 flex items-center justify-between gap-4 text-charcoal hover:bg-[#25D366]/20 transition-all shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <i className="fa-brands fa-whatsapp text-2xl text-[#25D366]" />
              <div>
                <span className="text-xs font-bold block">Instant WhatsApp Support</span>
                <span className="text-[11px] text-mid-gray">Chat directly with our studio representative</span>
              </div>
            </div>
            <span className="text-xs font-bold text-[#25D366] group-hover:translate-x-1 transition-transform">
              Chat →
            </span>
          </a>
        </div>

        {/* Right Column: Message Form */}
        <div className="lg:col-span-7 bg-warm-white border border-warm-gray/60 rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
          <div>
            <h3 className="font-brand text-xl text-charcoal mb-1">Send Us a Message</h3>
            <p className="text-xs text-mid-gray font-light">Fill out the form below and we will get back to you within 24 hours.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Full Name *</label>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="input-label">Email Address *</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label">Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="input-label">Message *</label>
              <textarea
                rows={4}
                placeholder="How can we help you today?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-field resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full flex items-center justify-center gap-2 shadow-md disabled:opacity-50 py-3.5"
            >
              {submitting ? (
                <span>Sending…</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Inquiry</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>

      {/* ─── GOOGLE MAPS EMBED OF SUN WEST BANK ASHRAM ROAD AHMEDABAD ─── */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-warm-gray/40 pb-3">
          <div>
            <span className="text-label block">Location &amp; Visit</span>
            <h2 className="font-brand text-2xl text-charcoal">Find Us at Sun West Bank, Ashram Road</h2>
          </div>
          <a
            href="https://maps.google.com/?q=Sun+Westbank+Ashram+Road+Ahmedabad"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-brass uppercase tracking-wider hover:underline"
          >
            Open in Google Maps ↗
          </a>
        </div>

        <div className="w-full h-80 md:h-96 rounded-2xl overflow-hidden border border-warm-gray/60 shadow-md bg-porcelain">
          <iframe
            title="Sun West Bank Ashram Road Ahmedabad Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.4925893245455!2d72.56942087592497!3d23.042371979159937!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84897f1f9d3b%3A0xbca88d8b9d03cb47!2sSun%20Westbank!5e0!3m2!1sen!2sin!4v1711000000000!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

    </div>
  );
};

export default ContactUs;
