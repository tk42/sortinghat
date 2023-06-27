// (1) import Layer
import React from 'react'
import { RadarChart } from 'components/radarchart'
import { Survey, Team, MIScore, Flavor } from 'services/types/interfaces'
import { createGradient, START_RGB, END_RGB, RGB, rgbToString } from 'services/libs/gradation';

// (2) Types Layer
export type ContainerProps = {
    survey?: Survey
}
type Props = {
    colors: RGB[]
} & ContainerProps

// (3) Define Global Constants
function MIScoreByTeam(team: Team): MIScore {
    let score: MIScore = [0, 0, 0, 0, 0, 0, 0, 0]
    for (var ts of team.teams_students) {
        const sf: Flavor = ts.student!.student_flavors![0].flavor
        score[0] += sf.mi_a
        score[1] += sf.mi_b
        score[2] += sf.mi_c
        score[3] += sf.mi_d
        score[4] += sf.mi_e
        score[5] += sf.mi_f
        score[6] += sf.mi_g
        score[7] += sf.mi_h
    }
    return score
}

// (4) DOM Layer
const Component: React.FC<Props> = (props) => (
    <>
        <div className="grid grid-cols-3 gap-4">
            {
                props.survey!.teams!.map((team: Team, index) => {
                    return <RadarChart
                        label={`Team ${index} (${team.teams_students.map((v) => v.student.name).join("-")})`}
                        data={MIScoreByTeam(team)}
                        color={rgbToString(props.colors[index])}
                    />
                })
            }
        </div>
    </>
)

// (5) Container Layer
export const Container: React.FC<ContainerProps> = props => {
    if (props.survey === undefined) {
        return <></>
    }
    const colors: RGB[] = createGradient(START_RGB, END_RGB, props.survey!.teams!.length)
    return <Component {...{ ...props, colors }} />
}