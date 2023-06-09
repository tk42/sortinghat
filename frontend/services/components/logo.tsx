// (1) import Layer
import React from 'react'
import Image from 'next/image'

// (2) Types Layer
export type ContainerProps = {

}
type Props = {

} & ContainerProps

// (3) Define Global Constants


// (4) DOM Layer
const Component: React.FC<Props> = (props) => (
    <>
        <Image src="/logo_nobrand.png" width={64} height={64} alt="Synergy MatchMaker" />
        <span className="text-2xl font-thin ml-4 leading-9 tracking-tight text-blue-900">Synergy MatchMaker</span>
    </>
)

// (5) Container Layer
export const Logo: React.FC<ContainerProps> = props => {
    return <Component {...props} />
}