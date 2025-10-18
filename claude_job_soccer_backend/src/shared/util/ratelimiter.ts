import rateLimit from "express-rate-limit";

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // limit each IP to 10000 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
export default rateLimiter;