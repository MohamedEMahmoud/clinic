import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { currentUser, errorHandler, NotFoundError } from '@clinic-services/common';
import cookieSession from 'cookie-session';
import { signupRouter } from "./routes/signup";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { currentUserRouter } from "./routes/current-user";
import { forgetPasswordRouter } from "./routes/forget-password";
import { resetPasswordRouter } from "./routes/reset-password";
import { resendKeyRouter } from "./routes/resend-key";
import { checkPasswordKeyRouter } from "./routes/check-password-key";
import { activeRouter } from "./routes/active";
import { updateProfileRouter } from "./routes/update-profile";
import { deleteProfileRouter } from "./routes/delete-profile";
import { showAllDoctorsRouter } from "./routes/doctor/show_doctors";
const app = express();
app.set('trust proxy', true);
app.use([
  json(),
  cookieSession({ signed: false, secure: process.env.NODE_ENV !== 'test' }),
  signupRouter,
  signinRouter,
  signoutRouter,
  currentUserRouter,
  forgetPasswordRouter,
  resetPasswordRouter,
  resendKeyRouter,
  checkPasswordKeyRouter,
  currentUser,
  activeRouter,
  updateProfileRouter,
  deleteProfileRouter,
  showAllDoctorsRouter
]);


app.use(
  '*',
  async () => {
    throw new NotFoundError();
  }, errorHandler);

export { app };