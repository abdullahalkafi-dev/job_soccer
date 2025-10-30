import express, { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { CandidateRoutes } from "../modules/candidate/candidate.route";
import { EmployerRoutes } from "../modules/employer/employer.route";
import { JobRoutes } from "../modules/Job/job.route";
import { SearchHistoryRoutes } from "../modules/searchHistory/searchHistory.route";
import SavedJobRoutes from "../modules/savedJobs/savedJobs.route";
import FollowRoutes from "../modules/follow/follow.route";


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
    path: "/job",
    route: JobRoutes,
  },
  {
    path: "/search-history",
    route: SearchHistoryRoutes,
  },
  {
    path: "/saved-jobs",
    route: SavedJobRoutes,
  },
  {
    path: "/follow",
    route: FollowRoutes,
  },
 
];

apiRoutes.forEach((route) => router.use(route.path, route.route));

export default router;

