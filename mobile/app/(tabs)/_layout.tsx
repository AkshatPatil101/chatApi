import { View } from 'react-native'
import React from 'react'
import {Redirect, Tabs} from 'expo-router'
import {Ionicons} from '@expo/vector-icons'
import {useAuth} from '@clerk/clerk-expo'

const TabsLayout = () => {

  const {isSignedIn, isLoaded} = useAuth();

  if(!isLoaded) return null;
  if(!isSignedIn) return <Redirect href={'/(auth)'}/>

  return (
    <Tabs 
      screenOptions={{
        headerShown:false,
        tabBarStyle:{
          backgroundColor:'#161717',
          borderTopColor:'#2D2E2E',
          borderTopWidth:1,
          height:80,
          paddingTop:9,
          alignItems:'center',
          justifyContent:'center'
        },
        tabBarActiveTintColor:'#F4A261',
        tabBarLabelStyle:{
          fontSize:14,
          fontWeight:'600',
          marginTop:6.5
        },
      }}
    >

      <Tabs.Screen name='index' options={{
        title:'Chats',
        tabBarIcon:({color, focused, size})=>(
            <View style={{
              width: 70,
              height: 34,
              borderRadius:20,
              backgroundColor: focused ? '#2B2B2E' : 'transparent',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Ionicons 
                name={focused ? "chatbubbles" : "chatbubbles-outline"}
                size={size}
                color={color}
              />
            </View>
        )
      }}/>

      <Tabs.Screen name='profile'options={{
        title:'Profile',
        tabBarIcon:({color, focused, size})=>(
                      <View style={{
              width: 70,
              height: 34,
              borderRadius:20,
              backgroundColor: focused ? '#2B2B2E' : 'transparent',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
          <Ionicons 
            name={focused ? "person" : "person-outline"}
            size={size}
            color={color}
          />
          </View>
        )
      }}/>

    </Tabs>
  )
}

export default TabsLayout