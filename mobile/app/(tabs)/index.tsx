import { View, Text, ScrollView, ActivityIndicator, Pressable,FlatList } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context' // Import from here!
import { useRouter } from 'expo-router'
import { useChats } from '@/hooks/useChats'
import ChatItem from '@/components/chat/ChatItem'
import { Ionicons } from '@expo/vector-icons'
import EmptyUi from '@/components/chat/EmptyUi'
import { Chat } from '@/types'

const ChatsTab = () => {

  const router = useRouter();
  const {data:chats, isLoading, error} = useChats();  // get Chats

  if(isLoading){
    return(
      <View className='flex-1 bg-surface justify-center items-center'>
        <ActivityIndicator size={"large"} color={"F4A261"} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <Text className="text-red-500 text-3xl">Unable to Load Chats</Text>
      </View>
    );
  }

  const handleChatPress = (chat:Chat) => {
    router.push({
      pathname:'/chat/[id]',
      params:{
        id:chat._id,
        participantId:chat.participant._id,
        name:chat.participant.name,
        avatar:chat.participant.avatar,
      },
    });
  } ; 

  return (
    <SafeAreaView className='bg-surface flex-1' edges={['top']}>
      <FlatList 
      data={chats}
      keyExtractor={item=>item._id}
      renderItem={({item})=>(
        <ChatItem chat={item} onPress={()=>handleChatPress(item)}/>
      )}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingHorizontal:20,
        paddingTop:16,
        paddingBottom:24
      }}
      ListHeaderComponent={<Header />}
      ListEmptyComponent={<EmptyUi title='No chats yet' subtitle='Start a conversation!' iconSize={64} buttonLabel='New Chat' onPressButton={()=>{console.log("Pressed")}}/>}
      />        

    </SafeAreaView>
  )
}


function Header() {
  const router = useRouter();

  return (
    <View className="px-5 pt-2 pb-4">
      <View className="flex-row items-center justify-between">

        <View className='flex-row'>
          <Ionicons
          name="flash"
          size={31}
          color="#F4A261"
          style={{ marginRight:8}}
          />
          <Text className="text-4xl font-bold text-foreground">Bolt</Text>
        </View> 

        <Pressable
          className="size-10 bg-primary rounded-full items-center justify-center"
          //onPress={() => router.push("/new-chat")}
          >
          <Ionicons name="create-outline" size={20} color="#0D0D0F" />
        </Pressable>
      </View>
    </View>
  );
}

export default ChatsTab