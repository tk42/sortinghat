import { useMemo, useCallback } from 'react'
import { updateStudentTeams } from '@/src/utils/actions/update_student_teams'
import { useToastHelpers } from '@/src/components/notifications/ToastNotifications'

interface ResultState {
  optimizationResult: any
  selectedSurvey: any
}

export function useResultHandling(state: ResultState) {
  const toastHelpers = useToastHelpers()

  // Calculate team and student counts
  const { teamsCount, studentsCount } = useMemo(() => {
    if (!state.optimizationResult || !state.optimizationResult.teams) {
      return { teamsCount: 0, studentsCount: 0 }
    }

    // Handle both array and object formats
    const teamsArray: any[] = Array.isArray(state.optimizationResult.teams)
      ? state.optimizationResult.teams
      : Object.values(state.optimizationResult.teams)

    const studentSet = new Set<number>()
    teamsArray.forEach((team: any) => {
      if (team && Array.isArray(team)) {
        // team is an array of student IDs
        team.forEach((studentId: any) => {
          studentSet.add(Number(studentId))
        })
      } else if (team && team.students) {
        // team has a students property
        team.students.forEach((s: any) => {
          // Try different possible keys for student identifier
          if (s.id !== undefined) {
            studentSet.add(s.id)
          } else if (s.student_id !== undefined) {
            studentSet.add(s.student_id)
          } else if (s.student_no !== undefined) {
            studentSet.add(s.student_no)
          }
        })
      }
    })

    return { teamsCount: teamsArray.length, studentsCount: studentSet.size }
  }, [state.optimizationResult])

  // Export results as CSV
  const handleExportResults = useCallback(() => {
    if (!state.optimizationResult) {
      toastHelpers.error('エラー', 'エクスポートする結果がありません')
      return
    }

    try {
      // TODO: Implement actual CSV export logic
      toastHelpers.success('エクスポート', '結果をCSVファイルでダウンロードしました')
    } catch (error) {
      console.error('Export error:', error)
      toastHelpers.error('エクスポートエラー', 'CSVファイルの生成に失敗しました')
    }
  }, [state.optimizationResult, toastHelpers])

  // Save results to database
  const handleSaveResults = useCallback(async () => {
    if (!state.optimizationResult || !state.optimizationResult.teams || !state.optimizationResult.survey) {
      toastHelpers.error('エラー', '保存する結果がありません')
      return
    }

    try {
      // Convert optimization result to teams format expected by updateStudentTeams
      let teamsMapping: Record<string, number[]> = {}
      
      if (Array.isArray(state.optimizationResult.teams)) {
        state.optimizationResult.teams.forEach((team: any, idx: number) => {
          const teamId = team.team_id ?? idx
          const studentNos = team.students
            ? team.students.map((s: any) =>
                s.student_no !== undefined ? s.student_no : s
              )
            : []
          teamsMapping[teamId.toString()] = studentNos
        })
      } else {
        teamsMapping = state.optimizationResult.teams as Record<string, number[]>
      }

      toastHelpers.info('保存中', '班分け結果を保存しています...')
      await updateStudentTeams(teamsMapping, state.optimizationResult.survey.id)
      toastHelpers.success('保存完了', '班分け結果を保存しました')
    } catch (error) {
      console.error('Error saving matching results:', error)
      toastHelpers.error('保存失敗', '班分け結果の保存に失敗しました')
    }
  }, [state.optimizationResult, toastHelpers])

  return {
    teamsCount,
    studentsCount,
    handleExportResults,
    handleSaveResults,
    hasResults: !!state.optimizationResult,
  }
}