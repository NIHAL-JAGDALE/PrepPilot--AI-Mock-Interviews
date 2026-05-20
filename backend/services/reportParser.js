import pool from '../db/index.js';

// ─── REPORT PARSER ────────────────────────────────────────
//
// When the AI outputs "INTERVIEW_COMPLETE", this service:
//   1. Regex-parses the structured final report
//   2. Extracts scores, percentile, strengths, etc.
//   3. Inserts into the reports table
//   4. Updates the session's total_score and status
//
// The AI's output format (from systemPrompt.js):
//   INTERVIEW_COMPLETE
//   OVERALL SCORE: X/100
//   PERCENTILE: Xth percentile
//   ROUND BREAKDOWN:
//   - Introduction (Q1): X/10
//   - DSA Round (Q2-Q4): X/10
//   - CS Fundamentals (Q5-Q6): X/10
//   - Project Deep Dive (Q7-Q8): X/10
//   - HR & Behavioral (Q9-Q10): X/10
//   TOP 3 STRENGTHS: ...
//   TOP 3 AREAS FOR IMPROVEMENT: ...
//   HIRING RECOMMENDATION: STRONG HIRE | HIRE | BORDERLINE | NO HIRE
//   30-DAY STUDY PLAN: ...
// ──────────────────────────────────────────────────────────

/**
 * Parse an AI response that contains INTERVIEW_COMPLETE and
 * extract the structured report data.
 *
 * @param {string} aiResponse - The full AI response text
 * @returns {object|null} Parsed report data, or null if parsing fails
 */
export function parseReport(aiResponse) {
  if (!aiResponse || !aiResponse.includes('INTERVIEW_COMPLETE')) {
    return null;
  }

  try {
    const report = {};

    // ── Overall Score ──
    const scoreMatch = aiResponse.match(/OVERALL\s*SCORE:\s*(\d+)\s*\/\s*100/i);
    report.overall_score = scoreMatch ? parseInt(scoreMatch[1]) : null;

    // ── Percentile ──
    const percentileMatch = aiResponse.match(/PERCENTILE:\s*(\d+)/i);
    report.percentile = percentileMatch ? parseInt(percentileMatch[1]) : null;

    // ── Round Breakdown ──
    // Introduction (Q1)
    const introMatch = aiResponse.match(/Introduction\s*\(Q1\):\s*(\d+)\s*\/\s*10/i);
    report.intro_score = introMatch ? parseInt(introMatch[1]) : null;

    // DSA Round (Q2-Q4)
    const dsaMatch = aiResponse.match(/DSA\s*(?:Round)?\s*\(Q2[-–]Q4\):\s*(\d+(?:\.\d+)?)\s*\/\s*10/i);
    report.dsa_score = dsaMatch ? Math.round(parseFloat(dsaMatch[1])) : null;

    // CS Fundamentals (Q5-Q6)
    const csMatch = aiResponse.match(/CS\s*Fundamentals?\s*\(Q5[-–]Q6\):\s*(\d+(?:\.\d+)?)\s*\/\s*10/i);
    report.cs_score = csMatch ? Math.round(parseFloat(csMatch[1])) : null;

    // Project Deep Dive (Q7-Q8)
    const projectMatch = aiResponse.match(/Project\s*(?:Deep\s*Dive)?\s*\(Q7[-–]Q8\):\s*(\d+(?:\.\d+)?)\s*\/\s*10/i);
    report.project_score = projectMatch ? Math.round(parseFloat(projectMatch[1])) : null;

    // HR & Behavioral (Q9-Q10)
    const hrMatch = aiResponse.match(/HR\s*(?:&|and)?\s*Behavioral?\s*\(Q9[-–]Q10\):\s*(\d+(?:\.\d+)?)\s*\/\s*10/i);
    report.hr_score = hrMatch ? Math.round(parseFloat(hrMatch[1])) : null;

    // ── Strengths ──
    const strengthsMatch = aiResponse.match(
      /TOP\s*3\s*STRENGTHS?:\s*([\s\S]*?)(?=TOP\s*3\s*(?:AREAS?\s*(?:FOR\s*)?IMPROVEMENT|IMPROVEMENT)|HIRING\s*RECOMMENDATION|$)/i
    );
    report.strengths = strengthsMatch
      ? strengthsMatch[1].trim().replace(/^\n+|\n+$/g, '')
      : null;

    // ── Improvements ──
    const improvementsMatch = aiResponse.match(
      /TOP\s*3\s*(?:AREAS?\s*(?:FOR\s*)?)?IMPROVEMENT[S]?:\s*([\s\S]*?)(?=HIRING\s*RECOMMENDATION|$)/i
    );
    report.improvements = improvementsMatch
      ? improvementsMatch[1].trim().replace(/^\n+|\n+$/g, '')
      : null;

    // ── Hiring Recommendation ──
    const hiringMatch = aiResponse.match(
      /HIRING\s*RECOMMENDATION:\s*(STRONG\s*HIRE|HIRE|BORDERLINE|NO\s*HIRE)/i
    );
    report.hiring_recommendation = hiringMatch
      ? hiringMatch[1].trim().toUpperCase()
      : null;

    // ── Study Plan ──
    const studyPlanMatch = aiResponse.match(
      /30[-–]DAY\s*STUDY\s*PLAN:\s*([\s\S]*?)(?=═|$)/i
    );
    report.study_plan = studyPlanMatch
      ? studyPlanMatch[1].trim().replace(/^\n+|\n+$/g, '')
      : null;

    // Validate we got at least some data
    const hasData = report.overall_score !== null || report.hiring_recommendation !== null;

    if (!hasData) {
      console.warn('⚠️ Report parsed but no data extracted. Raw response may not match expected format.');
      return null;
    }

    console.log(`📊 Report parsed successfully:`);
    console.log(`   Overall: ${report.overall_score}/100 (${report.percentile}th percentile)`);
    console.log(`   Recommendation: ${report.hiring_recommendation}`);
    console.log(`   Rounds: Intro=${report.intro_score} DSA=${report.dsa_score} CS=${report.cs_score} Project=${report.project_score} HR=${report.hr_score}`);

    return report;
  } catch (error) {
    console.error('Report parsing error:', error.message);
    return null;
  }
}

/**
 * Parse the AI response and save the report to the database.
 *
 * @param {string} sessionId - Session UUID
 * @param {string} aiResponse - The full AI response containing INTERVIEW_COMPLETE
 * @returns {object|null} The saved report, or null if parsing/saving failed
 */
export async function parseAndSaveReport(sessionId, aiResponse) {
  const reportData = parseReport(aiResponse);

  if (!reportData) {
    console.error(`❌ Failed to parse report for session ${sessionId}`);
    return null;
  }

  try {
    // ── Insert report ──
    const result = await pool.query(
      `INSERT INTO reports (
        session_id, overall_score, percentile,
        intro_score, dsa_score, cs_score, project_score, hr_score,
        strengths, improvements, hiring_recommendation, study_plan
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        sessionId,
        reportData.overall_score,
        reportData.percentile,
        reportData.intro_score,
        reportData.dsa_score,
        reportData.cs_score,
        reportData.project_score,
        reportData.hr_score,
        reportData.strengths,
        reportData.improvements,
        reportData.hiring_recommendation,
        reportData.study_plan,
      ]
    );

    // ── Update session ──
    await pool.query(
      `UPDATE sessions SET status = 'completed', total_score = $1 WHERE id = $2`,
      [reportData.overall_score, sessionId]
    );

    console.log(`✅ Report saved for session ${sessionId}`);

    return result.rows[0];
  } catch (error) {
    console.error(`❌ Failed to save report for session ${sessionId}:`, error.message);
    return null;
  }
}

export default { parseReport, parseAndSaveReport };
