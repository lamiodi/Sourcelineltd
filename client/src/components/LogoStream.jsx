import { ShieldCheck, Medal as Award, Ruler, MapTrifold as Map, Briefcase, Globe, FileText as FileCheck, Clock, Compass } from '@phosphor-icons/react';

const partners = [
    { name: 'SURCON Registered', icon: Award },
    { name: 'Unmatched Accuracy', icon: ShieldCheck },
    { name: 'CAC Certified', icon: FileCheck },
    { name: 'Official SURCON Beacons', icon: Ruler },
    { name: 'Corporate Consult', icon: Briefcase },
    { name: 'Interstate Operations', icon: Globe },
];

export default function LogoStream() {
    // Duplicate exactly once for 50% translation seamless loop
    const marqueeItems = [...partners, ...partners];

    return (
        <section className="w-full bg-white py-12 md:py-16 overflow-hidden relative">
            {/* Section Label */}
            <div className="text-center mb-8">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Why Sourceline
                </span>
            </div>

            <div className="relative flex group/marquee">
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

                <div className="flex w-max animate-marquee group-hover/marquee:[animation-play-state:paused] items-center py-4">
                    {marqueeItems.map((partner, index) => {
                        const Icon = partner.icon;
                        return (
                            <div
                                key={index}
                                className="flex items-center gap-4 px-10 mx-6 py-4 rounded-2xl bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-10px_rgba(255,104,6,0.2)] hover:border-primary/20 transition-all duration-500 group cursor-default shrink-0 transform hover:-translate-y-1"
                            >
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-500">
                                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors duration-300" />
                                </div>
                                <span className="font-display font-bold text-lg tracking-tight text-secondary/70 group-hover:text-secondary transition-colors duration-300">
                                    {partner.name}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
