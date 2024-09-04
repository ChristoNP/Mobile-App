# My Social Media App

## Overview

**My Social Media App** is a mobile application with a Facebook-like theme, focusing on user interaction and content management. The project encompasses both server-side and client-side development using modern technologies.

## Technologies

- **Backend**: 
  - GraphQL
  - Apollo Server
  - MongoDB
  - Redis

- **Frontend**: 
  - React Native (Expo)
  - React Navigation

## Features

- **User Authentication**
  - Register
  - Login

- **Posts**
  - Add Post
  - View Posts
  - Comment on Posts
  - Like Posts

- **User Interaction**
  - Search Users
  - Follow Users
  - View Followers and Following

- **Caching**
  - Redis caching for performance optimization

## Project Structure

- **Server**: 
  - Hosts GraphQL API with mutations and queries for user and post management.

- **Client**: 
  - React Native mobile app with screens for authentication, post management, user profiles, and navigation.

## Deployment Links

- **Server**: [Server Deployment](https://p3-gc1-server.rollyroller.com/)
- **Client**: [Client Deployment](https://expo.dev/preview/update?message=login%20button%20redesign&updateRuntimeVersion=1.0.0&createdAt=2024-08-25T10%3A47%3A15.098Z&slug=exp&projectId=cacd4656-83fa-4e3c-9724-4f2ac452b3be&group=d5577fda-7fc8-4360-b711-2a7c7c7283ac)

## Setup and Configuration

### Day 1

- **Setup Project**:
  - Install MongoDB or use MongoDB Atlas.
  - Install required packages: `@apollo/server`, `graphql`, `mongodb`.
  - Create a GraphQL server using Apollo Server on port 3000.

- **GraphQL - Apollo Server**:
  - Implement mutations and queries for Register, Login, Get Post, Add Post, Comment Post, Search User, Follow, Get User, Like Post.

- **MongoDB 1**:
  - Implement MongoDB functions for adding users, searching users, following users, adding posts, getting posts, commenting on posts, and liking posts.

### Day 2

- **MongoDB 2**:
  - Implement lookup/relations to display usernames in comments and followers/following lists.

- **Redis - Cache**:
  - Implement caching for Get Post query.
  - Invalidate cache on Add Post mutation.

### Day 3

- **React Native**:
  - Create screens for unauthenticated users (Login and Register) and authenticated users (Home, Create Post, Post Detail, Search, Profile).

- **React Navigation**:
  - Implement navigation between screens.

### Day 4

- **GraphQL - Apollo Client**:
  - Connect React Native client to GraphQL server.
  - Implement necessary queries and mutations.