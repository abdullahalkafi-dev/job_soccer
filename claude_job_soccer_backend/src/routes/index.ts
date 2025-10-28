import express, { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { CandidateRoutes } from "../modules/candidate/candidate.route";
import { EmployerRoutes } from "../modules/employer/employer.route";
import { JobRoutes } from "../modules/Job/job.route";


const router: Router = express.Router();

const apiRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/candidate",
    route: CandidateRoutes,
  },
  {
    path: "/employer",
    route: EmployerRoutes,
  },
  {
    path: "/jobs",
    route: JobRoutes,
  },
 
];

apiRoutes.forEach((route) => router.use(route.path, route.route));

export default router;

