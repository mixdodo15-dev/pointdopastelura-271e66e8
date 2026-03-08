import { motion } from 'framer-motion';

interface AnimatedCardProps {
  children: React.ReactNode;
  index: number;
  className?: string;
}

const AnimatedCard = ({ children, index, className = '' }: AnimatedCardProps) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
