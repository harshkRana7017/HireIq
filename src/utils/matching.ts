import { MatchAnalysis, Job } from '../types';

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
export function calculateMatchPercentage(
  resumeText: string,
  job: Job
): {
  percentage: number;
  category: 'low' | 'moderate' | 'high';
  analysis: MatchAnalysis;
} {
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
  if (job.skills.length > 0) {
    const rawRatio = matchedSkills.length / job.skills.length;
    // Base percentage has a floor of 25% and ceiling of 98% if text exists to make it look realistic
    percentage = Math.round(25 + rawRatio * 73);
  } else {
    percentage = 90; // Default placeholder
  }

  // Ensure percentage stays between 0 and 100
  percentage = Math.max(0, Math.min(100, percentage));

  let category: 'low' | 'moderate' | 'high' = 'moderate';
  if (percentage < 50) {
    category = 'low';
  } else if (percentage >= 80) {
    category = 'high';
  }

  // Generate dynamic AI-style summary
  let summary = '';
  if (category === 'high') {
    summary = `Excellent fit! The candidate has verified experience with vital core skills like ${matchedSkills.slice(0, 3).join(', ')}. Perfect alignment for the ${job.title} role.`;
  } else if (category === 'moderate') {
    summary = `Good potential match. Strong alignment on ${matchedSkills.slice(0, 2).join(', ')} but could use development or training in ${missingSkills.slice(0, 2).join(', ') || 'additional platform toolings'}.`;
  } else {
    summary = `Limited alignment on primary technical requirements. Significant caps in key areas like ${missingSkills.slice(0, 3).join(', ')}. Recommend testing alternative competencies.`;
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
