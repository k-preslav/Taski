import { Client, Account, TablesDB, Realtime, Storage } from "appwrite";

const client = new Client();

client
  .setEndpoint(
    import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  )
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const realtime = new Realtime(client);

export const account = new Account(client);
export const tablesDB = new TablesDB(client);
export const storage = new Storage(client);

export { ID, Query } from "appwrite";


export default client;
