import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { MessageCircle, ShoppingCart } from 'lucide-react';

interface ExitIntentPopupProps {
  open: boolean;
  onClose: () => void;
  onFinalize: () => void;
}

const ExitIntentPopup = ({ open, onClose, onFinalize }: ExitIntentPopupProps) => {
  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent className="max-w-sm rounded-2xl border-0 shadow-2xl">
        <AlertDialogHeader className="text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <ShoppingCart className="h-8 w-8 text-primary" />
          </div>
          <AlertDialogTitle className="text-lg font-extrabold">
            Espere! Seu pedido está quase pronto 🚀
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
            Finalize agora pelo WhatsApp e garanta seu atendimento rápido.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <AlertDialogAction
            onClick={onFinalize}
            className="w-full rounded-xl py-5 text-sm font-bold gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Finalizar pedido no WhatsApp
          </AlertDialogAction>
          <AlertDialogCancel
            onClick={onClose}
            className="w-full rounded-xl py-5 text-sm font-semibold mt-0"
          >
            Continuar comprando
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ExitIntentPopup;
