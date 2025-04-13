import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { MongoClient, ServerApiVersion } from 'mongodb';

// Configure MongoDB (same as in your generate-vibe file)
const uri = process.env.MONGODB_URI || "";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Initialize database connection
let db: any;
async function connectToDatabase() {
  if (!db) {
    try {
      await client.connect();
      db = client.db("storeVibeGenerator");
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  }
  return db;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('mode');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const page = parseInt(url.searchParams.get('page') || '1');
  const skip = (page - 1) * limit;
  
  try {
    const database = await connectToDatabase();
    const collection = database.collection("vibeResults");
    
    // Build query
    const query: any = { isPublic: true };
    if (mode && ['moodboard', 'city', 'cover'].includes(mode)) {
      query.mode = mode;
    }
    
    // Get total count for pagination
    const totalCount = await collection.countDocuments(query);
    
    // Get results
    const vibes = await collection
      .find(query)
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .toArray();
    
    return json({
      vibes,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching vibes:", error);
    return json(
      { error: "Failed to fetch vibes" },
      { status: 500 }
    );
  }
}
