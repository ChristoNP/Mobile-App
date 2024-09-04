import { useQuery, useMutation, gql } from '@apollo/client'
import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/FontAwesome'
import moment from 'moment'
import { LIKE_POST, GET_POST, ADD_POST } from "../../query/post"
import { GET_USER_ID } from '../../query/users'
import * as SecureStore from "expo-secure-store"

const timeAgo = (timestamp) => {
    return moment(timestamp).fromNow()
}

export default function HomePage({ navigation }) {
    const { data, loading, error, refetch } = useQuery(GET_POST)
    const [likePostfn] = useMutation(LIKE_POST, {
        update(cache, { data: { likePost } }) {
            const { posts } = cache.readQuery({ query: GET_POST })            
            cache.writeQuery({
                query: GET_POST,
                data: {
                    posts: posts.map(post => 
                        post._id === likePost.postId
                            ? { ...post, likes: [...post.likes, likePost] }
                            : post
                    ),
                },
            })
        },
    })
    const [addPostfn] = useMutation(ADD_POST, {
        update(cache, { data: { addPost } }) {
            const { posts } = cache.readQuery({ query: GET_POST })
            cache.writeQuery({
                query: GET_POST,
                data: {
                    posts: [addPost, ...posts],
                },
            })
        },
    })
    const [likedPosts, setLikedPosts] = useState(new Set())
    const [postContent, setPostContent] = useState('')
    const [postTags, setPostTags] = useState('')
    const [postImgUrl, setPostImgUrl] = useState('')

    useEffect(() => {
        const fetchLikedPosts = async () => {
            const likedPostsString = await SecureStore.getItemAsync('likedPosts')
            if (likedPostsString) {
                setLikedPosts(new Set(JSON.parse(likedPostsString)))
            }
        }

        fetchLikedPosts()
    }, [])

    const handleLike = async (postId) => {
        try {
            await likePostfn({
                variables: { postId },
            })
            setLikedPosts((prevLikedPosts) => {
                const newLikedPosts = new Set(prevLikedPosts)
                if (newLikedPosts.has(postId)) {
                    newLikedPosts.delete(postId)
                } else {
                    newLikedPosts.add(postId)
                }
                SecureStore.setItemAsync('likedPosts', JSON.stringify([...newLikedPosts]))
                return newLikedPosts
            })
            refetch()
        } catch (error) {
            Alert.alert('Wait!', 'You already like this post')
            console.log("Error liking post:", error)
        }
    }

    const handleAddPost = async () => {
        if (!postContent.trim()) {
            Alert.alert('Error', 'Content is required')
            return
        }

        try {
            await addPostfn({
                variables: {
                    form: {
                        content: postContent,
                        tags: postTags.split(',').map(tag => tag.trim()),
                        imgUrl: postImgUrl,
                    },
                },
            })
            setPostContent('')
            setPostTags('')
            setPostImgUrl('')
            refetch()
        } catch (error) {
            Alert.alert('Error', 'Failed to add post')
            console.log("Error adding post:", error)
        }
    }

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size={'large'} />
            </View>
        )
    }

    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>{error.message}</Text>
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Image
                    style={styles.logo}
                    source={{ uri: 'https://logowik.com/content/uploads/images/facebook-new-wordmark-20237628.logowik.com.webp' }}
                />
                <TouchableOpacity style={styles.profileButton}>
                    <Pressable
                        onPress={() => {
                            navigation.navigate('Profile', {
                                userId: GET_USER_ID,
                            })
                        }}
                    >
                        <Text style={styles.profileButtonText}>Profile</Text>
                    </Pressable>
                </TouchableOpacity>
            </View>

            <View style={styles.addPostContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="What's on your mind?"
                    value={postContent}
                    onChangeText={setPostContent}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Tags (comma separated)"
                    value={postTags}
                    onChangeText={setPostTags}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Image URL (optional)"
                    value={postImgUrl}
                    onChangeText={setPostImgUrl}
                />
                <TouchableOpacity style={styles.postButton} onPress={handleAddPost}>
                    <Text style={styles.postButtonText}>Post</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={data.posts}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Pressable
                            onPress={() => {
                                navigation.navigate('Detail', {
                                    postId: item._id,
                                })
                            }}
                        >
                            <View style={styles.postContainer}>
                                <View style={styles.postHeader}>
                                    <Text style={styles.postUser}>{item.author?.username || 'Unknown User'}</Text>
                                    <Text style={styles.postTime}>{timeAgo(item.createdAt)}</Text>
                                </View>
                                <Text style={styles.postContent}>{item.content}</Text>
                                {item.imgUrl && (
                                    <Image
                                        style={styles.postImage}
                                        source={{ uri: item.imgUrl }}
                                    />
                                )}
                            </View>
                            <View style={styles.infoContainer}>
                                <Text style={styles.infoText}>{item.likes.length} {item.likes.length <= 1 ? 'Like' : 'Likes'}</Text>
                                <Text style={styles.infoText}>{item.comments.length} {item.comments.length <= 1 ? 'Comment' : 'Comments'}</Text>
                            </View>
                            <View style={styles.buttonsContainer}>
                                <TouchableOpacity
                                    style={styles.iconButton}
                                    onPress={() => handleLike(item._id)}
                                >
                                    <Icon
                                        name={likedPosts.has(item._id) ? "thumbs-up" : "thumbs-o-up"}
                                        size={20}
                                        color={likedPosts.has(item._id) ? "#0666FE" : "#6d6d6e"}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.iconButton}
                                     onPress={() => {
                                        navigation.navigate('Detail', {
                                            postId: item._id,
                                        })
                                    }}
                                >
                                    <Icon name="comment-o" size={20} color="#6d6d6e" />
                                </TouchableOpacity>
                            </View>
                        </Pressable>
                    </View>
                )}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
        marginTop: -25,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#0666FE',
    },
    logo: {
        width: 120,
        height: 30,
    },
    profileButton: {
        backgroundColor: '#fff',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    profileButtonText: {
        color: '#0666FE',
        fontSize: 14,
    },
    addPostContainer: {
        padding: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    postButton: {
        backgroundColor: '#0666FE',
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    postButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    postContainer: {
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    postUser: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    postTime: {
        color: '#888',
        fontSize: 12,
    },
    postContent: {
        fontSize: 14,
        marginBottom: 10,
    },
    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 5,
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
    },
    iconButton: {
        flex: 1,
        alignItems: 'center',
    },
})