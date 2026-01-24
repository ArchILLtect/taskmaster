import { Button, Center } from "@chakra-ui/react";
import type { TaskUI } from "../../types";
import { Tooltip } from "../ui/Tooltip";
// TODO: Remove toaster import and fireToast later--only used for debugging right now, but they cannot
// be used in this component directly because it would create multiple toasters in the app.
// import { fireToast } from "../../hooks/useFireToast";
// import { Toaster } from "../ui/Toaster";

type SendToInboxButtonProps = {
  task: TaskUI;
  isActive?: boolean;
  onSend?: (e: React.MouseEvent<HTMLButtonElement>, task: TaskUI) => void;
  disabled: boolean;
}

export const SendTaskToInboxButton = ({task, isActive, onSend, disabled }: SendToInboxButtonProps) => {

  const handleSendToInbox = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onSend?.(e, task);
    // fireToast("success", "Task sent to Inbox", "The task has been moved to your Inbox.");
  }

  return (
  <Center>
    {/* <Toaster /> */}
    <Tooltip content={disabled ? "This task is already in the Inbox" : "Send task to Inbox"}>
      <Button
        borderRadius={"4xl"}
        paddingX={"3"}
        paddingY={"2"}
        size="2xs"
        fontSize={"sm"}
        fontWeight={"semibold"}
        variant="ghost"
        height={"7"}
        bg={isActive ? "blue.50" : "white"}
        _hover={{ bg: "blue.500" }}
        onClick={handleSendToInbox}
        disabled={disabled}
      >
          Send to Inbox
      </Button>
    </Tooltip>
  </Center>
  );
}