import { Heading, Text, VStack } from "@chakra-ui/react";
import { currentUser } from "../mocks/currentUser";

export function ProfilePage() {
  const signedIn = Boolean(currentUser);

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