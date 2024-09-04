import { useQuery, useMutation } from '@apollo/client'
import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ALL_USERS } from '../../query/users'
import { FOLLOW } from '../../query/follow'

export default function SearchPage({ navigation, route }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [filteredUsers, setFilteredUsers] = useState([])
    const [followedUsers, setFollowedUsers] = useState(new Set())

    const { data, loading, error } = useQuery(ALL_USERS)
    const [followUser] = useMutation(FOLLOW)

    useEffect(() => {
        if (data) {
            const allUsers = data.users
            const query = searchQuery.toLowerCase()
            const filtered = allUsers.filter(user =>
                user.username.toLowerCase().includes(query) || 
                user.name.toLowerCase().includes(query)
            )
            setFilteredUsers(filtered)
        }
    }, [data, searchQuery])

    const handleFollow = async (userId) => {
        try {
            await followUser({ variables: { followingId: userId } })
            setFollowedUsers(prev => {
                const updated = new Set(prev)
                if (updated.has(userId)) {
                    updated.delete(userId)
                } else {
                    updated.add(userId)
                }
                return updated
            })
        } catch (err) {
            console.error("Failed to follow user", err)
        }
    }

    const handleSearch = () => {
        if (data) {
            const allUsers = data.users
            const query = searchQuery.toLowerCase()
            const filtered = allUsers.filter(user =>
                user.username.toLowerCase().includes(query) || 
                user.name.toLowerCase().includes(query)
            )
            setFilteredUsers(filtered)
        }
    }

    const isFollowed = (userId) => followedUsers.has(userId)

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Image
                    style={styles.logo}
                    source={{ uri: 'https://logowik.com/content/uploads/images/facebook-new-wordmark-20237628.logowik.com.webp' }}
                />
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Search by username or name"
                    value={searchQuery}
                    onChangeText={text => {
                        setSearchQuery(text)
                    }}
                    onSubmitEditing={() => handleSearch()}
                />
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" />
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error.message}</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredUsers}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <View style={styles.userCard}>
                            <View>
                                <Text style={styles.name}>{item.name}</Text>
                                <Text style={styles.username}>{item.username}</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.followButton, isFollowed(item._id) ? styles.followed : styles.notFollowed]}
                                onPress={() => handleFollow(item._id)}
                            >
                                <Text style={styles.followButtonText}>
                                    {isFollowed(item._id) ? 'Followed' : 'Follow'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
        marginTop: -30,
    },
    header: {
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#0666FE',
    },
    logo: {
        width: 120,
        height: 30,
    },
    searchContainer: {
        flexDirection: 'row',
        margin: 16,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    userCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginHorizontal: 16,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    username: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    name: {
        fontSize: 14,
        color: '#666',
    },
    followButton: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    followed: {
        backgroundColor: '#ccc',
    },
    notFollowed: {
        backgroundColor: '#0666FE',
    },
    followButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
    },
})
