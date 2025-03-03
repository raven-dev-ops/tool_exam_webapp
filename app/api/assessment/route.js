export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Assessment from "@/lib/models/Assessment";
import AssessmentResult from "@/lib/models/AssessmentResult";
import QuestionSet from "@/lib/models/Question";
import User from "@/lib/models/User"; // so we can find firstName, lastName, gender
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Mailjet from "node-mailjet";

export async function POST(request) {
  try {
    // 1) Connect DB
    await connectDB();

    // 2) Check session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 3) Parse body => { answers, email, etc. }
    const body = await request.json();
    const { answers, email } = body || {};

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "Invalid or missing answers. Expecting an object." },
        { status: 400 }
      );
    }

    // Determine final userEmail
    const userEmail = email || session.user?.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: "No user email found" },
        { status: 400 }
      );
    }

    // =============== A) Lookup userDoc => fetch firstName, lastName, gender
    const userDoc = await User.findOne({ email: userEmail });
    const userFirst = userDoc?.firstName || "";
    const userLast = userDoc?.lastName || "";
    const userGender = userDoc?.gender || "";

    // =============== B) Count existing docs => build a sequential number
    const docCount = await Assessment.countDocuments(); 
    const nextAssessmentNum = docCount + 1;             

    // 4) Build question->category map, question text, etc.
    const allSets = await QuestionSet.find();
    let qCategoryMap = {};
    let qTextMap = {};
    let categoryDescriptions = {};

    allSets.forEach((doc) => {
      const catName = doc.category;
      if (doc.description) {
        categoryDescriptions[catName] = doc.description;
      }
      doc.questions.forEach((qItem) => {
        qCategoryMap[qItem.id] = catName;
        qTextMap[qItem.id] = qItem.text;
      });
    });

    // 5) Compute category sums
    const finalScores = computeSums(answers, qCategoryMap);

    // 6) Create doc in "Assessment"
    const newAssessment = await Assessment.create({
      user_id: session.user.id || userEmail,
      answers,
      scores: finalScores,
      created_at: new Date(),
    });

    // 7) Create doc in "AssessmentResult"
    const baseScores = computeBaseScores(answers);
    const categoryScores = finalScores;
    const newResult = await AssessmentResult.create({
      firstName: userFirst,
      lastName: userLast,
      gender: userGender,
      userEmail,
      answers,
      scores: {
        ...baseScores,
        categoryScores,
      },
      submittedBy: session.user?.id || null,
      date: new Date(),
    });

    // 8) (Optional) Send email via Mailjet => to process.env.REPORT_TO_EMAIL
    if (process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY) {
      const mailjetClient = Mailjet.apiConnect(
        process.env.MAILJET_API_KEY,
        process.env.MAILJET_SECRET_KEY
      );

      const fromEmail =
        process.env.MAILJET_FROM_EMAIL || "noreply@yourdomain.com";
      const toEmail =
        process.env.REPORT_TO_EMAIL || "info.discipleship.tool@gmail.com";

      // (A) Build Pie chart link with QuickChart => legend on left, stacked
      const categoriesArr = Object.keys(finalScores);
      const scoresArr = categoriesArr.map((cat) => Number(finalScores[cat]));
      const chartData = {
        type: "pie",
        data: {
          labels: categoriesArr,
          datasets: [{ data: scoresArr }],
        },
        options: {
          plugins: {
            legend: {
              display: true,
              position: "left", // place legend on left
              align: "start",  // stack legend items vertically
            },
          },
        },
      };
      const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(
        JSON.stringify(chartData)
      )}`;

      // (B) Find the lowest & highest categories
      let catEntries = Object.entries(finalScores).map(([k, v]) => [k, Number(v)]);
      catEntries.sort((a, b) => a[1] - b[1]); // ascending
      const [lowestCat, lowestVal] = catEntries[0] || ["N/A", 0];
      const [highestCat, highestVal] =
        catEntries[catEntries.length - 1] || ["N/A", 0];

      const lowestSummary =
        categoryDescriptions[lowestCat] || "No summary for that category";
      const highestSummary =
        categoryDescriptions[highestCat] || "No summary for that category";

      // (C) Build Q&A table
      let qaTable = `<table border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse;margin-top:1rem;">
        <thead style="background:#eee;">
          <tr><th style="padding:5px 10px;">Question</th>
              <th style="padding:5px 10px;">Answer</th></tr>
        </thead>
        <tbody>`;
      for (const qId of Object.keys(answers)) {
        const txt = qTextMap[qId] || "Unknown question";
        const ans = answers[qId];
        qaTable += `
          <tr>
            <td style="padding:5px 10px;">${txt}</td>
            <td style="padding:5px 10px;">${ans}</td>
          </tr>`;
      }
      qaTable += "</tbody></table>";

      // (D) Build final HTML
      const htmlContent = `
        <h2 style="margin-bottom:0.5rem;">New Assessment Submission</h2>
        <p><strong>Name:</strong> ${userFirst} ${userLast}</p>
        <p><strong>Gender:</strong> ${userGender}</p>
        <p><strong>Email:</strong> ${userEmail}</p>

        <hr style="margin:1rem 0;" />

        <p><strong>All Scores:</strong> ${JSON.stringify(finalScores)}</p>
        <p><strong>Highest Category:</strong> ${highestCat} (${highestVal})<br/>
           <em>${highestSummary}</em></p>
        <p><strong>Lowest Category:</strong> ${lowestCat} (${lowestVal})<br/>
           <em>${lowestSummary}</em></p>

        <p><img src="${chartUrl}" alt="Pie Chart of Scores" /></p>

        <hr style="margin:1rem 0;" />

        <p><strong>Answers:</strong></p>
        ${qaTable}
      `;

      // (E) Subject line => "Discipleship Assessment #NNN from FirstName LastName"
      const subjectLine = `Discipleship Assessment #${String(nextAssessmentNum).padStart(
        3,
        "0"
      )} from ${userFirst} ${userLast}`;

      const requestBody = {
        Messages: [
          {
            From: { Email: fromEmail, Name: "Assessment Tool" },
            To: [{ Email: toEmail, Name: "Report Recipient" }],
            Subject: subjectLine,
            HTMLPart: htmlContent,
          },
        ],
      };

      try {
        const mjResponse = await mailjetClient
          .post("send", { version: "v3.1" })
          .request(requestBody);

        console.log("Mailjet response =>", mjResponse.body);
      } catch (mailErr) {
        console.error("Mailjet error =>", mailErr);
      }
    }

    // 9) Return success => doc IDs, etc.
    return NextResponse.json(
      {
        success: true,
        assessmentId: newAssessment._id,
        resultId: newResult._id,
        message: "Assessment created in both collections & email sent (if configured).",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error in POST /api/assessment:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ============== GET: fetch newest from Assessment ==============
export async function GET() {
  try {
    await connectDB();
    const docs = await Assessment.find({}).sort({ created_at: -1 });
    return NextResponse.json(docs, { status: 200 });
  } catch (err) {
    console.error("Error in GET /api/assessment:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ============== HELPER 1: Simple category sums ==============
function computeSums(answers, qCategoryMap) {
  let sums = {};

  for (const qId in answers) {
    const numericVal = parseInt(answers[qId], 10) || 0;
    const cat = qCategoryMap[qId];
    if (cat) {
      if (!sums[cat]) sums[cat] = 0;
      sums[cat] += numericVal;
    }
  }

  let finalScores = {};
  for (const catKey in sums) {
    finalScores[catKey] = String(sums[catKey]);
  }
  return finalScores;
}

// ============== HELPER 2: Base numeric summary ==============
function computeBaseScores(answers) {
  let total = 0;
  let count = 0;
  for (const key of Object.keys(answers || {})) {
    const val = Number(answers[key]);
    if (!isNaN(val)) {
      total += val;
      count++;
    }
  }
  const average = count ? (total / count).toFixed(2) : 0;
  return { total, average };
}
