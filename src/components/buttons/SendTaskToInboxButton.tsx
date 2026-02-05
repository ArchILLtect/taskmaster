import { Button, Center, Icon, Text, VStack } from "@chakra-ui/react";
import { HiOutlineInboxIn } from "react-icons/hi";
import type { TaskUI } from "../../types";
import { Tooltip } from "../ui/Tooltip";
import { DialogModal } from "../ui/DialogModal";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTaskActions } from "../../store/taskStore";
import { fireToast } from "../../hooks/useFireToast";
// TODO: Remove toaster import and fireToast later--only used for debugging right now, but they cannot
// be used in this component directly because it would create multiple toasters in the app.
// import { fireToast } from "../../hooks/useFireToast";
// import { Toaster } from "../ui/Toaster";

type SendToInboxButtonProps = {
  task: TaskUI;
  isActive?: boolean;
  fromListName?: string;
  disabled: boolean;
}

export const SendTaskToInboxButton = ({ task, isActive, fromListName, disabled }: SendToInboxButtonProps) => {

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const navigate = useNavigate();
  const { sendTaskToInbox } = useTaskActions();

  const handleSendToInbox = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsConfirmOpen(true);
  }

  return (
  <Center>
    {/* <Toaster /> */}
    <DialogModal
      title="Send to Inbox"
      body={
        <VStack align="start" gap={2}>
          <Text>
            Send <Text as="span" fontWeight="700">{task.title || "Untitled task"}</Text> to your Inbox?
          </Text>
          {fromListName ? (
            <Text color="gray.600" fontSize="sm">
              From list: <Text as="span" fontWeight="600">{fromListName}</Text>
            </Text>
          ) : null}
          <Text color="gray.600" fontSize="sm">
            This moves the task into the system Inbox list and redirects you to Inbox.
          </Text>
        </VStack>
      }
      open={isConfirmOpen}
      setOpen={setIsConfirmOpen}
      acceptLabel="Send to Inbox"
      acceptColorPalette="blue"
      acceptVariant="solid"
      cancelLabel="Cancel"
      cancelVariant="outline"
      loading={sending}
      disableClose={sending}
      closeOnAccept={false}
      onAccept={async () => {
        if (sending) return;
        setSending(true);
        try {
          await sendTaskToInbox(task.id);
          fireToast("success", "Task sent to Inbox", "The task has been moved to your Inbox.");
          setIsConfirmOpen(false);
          navigate("/inbox");
        } finally {
          setSending(false);
        }
      }}
      onCancel={() => {
        // no-op
      }}
    />
    <Tooltip content={disabled ? "This task is already in the Inbox" : "Send task to Inbox"}>
      <Button
        aria-label={disabled ? "Task already in Inbox" : "Send task to Inbox"}
        paddingX={"2"}
        size="2xs"
        fontSize={"sm"}
        fontWeight={"semibold"}
        variant="ghost"
        height={"32px"}
        bg={isActive ? "blue.50" : "white"}
        _hover={{ bg: "blue.500" }}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        onClick={handleSendToInbox}
        disabled={disabled}
      >
        <Icon as={HiOutlineInboxIn} boxSize={5} />
      </Button>
    </Tooltip>
  </Center>
  );
}