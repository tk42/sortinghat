// (1) import Layer
import React from 'react'

// (2) Types Layer
export type ContainerProps = {

}
type Props = {

} & ContainerProps

// (3) Define Global Constants


// (4) DOM Layer
const Component: React.FC<Props> = props => (
    <>
        <div className="flex h-screen">
            <div className="m-auto text-center">
                <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent" />
            </div>
        </div>
    </>
)

// (5) Container Layer
export const Container: React.FC<ContainerProps> = props => {

    return <Component {...props} />
}