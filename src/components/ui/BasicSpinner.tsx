import { Center, Spinner } from "@chakra-ui/react"
import { useTaskmasterData } from "../../hooks/useTaskmasterData";

export function BasicSpinner () {
  const { loading } = useTaskmasterData();
  if (loading) {
    return (
      <Center width={"100%"} height={"75vh"}>
        <Spinner size={"xl"} />
      </Center>
    );
  }
}