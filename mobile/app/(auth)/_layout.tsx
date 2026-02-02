import { View, Text } from 'react-native'
import React from 'react'
import { Redirect, Stack } from 'expo-router'
import  {useAuth} from '@clerk/clerk-expo'


const AuthLayout = () => {

  const { isSignedIn } = useAuth()

  if (!isSignedIn) {
    return <Redirect href={'/(tabs)'} />
  }

  return (
    <Stack screenOptions={{
      headerShown:false
    }}>
      <Stack.Screen name='index'/>
    </Stack>
  )
}

export default AuthLayout