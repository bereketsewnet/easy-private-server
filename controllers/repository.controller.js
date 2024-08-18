
const generateRoomId = (senderId, receiverId) => {
    return [senderId, receiverId].sort().join('_');
  };

  module.exports = {
    generateRoomId
  }