import { createServer } from "node:http";
import { createApp } from "./app.mjs";
import { openDatabase } from "./db/database.mjs";

const port = Number(process.env.PORT ?? 3000);
const db = openDatabase({ file: process.env.SERVICEFLOW_DB });

createServer(createApp({ db })).listen(port, () => {
  console.log(`ServiceFlow is running on http://localhost:${port}`);
});
