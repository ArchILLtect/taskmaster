import { Heading, Text, VStack, Center, Spinner } from "@chakra-ui/react";
import { currentUser } from "../mocks/currentUser";
import { useProfilePageData } from "./useProfilePageData";

export function ProfilePage() {
  const signedIn = Boolean(currentUser);

    const { loading } = useProfilePageData();
  
    // Add a spinner for loading state
    if (loading) {
      return (
        <Center width={"100%"} height={"75vh"}>
          <Spinner size={"xl"} />
        </Center>
      );
    }

  if (!signedIn) {
    return (
      <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
        <Heading size="md">Profile</Heading>
        <Text>No user is currently logged in.</Text>
      </VStack>
    );
  } else {
    return (
      <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
        <Heading size="md">Profile</Heading>
        <Text>{currentUser?.id}</Text>
        <Text>{currentUser?.username}</Text>
        <Text>{currentUser?.email}</Text>
        <Text>{currentUser?.role}</Text>
      </VStack>
    )
  }
}