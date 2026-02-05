import { useSignUp } from '@clerk/clerk-expo'
import { useRouter, Link } from 'expo-router'
import React, { useState } from 'react'
import { Text, TextInput, View, Pressable, ActivityIndicator, Alert, StyleSheet } from 'react-native'

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return
    setLoading(true)
    try {
      await signUp.create({
        emailAddress,
        password,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Show the verification field
      setPendingVerification(true)
    } catch (err: any) {
      Alert.alert('Error', err.errors?.[0]?.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return
    setLoading(true)
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (signUpAttempt.status === 'complete') {
        await setActive({
          session: signUpAttempt.createdSessionId,
          navigate: () => router.replace('/(tabs)'),
        })
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err: any) {
      Alert.alert('Error', 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      {!pendingVerification ? (
        <>
          <Text style={styles.title}>Create Account</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Email"
            placeholderTextColor="#666"
            onChangeText={setEmailAddress}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            value={password}
            placeholder="Password"
            placeholderTextColor="#666"
            secureTextEntry={true}
            onChangeText={setPassword}
          />
          <Pressable 
            style={[styles.button, (!emailAddress || !password) && { opacity: 0.5 }]} 
            onPress={onSignUpPress}
            disabled={!emailAddress || !password || loading}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Continue</Text>}
          </Pressable>
          
          <Link href="/(auth)/sign-in" style={{ marginTop: 20 }}>
            <Text style={{ color: '#F4A261' }}>Already have an account? Sign in</Text>
          </Link>
        </>
      ) : (
        <>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>Enter the code sent to {emailAddress}</Text>
          <TextInput
            style={styles.input}
            value={code}
            placeholder="Enter verification code"
            placeholderTextColor="#666"
            onChangeText={setCode}
            keyboardType="numeric"
          />
          <Pressable style={styles.button} onPress={onVerifyPress} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Verify</Text>}
          </Pressable>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#1A1A1D',
    justifyContent: 'center',
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#A0A0A5',
    fontSize: 14,
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#242428',
    color: 'white',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#F4A261',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
})