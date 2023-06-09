// (1) import Layer
import React from 'react'
import { RadarChart } from 'services/components/radarchart'

// (2) Types Layer
export type ContainerProps = {

}
type Props = {

} & ContainerProps

// (3) Define Global Constants


// (4) DOM Layer
const Component: React.FC<Props> = (props) => (
    <>
        <div className="grid grid-cols-3 gap-4">
            <RadarChart label="Team 0" data={[4, 2, 1, 3, 2, 8, 2, 5]} color='220, 163, 185' />
            <RadarChart label="Team 1" data={[4, 2, 1, 3, 2, 8, 2, 5]} color='223, 162, 154' />
            <RadarChart label="Team 2" data={[4, 2, 1, 3, 2, 8, 2, 5]} color='235, 200, 171' />
            <RadarChart label="Team 3" data={[4, 2, 1, 3, 2, 8, 2, 5]} color='205, 227, 186' />
            <RadarChart label="Team 4" data={[4, 2, 1, 3, 2, 8, 2, 5]} color='142, 219, 199' />
            <RadarChart label="Team 5" data={[4, 2, 1, 3, 2, 8, 2, 5]} color='149, 221, 241' />
            <RadarChart label="Team 6" data={[4, 2, 1, 3, 2, 8, 2, 5]} color='165, 172, 241' />
            <RadarChart label="Team 7" data={[4, 2, 1, 3, 2, 8, 2, 5]} color='196, 168, 243' />
        </div>
    </>
)

// (5) Container Layer
export const Container: React.FC<ContainerProps> = props => {

    return <Component {...props} />
}