import { Dialog, Button, Portal } from "@chakra-ui/react"

type DialogModalProps = {
  title: string;
  body: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  onAccept: () => void;
  onCancel: () => void;
}

export const DialogModal = ({ title, body, open, setOpen, onAccept, onCancel } : DialogModalProps) => {

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
              <Button onClick={onAccept}>Accept</Button>
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