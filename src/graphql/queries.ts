/* tslint:disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getTaskList = /* GraphQL */ `query GetTaskList($id: ID!) {
  getTaskList(id: $id) {
    id
    name
    isDemo
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
` as GeneratedQuery<
  APITypes.GetTaskListQueryVariables,
  APITypes.GetTaskListQuery
>;
export const listTaskLists = /* GraphQL */ `query ListTaskLists(
  $id: ID
  $filter: ModelTaskListFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listTaskLists(
    id: $id
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      id
      name
      isDemo
      isFavorite
      sortOrder
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListTaskListsQueryVariables,
  APITypes.ListTaskListsQuery
>;
export const getTask = /* GraphQL */ `query GetTask($id: ID!) {
  getTask(id: $id) {
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
    isDemo
    list {
      id
      name
      isDemo
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
` as GeneratedQuery<APITypes.GetTaskQueryVariables, APITypes.GetTaskQuery>;
export const listTasks = /* GraphQL */ `query ListTasks(
  $id: ID
  $filter: ModelTaskFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listTasks(
    id: $id
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
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
      isDemo
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListTasksQueryVariables, APITypes.ListTasksQuery>;
export const getUserProfile = /* GraphQL */ `query GetUserProfile($id: ID!) {
  getUserProfile(id: $id) {
    id
    owner
    planTier
    defaultVisibility
    seedVersion
    seededAt
    onboardingVersion
    onboarding
    onboardingUpdatedAt
    settingsVersion
    settings
    settingsUpdatedAt
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
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetUserProfileQueryVariables,
  APITypes.GetUserProfileQuery
>;
export const listUserProfiles = /* GraphQL */ `query ListUserProfiles(
  $id: ID
  $filter: ModelUserProfileFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listUserProfiles(
    id: $id
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      id
      owner
      planTier
      defaultVisibility
      seedVersion
      seededAt
      onboardingVersion
      onboarding
      onboardingUpdatedAt
      settingsVersion
      settings
      settingsUpdatedAt
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
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListUserProfilesQueryVariables,
  APITypes.ListUserProfilesQuery
>;
export const tasksByList = /* GraphQL */ `query TasksByList(
  $listId: ID!
  $sortOrder: ModelIntKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelTaskFilterInput
  $limit: Int
  $nextToken: String
) {
  tasksByList(
    listId: $listId
    sortOrder: $sortOrder
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
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
      isDemo
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.TasksByListQueryVariables,
  APITypes.TasksByListQuery
>;
export const tasksByParent = /* GraphQL */ `query TasksByParent(
  $parentTaskId: ID!
  $sortOrder: ModelIntKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelTaskFilterInput
  $limit: Int
  $nextToken: String
) {
  tasksByParent(
    parentTaskId: $parentTaskId
    sortOrder: $sortOrder
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
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
      isDemo
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.TasksByParentQueryVariables,
  APITypes.TasksByParentQuery
>;
