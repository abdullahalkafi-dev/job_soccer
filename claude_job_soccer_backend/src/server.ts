import colors from "colors";
import mongoose from "mongoose";
import config from "./config";
import socketServer from "./socket/socketServer";
import { logger } from "./shared/logger/logger";

//uncaught exception
process.on("uncaughtException", (error) => {
  logger.error("UnhandledException Detected", error);
  process.exit(1);
});

const server = socketServer();
async function main() {
  try {
    //TODO:  seedSuperAdmin();
    mongoose.connect(config.database_url as string);
    logger.info(colors.green("🚀 Database connected successfully"));

    const port =
      typeof config.port === "number" ? config.port : Number(config.port);
    console.log(port, "port");
    // await redisClient.connect();

    server.listen(port, config.ip_address as string, () => {
      logger.info(
        colors.yellow(
          `♻️  Application listening ${config.ip_address} on port:${config.port}`
        )
      );
    });
  } catch (error) {
    logger.error(colors.red("🤢 Failed to connect Database"));
  }
}

//handle unhandledRejection
process.on("unhandledRejection", (error) => {
  if (server) {
    server.close(() => {
      logger.error("UnhandledRejection Detected", error);
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

main();

// Only handle SIGTERM in production environments
// In development, ts-node-dev handles restarts via SIGTERM
if (process.env.NODE_ENV === "production") {
  process.on("SIGTERM", async () => {
    logger.info("SIGTERM received, shutting down gracefully...");
    if (server) {
      server.close(async () => {
        logger.info("HTTP server closed.");
        //TODO: close other resources like redis
        // await redisClient.disconnect();
        await mongoose.connection.close();
        process.exit(0);
      });
    }
  });
}
