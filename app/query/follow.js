import { gql } from "@apollo/client";

export const FOLLOW = gql`
  mutation Mutation($followingId: String) {
  followUser(followingId: $followingId) {
    _id
    followingId
    followerId
    createdAt
    updatedAt
    user {
      _id
      name
      username
      email
    }
  }
}
`