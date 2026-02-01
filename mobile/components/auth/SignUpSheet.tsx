// components/auth/SignUpSheet.tsx
import { View, Text, TextInput, Pressable, Alert, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { useSignUp } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

interface SignUpSheetProps {
  onSwitchToSignIn: () => void
  onClose?: () => void  // Add this
}

const SignUpSheet = ({ onSwitchToSignIn, onClose }: SignUpSheetProps) => {
  const { signUp, setActive, isLoaded } = useSignUp()
  const router = useRouter()
  
  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')

  const onSignUpPress = async () => {
    if (!isLoaded) return

    try {
      await signUp.create({
        emailAddress,
        password,
      })

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
    } catch (err: any) {
      Alert.alert('Error', err.errors[0]?.message || 'Something went wrong')
    }
  }

  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId })
        router.replace('/(tabs)')
      }
    } catch (err: any) {
      Alert.alert('Error', err.errors[0]?.message || 'Invalid code')
    }
  }

  if (pendingVerification) {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#1A1A1D'}}>
        <ScrollView className='flex-1 px-6' showsVerticalScrollIndicator={false}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, marginBottom: 10}}>
            <Text style={{fontFamily:'Lora', color:'white', fontSize:28}}>
              Verify Email
            </Text>
            {onClose && (
              <Pressable onPress={onClose} style={{padding: 8}}>
                <Text style={{color:'#F4A261', fontSize:24, fontWeight: '300'}}>×</Text>
              </Pressable>
            )}
          </View>
          
          <Text style={{color:'#A0A0A5', marginBottom:20, fontSize:14}}>
            Enter the verification code sent to {emailAddress}
          </Text>
          
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="Verification Code"
            placeholderTextColor="#6B6B70"
            style={{
              backgroundColor: '#242428',
              color: 'white',
              padding: 16,
              borderRadius: 12,
              marginBottom: 16,
              fontSize: 16
            }}
            keyboardType="number-pad"
          />
          
          <Pressable
            onPress={onVerifyPress}
            style={{
              backgroundColor: '#F4A261',
              padding: 16,
              borderRadius: 12,
              marginBottom: 16
            }}
            className='active:opacity-70'
          >
            <Text style={{color:'white', textAlign:'center', fontWeight:'600', fontSize:16}}>
              Verify Email
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#1A1A1D'}}>
      <ScrollView className='flex-1 px-6' showsVerticalScrollIndicator={false}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, marginBottom: 10}}>
          <Text style={{fontFamily:'Lora', color:'white', fontSize:28}}>
            Create Account
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
          onPress={onSignUpPress}
          style={{
            backgroundColor: '#F4A261',
            padding: 16,
            borderRadius: 12,
            marginBottom: 16
          }}
          className='active:opacity-70'
        >
          <Text style={{color:'white', textAlign:'center', fontWeight:'600', fontSize:16}}>
            Sign Up
          </Text>
        </Pressable>

        <Pressable onPress={onSwitchToSignIn}>
          <Text style={{color:'#A0A0A5', textAlign:'center', fontSize:14}}>
            Already have an account? <Text style={{color:'#F4A261', fontWeight:'600'}}>Sign In</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignUpSheet