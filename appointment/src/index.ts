import mongoose from 'mongoose';
import { natsWrapper } from "./nats-wrapper";
import { app } from './app';

(async () => {
  const Environment = ['MONGO_URI', "JWT_KEY", "NATS_CLUSTER_ID", "NATS_CLIENT_ID", "NATS_URL"];
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

    await mongoose.connect(process.env.MONGO_URI!, { useNewUrlParser: true, useUnifiedTopology: true } as mongoose.ConnectOptions);
    mongoose.Promise = global.Promise;
    console.log('Connection to Mongodb Successfully! From Appointment Service');
  }

  catch (e) {
    console.log(e);
  }

  const PORT = 3000;
  app.listen(PORT, () => console.log(`Server Listening On Port 3000! From Appointment Service`));
})();

