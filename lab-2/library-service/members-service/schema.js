const { gql } = require('graphql-tag');

const typeDefs = gql`
  type Member @key(fields: "id") {
    id: ID!
    name: String!
    email: String!
    phone: String
    membershipDate: String
  }

  type Query {
    members: [Member]
    member(id: ID!): Member
  }

  type Mutation {
    createMember(name: String!, email: String!, phone: String): Member
    updateMember(id: ID!, name: String, email: String, phone: String): Member
    deleteMember(id: ID!): Boolean
  }
`;

module.exports = typeDefs;
