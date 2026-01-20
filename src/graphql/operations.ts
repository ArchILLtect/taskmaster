import * as APITypes from "../API";

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
  query ListTaskLists($limit: Int, $nextToken: String) {
    listTaskLists(limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
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

/**
 * Optional (we won’t need this for the first page conversion unless you show subtasks):
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