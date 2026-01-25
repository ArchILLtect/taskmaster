import { Heading, Text, VStack, Button } from "@chakra-ui/react";
import { useProfilePageData } from "./useProfilePageData";
import { BasicSpinner } from "../components/ui/BasicSpinner";
// import type { User } from "../types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type ProfilePageProps = {
  user?: any;
  onSignOut?: () => void;
}
  
export function ProfilePage({ user, onSignOut }: ProfilePageProps) {
  const signedIn = user ? Boolean(user) : false;

  const { loading } = useProfilePageData();

  if (loading) return <BasicSpinner />;

  if (!signedIn) {
    return (
      <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
        <Heading size="md">Profile</Heading>
        <Text>No user is currently logged in.</Text>
      </VStack>
    );
  } else {
    return (
      <>
      <VStack align="start" gap={2} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
        <Heading size="md">Profile</Heading>
        <Text>{user?.id}</Text>
        <Text>{user?.username}</Text>
        <Text>{user?.email}</Text>
        <Text>{user?.role}</Text>
      </VStack>
      {onSignOut ? (
        <Button size="sm" variant="outline" onClick={onSignOut}>
          Sign out
        </Button>
      ) : null}
      </>
    );
  }
}