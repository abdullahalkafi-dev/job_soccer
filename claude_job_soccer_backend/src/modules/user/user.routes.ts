import { Router } from "express";
import { logger } from "../../shared/logger/logger";

const router = Router();

router.get("/", (req, res) => {
  logger.info("User route accessed");

  res.send("User route");
});

export const UserRoutes: Router = router;
