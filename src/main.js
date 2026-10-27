import express from "express";
import { PORT } from "./config/config.js";
import { dbConnection } from "./DB/connection.db.js";
import authRouter from "./module/auth/auth.controller.js";
import userRouter from "./module/user/user.controller.js";
import notFoundMiddleware from "./middleware/notFound.middleware.js";
import globalErrMiddleware from "./middleware/error.middleware.js";
import cros from "cors";
import messageRouter from "./module/message/message.controller.js";

async function bootstrap() {
  
  const app = express();

  app.use(cros());

  app.use(express.json());

  app.use("/assets", express.static("./assets"));
  
  await dbConnection();

  app.get("/", (req, res) => res.json({ message: "Welcome to Saraha app" }));
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/message", messageRouter);

  app.use((req, res, next) => notFoundMiddleware(req, res, next));

  app.use(globalErrMiddleware);

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

bootstrap();
