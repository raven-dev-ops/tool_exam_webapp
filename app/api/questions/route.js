// app/api/questions/route.js
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import QuestionSet from "@/lib/models/Question";

export async function GET() {
  try {
    await connectDB();

    // 1) Fetch all question sets
    const allSets = await QuestionSet.find({});

    // 2) We'll create two arrays:
    //    - flattenedQuestions: all question objects (id, text, category)
    //    - categoriesInfo: an array of { category, description }
    let flattenedQuestions = [];
    let categoriesInfo = [];

    allSets.forEach((doc) => {
      // doc => e.g.
      // {
      //   category: "ESTABLISH",
      //   description: "Focuses on your identity in Christ...",
      //   questions: [ { id: 1, text: "..."}, ... ]
      // }

      // Save the category + description in categoriesInfo
      categoriesInfo.push({
        category: doc.category,
        description: doc.description || "",
      });

      // Flatten each question
      doc.questions.forEach((qItem) => {
        flattenedQuestions.push({
          id: qItem.id,       // e.g. 1
          text: qItem.text,   // e.g. "My sense of who I am in Jesus..."
          category: doc.category,
        });
      });
    });

    // 3) Return the data
    const payload = {
      questions: flattenedQuestions,
      categories: categoriesInfo,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/questions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
