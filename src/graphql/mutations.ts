/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createTaskList = /* GraphQL */ `mutation CreateTaskList(
  $input: CreateTaskListInput!
  $condition: ModelTaskListConditionInput
) {
  createTaskList(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateTaskListMutationVariables,
  APITypes.CreateTaskListMutation
>;
export const updateTaskList = /* GraphQL */ `mutation UpdateTaskList(
  $input: UpdateTaskListInput!
  $condition: ModelTaskListConditionInput
) {
  updateTaskList(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateTaskListMutationVariables,
  APITypes.UpdateTaskListMutation
>;
export const deleteTaskList = /* GraphQL */ `mutation DeleteTaskList(
  $input: DeleteTaskListInput!
  $condition: ModelTaskListConditionInput
) {
  deleteTaskList(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteTaskListMutationVariables,
  APITypes.DeleteTaskListMutation
>;
export const createTask = /* GraphQL */ `mutation CreateTask(
  $input: CreateTaskInput!
  $condition: ModelTaskConditionInput
) {
  createTask(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateTaskMutationVariables,
  APITypes.CreateTaskMutation
>;
export const updateTask = /* GraphQL */ `mutation UpdateTask(
  $input: UpdateTaskInput!
  $condition: ModelTaskConditionInput
) {
  updateTask(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateTaskMutationVariables,
  APITypes.UpdateTaskMutation
>;
export const deleteTask = /* GraphQL */ `mutation DeleteTask(
  $input: DeleteTaskInput!
  $condition: ModelTaskConditionInput
) {
  deleteTask(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteTaskMutationVariables,
  APITypes.DeleteTaskMutation
>;
