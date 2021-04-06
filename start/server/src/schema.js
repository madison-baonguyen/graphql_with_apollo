const { gql } = require("apollo-server");

const typeDefs = gql`
  "enable client fetch data"
  type Query {
    launches(
      "number of result to show client"
      pageSize: Int
      "number of skip result"
      after: String
    ): LaunchConnection!
    launch(id: ID!): Launch
    me: User
  }

  type LaunchConnection {
    cursor: String!
    hasMore: Boolean!
    launches: [Launch]
  }

  "enable client modify data"
  type Mutation {
    bookTrips(launchIds: [ID]!): TripUpdateResponse!
    "The cancelTrip mutation enables a logged-in user to cancel a trip that they previously booked."
    cancelTrip(launchId: ID!): TripUpdateResponse!
    "The login mutation enables a user to log in by providing their email address."
    login(email: String): User
  }

  type TripUpdateResponse {
    success: Boolean!
    message: String
    "And an array of any Launch return for cache"
    launches: [Launch]
  }

  type Launch {
    id: ID!
    site: String
    mission: Mission
    rocket: Rocket
    isBooked: Boolean!
  }

  type Rocket {
    id: ID!
    name: String
    type: String
  }

  type User {
    id: ID!
    email: String!
    trips: [Launch]!
    token: String
  }

  type Mission {
    name: String
    missionPatch(size: PatchSize): String
  }

  enum PatchSize {
    SMALL
    LARGE
  }
`;

module.exports = typeDefs;
