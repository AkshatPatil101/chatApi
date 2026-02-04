import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet,Pressable, ActivityIndicator } from 'react-native';
import BottomSheet, { 
  BottomSheetView, 
  BottomSheetBackdrop, 
  BottomSheetTextInput 
} from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUsers } from '@/hooks/useUsers';
import { useGetOrCreateChat } from '@/hooks/useChats';
import { User } from '@/types';
import { ScrollView } from 'react-native-gesture-handler';
import UserItem from '@/components/chat/UserItem';


const NewChatScreen = () => {

  const [searchQuery, setSearchQuery] = useState("");


  const {data:allUsers, isLoading} = useUsers();
  const {mutate:getOrCreateChat, isPending:isCreatingChat} = useGetOrCreateChat();

  // Filter over here on the client side 
  const users = allUsers?.filter((u)=>{
    if(!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return u.name?.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query);
  });

  const handleUserSelect = (user:User) => {
    getOrCreateChat(user._id,{
      onSuccess:(chat) => {
        router.dismiss()
        setTimeout(()=>{
                  router.push({
          pathname:"/chat/[id]",
          params:{
            id:chat._id,
            participantId:chat.participant._id,
            name:chat.participant.name,
            avatar:chat.participant.avatar
          }
        })
        },100)
      }
    })
  }

  const router = useRouter();
  const sheetRef = useRef<BottomSheet>(null);

  // Define exactly where we want the sheet to stay
  const snapPoints = useMemo(() => ['80%','98%'], []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.6}
        onPress={() => router.back()}
      />
    ),
    [router]
  );
  {/*Required for the sheet to be visible*/}
  // enableDynamicSizing fix disable the auto-sizing it was creating the 15% snap point on mount 
  return (
    <View style={StyleSheet.absoluteFillObject}> 
      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        
        enableDynamicSizing={false} 
        
        enablePanDownToClose
        animateOnMount={true}
        backdropComponent={renderBackdrop}
        onClose={() => router.back()}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.indicator}
        
        keyboardBehavior="interactive"
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetView style={styles.contentContainer}>
          <View className='flex-row justify-between'>
          <Text style={styles.title}>New Chat</Text>
            <Pressable
              className="w-9 h-9 rounded-full mr-2 bg-surface-card items-center justify-center"
              onPress={() => router.back()}
            >
              <Ionicons name="close" size={20} color="#F4A261" />
            </Pressable>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#F4A261" />
            <BottomSheetTextInput
              placeholder="Search users..."
              placeholderTextColor="#8E8E93"
              autoFocus={true}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize='none'
            />
          </View>

          {/*If nothing is typed*/}
          {!searchQuery ? (<View style={styles.resultsArea}>
            <Text style={styles.helperText}>Start typing to find friends</Text>
          </View>):(
          <View className='flex-1'>
            {isCreatingChat || isLoading ? (
              <View style={{marginTop:80}}>
                <ActivityIndicator size="large" color="#F4A261" style={{marginTop:30}}/>
              </View>
            ): !users || users.length === 0 ? (
                <View className="flex-1 items-center justify-center px-5 mt-32">
                <Ionicons name="person-outline" size={64} color="#6B6B70" />
                <Text className="text-muted-foreground text-lg mt-4">No users found</Text>
                <Text className="text-subtle-foreground text-sm mt-1 text-center">
                  Try a different search term
                </Text>
              </View>
            ) : (
              <ScrollView
              className='flex-1 px-5 pt-4'
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{paddingBottom:24}}
              keyboardShouldPersistTaps='handled'
              >
                <Text className='text-muted-foreground text-xs mb-3 mt-6'>USERS</Text>

                {users.map((user)=>(
                  <UserItem key={user._id} user={user} isOnline={true} onPressed={() => handleUserSelect(user)}/>
                ))}

              </ScrollView>
            )}
          </View>
          )}

        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  sheetBackground: { backgroundColor: '#161717' },
  indicator: { backgroundColor: '#F4A261', width: 40 },
  contentContainer: { flex: 1, paddingHorizontal: 24, paddingTop: 8 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232424',
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#323333',
  },
  searchInput: { flex: 1, paddingVertical: 14, paddingHorizontal: 12, color: '#FFFFFF', fontSize: 16 },
  resultsArea: { flex: 1, marginTop: 40, alignItems: 'center' },
  helperText: { color: '#8E8E93', fontSize: 14 }
});

export default NewChatScreen;