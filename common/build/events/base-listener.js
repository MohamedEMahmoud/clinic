"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Listener = void 0;
class Listener {
    constructor(client) {
        this.client = client;
        this.ackWait = 5 * 1000;
    }
    subscriptionOptions() {
        return this.client
            .subscriptionOptions()
            .setManualAckMode(true)
            .setAckWait(this.ackWait)
            .setDeliverAllAvailable()
            .setDurableName(this.queueGroupName);
    }
    listen() {
        const subscription = this.client.subscribe(this.subject, this.queueGroupName, this.subscriptionOptions());
        subscription.on("message", (msg) => {
            console.log(`Message received: ${this.subject} / ${this.queueGroupName}`);
            const parsedData = this.parseMessage(msg);
            this.onMessage(parsedData, msg);
        });
    }
    parseMessage(msg) {
        const data = msg.getData();
        return typeof data === "string" ? JSON.parse(data) : JSON.parse(data.toString("utf8"));
    }
}
exports.Listener = Listener;
