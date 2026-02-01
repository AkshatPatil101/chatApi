// components/auth/SignInSheet.tsx
import { View, Text, TextInput, Pressable, Alert, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { useSignIn } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

interface SignInSheetProps {
  onSwitchToSignUp: () => void
  onClose?: () => void  // Add this
}

const SignInSheet = ({ onSwitchToSignUp, onClose }: SignInSheetProps) => {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()
  
  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')

  const onSignInPress = async () => {
    if (!isLoaded) return

    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      })

      await setActive({ session: completeSignIn.createdSessionId })
      router.replace('/(tabs)')
    } catch (err: any) {
      Alert.alert('Error', err.errors[0]?.message || 'Invalid credentials')
    }
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#1A1A1D'}}>
      <ScrollView className='flex-1 px-6' showsVerticalScrollIndicator={false}>
        {/* Header with close button */}
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, marginBottom: 10}}>
          <Text style={{fontFamily:'Lora', color:'white', fontSize:28}}>
            Welcome Back
          </Text>
          {onClose && (
            <Pressable onPress={onClose} style={{padding: 8}}>
              <Text style={{color:'#F4A261', fontSize:24, fontWeight: '300'}}>×</Text>
            </Pressable>
          )}
        </View>
        
        <TextInput
          value={emailAddress}
          onChangeText={setEmailAddress}
          placeholder="Email"
          placeholderTextColor="#6B6B70"
          style={{
            backgroundColor: '#242428',
            color: 'white',
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
            fontSize: 16
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#6B6B70"
          style={{
            backgroundColor: '#242428',
            color: 'white',
            padding: 16,
            borderRadius: 12,
            marginBottom: 24,
            fontSize: 16
          }}
          secureTextEntry
        />
        
        <Pressable
          onPress={onSignInPress}
          style={{
            backgroundColor: '#F4A261',
            padding: 16,
            borderRadius: 12,
            marginBottom: 16
          }}
          className='active:opacity-70'
        >
          <Text style={{color:'white', textAlign:'center', fontWeight:'600', fontSize:16}}>
            Sign In
          </Text>
        </Pressable>

        <Pressable onPress={onSwitchToSignUp}>
        <Text style={{color:'#A0A0A5', textAlign:'center', fontSize:14}}>
        Don&apos;t have an account? <Text style={{color:'#F4A261', fontWeight:'600'}}>Sign Up</Text>
        </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignInSheet