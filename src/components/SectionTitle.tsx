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
    <div ref={ref} className="flex flex-col items-center mb-5">
      <span
        className={`text-3xl mb-1 transition-transform duration-500 ${
          visible ? 'animate-[pulse-icon_0.8s_ease-in-out]' : 'opacity-0'
        }`}
      >
        {icon}
      </span>
      <h2
        className={`text-2xl font-extrabold text-foreground tracking-tight transition-all duration-500 ${
          visible ? 'animate-[pulse-title_0.6s_ease-out]' : 'opacity-0 scale-95'
        }`}
      >
        {label}
      </h2>
      <div
        className={`h-1 bg-primary rounded-full mt-2 transition-all duration-700 ease-out ${
          visible ? 'w-12' : 'w-0'
        }`}
      />
    </div>
  );
};

export default SectionTitle;
