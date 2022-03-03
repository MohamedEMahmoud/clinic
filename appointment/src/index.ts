import mongoose from 'mongoose';
import { natsWrapper } from "./nats-wrapper";
import { app } from './app';
import { UserCreatedListener } from "./events/listeners/user-created-listener";
import { UserUpdatedListener } from "./events/listeners/user-updated-listener";
import { UserDeletedListener } from "./events/listeners/user-deleted-listener";

(async () => {
  const Environment = ["PORT", "MONGO_URI", "JWT_KEY", "NATS_CLUSTER_ID", "NATS_CLIENT_ID", "NATS_URL"];
  Environment.forEach(el => {
    if (!process.env[el]) {
      throw new Error(`${el} Must Be Defined`);
    }
  });

  try {
    await natsWrapper.connect(process.env.NATS_CLUSTER_ID!, process.env.NATS_CLIENT_ID!, process.env.NATS_URL!);
    natsWrapper.client.on("close", () => {
      console.log("NATS connection closed! from Appointment service");
      process.exit();
    });
    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    new UserCreatedListener(natsWrapper.client).listen();
    new UserUpdatedListener(natsWrapper.client).listen();
    new UserDeletedListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI!, { useNewUrlParser: true, useUnifiedTopology: true } as mongoose.ConnectOptions);
    mongoose.Promise = global.Promise;
    console.log('Connection to Mongodb Successfully! From Appointment Service');
  }

  catch (e) {
    console.log(e);
  }

  const PORT = 3000 || Number(process.env.PORT);
  app.listen(PORT, () => console.log(`Server Listening On Port ${PORT} From Appointment Service`));
})();

