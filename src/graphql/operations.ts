import * as APITypes from "../API";

type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

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