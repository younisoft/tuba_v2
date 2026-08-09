import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';

export interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  /** States the specific, scoped consequence — "This will remove 3 leads from
   * this campaign," never a generic "Are you sure?" — design-system/
   * 12_COMPONENT_GUIDELINES.md §4. */
  consequence: string;
  confirmLabel?: string;
  /** Overrides the Cancel button's label — needed by any caller rendering in
   * a locale other than English. Defaults to 'Cancel', unchanged from before. */
  cancelLabel?: string;
  /** Destructive actions render `role="alertdialog"` and a danger-styled
   * confirm button, matching the action's actual severity. */
  destructive?: boolean;
}

/**
 * TBOS-PAT-FEEDBACK-001 — the Confirmation Dialog pattern, composing the
 * Dialog primitive. Backs WF-DELETION/WF-ARCHIVING/WF-PUBLISHING across
 * PROP/PROJ/LEAD/CONT/MKT per tbos-blueprint/17_ACCEPTANCE_CRITERIA.md's
 * WF-DELETION scenarios (plain-language, scoped consequence, never generic).
 */
export function ConfirmationDialog({ open, onClose, onConfirm, title, consequence, confirmLabel = 'Confirm', cancelLabel = 'Cancel', destructive = false }: ConfirmationDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      variant={destructive ? 'alertdialog' : 'standard'}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-body text-text-primary">{consequence}</p>
    </Dialog>
  );
}
