const { userClient, bookingClient, notifClient, grpcCall } = require('../grpc/clients');

const resolvers = {
  Query: {
    me: async (_, __, { userId }) => {
      if (!userId) throw new Error('Non authentifié');
      const res = await grpcCall(userClient, 'GetUserProfile', { user_id: userId });
      if (!res.success) throw new Error(res.error);
      return res.user;
    },

    booking: async (_, { id }, { userId }) => {
      if (!userId) throw new Error('Non authentifié');
      const res = await grpcCall(bookingClient, 'GetBooking', { booking_id: id, user_id: userId });
      if (!res.success) throw new Error(res.error);
      return res.booking;
    },

    myBookings: async (_, __, { userId }) => {
      if (!userId) throw new Error('Non authentifié');
      const res = await grpcCall(bookingClient, 'ListUserBookings', { user_id: userId });
      if (!res.success) throw new Error(res.error);
      return res.bookings;
    },

    myNotifications: async (_, __, { userId }) => {
      if (!userId) throw new Error('Non authentifié');
      const res = await grpcCall(notifClient, 'GetUserNotifs', { user_id: userId });
      if (!res.success) throw new Error(res.error);
      return res.notifs;
    },

    rooms: async () => {
      const res = await grpcCall(bookingClient, 'ListRooms', {});
      if (!res.success) throw new Error(res.error);
      return res.rooms;
    },

    checkAvailability: async (_, { room_id, check_in, check_out }) => {
      const res = await grpcCall(bookingClient, 'CheckAvailability', { room_id, check_in, check_out });
      return res.available;
    },
  },

  User: {
    bookings: async (parent) => {
      const res = await grpcCall(bookingClient, 'ListUserBookings', { user_id: parent.id });
      return res.success ? res.bookings : [];
    },
  },
};

module.exports = { resolvers };
