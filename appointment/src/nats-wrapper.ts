import nats, { Stan } from "node-nats-streaming";

class NatsWrapper {
    private _client?: Stan;
    get client() {
        if (!this._client) {
            throw new Error("Can Not Access NATS Client Before Connecting From Appointment Service");
        }
        return this._client;
    }
    connect(clusterId: string, clientId: string, url: string): Promise<void> {
        this._client = nats.connect(clusterId, clientId, { url });
        return new Promise((resolve, reject) => {
            this._client!.on('connect', () => {
                console.log("Connected To NATS From Appointment Service");
                resolve();
            });
            this._client!.on('error', (err) => reject(err));
        });
    }
}

export const natsWrapper = new NatsWrapper();