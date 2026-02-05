import { HStack, Text, Switch } from "@chakra-ui/react";

export const CompletedTasksToggle = ({ showCompletedTasks, setShowCompletedTasks }: { showCompletedTasks: boolean; setShowCompletedTasks: (value: boolean) => void }) => {


return (
  <HStack gap={2} align="center">
    <Text fontSize={"md"}>Show Completed Tasks</Text>
    <Switch.Root
      checked={showCompletedTasks}
      aria-label="Show completed tasks"
      onCheckedChange={(details) => setShowCompletedTasks(details.checked)}
    >
      <Switch.HiddenInput name="showCompletedTasks" aria-label="Show completed tasks" />
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
    </Switch.Root>
  </HStack>
)}