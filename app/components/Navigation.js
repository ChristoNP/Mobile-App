import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomePage from '../pages/needAuth/Home';
import PostDetailPage from '../pages/needAuth/PostDetail';
import Profile from '../pages/needAuth/Profile';
import SearchPage from '../pages/needAuth/SearchPage';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/auth';
import { Pressable, StyleSheet, Text } from 'react-native';
import * as SecureStore from "expo-secure-store";
import Ionicons from "@expo/vector-icons/Ionicons";
import { NavigationContainer } from '@react-navigation/native';
import Login from '../pages/login';
import Register from '../pages/Register';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTab() {
    const { setIsSignedIn } = useContext(AuthContext);

    return (
        <Tab.Navigator>
            <Tab.Screen
                name='Home'
                component={HomePage}
                options={{
                    tabBarIcon: (props) => (
                        <Ionicons
                            name={props.focused ? 'home' : 'home-outline'}
                            size={props.size}
                            color={props.color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Search"
                component={SearchPage}
                options={{
                    tabBarIcon: (props) => (
                        <Ionicons
                            name={props.focused ? 'search' : 'search-outline'}
                            size={props.size}
                            color={props.color}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

export default function Navigation() {
    const { isSignedIn, setIsSignedIn } = useContext(AuthContext);

    useEffect(() => {
        SecureStore.getItemAsync('access_token').then((r) => {
            if (r) {
                setIsSignedIn(true);
            }
        });
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {isSignedIn ? (
                    <>
                        <Stack.Screen
                            name='MainTab'
                            component={MainTab}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen name='Detail' component={PostDetailPage} />
                        <Stack.Screen
                            name="Profile"
                            component={Profile}
                            options={{
                                headerRight: () => (
                                    <Pressable
                                        onPress={async () => {
                                            await SecureStore.deleteItemAsync('access_token');
                                            setIsSignedIn(false);
                                        }}
                                        style={styles.logoutButton}
                                    >
                                        <Text style={styles.logoutText}>Logout</Text>
                                    </Pressable>
                                ),
                            }}
                        />
                    </>
                ) : (
                    <>
                        <Stack.Screen name='Login' component={Login} />
                        <Stack.Screen name='Register' component={Register} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    logoutButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 10,
    },
    logoutText: {
        color: 'white',
    },
});
