/* tslint:disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateTaskList = /* GraphQL */ `subscription OnCreateTaskList(
  $filter: ModelSubscriptionTaskListFilterInput
  $owner: String
) {
  onCreateTaskList(filter: $filter, owner: $owner) {
    id
    name
    isFavorite
    sortOrder
    tasks {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateTaskListSubscriptionVariables,
  APITypes.OnCreateTaskListSubscription
>;
export const onUpdateTaskList = /* GraphQL */ `subscription OnUpdateTaskList(
  $filter: ModelSubscriptionTaskListFilterInput
  $owner: String
) {
  onUpdateTaskList(filter: $filter, owner: $owner) {
    id
    name
    isFavorite
    sortOrder
    tasks {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateTaskListSubscriptionVariables,
  APITypes.OnUpdateTaskListSubscription
>;
export const onDeleteTaskList = /* GraphQL */ `subscription OnDeleteTaskList(
  $filter: ModelSubscriptionTaskListFilterInput
  $owner: String
) {
  onDeleteTaskList(filter: $filter, owner: $owner) {
    id
    name
    isFavorite
    sortOrder
    tasks {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteTaskListSubscriptionVariables,
  APITypes.OnDeleteTaskListSubscription
>;
export const onCreateTask = /* GraphQL */ `subscription OnCreateTask(
  $filter: ModelSubscriptionTaskFilterInput
  $owner: String
) {
  onCreateTask(filter: $filter, owner: $owner) {
    id
    listId
    sortOrder
    parentTaskId
    title
    description
    status
    priority
    dueAt
    completedAt
    assigneeId
    tagIds
    list {
      id
      name
      isFavorite
      sortOrder
      createdAt
      updatedAt
      owner
      __typename
    }
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateTaskSubscriptionVariables,
  APITypes.OnCreateTaskSubscription
>;
export const onUpdateTask = /* GraphQL */ `subscription OnUpdateTask(
  $filter: ModelSubscriptionTaskFilterInput
  $owner: String
) {
  onUpdateTask(filter: $filter, owner: $owner) {
    id
    listId
    sortOrder
    parentTaskId
    title
    description
    status
    priority
    dueAt
    completedAt
    assigneeId
    tagIds
    list {
      id
      name
      isFavorite
      sortOrder
      createdAt
      updatedAt
      owner
      __typename
    }
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateTaskSubscriptionVariables,
  APITypes.OnUpdateTaskSubscription
>;
export const onDeleteTask = /* GraphQL */ `subscription OnDeleteTask(
  $filter: ModelSubscriptionTaskFilterInput
  $owner: String
) {
  onDeleteTask(filter: $filter, owner: $owner) {
    id
    listId
    sortOrder
    parentTaskId
    title
    description
    status
    priority
    dueAt
    completedAt
    assigneeId
    tagIds
    list {
      id
      name
      isFavorite
      sortOrder
      createdAt
      updatedAt
      owner
      __typename
    }
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteTaskSubscriptionVariables,
  APITypes.OnDeleteTaskSubscription
>;
export const onCreateUserProfile = /* GraphQL */ `subscription OnCreateUserProfile(
  $filter: ModelSubscriptionUserProfileFilterInput
  $owner: String
) {
  onCreateUserProfile(filter: $filter, owner: $owner) {
    id
    planTier
    defaultVisibility
    seedVersion
    seededAt
    onboardingVersion
    onboarding
    settingsVersion
    settings
    displayName
    avatarUrl
    lastSeenAt
    preferredName
    bio
    timezone
    locale
    lastDeviceId
    acceptedTermsAt
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateUserProfileSubscriptionVariables,
  APITypes.OnCreateUserProfileSubscription
>;
export const onUpdateUserProfile = /* GraphQL */ `subscription OnUpdateUserProfile(
  $filter: ModelSubscriptionUserProfileFilterInput
  $owner: String
) {
  onUpdateUserProfile(filter: $filter, owner: $owner) {
    id
    planTier
    defaultVisibility
    seedVersion
    seededAt
    onboardingVersion
    onboarding
    settingsVersion
    settings
    displayName
    avatarUrl
    lastSeenAt
    preferredName
    bio
    timezone
    locale
    lastDeviceId
    acceptedTermsAt
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateUserProfileSubscriptionVariables,
  APITypes.OnUpdateUserProfileSubscription
>;
export const onDeleteUserProfile = /* GraphQL */ `subscription OnDeleteUserProfile(
  $filter: ModelSubscriptionUserProfileFilterInput
  $owner: String
) {
  onDeleteUserProfile(filter: $filter, owner: $owner) {
    id
    planTier
    defaultVisibility
    seedVersion
    seededAt
    onboardingVersion
    onboarding
    settingsVersion
    settings
    displayName
    avatarUrl
    lastSeenAt
    preferredName
    bio
    timezone
    locale
    lastDeviceId
    acceptedTermsAt
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteUserProfileSubscriptionVariables,
  APITypes.OnDeleteUserProfileSubscription
>;
