import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Compass, Feather } from 'lucide-react';

export const AboutUs: React.FC = () => {
  return (
    <div className="animate-fadeIn font-sans text-charcoal space-y-16 pb-20">
      
      {/* ─── HERO SECTION ─── */}
      <section className="relative bg-[#171511] text-warm-white py-24 md:py-32 px-6 md:px-12 border-b border-brass/20 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#171511] via-[#171511]/80 to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1600&q=85"
          alt="Kuduchee Stoneware Studio Craft"
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.6] contrast-[1.05] z-0"
        />

        <div className="relative z-20 max-w-screen-xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-brass/20 border border-brass/40 px-4 py-1.5 rounded-full text-brass text-[11px] font-bold uppercase tracking-widest backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kuduchee Brand Ideology</span>
          </div>

          <h1 className="font-brand text-4xl md:text-6xl text-warm-white max-w-4xl leading-tight">
            Designing Experiences Around Every Meal.
          </h1>

          <p className="text-base md:text-lg font-light text-warm-white/85 max-w-2xl leading-relaxed">
            While food nourishes the body, the experience surrounding it nourishes the soul. Kuduchee creates thoughtful homeware that transforms everyday eating into lasting memories.
          </p>

          <div className="pt-2 flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-widest text-brass px-4 py-2 bg-warm-white/10 rounded-xl border border-warm-white/15">
              "Serve What You Deserve."
            </span>
          </div>
        </div>
      </section>

      {/* ─── WHO WE ARE & THE BIG IDEA ─── */}
      <section className="max-w-screen-xl mx-auto px-6 md:px-12 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <span className="text-label block">Who We Are &amp; The Big Idea</span>
          <h2 className="font-brand text-3xl md:text-5xl text-charcoal leading-tight">
            "You Become What You Experience."
          </h2>

          <div className="space-y-4 text-xs md:text-sm text-mid-gray font-light leading-relaxed">
            <p>
              Kuduchee is not just a tableware brand. We are a design philosophy built around one simple belief: every meal is more than consumption — it is a ritual of connection, celebration, healing, gratitude, and belonging.
            </p>
            <p>
              A meal is never remembered by ingredients alone. It is remembered because of the people around the table, the stories shared, the warmth of the cup held in your hands, and the emotions attached to that moment.
            </p>
            <p>
              Food feeds the body, but experiences feed the heart. Kuduchee exists to enrich everyday living by designing products that transform eating into an experience, allowing every meal to become a memory worth keeping.
            </p>
          </div>
        </div>

        <div className="lg:col-span-6 bg-porcelain/60 border border-warm-gray/50 rounded-3xl p-8 md:p-10 space-y-6 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brass block">Brand Purpose &amp; Vision</span>
          
          <div className="space-y-4">
            <div className="border-l-2 border-brass pl-4 space-y-1">
              <h4 className="font-brand text-lg text-charcoal">Our Purpose</h4>
              <p className="text-xs text-mid-gray font-light leading-relaxed">
                To enrich everyday living by designing products that transform eating into an experience.
              </p>
            </div>

            <div className="border-l-2 border-brass pl-4 space-y-1">
              <h4 className="font-brand text-lg text-charcoal">Our Vision</h4>
              <p className="text-xs text-mid-gray font-light leading-relaxed">
                To become India's most loved lifestyle homeware brand that redefines how people experience food across the world.
              </p>
            </div>

            <div className="border-l-2 border-brass pl-4 space-y-1">
              <h4 className="font-brand text-lg text-charcoal">Our Mission</h4>
              <p className="text-xs text-mid-gray font-light leading-relaxed">
                To create timeless home and kitchen products combining thoughtful functionality, natural materials, meaningful storytelling, and contemporary Indian design.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── THE STORY BEHIND KUDUCHEE (DEER + SQUIRREL) ─── */}
      <section className="bg-porcelain/40 border-y border-warm-gray/40 py-20 px-6 md:px-12">
        <div className="max-w-screen-xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="bg-warm-white border border-warm-gray/60 rounded-3xl p-6 text-center space-y-3 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-brass/15 text-brass flex items-center justify-center mx-auto">
                <Feather className="w-7 h-7" />
              </div>
              <h3 className="font-brand text-xl text-charcoal">The Graceful Deer</h3>
              <p className="text-xs text-mid-gray font-light leading-relaxed">
                Represents elegance, calmness, sensitivity, and effortless beauty.
              </p>
            </div>

            <div className="bg-warm-white border border-warm-gray/60 rounded-3xl p-6 text-center space-y-3 shadow-sm mt-6">
              <div className="w-14 h-14 rounded-full bg-brass/15 text-brass flex items-center justify-center mx-auto">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="font-brand text-xl text-charcoal">The Curious Squirrel</h3>
              <p className="text-xs text-mid-gray font-light leading-relaxed">
                Represents curiosity, intelligence, playfulness, and attention to detail.
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-5">
            <span className="text-label block">Name &amp; Origin Story</span>
            <h2 className="font-brand text-3xl md:text-4xl text-charcoal">The Harmony of Grace &amp; Curiosity</h2>
            <p className="text-xs md:text-sm text-mid-gray font-light leading-relaxed">
              The name <strong>Kuduchee</strong> is inspired by two remarkable creatures found in nature. The deer embodies elegance and calm, while the squirrel represents curiosity and painstaking attention to detail.
            </p>
            <p className="text-xs md:text-sm text-mid-gray font-light leading-relaxed">
              Together, they define Kuduchee — a brand that balances refinement with warmth, sophistication with simplicity, and beauty with functionality.
            </p>
          </div>
        </div>
      </section>

      {/* ─── BRAND DNA (6 PILLARS) ─── */}
      <section className="max-w-screen-xl mx-auto px-6 md:px-12 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-label block">Our Core Pillars</span>
          <h2 className="font-brand text-3xl md:text-5xl text-charcoal">The Kuduchee DNA</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-warm-white p-7 rounded-3xl border border-warm-gray/60 space-y-3 shadow-xs">
            <h3 className="font-brand text-xl text-brass">Thoughtful</h3>
            <p className="text-xs text-mid-gray font-light leading-relaxed">
              Every product begins with human behavior before aesthetics. Design influences emotion and completes the ritual of eating.
            </p>
          </div>

          <div className="bg-warm-white p-7 rounded-3xl border border-warm-gray/60 space-y-3 shadow-xs">
            <h3 className="font-brand text-xl text-brass">Rooted</h3>
            <p className="text-xs text-mid-gray font-light leading-relaxed">
              Every collection draws inspiration from India's diverse culture, regional crafts, serving rituals, and natural landscapes.
            </p>
          </div>

          <div className="bg-warm-white p-7 rounded-3xl border border-warm-gray/60 space-y-3 shadow-xs">
            <h3 className="font-brand text-xl text-brass">Contemporary</h3>
            <p className="text-xs text-mid-gray font-light leading-relaxed">
              Tradition is always reinterpreted for modern lifestyles, clean organic silhouettes, and modern homes.
            </p>
          </div>

          <div className="bg-warm-white p-7 rounded-3xl border border-warm-gray/60 space-y-3 shadow-xs">
            <h3 className="font-brand text-xl text-brass">Honest</h3>
            <p className="text-xs text-mid-gray font-light leading-relaxed">
              Natural materials, 1280°C kiln-fired stoneware, lead-free non-toxic glazes, and honest craftsmanship define every piece.
            </p>
          </div>

          <div className="bg-warm-white p-7 rounded-3xl border border-warm-gray/60 space-y-3 shadow-xs">
            <h3 className="font-brand text-xl text-brass">Curious</h3>
            <p className="text-xs text-mid-gray font-light leading-relaxed">
              Every new collection explores new stories, forms, and sensory experiences around the home and table.
            </p>
          </div>

          <div className="bg-warm-white p-7 rounded-3xl border border-warm-gray/60 space-y-3 shadow-xs">
            <h3 className="font-brand text-xl text-brass">Warm</h3>
            <p className="text-xs text-mid-gray font-light leading-relaxed">
              Every design is created to bring people closer together, making every gathering feel warmer and every home more alive.
            </p>
          </div>
        </div>
      </section>

      {/* ─── COLLECTION STORIES & STRATEGY ─── */}
      <section className="bg-[#1C1A17] text-warm-white py-20 px-6 md:px-12">
        <div className="max-w-screen-xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brass block">Story-Driven Collections</span>
            <h2 className="font-brand text-3xl md:text-5xl text-warm-white">Launching Stories, Not Products</h2>
            <p className="text-xs text-warm-white/70 font-light">
              Rather than releasing standard items, Kuduchee launches chapters inspired by food, seasons, rituals, and emotions.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-6 bg-warm-white/5 border border-warm-white/10 rounded-2xl space-y-2">
              <span className="text-brass font-brand text-lg block">Morning Ritual</span>
              <p className="text-xs text-warm-white/70 font-light">Ceremony mugs &amp; breakfast bowls designed for quiet morning moments.</p>
            </div>

            <div className="p-6 bg-warm-white/5 border border-warm-white/10 rounded-2xl space-y-2">
              <span className="text-brass font-brand text-lg block">Monsoon Chai</span>
              <p className="text-xs text-warm-white/70 font-light">Textured tactile cups that hold heat and comfort during rain outside.</p>
            </div>

            <div className="p-6 bg-warm-white/5 border border-warm-white/10 rounded-2xl space-y-2">
              <span className="text-brass font-brand text-lg block">Sunday Gatherings</span>
              <p className="text-xs text-warm-white/70 font-light">Generous serving platters and communal bowls built for family lunches.</p>
            </div>

            <div className="p-6 bg-warm-white/5 border border-warm-white/10 rounded-2xl space-y-2">
              <span className="text-brass font-brand text-lg block">The Everyday Feast</span>
              <p className="text-xs text-warm-white/70 font-light">Durable stoneware tableware bringing celebration to weekday dinners.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BRAND MANIFESTO & CTA ─── */}
      <section className="max-w-screen-xl mx-auto px-6 md:px-12 text-center space-y-8 py-10">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="text-label block">Brand Manifesto &amp; Promise</span>
          <h2 className="font-brand text-3xl md:text-5xl text-charcoal">
            "We cannot change the food you eat. We can change the way you experience it."
          </h2>
          <p className="text-xs md:text-sm text-mid-gray font-light leading-relaxed">
            Beautiful living is not reserved for special occasions. It begins with every meal, every gathering, and every moment shared around the table.
          </p>
        </div>

        <div className="pt-4">
          <Link to="/shop" className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-xs font-bold uppercase tracking-wider">
            <span>Explore Studio Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
};

export default AboutUs;
