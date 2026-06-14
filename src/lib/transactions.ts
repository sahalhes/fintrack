import { MongoClient } from 'mongodb';
import { Transaction } from '@/types/transaction';

let client: MongoClient | null = null;

function getClient(): MongoClient {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  if (!client) {
    client = new MongoClient(databaseUrl);
  }
  return client;
}

export async function getUserTransactions(userId: string): Promise<Transaction[] | null> {
  const client = getClient();
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME);
  const userCollection = db.collection<{ userId: string; transactions: Transaction[] }>('user_transactions');

  const userData = await userCollection.findOne({ userId });

  if (!userData) {
    return null;
  }

  return userData.transactions || [];
}

export async function saveUserTransactions(userId: string, transactions: Transaction[]): Promise<void> {
  const client = getClient();
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME);
  const userCollection = db.collection<{ userId: string; transactions: Transaction[] }>('user_transactions');

  await userCollection.updateOne(
    { userId },
    { $set: { transactions } },
    { upsert: true }
  );
}

export async function deleteUserTransactions(userId: string): Promise<void> {
  const client = getClient();
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME);
  const userCollection = db.collection<{ userId: string; transactions: Transaction[] }>('user_transactions');

  await userCollection.deleteOne({ userId });
}
