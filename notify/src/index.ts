import { AppointmentCreatedListener } from "./events/listeners/appointment-created-listener";
import { natsWrapper } from "./nats-wrapper";

(async () => {
  const Environment = ["REDIS_HOST", "NATS_CLUSTER_ID", "NATS_CLIENT_ID", "NATS_URL"];
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

    new AppointmentCreatedListener(natsWrapper.client).listen();

  }

  catch (e) {
    console.log(e);
  }
})();

