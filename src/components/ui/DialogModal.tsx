import { Dialog, Button, Portal } from "@chakra-ui/react"

type DialogModalProps = {
  list: { id: string; isFavorite: boolean };
  title: string;
  body: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  onAccept: (id: string, isFavorite: boolean) => void;
  onCancel: () => void;
}

export const DialogModal = ({ list, title, body, open, setOpen, onAccept, onCancel } : DialogModalProps) => {

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
              <Button onClick={() => onAccept(list.id, list.isFavorite)}>Accept</Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <Button onClick={onCancel}>Cancel</Button>
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}