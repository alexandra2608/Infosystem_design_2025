const { gql } = require('graphql-tag');

const typeDefs = gql`
  type Loan @key(fields: "id") {
    id: ID!
    memberId: ID!
    bookId: ID!
    loanDate: String!
    returnDate: String
    status: String!
  }

  type Query {
    loans: [Loan!]!
    loan(id: ID!): Loan
    loansByMember(memberId: ID!): [Loan!]!
    loansByBook(bookId: ID!): [Loan!]!
  }

  type Mutation {
    createLoan(memberId: ID!, bookId: ID!, loanDate: String!, status: String!): Loan
    updateLoan(id: ID!, returnDate: String, status: String): Loan
    deleteLoan(id: ID!): Boolean
  }
`;

module.exports = typeDefs;
