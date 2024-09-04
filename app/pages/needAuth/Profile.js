import { useQuery, useMutation } from '@apollo/client'
import React from 'react'
import { StyleSheet, Text, View, SafeAreaView, FlatList, ActivityIndicator } from 'react-native'
import { GET_USER_ID } from '../../query/users'
import { FOLLOW } from '../../query/follow'

export default function Profile({ navigation, route }) {
    const { userId } = route.params
    const { data, loading, refetch } = useQuery(GET_USER_ID, {
        variables: { userByIdId: userId },
    })

    const [followUser] = useMutation(FOLLOW, {
        onCompleted: () => refetch(),
    })

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size={'large'} />
            </View>
        )
    }

    const handleFollow = (followingId) => {
        followUser({ variables: { followingId } })
    }

    const FollowingCard = ({ following }) => (
        <View style={styles.card}>
            <Text style={styles.cardText}>{following.name}</Text>
            <Text style={styles.cardTextDif}>{following.username}</Text>
        </View>
    )

    const FollowerCard = ({ follower }) => (
        <View style={styles.card}>
            <Text style={styles.cardText}>{follower.name}</Text>
            <Text style={styles.cardTextDif}>{follower.username}</Text>
        </View>
    )

    const renderFollowingItem = ({ item }) => <FollowingCard following={item} />
    const renderFollowerItem = ({ item }) => <FollowerCard follower={item} />

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>{data.usersById.user.username}</Text>
            </View>

            <View style={styles.profileInfoContainer}>
                <Text style={styles.userName}>{data.usersById.user.name}</Text>
                <View style={styles.followInfo}>
                    <View style={styles.following}>
                        <Text style={styles.followCount}>{data.usersById.followings.length}</Text>
                        <Text style={styles.followLabel}>Following</Text>
                    </View>
                    <View style={styles.followers}>
                        <Text style={styles.followCount}>{data.usersById.followers.length}</Text>
                        <Text style={styles.followLabel}>{data.usersById.followers.length <= 1 ? 'Follower' : 'Followers'}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.listContainer}>
                <FlatList
                    data={data.usersById.followings}
                    keyExtractor={(item) => item._id}
                    renderItem={renderFollowingItem}
                    ListHeaderComponent={() => (
                        <Text style={styles.sectionTitle}>Following</Text>
                    )}
                    showsVerticalScrollIndicator={false}
                    style={styles.list}
                />

                <FlatList
                    data={data.usersById.followers}
                    keyExtractor={(item) => item._id}
                    renderItem={renderFollowerItem}
                    ListHeaderComponent={() => (
                        <Text style={styles.sectionTitle}>Followers</Text>
                    )}
                    showsVerticalScrollIndicator={false}
                    style={styles.list}
                />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    header: {
        padding: 10,
        backgroundColor: '#0666FE',
        alignItems: 'center',
    },
    headerText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    profileInfoContainer: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    followInfo: {
        flexDirection: 'row',
        marginTop: 10,
    },
    following: {
        alignItems: 'center',
        marginHorizontal: 20,
    },
    followers: {
        alignItems: 'center',
        marginHorizontal: 20,
    },
    followCount: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    followLabel: {
        fontSize: 14,
        color: '#666ff',
    },
    listContainer: {
        paddingHorizontal: 16,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    list: {
        marginBottom: 10,
    },
    card: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginVertical: 5,
        borderRadius: 0,
        justifyContent: 'center',
        width: '100%',
    },
    cardText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    cardTextDif: {
        fontSize: 16,
        color: '#9fa19f',
    },
})
