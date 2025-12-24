import { Heading, Text, VStack } from "@chakra-ui/react";
import { mockUser } from "../mocks/user";

export function ProfilePage() {
  return (
    <VStack align="start" gap={2}>
      <Heading size="md">Profile</Heading>
      <Text>{mockUser.id}</Text>
      <Text>{mockUser.username}</Text>
      <Text>{mockUser.email}</Text>
      <Text>{mockUser.role}</Text>
    </VStack>
  );
}