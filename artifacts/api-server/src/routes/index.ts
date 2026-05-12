import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import artistsRouter from "./artists";
import tracksRouter from "./tracks";
import commentsRouter from "./comments";
import discussionsRouter from "./discussions";
import notificationsRouter from "./notifications";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(artistsRouter);
router.use(tracksRouter);
router.use(commentsRouter);
router.use(discussionsRouter);
router.use(notificationsRouter);
router.use(dashboardRouter);
router.use(adminRouter);

export default router;
