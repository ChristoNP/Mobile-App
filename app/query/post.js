import { gql } from "@apollo/client";

export const GET_POST = gql`
  query Query {
    posts {
      _id
      content
      tags
      imgUrl
      authorId
      comments {
        content
        username
        createdAt
        updatedAt
      }
      likes {
        username
        createdAt
        updatedAt
      }
      author {
        _id
        name
        username
        email
      }
      createdAt
      updatedAt
    }
  }
`
export const GET_POST_DETAIL = gql`
  query PostById($postByIdId: String!) {
  postById(id: $postByIdId) {
    _id
    content
    tags
    imgUrl
    authorId
    comments {
      content
      username
      createdAt
      updatedAt
    }
    likes {
      username
      createdAt
      updatedAt
    }
    author {
      _id
      name
      username
      email
    }
    createdAt
    updatedAt
  }
}
`

export const LIKE_POST = gql`
mutation Mutation($postId: String!) {
  likePost(postId: $postId) {
    username
    createdAt
    updatedAt
  }
}
`

export const ADD_POST = gql`
mutation Mutation($form: postForm) {
  addPost(form: $form) {
    _id
    content
    tags
    imgUrl
    authorId
    comments {
      content
      username
      createdAt
      updatedAt
    }
    likes {
      username
      createdAt
      updatedAt
    }
    author {
      _id
      name
      username
      email
    }
    createdAt
    updatedAt
  }
}
`
export const ADD_COMMENT = gql`
mutation CommentPost($content: String!, $postId: String) {
  commentPost(content: $content, postId: $postId) {
    content
    username
    createdAt
    updatedAt
  }
}
`
