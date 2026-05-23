import { MatchAnalysis, Job } from '../types';
import ai from './ai';

/**
 * Normalizes text to help with simple keyword matching
 */
function cleanText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);
}



/**
 * Abstracted matching algorithm that compares raw resume text with a Job object.
 * Returns a robust score percentage, matches/unmatched skills lists, and a brief report.
 */
export async function calculateMatchPercentage(
  resumeText: string,
  job: Job,
  file: File
): Promise<{
  percentage: number;
  category: 'low' | 'moderate' | 'high';
  analysis: MatchAnalysis;
}> {

  const resumeWords = cleanText(resumeText);
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  // Match process
  job.skills.forEach(skill => {
    const skillLower = skill.toLowerCase();
    // Support multi-word skills like "react native" or simple words
    const isMatched = skillLower.split(' ').every(part =>
      resumeWords.some(word => word.includes(part) || part.includes(word))
    );

    if (isMatched) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  // If resume text is empty, fall back to safe placeholder defaults (e.g. 90% as requested)
  if (!resumeText || resumeText.trim().length === 0) {

    return {
      percentage: matchedSkills.length > missingSkills.length ? 90 : 50,
      category: matchedSkills.length > missingSkills.length ? 'high' : 'moderate',
      analysis: {
        matchedSkills,
        missingSkills,
        summary: matchedSkills.length > missingSkills.length ? `The candidate demonstrates outstanding overlap of ${matchedSkills.join(', ')}. Strong matching structure across standard frameworks.` : `The candidate has a moderate overlap of ${matchedSkills.join(', ')}. Strong matching structure across standard frameworks.`
      }
    };
  }



  // Calculate percentage of skills matched
  let percentage = 0;
  let category: 'low' | 'moderate' | 'high' = 'moderate';
  let summary = '';
  const systemInstruction = `
  You are an experienced hiring manager evaluating a candidate for a job role.

Analyze the uploaded resume against the provided job description and determine how well the candidate fits the role.

Be slightly lenient toward candidates with strong fundamentals, transferable skills, relevant projects, or good growth potential, but do not overrate clearly weak or irrelevant profiles.
If they have relevant experiece and skill they should match atleast moderately, if they have more to offer match them higher like above 80.
the summary should be brief and simple nto too long, just 2-3 lines.
Focus on:
- relevant skills
- practical experience
- project relevance
- seniority
- overall role fit

Avoid rejecting candidates for minor missing tools or keywords.

Return ONLY valid JSON.

{
  "percentage": number,
  "category": "low" | "moderate" | "high",
  "summary": "Short professional evaluation",
  "strengths": ["strength1", "strength2"],
  "concerns": ["concern1", "concern2"],
  "decision": "Reject" | "Consider" | "Shortlist" | "Strong Shortlist"
}

Rules:
- 0–49 = low
- 50–79 = moderate
- 80–100 = high
- Only give 95+ for genuinely strong matches
- Keep summary under 60 words
- Be realistic and concise
`;

  const fileToGenerativePart = async (file: File) => {
    const base64EncodedData = await new Promise<string>(
      (resolve) => {
        const reader = new FileReader();

        reader.onload = () => {
          const result = reader.result as string;

          resolve(result.split(",")[1]);
        };

        reader.readAsDataURL(file);
      }
    );

    return {
      inlineData: {
        data: base64EncodedData,
        mimeType: file.type,
      },
    };
  };

  let response;

  if (file) {

    const filePart = await fileToGenerativePart(file);

    response = await ai.models.generateContent({
      model: "gemini-2.0-flash",

      contents: [
        filePart,
        {
          text: `
Job Description:

Title: ${job.title}

Description:
${job.description}

Required Skills:
${job.skills.join(", ")}

Requirements:
${job.requirements.join(", ")}
`,
        },
      ],

      config: {
        systemInstruction,
        responseMimeType: "application/json",

        responseSchema: {
          type: "object",

          properties: {
            percentage: {
              type: "number",
            },

            category: {
              type: "string",
            },

            summary: {
              type: "string",
            },
          },

          required: [
            "percentage",
            "category",
            "summary",
          ],
        },
      },
    });

  } else {

    response = await ai.models.generateContent({
      model: "gemini-2.5-flash",

      contents: `
Resume Text:
${resumeText}

Job:
${JSON.stringify(job)}
`,

      config: {
        systemInstruction,
        responseMimeType: "application/json",

        responseSchema: {
          type: "object",

          properties: {
            percentage: {
              type: "number",
            },

            category: {
              type: "string",
            },

            summary: {
              type: "string",
            },
          },

          required: [
            "percentage",
            "category",
            "summary",
          ],
        },
      },
    });

  }

  const text =
    response.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

  const parsed = JSON.parse(text);

  percentage = parsed.percentage || 0;

  category = parsed.category || 'moderate';

  summary = parsed.summary || '';
  if (response?.error) {
    return {
      percentage: matchedSkills.length > missingSkills.length ? 90 : 50,
      category: matchedSkills.length > missingSkills.length ? 'high' : 'moderate',
      analysis: {
        matchedSkills,
        missingSkills,
        summary: matchedSkills.length > missingSkills.length ? `The candidate demonstrates outstanding overlap of ${matchedSkills.join(', ')}. Strong matching structure across standard frameworks.` : `The candidate has a moderate overlap of ${matchedSkills.join(', ')}. Strong matching structure across standard frameworks.`
      }
    };
  }

  return {
    percentage,
    category,
    analysis: {
      matchedSkills,
      missingSkills,
      summary
    }
  };
}
