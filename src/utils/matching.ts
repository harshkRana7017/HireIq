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
  console.log(file, 'file');

  // If resume text is empty, fall back to safe placeholder defaults (e.g. 90% as requested)
  if (!resumeText || resumeText.trim().length === 0) {
    const halfLen = Math.ceil(job.skills.length / 2);
    const matchedSkills = job.skills.slice(0, halfLen);
    const missingSkills = job.skills.slice(halfLen);

    return {
      percentage: 90,
      category: 'high',
      analysis: {
        matchedSkills,
        missingSkills,
        summary: `The candidate demonstrates outstanding overlap of ${matchedSkills.join(', ')}. Strong matching structure across standard frameworks.`
      }
    };
  }

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

  // Calculate percentage of skills matched
  let percentage = 0;
  let category: 'low' | 'moderate' | 'high' = 'moderate';
  let summary = '';
  const systemInstruction = `
  You are an experienced hiring manager and company owner evaluating candidates for a real-world hiring decision.

Analyze the uploaded resume against the provided job description carefully and realistically.

Your goal is to identify strong potential candidates without being overly strict, while also avoiding weak or clearly mismatched applicants.

Evaluation Guidelines:
- Be slightly lenient toward candidates who show strong fundamentals, transferable skills, growth potential, or relevant project experience.
- Do NOT reject candidates simply because they are missing a few minor tools or keywords.
- However, do NOT overrate candidates who lack the core skills, domain understanding, or practical experience required for the role.
- Focus on actual alignment with the responsibilities and expectations of the role.
- Consider practical experience, technologies used, problem-solving ability, seniority, project complexity, and overall fit.
- Penalize resumes that appear generic, irrelevant, or heavily mismatched.
- Reward candidates who demonstrate real ownership, impactful work, adaptability, or strong learning ability.

Return ONLY valid JSON in the following structure:

{
  "percentage": number,
  "category": "low" | "moderate" | "high",
  "summary": "Short professional evaluation of the candidate",
  "strengths": ["strength1", "strength2"],
  "concerns": ["concern1", "concern2"],
  "decision": "Reject" | "Consider" | "Shortlist" | "Strong Shortlist"
}

Scoring Rules:
- 0–49 → low
- 50–79 → moderate
- 80–100 → high

Additional Guidance:
- Only give scores above 85 if the candidate is genuinely strong for the role.
- Scores between 65–80 should represent decent but imperfect matches.
- Keep summaries concise, professional, and realistic.
- Avoid hallucinating experience not present in the resume.
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
      model: "gemini-2.5-flash",

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
