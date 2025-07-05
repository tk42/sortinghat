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
    
    // If we have matching results, return the latest one for backward compatibility
    if (result.success && result.data?.matchingResults?.length > 0) {
      return {
        success: true,
        data: { matchingResult: result.data.matchingResults[0] }
      }
    }
    
    return { success: true, data: { matchingResult: null } }
  } catch (error) {
    console.error('Error fetching matching result:', error)
    return { success: false, error: 'Failed to fetch matching result' }
  }
}

/**
 * Fetch all matching results for a survey (history)
 */
export async function fetchMatchingResults(
  surveyId: string
): Promise<{
  success: boolean
  data?: { matchingResults: MatchingResultWithTeams[] }
  error?: string
}> {
  try {
    const res = await fetch(`/api/chat/surveys/${surveyId}/results`)
    const result = await res.json()
    return result
  } catch (error) {
    console.error('Error fetching matching results:', error)
    return { success: false, error: 'Failed to fetch matching results' }
  }
}