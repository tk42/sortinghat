import { MatchingResultWithTeams } from '@/src/lib/interfaces'

/**
 * Fetch saved matching result for a survey (latest)
 */
export async function fetchMatchingResult(
  surveyId: string
): Promise<{
  success: boolean
  data?: { matchingResult: MatchingResultWithTeams | null }
  error?: string
}> {
  try {
    const res = await fetch(`/api/chat/surveys/${surveyId}/results`)
    const result = await res.json()
    return result
  } catch (error) {
    console.error('Error fetching matching result:', error)
    return { success: false, error: 'Failed to fetch matching result' }
  }
}