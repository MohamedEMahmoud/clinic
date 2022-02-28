import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { currentUser, errorHandler, NotFoundError } from '@clinic-services/common';
import cookieSession from 'cookie-session';
import { book_appointment_router } from "./routes/patient/book";
import { cancel_appointment_router } from "./routes/patient/cancel";
import { show_appointment_router } from "./routes/patient/show";
import { reschedule_appointment_router } from "./routes/patient/reschedule";

const app = express();

app.set('trust proxy', true);
app.use([
  json(),
  cookieSession({ signed: false, secure: process.env.NODE_ENV !== 'test' }),
  currentUser,
  book_appointment_router,
  cancel_appointment_router,
  show_appointment_router,
  reschedule_appointment_router
]);


app.use(
  '*',
  async () => {
    throw new NotFoundError();
  }, errorHandler);

export { app };