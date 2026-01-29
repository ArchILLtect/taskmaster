import * as APITypes from "../API";

// NOTE: This file is intentionally NOT under src/graphql/**.
// That folder is treated as codegen-owned and may be deleted/regenerated.

type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

// Task List Queries and Mutations - Minimal Versions

export const createTaskListMinimal = /* GraphQL */ `
  mutation CreateTaskList($input: CreateTaskListInput!) {
    createTaskList(input: $input) {
      id
      name
      description
      isFavorite
      sortOrder
      owner
      createdAt
      updatedAt
    }
  }
` as GeneratedMutation<
  APITypes.CreateTaskListMutationVariables,
  APITypes.CreateTaskListMutation
>;

export const updateTaskListMinimal = /* GraphQL */ `
  mutation UpdateTaskList($input: UpdateTaskListInput!) {
    updateTaskList(input: $input) {
      id
      name
      description
      isFavorite
      sortOrder
      owner
      createdAt
      updatedAt
    }
  }
` as GeneratedMutation<
  APITypes.UpdateTaskListMutationVariables,
  APITypes.UpdateTaskListMutation
>;

export const deleteTaskListMinimal = /* GraphQL */ `
  mutation DeleteTaskList($input: DeleteTaskListInput!) {
    deleteTaskList(input: $input) {
      id
      owner
    }
  }
` as GeneratedMutation<
  APITypes.DeleteTaskListMutationVariables,
  APITypes.DeleteTaskListMutation
>;

export const getTaskListMinimal = /* GraphQL */ `
  query GetTaskList($id: ID!) {
    getTaskList(id: $id) {
      id
      name
      description
      isFavorite
      sortOrder
      owner
      createdAt
      updatedAt
    }
  }
` as GeneratedQuery<
  APITypes.GetTaskListQueryVariables,
  APITypes.GetTaskListQuery
>;

export const listTaskListsMinimal = /* GraphQL */ `
  query ListTaskLists($id: ID, $filter: ModelTaskListFilterInput, $limit: Int, $nextToken: String, $sortDirection: ModelSortDirection) {
    listTaskLists(id: $id, filter: $filter, limit: $limit, nextToken: $nextToken, sortDirection: $sortDirection) {
      items {
        id
        name
        description
        # Intentionally omitted in normal UI minimal query to avoid legacy non-null errors:
        # isDemo
        isFavorite
        sortOrder
        owner
        createdAt
        updatedAt
      }
      nextToken
    }
  }
` as GeneratedQuery<
  APITypes.ListTaskListsQueryVariables,
  APITypes.ListTaskListsQuery
>;

// Admin variant: includes `isDemo` for owner-first browsing.
// NOTE: This can hard-fail if legacy items are missing the now-required `isDemo` field.
// Admin services should fall back to `listTaskListsMinimal` if that happens.
export const listTaskListsAdminMinimal = /* GraphQL */ `
  query ListTaskLists($id: ID, $filter: ModelTaskListFilterInput, $limit: Int, $nextToken: String, $sortDirection: ModelSortDirection) {
    listTaskLists(id: $id, filter: $filter, limit: $limit, nextToken: $nextToken, sortDirection: $sortDirection) {
      items {
        id
        name
        description
        isDemo
        isFavorite
        sortOrder
        owner
        createdAt
        updatedAt
      }
      nextToken
    }
  }
` as GeneratedQuery<
  APITypes.ListTaskListsQueryVariables,
  APITypes.ListTaskListsQuery
>;

// Task Queries and Mutations - Minimal Versions

export const createTaskMinimal = /* GraphQL */ `
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
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
      owner
      createdAt
      updatedAt
    }
  }
` as GeneratedMutation<
  APITypes.CreateTaskMutationVariables,
  APITypes.CreateTaskMutation
>;

export const updateTaskMinimal = /* GraphQL */ `
  mutation UpdateTask($input: UpdateTaskInput!) {
    updateTask(input: $input) {
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
      owner
      createdAt
      updatedAt
    }
  }
` as GeneratedMutation<
  APITypes.UpdateTaskMutationVariables,
  APITypes.UpdateTaskMutation
>;

export const deleteTaskMinimal = /* GraphQL */ `
  mutation DeleteTask($input: DeleteTaskInput!) {
    deleteTask(input: $input) {
      id
      listId
      parentTaskId
      title
      owner
    }
  }
` as GeneratedMutation<
  APITypes.DeleteTaskMutationVariables,
  APITypes.DeleteTaskMutation
>;

export const tasksByListMinimal = /* GraphQL */ `
  query TasksByList($listId: ID!, $sortOrder: ModelIntKeyConditionInput, $limit: Int, $nextToken: String) {
    tasksByList(listId: $listId, sortOrder: $sortOrder, limit: $limit, nextToken: $nextToken) {
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
        # Intentionally omitted in normal UI minimal query to avoid legacy non-null errors:
        # isDemo
        owner
        createdAt
        updatedAt
      }
      nextToken
    }
  }
` as GeneratedQuery<
  APITypes.TasksByListQueryVariables,
  APITypes.TasksByListQuery
>;

// Admin variant: includes `isDemo` for diagnostics and filtering.
// Admin services should fall back to `tasksByListMinimal` if legacy items break non-null.
export const tasksByListAdminMinimal = /* GraphQL */ `
  query TasksByList($listId: ID!, $sortOrder: ModelIntKeyConditionInput, $limit: Int, $nextToken: String) {
    tasksByList(listId: $listId, sortOrder: $sortOrder, limit: $limit, nextToken: $nextToken) {
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
        owner
        createdAt
        updatedAt
      }
      nextToken
    }
  }
` as GeneratedQuery<
  APITypes.TasksByListQueryVariables,
  APITypes.TasksByListQuery
>;

// -----------------------------
// UserProfile (bootstrap + demo seed gate)
// -----------------------------

export const getUserProfileMinimal = /* GraphQL */ `
  query GetUserProfile($id: ID!) {
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
    }
  }
` as GeneratedQuery<
  APITypes.GetUserProfileQueryVariables,
  APITypes.GetUserProfileQuery
>;

// Probe variant: includes `email` so legacy records missing it will error.
// Useful for admin diagnostics and migrations.
export const getUserProfileEmailProbeMinimal = /* GraphQL */ `
  query GetUserProfile($id: ID!) {
    getUserProfile(id: $id) {
      id
      owner
      email
      seedVersion
      createdAt
      updatedAt
    }
  }
` as GeneratedQuery<
  APITypes.GetUserProfileQueryVariables,
  APITypes.GetUserProfileQuery
>;

export const createUserProfileMinimal = /* GraphQL */ `
  mutation CreateUserProfile($input: CreateUserProfileInput!) {
    createUserProfile(input: $input) {
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
      email
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
    }
  }
` as GeneratedMutation<
  APITypes.CreateUserProfileMutationVariables,
  APITypes.CreateUserProfileMutation
>;

export const listUserProfilesMinimal = /* GraphQL */ `
  query ListUserProfiles($id: ID, $filter: ModelUserProfileFilterInput, $limit: Int, $nextToken: String, $sortDirection: ModelSortDirection) {
    listUserProfiles(id: $id, filter: $filter, limit: $limit, nextToken: $nextToken, sortDirection: $sortDirection) {
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
        email
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
      }
      nextToken
    }
  }
` as GeneratedQuery<
  APITypes.ListUserProfilesQueryVariables,
  APITypes.ListUserProfilesQuery
>;

// Safe variant for legacy/backfill situations: omits `email` so GraphQL won't error on
// records missing the now-required field.
export const listUserProfilesSafeMinimal = /* GraphQL */ `
  query ListUserProfiles($id: ID, $filter: ModelUserProfileFilterInput, $limit: Int, $nextToken: String, $sortDirection: ModelSortDirection) {
    listUserProfiles(id: $id, filter: $filter, limit: $limit, nextToken: $nextToken, sortDirection: $sortDirection) {
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
      }
      nextToken
    }
  }
` as GeneratedQuery<
  APITypes.ListUserProfilesQueryVariables,
  APITypes.ListUserProfilesQuery
>;

export const updateUserProfileMinimal = /* GraphQL */ `
  mutation UpdateUserProfile($input: UpdateUserProfileInput!, $condition: ModelUserProfileConditionInput) {
    updateUserProfile(input: $input, condition: $condition) {
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
      email
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
    }
  }
` as GeneratedMutation<
  APITypes.UpdateUserProfileMutationVariables,
  APITypes.UpdateUserProfileMutation
>;

/**
 * Optional (not currently used):
 * requires schema queryField: "tasksByParent"
 */
export const tasksByParentMinimal = /* GraphQL */ `
  query TasksByParent(
    $parentTaskId: ID!
    $sortOrder: ModelIntKeyConditionInput
    $limit: Int
    $nextToken: String
  ) {
    tasksByParent(
      parentTaskId: $parentTaskId
      sortOrder: $sortOrder
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
        owner
        createdAt
        updatedAt
      }
      nextToken
    }
  }
` as GeneratedQuery<
  APITypes.TasksByParentQueryVariables,
  APITypes.TasksByParentQuery
>;
