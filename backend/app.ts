import express, { Application, Request, Response, NextFunction } from "express";
import logger from "morgan";
import cookieParser from "cookie-parser";
import indexRouter from "./routes/index";
import usersRouter from "./routes/users";

const app: Application = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
	res.status(404).send("Sorry, can't find that!");
});

export default app;
