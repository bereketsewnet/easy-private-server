class PrivateChatModel {
    constructor({
        messageId,
        message,
        sender,
        receiver,
        timeStamp,
        isSeen,
        messageType = 'Text',
        messageOrder = 0,
        replayMessage = null
    }) {
        this.messageId = messageId;
        this.message = message;
        this.sender = sender;
        this.receiver = receiver;
        this.timeStamp = timeStamp;
        this.isSeen = isSeen;
        this.messageType = messageType;
        this.messageOrder = messageOrder;
        this.replayMessage = replayMessage;
    }

    toJson() {
        return {
            messageId: this.messageId,
            message: this.message,
            sender: this.sender,
            receiver: this.receiver,
            timeStamp: this.timeStamp,
            isSeen: this.isSeen,
            messageType: this.messageType,
            messageOrder: this.messageOrder,
            replayMessage: this.replayMessage
        };
    }


    static fromJson(json) {
        return new PrivateChatModel({
            messageId: json.messageId,
            message: json.message,
            sender: json.sender,
            receiver: json.receiver,
            timeStamp: json.timeStamp,
            isSeen: json.isSeen,
            messageType: json.messageType || 'Text',
            messageOrder: json.messageOrder || 0,
            replayMessage: json.replayMessage
        });
    }
}

module.exports = PrivateChatModel;