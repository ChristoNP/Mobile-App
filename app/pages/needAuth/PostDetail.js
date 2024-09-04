import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, ActivityIndicator, TextInput, KeyboardAvoidingView, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/FontAwesome'
import moment from 'moment'
import { GET_POST_DETAIL, LIKE_POST, ADD_COMMENT } from '../../query/post'

export default function PostDetailPage({ navigation, route }) {
    const [newComment, setNewComment] = useState('')
    const [isLiked, setIsLiked] = useState(false)
    const [comments, setComments] = useState([])
    const { data, loading, error, refetch } = useQuery(GET_POST_DETAIL, {
        variables: {
            postByIdId: route.params.postId
        },
        onCompleted: (data) => {
            setIsLiked(data.postById.likes.includes('Current User'))
            setComments(data.postById.comments)
        }
    })

    const [likePost] = useMutation(LIKE_POST, {
        update(cache, { data: { likePost } }) {
            const { postById } = cache.readQuery({
                query: GET_POST_DETAIL,
                variables: { postByIdId: route.params.postId }
            }) || { postById: { likes: [], comments: [] } }

            cache.writeQuery({
                query: GET_POST_DETAIL,
                variables: { postByIdId: route.params.postId },
                data: {
                    postById: {
                        ...postById,
                        __typename: 'Post',
                        likes: likePost.likes || postById.likes
                    }
                }
            })
        }
    })

    const [addCommentMutation] = useMutation(ADD_COMMENT, {
        refetchQueries: [
            { query: GET_POST_DETAIL, variables: { postByIdId: route.params.postId } }
        ],
        onError: (error) => {
            Alert.alert('Error', 'Failed to add comment.')
            console.log("Error adding comment:", error)
        }
    })

    const addComment = async () => {
        if (newComment.trim() !== '') {
            try {
                await addCommentMutation({
                    variables: {
                        content: newComment,
                        postId: route.params.postId
                    }
                })
                setNewComment('')
            } catch (error) {
                Alert.alert('Error', 'Failed to add comment.')
                console.log("Error adding comment:", error)
            }
        }
    }

    const handleLike = async () => {
        try {
            await likePost({
                variables: { postId: route.params.postId },
            })
            refetch()
            setIsLiked(!isLiked)
        } catch (error) {
            Alert.alert('Wait!', 'You already like this post')
            console.log("Error liking post:", error)
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
            <View style={styles.commentSection}>
                <FlatList
                    ListHeaderComponent={
                        <>
                            <View style={styles.header}>
                                <Text style={styles.headerText}>{data.postById.author.name}'s Post</Text>
                            </View>

                            <View style={styles.postContainer}>
                                <View style={styles.postHeader}>
                                    <Text style={styles.postUser}>{data.postById.author.username}</Text>
                                    <Text style={styles.postTime}>{moment(data.postById.createdAt).fromNow()}</Text>
                                </View>
                                <Text style={styles.postContent}>{data.postById.content}</Text>
                                {data.postById.imgUrl && (
                                    <Image
                                        style={styles.postImage}
                                        source={{ uri: data.postById.imgUrl }}
                                    />
                                )}
                            </View>

                            <View style={styles.likeCommentContainer}>
                                <Text style={styles.likeCommentText}>{data.postById.likes.length} {data.postById.likes.length <= 1 ? 'Like' : 'Likes'}</Text>
                                <Text style={styles.likeCommentText}>{data.postById.comments.length} {data.postById.comments.length <= 1 ? 'Comment' : 'Comments'}</Text>
                            </View>

                            <View style={styles.buttonsContainer}>
                                <TouchableOpacity
                                    style={styles.iconButton}
                                    onPress={handleLike}
                                >
                                    <Icon
                                        name={isLiked ? "thumbs-up" : "thumbs-o-up"}
                                        size={20}
                                        color={isLiked ? "#0666FE" : "#6d6d6e"}
                                    />
                                    <Text>Like</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.iconButton}>
                                    <Icon name="comment-o" size={20} color="#6d6d6e" />
                                    <Text>Comment</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.commentSectionTitle}>Comments</Text>
                        </>
                    }

                    data={comments}
                    keyExtractor={(item) => item.createdAt || item.id}
                    renderItem={({ item }) => (
                        <View style={styles.commentContainer}>
                            <View style={styles.commentHeader}>
                                <Text style={styles.commentUser}>{item.username}</Text>
                                <Text style={styles.commentTime}>{moment(item.createdAt).fromNow()}</Text>
                            </View>
                            <Text style={styles.commentContent}>{item.content}</Text>
                        </View>
                    )}
                />
            </View>

            {/* Input for adding new comment */}
            <KeyboardAvoidingView behavior="padding" style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={newComment}
                    onChangeText={setNewComment}
                    placeholder="Add a comment..."
                />
                <TouchableOpacity style={styles.sendButton} onPress={addComment}>
                    <Icon name="send" size={20} color="#fff" />
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
        marginTop: -50,
        marginLeft: -15,
        marginRight: -15,
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
    postContainer: {
        backgroundColor: '#fff',
        padding: 15,
        marginHorizontal: 15,
        marginTop: 15,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
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
        fontSize: 16,
        marginBottom: 10,
    },
    postImage: {
        width: '100%',
        height: 300,
        borderRadius: 5,
        marginTop: 10,
        backgroundColor: '#a19e9d',
    },
    likeCommentContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        marginTop: 10,
        marginHorizontal: 10
    },
    likeCommentText: {
        fontSize: 14,
        color: '#666',
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    iconButton: {
        flex: 1,
        alignItems: 'center',
    },
    commentSection: {
        paddingHorizontal: 15,
        paddingTop: 20,
        flex: 1,
    },
    commentSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        marginHorizontal: 10
    },
    commentContainer: {
        backgroundColor: '#fff',
        padding: 10,
        marginBottom: 1,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        borderRadius: 8,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    commentUser: {
        fontWeight: 'bold',
    },
    commentTime: {
        color: '#888',
        fontSize: 12,
    },
    commentContent: {
        fontSize: 14,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        marginHorizontal: 10,
    },
    input: {
        flex: 1,
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#f0f2f5',
        marginLeft: 10,
        marginBottom: 10,
    },
    sendButton: {
        backgroundColor: '#0666FE',
        borderRadius: 5,
        padding: 10,
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 10,
    },
})
