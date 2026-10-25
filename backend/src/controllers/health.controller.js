import ApiResponse from "../utils/apiResponse.js";

export const healthCheck = (req, res) => {
  const uptime = process.uptime();

  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  const memory = process.memoryUsage();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        status: "ok",
        uptime: `${days}d ${hours}h ${minutes}m ${seconds}s`,
        timestamp: new Date().toLocaleString("en-PK", {
          timeZone: "Asia/Karachi",
        }),
        nodeVersion: process.version,
        memory: {
          heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        },
      },
      "Server is healthy"
    )
  );
};