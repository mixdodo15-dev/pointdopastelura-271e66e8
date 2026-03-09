import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, PartyPopper } from 'lucide-react';
import { useEffect } from 'react';

interface OrderSuccessAnimationProps {
  show: boolean;
  onComplete: () => void;
}

const OrderSuccessAnimation = ({ show, onComplete }: OrderSuccessAnimationProps) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 2800);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-card shadow-2xl border border-border"
            initial={{ scale: 0.5, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.3 }}
            >
              <div className="relative">
                <motion.div
                  className="absolute -inset-3 rounded-full bg-primary/20"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.5, 1] }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                />
                <CheckCircle2 className="h-16 w-16 text-primary relative z-10" strokeWidth={2.5} />
              </div>
            </motion.div>

            <motion.p
              className="text-xl font-extrabold text-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              Pedido enviado!
            </motion.p>

            <motion.p
              className="text-sm text-muted-foreground text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Seu pedido foi enviado com sucesso <PartyPopper className="inline h-4 w-4" />
            </motion.p>

            {/* Confetti-like dots */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-primary"
                initial={{ opacity: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  x: Math.cos((i * Math.PI * 2) / 8) * 80,
                  y: Math.sin((i * Math.PI * 2) / 8) * 80,
                }}
                transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderSuccessAnimation;
