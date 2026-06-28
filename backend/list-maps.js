import { LocationClient, ListMapsCommand, ListKeysCommand } from "@aws-sdk/client-location";
import dotenv from "dotenv";

dotenv.config();

const client = new LocationClient({ region: process.env.AWS_REGION });

async function main() {
  try {
    const data = await client.send(new ListMapsCommand({}));
    console.log("Maps:", JSON.stringify(data.Entries, null, 2));

    const keysData = await client.send(new ListKeysCommand({}));
    console.log("API Keys:", JSON.stringify(keysData.Entries, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

main();

main();
