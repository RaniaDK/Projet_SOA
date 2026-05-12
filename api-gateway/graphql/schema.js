const { gql } = require('graphql-tag');

const typeDefs = gql`
  type User {
    id:         String!
    name:       String!
    email:      String!
    phone:      String
    created_at: String!
    bookings:   [Booking!]
  }

  type Room {
    id:          String!
    name:        String!
    type:        String!
    price:       Float!
    description: String
  }

  type Booking {
    id:         String!
    user_id:    String!
    room_id:    String!
    check_in:   String!
    check_out:  String!
    status:     String!
    created_at: String!
    room:       Room
  }

  type Notification {
    id:         String!
    user_id:    String!
    type:       String!
    message:    String!
    read:       Boolean!
    created_at: String!
  }

  type Query {
    me:                User
    booking(id: String!): Booking
    myBookings:        [Booking!]!
    myNotifications:   [Notification!]!
    rooms:             [Room!]!
    checkAvailability(room_id: String!, check_in: String!, check_out: String!): Boolean!
  }
`;

module.exports = { typeDefs };