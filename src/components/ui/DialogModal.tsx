import { useEffect } from "react";
import { Dialog, Button, Portal } from "@chakra-ui/react"
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

useEffect(() => {
  if (open) {
    console.log("DialogModal opened with:", { list, title });
  }
}, [open, list, title]);

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
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              {body}
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
              </Dialog.ActionTrigger>
              <Button onClick={handleAccept}>Accept</Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <Button onClick={onCancel} size={"xs"}>X</Button>
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}