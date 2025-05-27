const { gql } = require('graphql-tag');

const typeDefs = gql`
  type Book @key(fields: "id") {
    id: ID!
    title: String!
    author: String!
    isbn: String!
    publishedYear: Int!
    copiesAvailable: Int!
    genre: String
  }

  type Query {
    books: [Book!]!
    book(id: ID!): Book
  }

  type Mutation {
    createBook(
      title: String!
      author: String!
      isbn: String!
      publishedYear: Int!
      copiesAvailable: Int!
      genre: String
    ): Book

    updateBook(
      id: ID!
      title: String
      author: String
      isbn: String
      publishedYear: Int
      copiesAvailable: Int
      genre: String
    ): Book

    deleteBook(id: ID!): Boolean
  }
`;

module.exports = typeDefs;
