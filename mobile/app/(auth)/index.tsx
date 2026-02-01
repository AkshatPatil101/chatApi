import { View, Text, Pressable, Modal } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'

const AuthScreen = () => {

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
      </SafeAreaView>
    </View>
  )
}

export default AuthScreen;