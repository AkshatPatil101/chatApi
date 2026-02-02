import { View, Text, Pressable, Modal } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import AuthSheet from '../../components/auth/AuthSheet'

type AuthMode = 'signin' | 'signup' | 'verify'

const AuthScreen = () => {
  const [showAuth, setShowAuth] = useState(false)
  const [mode, setMode] = useState<AuthMode>('signin')

  return (
    <View className="flex-1 bg-surface-dark">
      <SafeAreaView className="flex-1">
        <View className="w-full h-1/2 justify-center items-center mt-32">
          <Image
            source={require('../../assets/images/phone-chat.png')}
            style={{ width: 500, height: 500 }}
            contentFit="contain"
          />
        </View>

        <Text style={{ fontFamily: 'Lora', color: 'white', textAlign: 'center', fontSize: 34 }}>
          Connect & Chat
        </Text>
        <Text style={{ color: '#F4A261', textAlign: 'center', fontSize: 24, marginTop: 4 }}>
          Seamlessly
        </Text>

        <View className="flex-row gap-4 mt-10 px-4">
          <Pressable
            onPress={() => {
              setMode('signin')
              setShowAuth(true)
            }}
            className="flex-1 rounded-2xl bg-white py-4 items-center active:opacity-70"
          >
            <Text style={{ fontWeight: '600', fontSize: 16 }}>Sign In</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setMode('signup')
              setShowAuth(true)
            }}
            className="flex-1 rounded-2xl bg-primary py-4 items-center active:opacity-70"
          >
            <Text style={{ fontWeight: '600', fontSize: 16, color: 'white' }}>Sign Up</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* SINGLE MODAL */}
      <Modal
        visible={showAuth}
        animationType="fade"
        presentationStyle="formSheet"
        onRequestClose={() => setShowAuth(false)}
      >
        <AuthSheet
          mode={mode}
          setMode={setMode}
          onClose={() => setShowAuth(false)}
        />
      </Modal>
    </View>
  )
}

export default AuthScreen
