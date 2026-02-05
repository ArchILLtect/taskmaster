import { HStack, Text, Switch } from "@chakra-ui/react";
import { useId } from "react";

export const CompletedTasksToggle = ({ showCompletedTasks, setShowCompletedTasks }: { showCompletedTasks: boolean; setShowCompletedTasks: (value: boolean) => void }) => {

const switchId = useId();

return (
  <HStack gap={2} align="center">
    <Text fontSize={"md"}>Show Completed Tasks</Text>
    <Switch.Root checked={showCompletedTasks} onCheckedChange={() => setShowCompletedTasks(!showCompletedTasks)}>
      <Switch.HiddenInput id={`show-completed-${switchId}`} name="showCompletedTasks" aria-label="Show completed tasks" />
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
    </Switch.Root>
  </HStack>
)}