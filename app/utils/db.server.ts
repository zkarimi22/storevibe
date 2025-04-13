import { MongoClient, ServerApiVersion } from 'mongodb';
import { setupRateLimitCollection } from './rate-limiter';

// Configure MongoDB
const uri = process.env.MONGODB_URI || "";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Initialize database connection
let isConnected = false;

/**
 * Connect to MongoDB and initialize necessary collections
 */
export async function connectToDatabase() {
  if (!isConnected) {
    try {
      await client.connect();
      console.log("Connected to MongoDB");
      isConnected = true;
      
      // Setup rate limiting collection and indexes
      await setupRateLimitCollection(client);
      
      // Setup indexes for the vibeResults collection
      await setupVibeResultsIndexes(client);
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  }
  
  return {
    db: client.db("storeVibeGenerator"),
    client
  };
}

/**
 * Setup necessary indexes for the vibeResults collection
 */
async function setupVibeResultsIndexes(client: MongoClient): Promise<void> {
  try {
    const db = client.db("storeVibeGenerator");
    const collection = db.collection("vibeResults");
    
    // Create index on seoId field for faster lookups
    await collection.createIndex({ seoId: 1 }, { unique: true });
    
    // Create index on mode field for filtering
    await collection.createIndex({ mode: 1 });
    
    // Create index on createdAt field for sorting
    await collection.createIndex({ createdAt: -1 });
    
    console.log("vibeResults indexes created successfully");
  } catch (error) {
    console.error("Error creating vibeResults indexes:", error);
    // Don't throw the error to prevent app from crashing on startup
  }
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  
  // Try to get IP from common headers
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Get the first IP in case of multiple proxies
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Fallback to a default value if no IP found
  return '127.0.0.1';
} 