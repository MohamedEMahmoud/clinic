import mongoose from 'mongoose';
import { v2 as Cloudinary } from 'cloudinary';
import { natsWrapper } from "./nats-wrapper";
import { app } from './app';
import { AppointmentCreatedListener } from "./events/listeners/appointment-created-listener";

(async () => {
  const Environment = ["PORT", "MONGO_URI", "JWT_KEY", "RESET_PASSWORD_EXPIRATION_KEY", "CLOUDINARY_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "NATS_CLUSTER_ID", "NATS_CLIENT_ID", "NATS_URL"];
  Environment.forEach(el => {
    if (!process.env[el]) {
      throw new Error(`${el} Must Be Defined`);
    }
  });

  try {
    await natsWrapper.connect(process.env.NATS_CLUSTER_ID!, process.env.NATS_CLIENT_ID!, process.env.NATS_URL!);
    natsWrapper.client.on("close", () => {
      console.log("NATS connection closed! from Auth service");
      process.exit();
    });
    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    await mongoose.connect(process.env.MONGO_URI!, { useNewUrlParser: true, useUnifiedTopology: true } as mongoose.ConnectOptions);
    mongoose.Promise = global.Promise;
    console.log('Connection to Mongodb Successfully! From Auth Service');

    new AppointmentCreatedListener(natsWrapper.client).listen();

    Cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }

  catch (e) {
    console.log(e);
  }

  const PORT = 3000 || Number(process.env.PORT);
  app.listen(PORT, () => console.log(`Server Listening On Port ${PORT} From Auth Service`));
})();

