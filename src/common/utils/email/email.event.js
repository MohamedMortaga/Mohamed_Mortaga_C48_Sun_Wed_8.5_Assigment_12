import { EventEmitter } from "node:events";
import { sendOTP } from "./email.service.js";

const emailEvents = new EventEmitter();

emailEvents.on("send-otp", async ({ email, subject }) => {
  try {
    await sendOTP({ email, subject });
  } catch (error) {
    console.log("Error While Sending Email");
    console.log(error);
  }
});
export default emailEvents;
