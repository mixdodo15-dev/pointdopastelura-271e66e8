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
      className={`rounded-[20px] py-5 px-6 mb-5 text-center shadow-md transition-all duration-500 ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{
        background: 'linear-gradient(135deg, hsl(0,100%,27%), hsl(0,100%,38%))',
      }}
    >
      <span className="text-3xl mb-1 block">{icon}</span>
      <h2
        className="text-xl font-black text-white uppercase tracking-[0.15em]"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {label}
      </h2>
    </div>
  );
};

export default SectionTitle;
