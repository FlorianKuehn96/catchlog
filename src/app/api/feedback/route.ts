import { NextRequest, NextResponse } from "next/server";
import { getRedis, keys } from "@/lib/redis";

// POST /api/feedback - Feedback speichern
export async function POST(request: NextRequest) {
  try {
    const { rating, category, feedback, userEmail, timestamp } = await request.json();

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Bewertung erforderlich (1-5 Sterne)" },
        { status: 400 }
      );
    }

    if (!category || !feedback.trim()) {
      return NextResponse.json(
        { error: "Kategorie und Feedback-Text erforderlich" },
        { status: 400 }
      );
    }

    // Create feedback object
    const feedbackData = {
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      rating,
      category,
      feedback: feedback.trim(),
      userEmail: userEmail || "anonymous",
      timestamp: timestamp || new Date().toISOString(),
      userAgent: request.headers.get("user-agent") || "unknown",
    };

    // Save to Redis
    const redis = getRedis();
    const feedbackKey = `feedback:${feedbackData.id}`;
    await redis.set(feedbackKey, JSON.stringify(feedbackData));

    // Add to feedback index
    await redis.sadd("feedback:all", feedbackData.id);

    // Add to category index
    await redis.sadd(`feedback:category:${category}`, feedbackData.id);

    // Add to rating index
    await redis.sadd(`feedback:rating:${rating}`, feedbackData.id);

    // Track daily feedback count
    const today = new Date().toISOString().split("T")[0];
    await redis.incr(`feedback:count:${today}`);

    console.log("Feedback received:", {
      rating,
      category,
      user: userEmail || "anonymous",
      timestamp: feedbackData.timestamp,
    });

    return NextResponse.json({
      success: true,
      message: "Feedback gespeichert",
      id: feedbackData.id,
    });
  } catch (error) {
    console.error("Error saving feedback:", error);
    return NextResponse.json(
      { error: "Feedback konnte nicht gespeichert werden" },
      { status: 500 }
    );
  }
}

// GET /api/feedback - Get all feedback (for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const rating = searchParams.get("rating");
    const limit = parseInt(searchParams.get("limit") || "50");

    const redis = getRedis();
    let feedbackIds: string[] = [];

    // Get feedback IDs based on filter
    if (category) {
      feedbackIds = await redis.smembers(`feedback:category:${category}`);
    } else if (rating) {
      feedbackIds = await redis.smembers(`feedback:rating:${rating}`);
    } else {
      feedbackIds = await redis.smembers("feedback:all");
    }

    // Sort by timestamp (newest first)
    feedbackIds.sort().reverse();

    // Limit results
    feedbackIds = feedbackIds.slice(0, limit);

    // Get full feedback data
    const feedbacks = await Promise.all(
      feedbackIds.map(async (id) => {
        const data = await redis.get(`feedback:${id}`);
        return data ? JSON.parse(data as string) : null;
      })
    );

    // Filter out nulls and sort by timestamp
    const validFeedbacks = feedbacks
      .filter((f) => f !== null)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

    // Get statistics
    const totalCount = await redis.scard("feedback:all");
    const categoryCounts = await Promise.all(
      ["bug", "feature", "improvement", "general"].map(async (cat) => ({
        category: cat,
        count: await redis.scard(`feedback:category:${cat}`),
      }))
    );

    const ratingCounts = await Promise.all(
      [1, 2, 3, 4, 5].map(async (r) => ({
        rating: r,
        count: await redis.scard(`feedback:rating:${r}`),
      }))
    );

    // Calculate average rating
    const totalRatings = ratingCounts.reduce((sum, r) => sum + r.count, 0);
    const weightedSum = ratingCounts.reduce(
      (sum, r) => sum + r.rating * r.count,
      0
    );
    const averageRating = totalRatings > 0 ? weightedSum / totalRatings : 0;

    return NextResponse.json({
      feedbacks: validFeedbacks,
      stats: {
        total: totalCount,
        categories: categoryCounts,
        ratings: ratingCounts,
        averageRating: Math.round(averageRating * 10) / 10,
      },
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Feedback konnte nicht geladen werden" },
      { status: 500 }
    );
  }
}
