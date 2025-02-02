// (1) import Layer
import React from 'react'
import Image from 'next/image'

// (2) Types Layer
export type ContainerProps = {
    brand: boolean
}
type Props = {

} & ContainerProps

// (3) Define Global Constants


// (4) DOM Layer


// (5) Container Layer
export const Container = (props: ContainerProps) => {
    return props.brand ? (
       <Image 
         src="/logo.png" 
         width={256} 
         height={256} 
         alt="Synergy MatchMaker" 
         priority
       /> 
     ) : (
        <Image 
          src="/logo_nobrand.png" 
          width={64} 
          height={64} 
          alt="Synergy MatchMaker"
          style={{
            width: '100%',
            height: 'auto',
            maxWidth: '64px'
          }}
        />
    )
}