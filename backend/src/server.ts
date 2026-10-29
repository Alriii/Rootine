// Purpose: Import the configured Express application.
import app from "./app";
import { ENV } from "@/config/env";

// Purpose: Start accepting HTTP requests on the configured port.
app.listen(ENV.PORT, () => {
  // Meaning: Print a confirmation after the server begins listening.
  console.log(`Server is running on port ${ENV.PORT}`);
});