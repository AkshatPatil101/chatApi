import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context' // Import from here!

const ChatsTab = () => {
  return (
    <SafeAreaView className='bg-surface flex-1' edges={['top']}>
      <ScrollView className='bg-surface'>
        <Text className='text-white'>ChatsTab</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ChatsTab