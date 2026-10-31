// Purpose: Import the configured Express application.
import app from "./app";
import { ENV } from "@/config/env";
import { startReminderWorker } from "@/services/reminder/reminder-worker";

// Purpose: Start accepting HTTP requests on the configured port.
app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
  // Start the background reminder worker
  startReminderWorker();
});
