import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import morgan from 'morgan';
import { currentUser, errorHandler, NotFoundError } from '@clinic-services/common';
import cookieSession from 'cookie-session';
import { patient_book_appointment_router } from "./routes/patient/book";
import { patient_cancelled_appointment_router } from "./routes/patient/cancelled";
import { patient_show_appointment_router } from "./routes/patient/show";
import { patient_show_all_appointment_router } from "./routes/patient/showAll";
import { patient_reschedule_appointment_router } from "./routes/patient/reschedule";
import { doctor_availableDates_router } from "./routes/doctor/available";
import { doctor_approved_appointment_router } from "./routes/doctor/approved";
import { doctor_cancelled_appointment_router } from "./routes/doctor/cancelled";
import { doctor_finished_appointment_router } from "./routes/doctor/finished";
import { admin_book_appointment_router } from "./routes/admin/book";
import { admin_approved_appointment_router } from "./routes/admin/approved";
import { admin_cancelled_appointment_router } from "./routes/admin/cancelled";
import { admin_delete_appointment_router } from "./routes/admin/delete";
import { admin_finished_appointment_router } from "./routes/admin/finished";
import { admin_missed_appointment_router } from "./routes/admin/missed";
import { admin_reschedule_appointment_router } from "./routes/admin/reschedule";
import { admin_schedule_appointment_router } from "./routes/admin/schedule";
import { admin_update_available_dates_router } from "./routes/admin/updateAvailableDates";
import { admin_update_book_appointment_router } from "./routes/admin/updateBook";
import { filter_appointment_router } from "./routes/filter";
import { view_all_appointments_router } from "./routes/viewAllAppointment";
import { view_all_upcoming_appointments_router } from "./routes/viewAllUpComingAppointment";
import { show_all_available_dates_router } from "./routes/showAvailableDates";
const app = express();

app.set('trust proxy', true);
app.use([
  json(),
  cookieSession({ signed: false, secure: process.env.NODE_ENV !== 'test' }),
  morgan("dev"),
  currentUser,
  patient_book_appointment_router,
  patient_cancelled_appointment_router,
  patient_show_appointment_router,
  patient_show_all_appointment_router,
  patient_reschedule_appointment_router,
  doctor_availableDates_router,
  doctor_approved_appointment_router,
  doctor_cancelled_appointment_router,
  doctor_finished_appointment_router,
  admin_book_appointment_router,
  admin_approved_appointment_router,
  admin_cancelled_appointment_router,
  admin_delete_appointment_router,
  admin_finished_appointment_router,
  admin_missed_appointment_router,
  admin_reschedule_appointment_router,
  admin_schedule_appointment_router,
  admin_update_available_dates_router,
  admin_update_book_appointment_router,
  filter_appointment_router,
  view_all_appointments_router,
  view_all_upcoming_appointments_router,
  show_all_available_dates_router
]);


app.use(
  '*',
  async () => {
    throw new NotFoundError();
  }, errorHandler);

export { app };