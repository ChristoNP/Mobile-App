import { gql } from "@apollo/client";
export const GET_USER_ID = gql`
query Query {
  usersById {
    user {
      _id
      name
      username
      email
    }
    followers {
      _id
      name
      username
      email
    }
    followings {
      _id
      name
      username
      email
    }
  }
}
`

export const GET_LOGIN_USER = gql`
query Query {
  loginUser {
    _id
    name
    username
    email
  }
}
`
export const GET_USER = gql`
query Query {
  users {
    _id
    name
    username
    email
  }
}
`

export const LOGIN = gql`
mutation Mutation($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    accessToken
    _id
    username
  }
}
`
export const REGISTER = gql`
mutation Mutation($form: userForm) {
  register(form: $form) {
    _id
    name
    username
    email
  }
}
`

export const FIND_USERNAME = gql`
query UsersByUsername($username: String!) {
  usersByUsername(username: $username) {
    _id
    name
    username
    email
  }
}
`
export const FIND_NAME = gql`
query UsersByName($name: String!) {
  usersByName(name: $name) {
    _id
    name
    username
    email
  }
}
`

export const ALL_USERS = gql`
query Users {
  users {
    _id
    name
    username
    email
  }
}
`

