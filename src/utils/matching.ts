import { MatchAnalysis, Job } from '../types';
import OpenAI from "openai";

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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});



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
  const analysis = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Analyze this resume against the job description. Return a JSON with keys: percentage, category, summary. the category can only be 'low'- if percentage less that 50, 'moderate'- if percentage between 50 and 80, or 'high'- if percentage greater than 80"
      },
      { role: "user", content: `Resume: ${resumeText}\n\nJob: ${JSON.stringify(job)}` }
    ]
  });
  percentage = JSON.parse(analysis.choices[0].message.content || '{}').percentage;
  category = JSON.parse(analysis.choices[0].message.content || '{}').category;
  summary = JSON.parse(analysis.choices[0].message.content || '{}').summary;
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
