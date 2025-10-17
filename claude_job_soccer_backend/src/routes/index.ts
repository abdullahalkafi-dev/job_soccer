import express, { Router } from "express";
import { UserRoutes } from "../modules/user/user.routes";


const router: Router = express.Router();

const apiRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  // {
  //   path: "/auth",
  //   route: AuthRoutes,
  // },
 
];

apiRoutes.forEach((route) => router.use(route.path, route.route));

export default router;

