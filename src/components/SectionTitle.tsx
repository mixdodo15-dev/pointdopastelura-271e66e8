import { useRef, useState, useEffect } from 'react';

interface SectionTitleProps {
  icon: string;
  label: string;
}

const SectionTitle = ({ icon, label }: SectionTitleProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`rounded-2xl py-3 px-4 mb-4 flex items-center justify-center gap-2 transition-all duration-500 ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{
        background: 'linear-gradient(135deg, hsl(0,100%,27%), hsl(0,100%,38%))',
        boxShadow: '0 6px 20px -4px hsla(0, 100%, 30%, 0.55)',
      }}
    >
      <span className="text-lg">{icon}</span>
      <h2
        className="text-sm font-bold text-white uppercase tracking-[0.12em]"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {label}
      </h2>
    </div>
  );
};

export default SectionTitle;
