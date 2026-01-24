import { Dialog, Button, Portal, CloseButton } from "@chakra-ui/react"
import { fireToast } from "../../hooks/useFireToast";

type DialogModalProps = {
  list?: { id: string; isFavorite: boolean };
  title: string;
  body: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  onAccept: (id?: string, isFavorite?: boolean) => void;
  onCancel: () => void;
  isModal?: boolean;
}

export const DialogModal = ({ list, title, body, open, setOpen, onAccept, onCancel } : DialogModalProps) => {

  const handleAccept = () => {
    try {
      if (list) {
        onAccept(list.id, list.isFavorite);
      } else {
        onAccept();
      }
    } catch (error) {
      console.error("Error in dialog accept action:", error);
      fireToast("error", "Error", "There was an issue processing your request.");
    } finally {
      setOpen(false);
    }
  };

  return (
    <Dialog.Root lazyMount open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header paddingX={4} paddingTop={4} paddingBottom={2}>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body paddingX={4} paddingY={2} >
              {body}
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
              </Dialog.ActionTrigger>
              <Button onClick={handleAccept}>Accept</Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton aria-label="Close" onClick={onCancel} />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}