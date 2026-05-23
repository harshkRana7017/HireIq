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
  job: Job
): Promise<{
  percentage: number;
  category: 'low' | 'moderate' | 'high';
  analysis: MatchAnalysis;
}> {
  console.log(resumeText, process.env.OPENAI_API_KEY, "here");
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
  const systemInstruction = `Analyze this resume against the job description. Return a JSON with keys: percentage, category, summary. The category can only be 'low'- if percentage is less than 50, 'moderate'- if percentage is between 50 and 80, or 'high'- if percentage is greater than 80.`;
  const contents = `Resume: ${resumeText}
Job: ${JSON.stringify(job)}
  `
  console.log(contents, "contents")
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contents,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          percentage: { type: "number" },
          category: { type: "string" },
          summary: { type: "string" }
        }
      }
    }
  });

  const text =
    response.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

  const parsed = JSON.parse(text);

  percentage = parsed.percentage || 0;
  category = parsed.category || 'moderate';
  summary = parsed.summary || '';

  console.log(percentage, category, summary, "demo");
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
