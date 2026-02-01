import { View, Text, Pressable, Modal } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import SignUpSheet from '../../components/auth/SignUpSheet'
import SignInSheet from '../../components/auth/SignInSheet'

const AuthScreen = () => {
  const [showSignUp, setShowSignUp] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)

  return (
    <View className='flex-1 bg-surface-dark'>
      <SafeAreaView className='flex-1'>
        <View className='w-full h-1/2 justify-center items-center mt-32'>
          <Image 
            source={require('../../assets/images/phone-chat.png')}
            style={{
              width: 500,
              height: 500, 
              alignSelf:'center'
            }}
            contentFit="contain"
          />
        </View>
        <Text style={{fontFamily:'Lora', color:'white',textAlign:'center',fontSize:34}} >
          Connect & Chat
        </Text>
        <Text style={{color:"#F4A261", textAlign:'center', fontSize:24, marginTop:4}} >
          Seamlessly
        </Text>
        
        <View className='flex-row gap-4 mt-10 px-4'>
          <Pressable
            onPress={() => setShowSignIn(true)}
            className='flex-1 items-center justify-center gap-2 rounded-2xl bg-white py-4 active:opacity-70'
          >
            <Text style={{fontWeight: '600', fontSize: 16, color: '#000'}}>Sign In</Text>
          </Pressable>
          
          <Pressable
            onPress={() => setShowSignUp(true)}
            className='flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-4 active:opacity-70'
          >
            <Text style={{fontWeight: '600', fontSize: 16, color: 'white'}}>Sign Up</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Sign Up Modal */}
      <Modal
        visible={showSignUp}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSignUp(false)}
      >
        <View style={{flex: 1, backgroundColor: '#1A1A1D'}}>
          <SignUpSheet 
            onClose={() => setShowSignUp(false)}
            onSwitchToSignIn={() => {
              setShowSignUp(false)
              setShowSignIn(true)
            }} 
          />
        </View>
      </Modal>

      {/* Sign In Modal */}
      <Modal
        visible={showSignIn}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSignIn(false)}
      >
        <View style={{flex: 1, backgroundColor: '#1A1A1D'}}>
          <SignInSheet 
            onClose={() => setShowSignIn(false)}
            onSwitchToSignUp={() => {
              setShowSignIn(false)
              setShowSignUp(true)
            }} 
          />
        </View>
      </Modal>
    </View>
  )
}

export default AuthScreen;