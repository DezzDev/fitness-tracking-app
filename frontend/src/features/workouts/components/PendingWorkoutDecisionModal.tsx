import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PendingWorkoutDecisionModalProps {
  open: boolean;
  modalTitle?: string;
  title: string;
  description?: string;
  cancelLabel?: string;
  onOpenChange?: (open: boolean) => void;
  onContinue: () => void;
  onCancel: () => void;
  preventClose?: boolean;
}

export default function PendingWorkoutDecisionModal({
  open,
  modalTitle = 'ENTRENAMIENTO EN PROGRESO',
  title,
  description,
  cancelLabel = 'DESCARTAR E INICIAR NUEVO',
  onOpenChange,
  onContinue,
  onCancel,
  preventClose = false,
}: PendingWorkoutDecisionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={!preventClose}
        onPointerDownOutside={(event) => {
          if (preventClose) {
            event.preventDefault();
          }
        }}
        onEscapeKeyDown={(event) => {
          if (preventClose) {
            event.preventDefault();
          }
        }}
        className="rounded-none border-border"
      >
        <DialogHeader>
          <DialogTitle className="font-bebas text-2xl tracking-[2px] text-foreground">
            {modalTitle}
          </DialogTitle>
          <DialogDescription className="font-barlow text-sm text-muted-foreground">
            {description ?? (
              <>
                Tienes un entrenamiento en progreso de{' '}
                <strong className="text-foreground">{title}</strong>. ¿Qué deseas hacer?
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-3 sm:flex-col sm:justify-start">
          <Button
            onClick={onContinue}
            className="w-full bg-primary border-none text-black font-bebas text-[18px] tracking-[3px] py-6 rounded-none hover:bg-primary/90"
          >
            CONTINUAR ENTRENAMIENTO
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full bg-transparent border border-border text-muted-foreground font-barlow text-[13px] tracking-[3px] py-6 rounded-none hover:bg-muted/20"
          >
            {cancelLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
