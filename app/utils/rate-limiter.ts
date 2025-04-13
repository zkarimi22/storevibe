import { MongoClient } from 'mongodb';

type RateLimitOptions = {
  limit: number;   // Maximum number of requests
  window: number;  // Time window in milliseconds
}

/**
 * MongoDB-based rate limiter for API endpoints
 */
export async function checkRateLimit(
  ipAddress: string, 
  action: string, 
  options: RateLimitOptions,
  client: MongoClient
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const db = client.db("storeVibeGenerator");
  const collection = db.collection("rateLimits");
  
  // Create a unique key for this IP and action
  const key = `${ipAddress}:${action}`;
  
  // Get the current timestamp
  const now = new Date();
  
  // Calculate the start of the current window
  const windowStart = new Date(now.getTime() - options.window);
  
  // Find existing rate limit document
  const rateLimitDoc = await collection.findOne({ key });
  
  if (!rateLimitDoc) {
    // First request for this IP and action
    await collection.insertOne({
      key,
      count: 1,
      requests: [{ timestamp: now }],
      createdAt: now,
      updatedAt: now
    });
    
    return {
      allowed: true,
      remaining: options.limit - 1,
      resetAt: new Date(now.getTime() + options.window)
    };
  }
  
  // Filter requests within the current window
  const recentRequests = (rateLimitDoc.requests || [])
    .filter((req: any) => new Date(req.timestamp) > windowStart);
  
  // Check if limit is reached
  if (recentRequests.length >= options.limit) {
    // Sort requests to find the oldest one (which determines when the window resets)
    recentRequests.sort((a: any, b: any) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
    // The reset time will be when the oldest request falls out of the window
    const oldestRequest = recentRequests[0];
    const resetAt = new Date(new Date(oldestRequest.timestamp).getTime() + options.window);
    
    return {
      allowed: false,
      remaining: 0,
      resetAt
    };
  }
  
  // Add the current request to the list
  recentRequests.push({ timestamp: now });
  
  // Update the document
  await collection.updateOne(
    { key },
    { 
      $set: {
        requests: recentRequests,
        count: recentRequests.length,
        updatedAt: now
      }
    }
  );
  
  return {
    allowed: true,
    remaining: options.limit - recentRequests.length,
    resetAt: new Date(now.getTime() + options.window)
  };
}

/**
 * Creates ttl index for rate limit collection to automatically remove old entries
 */
export async function setupRateLimitCollection(client: MongoClient): Promise<void> {
  const db = client.db("storeVibeGenerator");
  const collection = db.collection("rateLimits");
  
  // Create TTL index to automatically remove documents after 24 hours
  await collection.createIndex(
    { updatedAt: 1 },
    { expireAfterSeconds: 86400 } // 24 hours
  );
  
  // Create index on the key field for faster lookups
  await collection.createIndex({ key: 1 });
} 