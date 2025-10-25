// import { openai, OPENAI_CONFIG } from "./openai.config";
// import { CandidateRole } from "../../modules/user/user.interface";
// import { logger } from "../logger/logger";

// /**
//  * Profile scoring criteria based on candidate role
//  * Note: Video analysis removed to reduce costs. Focus is on quality of written information.
//  */
// const PROFILE_SCORING_CRITERIA = {
//   [CandidateRole.PROFESSIONAL_PLAYER]: {
//     experience: 35,
//     achievements: 30,
//     details: 25,
//     completeness: 10,
//   },
//   [CandidateRole.AMATEUR_PLAYER]: {
//     potential: 35,
//     training: 30,
//     details: 25,
//     completeness: 10,
//   },
//   [CandidateRole.HIGH_SCHOOL]: {
//     academics: 30,
//     athletics: 35,
//     details: 25,
//     completeness: 10,
//   },
//   [CandidateRole.COLLEGE_UNIVERSITY]: {
//     academics: 30,
//     athletics: 35,
//     details: 25,
//     completeness: 10,
//   },
//   [CandidateRole.ON_FIELD_STAFF]: {
//     experience: 40,
//     certifications: 30,
//     details: 20,
//     completeness: 10,
//   },
//   [CandidateRole.OFFICE_STAFF]: {
//     experience: 40,
//     qualifications: 30,
//     details: 20,
//     completeness: 10,
//   },
// };

// /**
//  * Generate AI profile score for a candidate
//  * @param profileData - The candidate's profile data
//  * @param role - The candidate's role
//  * @returns Promise<number> - Score out of 100
//  */
// export async function generateProfileScore(
//   profileData: Record<string, any>,
//   role: CandidateRole
// ): Promise<number> {
//   try {
//     const criteria = PROFILE_SCORING_CRITERIA[role];
    
//     if (!criteria) {
//       logger.warn(`No scoring criteria found for role: ${role}`);
//       return 0;
//     }

//     // Build the prompt for OpenAI
//     const prompt = buildScoringPrompt(profileData, role, criteria);

//     // Call OpenAI API
//     const completion = await openai.chat.completions.create({
//       model: OPENAI_CONFIG.model,
//       temperature: OPENAI_CONFIG.temperature,
//       max_completion_tokens: OPENAI_CONFIG.maxTokens,
//       messages: [
//         {
//           role: "system",
//           content: `You are an expert soccer/football recruitment analyst. Your task is to evaluate candidate profiles and provide a numerical score out of 100. Be objective, fair, and consistent in your scoring. Return ONLY a number between 0 and 100, nothing else.`,
//         },
//         {
//           role: "user",
//           content: prompt,
//         },
//       ],
//     });

//     // Log the full response for debugging
//     logger.info("OpenAI API Response:", {
//       choices: completion.choices,
//       usage: completion.usage,
//       model: completion.model,
//     });

//     const responseContent = completion.choices[0]?.message?.content?.trim();
    
//     if (!responseContent) {
//       logger.error("OpenAI returned empty response", {
//         fullCompletion: JSON.stringify(completion),
//       });
//       return 0;
//     }

//     // Extract the score from the response
//     const score = parseInt(responseContent, 10);

//     // Validate the score
//     if (isNaN(score) || score < 0 || score > 100) {
//       logger.error(`Invalid score received from OpenAI: ${responseContent}`);
//       return 0;
//     }

//     logger.info(`Generated AI profile score: ${score} for role: ${role}`);
//     return score;
//   } catch (error) {
//     logger.error("Error generating profile score:", error);
//     // Return 0 instead of throwing to prevent profile creation failure
//     return 0;
//   }
// }

// /**
//  * Build the scoring prompt based on profile data and role
//  */
// function buildScoringPrompt(
//   profileData: Record<string, any>,
//   role: CandidateRole,
//   criteria: Record<string, number>
// ): string {
//   const criteriaText = Object.entries(criteria)
//     .map(([key, value]) => `- ${key}: ${value} points`)
//     .join("\n");

//   // Calculate profile completeness
//   const totalFields = Object.keys(profileData).length;
//   const filledFields = Object.values(profileData).filter(
//     (value) => value !== null && value !== undefined && value !== ""
//   ).length;
//   const completenessPercentage = Math.round(
//     (filledFields / totalFields) * 100
//   );

//   // Check for videos (presence only, not analyzed)
//   const hasVideos = profileData.videos && profileData.videos.length > 0;
//   const videoCount = hasVideos ? profileData.videos.length : 0;

//   let prompt = `Evaluate this ${role} soccer candidate profile and provide a score out of 100.

// IMPORTANT: Focus on the QUALITY and DEPTH of the written information provided, not just presence of fields.

// SCORING CRITERIA:
// ${criteriaText}

// PROFILE DATA:
// - Profile Completeness: ${completenessPercentage}% (${filledFields}/${totalFields} fields filled)
// - Has Videos: ${hasVideos ? `Yes (${videoCount})` : "No"} - Note: Videos are NOT analyzed or scored
// `;

//   // Add role-specific details
//   if (
//     role === CandidateRole.PROFESSIONAL_PLAYER ||
//     role === CandidateRole.AMATEUR_PLAYER
//   ) {
//     prompt += `- Position: ${profileData.position || "Not specified"}
// - Current Club: ${profileData.currentClub || "Not specified"}
// - Division: ${profileData.division || "Not specified"}
// - Height: ${profileData.height ? `${profileData.height.size} ${profileData.height.unit}` : "Not specified"}
// - Weight: ${profileData.weight ? `${profileData.weight.size} ${profileData.weight.unit}` : "Not specified"}
// - Foot: ${profileData.foot || "Not specified"}
// - National Team Category: ${profileData.nationalTeamCategory || "Not specified"}
// - Availability: ${profileData.availability || "Not specified"}
// `;
//   } else if (
//     role === CandidateRole.HIGH_SCHOOL ||
//     role === CandidateRole.COLLEGE_UNIVERSITY
//   ) {
//     prompt += `- Position: ${profileData.position || "Not specified"}
// - GPA: ${profileData.gpa || "Not specified"}
// - School/Institution: ${profileData.schoolName || profileData.universityName || "Not specified"}
// - Height: ${profileData.height ? `${profileData.height.size} ${profileData.height.unit}` : "Not specified"}
// - Availability: ${profileData.availability || "Not specified"}
// `;
//   } else if (
//     role === CandidateRole.ON_FIELD_STAFF ||
//     role === CandidateRole.OFFICE_STAFF
//   ) {
//     prompt += `- Position: ${profileData.position || "Not specified"}
// - Years of Experience: ${profileData.yearsOfExperience || "Not specified"}
// - Education Level: ${profileData.educationLevel || "Not specified"}
// - Certifications: ${profileData.certifications || "Not specified"}
// - Current Employer: ${profileData.currentEmployer || "Not specified"}
// `;
//   }

//   prompt += `
// INSTRUCTIONS:
// 1. Evaluate the profile based on the scoring criteria above
// 2. Focus heavily on the QUALITY and DETAIL of information, not just quantity
// 3. Reward profiles with specific, detailed, and relevant information
// 4. Since all required fields must be filled to create a profile, completeness has minimal weight
// 5. Be critical - only exceptional profiles with rich, detailed information should score above 90
// 6. Average profiles with basic information should score around 50-60
// 7. Profiles with exceptional detail and relevant experience should score 70-90
// 8. DO NOT analyze or score videos - they are not part of the evaluation

// Return ONLY a number between 0 and 100. Do not include any explanation or additional text.`;

//   return prompt;
// }

// /**
//  * Batch generate scores for multiple profiles (for future use)
//  */
// export async function batchGenerateProfileScores(
//   profiles: Array<{ data: Record<string, any>; role: CandidateRole }>
// ): Promise<number[]> {
//   const scores = await Promise.all(
//     profiles.map(({ data, role }) => generateProfileScore(data, role))
//   );
//   return scores;
// }

import { openai, OPENAI_CONFIG } from "./openai.config";
import { CandidateRole } from "../../modules/user/user.interface";
import { logger } from "../logger/logger";

/**
 * Profile scoring criteria based on candidate role
 * Videos not analyzed to reduce costs. Focus on written info quality.
 */
const PROFILE_SCORING_CRITERIA = {
  [CandidateRole.PROFESSIONAL_PLAYER]: { experience: 35, achievements: 30, details: 25, completeness: 10 },
  [CandidateRole.AMATEUR_PLAYER]: { potential: 35, training: 30, details: 25, completeness: 10 },
  [CandidateRole.HIGH_SCHOOL]: { academics: 30, athletics: 35, details: 25, completeness: 10 },
  [CandidateRole.COLLEGE_UNIVERSITY]: { academics: 30, athletics: 35, details: 25, completeness: 10 },
  [CandidateRole.ON_FIELD_STAFF]: { experience: 40, certifications: 30, details: 20, completeness: 10 },
  [CandidateRole.OFFICE_STAFF]: { experience: 40, qualifications: 30, details: 20, completeness: 10 },
};

/**
 * Generate AI profile score for a candidate
 */
export async function generateProfileScore(profileData: Record<string, any>, role: CandidateRole): Promise<number> {
  try {
    const criteria = PROFILE_SCORING_CRITERIA[role];
    if (!criteria) {
      logger.warn(`No scoring criteria for role: ${role}`);
      return 0;
    }

    const prompt = buildScoringPrompt(profileData, role, criteria);

    const completion = await openai.chat.completions.create({
      model: OPENAI_CONFIG.model,
      temperature: OPENAI_CONFIG.temperature,
      max_completion_tokens: OPENAI_CONFIG.maxTokens,
      messages: [
        {
          role: "system",
          content: `You are an expert soccer/football recruitment analyst. Evaluate candidate profiles and provide a numerical score out of 100. Be fair, objective, and consistent. Return ONLY a number between 0-100.`,
        },
        { role: "user", content: prompt },
      ],
    });

    const responseContent = completion.choices[0]?.message?.content?.trim();
    if (!responseContent) {
      logger.error("OpenAI returned empty response", { fullCompletion: JSON.stringify(completion) });
      return 0;
    }

    const score = parseInt(responseContent, 10);
    if (isNaN(score) || score < 0 || score > 100) {
      logger.error(`Invalid score from OpenAI: ${responseContent}`);
      return 0;
    }

    logger.info(`Generated AI profile score: ${score} for role: ${role}`);
    return score;
  } catch (error) {
    logger.error("Error generating profile score:", error);
    return 0;
  }
}

/**
 * Build scoring prompt (optimized)
 */
function buildScoringPrompt(profileData: Record<string, any>, role: CandidateRole, criteria: Record<string, number>): string {
  const criteriaText = Object.entries(criteria).map(([k, v]) => `- ${k}: ${v} points`).join("\n");

  const totalFields = Object.keys(profileData).length;
  const filledFields = Object.values(profileData).filter(v => v !== null && v !== undefined && v !== "").length;
  const completenessPercentage = Math.round((filledFields / totalFields) * 100);

  const hasVideos = profileData.videos && profileData.videos.length > 0;
  const videoCount = hasVideos ? profileData.videos.length : 0;

  let prompt = `Evaluate this ${role} soccer candidate profile and provide a score out of 100.

IMPORTANT: Focus on the QUALITY and DEPTH of written information, not just field presence.

SCORING CRITERIA:
${criteriaText}

PROFILE DATA:
- Profile Completeness: ${completenessPercentage}% (${filledFields}/${totalFields} fields filled)
- Has Videos: ${hasVideos ? `Yes (${videoCount})` : "No"} - Videos are NOT scored
`;

  if (role === CandidateRole.PROFESSIONAL_PLAYER || role === CandidateRole.AMATEUR_PLAYER) {
    prompt += `- Position: ${profileData.position || "Not specified"}
- Current Club: ${profileData.currentClub || "Not specified"}
- Division: ${profileData.division || "Not specified"}
- Height: ${profileData.height ? `${profileData.height.size} ${profileData.height.unit}` : "Not specified"}
- Weight: ${profileData.weight ? `${profileData.weight.size} ${profileData.weight.unit}` : "Not specified"}
- Foot: ${profileData.foot || "Not specified"}
- National Team Category: ${profileData.nationalTeamCategory || "Not specified"}
- National Team Games: ${profileData.nationalTeamGames || "Not specified"}
- Clubs Joined: ${profileData.teamsJoined || "Not specified"}
- Agent: ${profileData.agent || "Not specified"}
- Availability: ${profileData.availability || "Not specified"}
`;

    // Additional guidance for AI to give higher scores for top-level experience
    prompt += `
CONSIDERATIONS:
- Give higher weight to players in top leagues (La Liga, Premier League, Serie A)
- Reward national team caps and goals
- Reward complete, detailed profiles with stats, agent, club history, and social media
`;
  }

  prompt += `
INSTRUCTIONS:
1. Score based on criteria above
2. Focus heavily on QUALITY and DETAIL
3. Reward profiles with specific, relevant info
4. Completeness has minimal weight
5. Only exceptional profiles with rich info score >90
6. Average profiles score ~50-60
7. Exceptional profiles with detailed experience should score 70-95
8. DO NOT analyze videos

Return ONLY a number between 0 and 100. No extra text.`;

  return prompt;
}

/**
 * Batch generate scores for multiple profiles
 */
export async function batchGenerateProfileScores(
  profiles: Array<{ data: Record<string, any>; role: CandidateRole }>
): Promise<number[]> {
  const scores = await Promise.all(profiles.map(({ data, role }) => generateProfileScore(data, role)));
  return scores;
}

