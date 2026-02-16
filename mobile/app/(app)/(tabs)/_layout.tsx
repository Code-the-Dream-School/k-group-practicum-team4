import React from 'react';
import "../../../global.css";
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons'; // or your icon library

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#4f46e5',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: { backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Library',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="library-books" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="dashboard" size={size} color={color} />
                    ),
                }}
            />
            {/* Add other tabs if any */}
        </Tabs>
    );
}
