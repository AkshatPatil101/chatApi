import { View, Text, TextInput, Pressable, Alert, ScrollView, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useSignIn, useSignUp } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

type AuthMode = 'signin' | 'signup' | 'verify'

interface Props {
  mode: AuthMode
  setMode: (mode: AuthMode) => void
  onClose: () => void
}

const AuthSheet = ({ mode, setMode, onClose }: Props) => {
  const router = useRouter()
  const { signIn, setActive: setSignInActive, isLoaded: signInLoaded } = useSignIn()
  const { signUp, setActive: setSignUpActive, isLoaded: signUpLoaded } = useSignUp()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  /* ---------- ACTIONS ---------- */

  const signInUser = async () => {
    if (!signInLoaded || loading) return
    setLoading(true)
    try {
      const res = await signIn.create({ identifier: email, password })
      await setSignInActive({ session: res.createdSessionId })
      router.replace('/(tabs)')
    } catch (e: any) {
      Alert.alert('Error', e.errors?.[0]?.message || 'Invalid credentials')
      setLoading(false)
    }
  }

  const signUpUser = async () => {
    if (!signUpLoaded || loading) return
    setLoading(true)
    try {
      await signUp.create({ emailAddress: email, password })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setMode('verify')
    } catch (e: any) {
      Alert.alert('Error', e.errors?.[0]?.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  const verifyEmail = async () => {
    if (!signUpLoaded || loading) return
    setLoading(true)
    try {
      const res = await signUp.attemptEmailAddressVerification({ code })
      if (res.status === 'complete') {
        await setSignUpActive({ session: res.createdSessionId })
        router.replace('/(tabs)')
      }
    } catch (e: any) {
      Alert.alert('Error', e.errors?.[0]?.message || 'Invalid code')
      setLoading(false)
    }
  }

  /* ---------- UI ---------- */

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1A1A1D' }}>
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row justify-between items-center pt-32 mb-6">
          <Text style={{ fontFamily: 'Lora', color: 'white', fontSize: 28 }}>
            {mode === 'signin' && 'Welcome Back'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'verify' && 'Verify Email'}
          </Text>

          <Pressable onPress={onClose} hitSlop={10}>
            <Text style={{ color: '#F4A261', fontSize: 26 }}>×</Text>
          </Pressable>
        </View>

        {mode !== 'verify' && (
          <>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#6B6B70"
              autoCapitalize="none"
              style={input}
            />

            <View style={{ position: 'relative' }}>
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#6B6B70"
                secureTextEntry={!showPassword}
                style={input}
                textContentType="password"
              />

              <Pressable
                onPress={() => setShowPassword(prev => !prev)}
                hitSlop={10}
                style={{ position: 'absolute', right: 16, top: 18 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color="#A0A0A5"
                />
              </Pressable>
            </View>
          </>
        )}

        {mode === 'verify' && (
          <TextInput
            placeholder="Verification Code"
            value={code}
            onChangeText={setCode}
            placeholderTextColor="#6B6B70"
            keyboardType="number-pad"
            style={input}
          />
        )}

        <Pressable
          onPress={
            mode === 'signin'
              ? signInUser
              : mode === 'signup'
              ? signUpUser
              : verifyEmail
          }
          style={[button, loading && { opacity: 0.8 }]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{
              color: 'white',
              textAlign: 'center' as const,
              fontWeight: '600',
              fontSize: 16,
            }}>
              {mode === 'signin' && 'Sign In'}
              {mode === 'signup' && 'Sign Up'}
              {mode === 'verify' && 'Verify Email'}
            </Text>
          )}
        </Pressable>

        {mode !== 'verify' && (
          <Pressable
            onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            hitSlop={{ top: 5, bottom: 5, left: 3, right: 3 }}
          >
            <Text style={{ textAlign: 'center', color: '#A0A0A5', marginTop: 4 }}>
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <Text style={{ color: '#F4A261', fontWeight: '600' }}>
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </Text>
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const input = {
  backgroundColor: '#242428',
  color: 'white',
  padding: 16,
  borderRadius: 12,
  marginBottom: 16,
  fontSize: 16,
}

const button = {
  backgroundColor: '#F4A261',
  padding: 16,
  borderRadius: 12,
  marginBottom: 20,
  alignItems: 'center' as const,
}



export default AuthSheet
