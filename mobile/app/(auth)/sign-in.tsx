import { useSignIn } from '@clerk/clerk-expo'
import type { EmailCodeFactor } from '@clerk/types'
import { Link, useRouter } from 'expo-router'
import * as React from 'react'
import { Pressable, StyleSheet, TextInput, View, Text, ActivityIndicator } from 'react-native'

export default function SignInPage() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [code, setCode] = React.useState('')
  const [showEmailCode, setShowEmailCode] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const onSignInPress = React.useCallback(async () => {
    if (!isLoaded) return
    setLoading(true)
    try {
      const signInAttempt = await signIn.create({ identifier: emailAddress, password })

      if (signInAttempt.status === 'complete') {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: () => router.replace('/(tabs)'),
        })
      } else if (signInAttempt.status === 'needs_second_factor') {
        const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
          (factor): factor is EmailCodeFactor => factor.strategy === 'email_code',
        )
        if (emailCodeFactor) {
          await signIn.prepareSecondFactor({ strategy: 'email_code', emailAddressId: emailCodeFactor.emailAddressId })
          setShowEmailCode(true)
        }
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
    } finally {
      setLoading(false)
    }
  }, [isLoaded, emailAddress, password])

  const onVerifyPress = React.useCallback(async () => {
    if (!isLoaded) return
    setLoading(true)
    try {
      const signInAttempt = await signIn.attemptSecondFactor({ strategy: 'email_code', code })
      if (signInAttempt.status === 'complete') {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: () => router.replace('/(tabs)'),
        })
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
    } finally {
      setLoading(false)
    }
  }, [isLoaded, code])

  if (showEmailCode) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Verify your email</Text>
        <TextInput
          style={styles.input}
          value={code}
          placeholder="Verification code"
          placeholderTextColor="#666"
          onChangeText={setCode}
          keyboardType="numeric"
        />
        <Pressable style={styles.button} onPress={onVerifyPress}>
          <Text style={styles.buttonText}>Verify</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Email"
        placeholderTextColor="#666"
        onChangeText={setEmailAddress}
      />
      <TextInput
        style={styles.input}
        value={password}
        placeholder="Password"
        placeholderTextColor="#666"
        secureTextEntry
        onChangeText={setPassword}
      />
      <Pressable style={styles.button} onPress={onSignInPress}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Sign In</Text>}
      </Pressable>
      <Link href="/sign-up" style={{ marginTop: 15 }}>
        <Text style={{ color: '#F4A261' }}> Dont have Sign up</Text>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#1A1A1D', justifyContent: 'center' },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: '#242428', color: 'white', padding: 16, borderRadius: 12, marginBottom: 12 },
  button: { backgroundColor: '#F4A261', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' }
})