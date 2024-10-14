// import React, { useEffect, useState } from 'react';
// import { View, Text, Button, FlatList, StyleSheet, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { API_URL } from '../../env'; // Nhập biến môi trường từ file env.js

// const InterfaceScreen = ({ navigation }) => {
//   const [posts, setPosts] = useState([]);
//   const [title, setTitle] = useState('');
//   const [content, setContent] = useState('');
//   const [commentContent, setCommentContent] = useState('');
//   const [isFormVisible, setIsFormVisible] = useState(false);
//   const [editingPostId, setEditingPostId] = useState(null);
//   const [selectedPostId, setSelectedPostId] = useState(null);
//   const [userId, setUserId] = useState(null);
//   const [categories, setCategories] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState('');

//   useEffect(() => {
//     const fetchUserId = async () => {
//       const id = await AsyncStorage.getItem('userId');
//       setUserId(id);
//     };

//     fetchUserId();
//     fetchPosts();
//     fetchCategories();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       const response = await axios.get(`${API_URL}/name_technician`);
//       setCategories(response.data);
//     } catch (error) {
//       Alert.alert('Lỗi', 'Không thể lấy danh sách loại thợ.');
//     }
//   };

//   const fetchPosts = async () => {
//     const token = await AsyncStorage.getItem('token');
//     if (token) {
//       try {
//         const response = await axios.get(`${API_URL}/posts`, {
//           headers: { Authorization: token },
//         });
//         const sortedPosts = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
//         setPosts(sortedPosts);
//       } catch (error) {
//         Alert.alert('Lỗi', 'Không thể lấy danh sách bài viết.');
//       }
//     }
//   };

//   const handlePost = async () => {
//     if (!title || !content || !selectedCategory) {
//       Alert.alert('Vui lòng điền đầy đủ thông tin.');
//       return;
//     }

//     const token = await AsyncStorage.getItem('token');
//     const endpoint = editingPostId ? `${API_URL}/posts/${editingPostId}` : `${API_URL}/posts`;
//     const method = editingPostId ? 'put' : 'post';

//     try {
//       const response = await axios[method](endpoint, { title, content, technician_category_name: selectedCategory }, {
//         headers: { Authorization: token },
//       });

//       if (response.status === 200 || response.status === 201) {
//         Alert.alert('Thành công', editingPostId ? 'Cập nhật bài viết thành công.' : 'Đăng bài viết thành công.');
//         resetForm();
//         fetchPosts();
//       } else {
//         Alert.alert('Lỗi', response.data || 'Có lỗi xảy ra.');
//       }
//     } catch (error) {
//       Alert.alert('Lỗi', error.response?.data || 'Có lỗi xảy ra.');
//     }
//   };

//   const resetForm = () => {
//     setTitle('');
//     setContent('');
//     setSelectedCategory('');
//     setIsFormVisible(false);
//     setEditingPostId(null);
//   };

//   const handleEditPost = (post) => {
//     setTitle(post.title);
//     setContent(post.content);
//     setSelectedCategory(post.technician_category_name);
//     setEditingPostId(post.id);
//     setIsFormVisible(true);
//   };

//   const handleDeletePost = async (postId) => {
//     const token = await AsyncStorage.getItem('token');
//     try {
//       const response = await axios.delete(`${API_URL}/posts/${postId}`, {
//         headers: { Authorization: token },
//       });

//       if (response.status === 200) {
//         Alert.alert('Thành công', 'Xóa bài viết thành công.');
//         fetchPosts();
//       } else {
//         Alert.alert('Lỗi', response.data || 'Có lỗi xảy ra.');
//       }
//     } catch (error) {
//       Alert.alert('Lỗi', error.response?.data || 'Có lỗi xảy ra.');
//     }
//   };

//   const handleComment = async (postId) => {
//     if (!commentContent) {
//       Alert.alert('Vui lòng điền nội dung bình luận.');
//       return;
//     }

//     const token = await AsyncStorage.getItem('token');

//     try {
//       const response = await axios.post(`${API_URL}/posts/${postId}/comments`, { content: commentContent }, {
//         headers: { Authorization: token },
//       });

//       if (response.status === 200) {
//         Alert.alert('Thành công', 'Bình luận thành công.');
//         setCommentContent('');
//         fetchPosts();
//       } else {
//         Alert.alert('Lỗi', response.data || 'Có lỗi xảy ra.');
//       }
//     } catch (error) {
//       Alert.alert('Lỗi', error.response?.data || 'Có lỗi xảy ra.');
//     }
//   };

//   const toggleForm = () => {
//     resetForm();
//     setIsFormVisible((prev) => !prev);
//   };

//   const togglePostDetails = (postId) => {
//     setSelectedPostId(prevId => (prevId === postId ? null : postId));
//   };

//   return (
//     <KeyboardAvoidingView 
//       style={styles.container} 
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       keyboardVerticalOffset={100}
//     >
//       <Text style={styles.title}>Danh sách bài viết</Text>
//       <Button title={isFormVisible ? "Hủy" : "Đăng bài viết"} onPress={toggleForm} />

//       {isFormVisible && (
//         <View>
//           <TextInput
//             placeholder="Tiêu đề"
//             value={title}
//             onChangeText={setTitle}
//             style={styles.input}
//           />
//           <TextInput
//             placeholder="Nội dung"
//             value={content}
//             onChangeText={setContent}
//             style={[styles.input, { height: 100 }]}
//             multiline
//           />
//           <Picker
//             selectedValue={selectedCategory}
//             style={styles.picker}
//             onValueChange={(itemValue) => setSelectedCategory(itemValue)}
//           >
//             <Picker.Item label="Chọn loại thợ" value="" />
//             {categories.map((category) => (
//               <Picker.Item key={category.name} label={category.name} value={category.name} />
//             ))}
//           </Picker>
//           <Button title={editingPostId ? "Cập nhật" : "Gửi bài viết"} onPress={handlePost} />
//         </View>
//       )}

//       {!isFormVisible && (
//         <FlatList
//           data={posts}
//           keyExtractor={(item) => item.id.toString()}
//           renderItem={({ item }) => (
//             <View style={styles.postContainer}>
//               <View style={styles.titleRow}>
//                 <Text style={styles.postTitle} onPress={() => togglePostDetails(item.id)}>
//                   {item.title}
//                 </Text>
//                 <Text style={styles.categoryText}>{item.technician_category_name}</Text>
//               </View>
//               <Text style={styles.usernameText}>Người đăng: {item.username}</Text>
//               <Text style={styles.contentText}>{item.content}</Text>
//               <Text style={styles.dateText}>Được tạo lúc: {new Date(item.created_at).toLocaleString()}</Text>

//               {selectedPostId === item.id && (
//                 <>
//                   {item.user_id === userId ? (
//                     <View style={styles.buttonContainer}>
//                       <Button title="Chỉnh sửa" onPress={() => handleEditPost(item)} />
//                       <Button title="Xóa" onPress={() => handleDeletePost(item.id)} />
//                     </View>
//                   ) : (
//                     <View>
//                       <TextInput
//                         placeholder="Viết bình luận..."
//                         value={commentContent}
//                         onChangeText={setCommentContent}
//                         style={[styles.input, { height: 60 }]}
//                         multiline
//                       />
//                       <Button title="Gửi bình luận" onPress={() => handleComment(item.id)} />
//                     </View>
//                   )}
//                 </>
//               )}

//               {selectedPostId === item.id && item.comments && item.comments.length > 0 && (
//                 <FlatList
//                   data={item.comments}
//                   keyExtractor={(comment) => comment.id.toString()}
//                   renderItem={({ item: comment }) => (
//                     <View style={styles.commentContainer}>
//                       <Text style={styles.commentText}>
//                         <Text style={styles.commentAuthor}>{comment.username}</Text>: {comment.content}
//                       </Text>
//                       <Text style={styles.commentDate}>{new Date(comment.created_at).toLocaleString()}</Text>
//                     </View>
//                   )}
//                 />
//               )}
//             </View>
//           )}
//         />
//       )}
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 10,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     padding: 10,
//     marginBottom: 10,
//   },
//   postContainer: {
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//     paddingBottom: 10,
//     marginBottom: 10,
//   },
//   titleRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   postTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     flex: 1,
//   },
//   categoryText: {
//     fontSize: 14,
//     color: 'gray',
//   },
//   usernameText: {
//     fontSize: 14,
//     color: 'blue',
//   },
//   contentText: {
//     fontSize: 14,
//   },
//   dateText: {
//     fontSize: 12,
//     color: 'gray',
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 10,
//   },
//   commentContainer: {
//     marginTop: 10,
//     marginBottom: 5,
//     padding: 5,
//     borderWidth: 1,
//     borderColor: '#eee',
//     borderRadius: 5,
//   },
//   commentText: {
//     fontSize: 14,
//   },
//   commentAuthor: {
//     fontWeight: 'bold',
//   },
//   commentDate: {
//     fontSize: 12,
//     color: 'gray',
//   },
//   picker: {
//     height: 50,
//     marginBottom: 10,
//   },
// });

// export default InterfaceScreen;



// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, ActivityIndicator, Alert, Image, TouchableOpacity, FlatList, KeyboardAvoidingView } from 'react-native';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { API_URL } from '../../env';

// const Profile = () => {
//   const [userInfo, setUserInfo] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [avatarUrl, setAvatarUrl] = useState(null);
//   const [posts, setPosts] = useState([]);
//   const [postCount, setPostCount] = useState(0);
//   const [selectedPostId, setSelectedPostId] = useState(null);

//   const togglePostDetails = (postId) => {
//     setSelectedPostId(selectedPostId === postId ? null : postId);
//   };

//   const fetchUserInfo = async () => {
//     const token = await AsyncStorage.getItem('token');
//     if (!token) {
//       Alert.alert('Lỗi', 'Bạn chưa đăng nhập.');
//       setLoading(false);
//       return;
//     }

//     try {
//       const userResponse = await axios.get(`${API_URL}/user_info`, {
//         headers: { Authorization: token },
//       });
//       setUserInfo(userResponse.data.user);
//       setAvatarUrl(userResponse.data.user.avatar ? `${API_URL}/images/${userResponse.data.user.avatar}` : 'http://example.com/k1.jpg');

//       const postsResponse = await axios.get(`${API_URL}/posts`, {
//         headers: { Authorization: token },
//       });
//       const userPosts = postsResponse.data.filter(post => post.user_id === userResponse.data.user.id);
//       setPosts(userPosts);
//       setPostCount(userPosts.length);
//     } catch (error) {
//       console.error('Error fetching user info:', error);
//       Alert.alert('Lỗi', 'Có lỗi xảy ra khi lấy thông tin người dùng.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUserInfo();
//   }, []);

//   if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

//   if (!userInfo) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.title}>Thông tin người dùng không có.</Text>
//       </View>
//     );
//   }

//   return (
//     <KeyboardAvoidingView style={styles.container}>
//       <View style={styles.profileHeader}>
//         <Image source={{ uri: avatarUrl }} style={styles.profileImage} />
//         <View style={styles.statsContainer}>
//           <View style={styles.stat}>
//             <Text style={styles.statNumber}>{postCount}</Text>
//             <Text style={styles.statLabel}>Bài viết</Text>
//           </View>
//         </View>
//       </View>
//       <View style={styles.userInfoContainer}>
//         <Text style={styles.username}>{userInfo.username}</Text>
//         <TouchableOpacity style={styles.editButton}>
//           <Text style={styles.editButtonText}>Chỉnh sửa thông tin</Text>
//         </TouchableOpacity>
//       </View>
//       <View style={styles.infoContainer}>
//         <Text style={styles.infoText}>Email: {userInfo.email}</Text>
//         {userInfo.phone && <Text style={styles.infoText}>Số điện thoại: {userInfo.phone}</Text>}
//         {userInfo.account_type === 'technician' && userInfo.technician_category_name && (
//           <Text style={styles.infoText}>Chuyên môn: {userInfo.technician_category_name}</Text>
//         )}
//       </View>
//       <FlatList
//   data={posts}
//   keyExtractor={(item) => item.id.toString()}
//   showsVerticalScrollIndicator={false} // Ẩn thanh cuộn
//   renderItem={({ item }) => (
//     <View style={styles.postContainer}>
//       <Text style={styles.postTitle} onPress={() => togglePostDetails(item.id)}>{item.title}</Text>
//       <Text style={styles.postContent}>{item.content}</Text>
//       <Text style={styles.postAuthor}>Tác giả: {item.username}</Text>
//       <Text style={styles.postCategory}>Chuyên môn: {item.technician_category_name}</Text>
      
//       {selectedPostId === item.id && (
//         <>
//           {item.comments && item.comments.length > 0 && (
//             <FlatList
//               data={item.comments}
//               keyExtractor={(comment) => comment.id.toString()}
//               renderItem={({ item: comment }) => (
//                 <View style={styles.commentContainer}>
//                   <Text style={styles.commentText}>
//                     <Text style={styles.commentAuthor}>{comment.username}</Text>: {comment.content}
//                   </Text>
//                   <Text style={styles.commentDate}>{new Date(comment.created_at).toLocaleString()}</Text>
//                 </View>
//               )}
//             />
//           )}
//         </>
//       )}
//     </View>
//   )}
// />
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#004581', // Đổi nền thành màu
//     padding: 20,
//   },
//   profileHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   profileImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     flex: 1,
//     marginLeft: 20,
//   },
//   stat: {
//     alignItems: 'center',
//   },
//   statNumber: {
//     fontSize: 20,
//     color: '#90C2D4',
//     fontWeight: 'bold',
//   },
//   statLabel: {
//     fontSize: 20,
//     color: '#C1E7F5',
//   },
//   userInfoContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   username: {
//     fontSize: 24,
//     color: '#8CC7DC',
//     fontWeight: 'bold',
//   },
//   editButton: {
//     backgroundColor: '#0095f6',
//     padding: 8,
//     borderRadius: 5,
//   },
//   editButtonText: {
//     color: '#FFF',
//     fontWeight: 'bold',
//   },
//   postContainer: {
//     backgroundColor: '#FFF',
//     borderRadius: 8,
//     padding: 15,
//     marginVertical: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 1.41,
//     elevation: 2,
//   },
//   postTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   postContent: {
//     fontSize: 16,
//     marginVertical: 5,
//   },
//   postAuthor: {
//     fontSize: 14,
//     color: '#888',
//   },
//   postCategory: {
//     fontSize: 14,
//     color: '#888',
//   },
//   commentContainer: {
//     marginTop: 10,
//   },
//   commentText: {
//     fontSize: 14,
//     color: '#333',
//   },
//   commentAuthor: {
//     fontWeight: 'bold',
//   },
//   commentDate: {
//     fontSize: 12,
//     color: '#666',
//   },
// });

// export default Profile;



import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Image, TouchableOpacity, FlatList, KeyboardAvoidingView, TextInput, Modal } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../env';
import * as Sharing from 'expo-sharing';

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postCount, setPostCount] = useState(0);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // State to manage edit form visibility
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Lỗi', 'Bạn chưa đăng nhập.');
      setLoading(false);
      return;
    }

    try {
      const userResponse = await axios.get(`${API_URL}/user_info`, {
        headers: { Authorization: token },
      });

      setUserInfo(userResponse.data.user);
      setAvatarUrl(userResponse.data.user.avatar 
        ? `${API_URL}/images/${userResponse.data.user.avatar}` 
        : 'http://example.com/k1.jpg'
      );

      setUsername(userResponse.data.user.username); // Set initial values for edit form
      setEmail(userResponse.data.user.email);
      setPhone(userResponse.data.user.phone);

      const postsResponse = await axios.get(`${API_URL}/posts`, {
        headers: { Authorization: token },
      });

      const userPosts = postsResponse.data.filter(post => post.user_id === userResponse.data.user.id);
      setPosts(userPosts);
      setPostCount(userPosts.length);
    } catch (error) {
      console.error('Error fetching user info:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi lấy thông tin người dùng.');
    } finally {
      setLoading(false);
    }
  };

  const shareProfile = async () => {
    if (!userInfo) return;

    try {
      const shareOptions = {
        message: `🌟 Hồ sơ của tôi 🌟\n\n` +
                 `Tên: ${userInfo.username}\n` +
                 `Email: ${userInfo.email}\n` +
                 `Số điện thoại: ${userInfo.phone || 'Không có'}\n` +
                 `Chuyên môn: ${userInfo.technician_category_name || 'Không có'}\n` +
                 `Xem hồ sơ tại: ${API_URL}/profile/${userInfo.id}`,
        url: avatarUrl,
      };

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareOptions.url, {
          dialogTitle: 'Chia sẻ hồ sơ của tôi',
          message: shareOptions.message,
        });
      } else {
        Alert.alert('Lỗi', 'Chia sẻ không khả dụng trên thiết bị này.');
      }
    } catch (error) {
      console.error('Error sharing profile:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi chia sẻ hồ sơ.');
    }
  };

  const togglePostDetails = (postId) => {
    setSelectedPostId(selectedPostId === postId ? null : postId);
  };

  const handleEditProfile = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      await axios.put(`${API_URL}/user_info`, { username, email, phone }, {
        headers: { Authorization: token },
      });
      Alert.alert('Thành công', 'Cập nhật thông tin thành công.');
      setIsEditing(false); // Close the edit form
      fetchUserInfo(); // Refresh user info
    } catch (error) {
      console.error('Error updating user info:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật thông tin.');
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

  if (!userInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Thông tin người dùng không có.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container}>
      <View style={styles.profileHeader}>
        <Image source={{ uri: avatarUrl }} style={styles.profileImage} />
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{postCount}</Text>
            <Text style={styles.statLabel}>Bài viết</Text>
          </View>
        </View>
      </View>
      <View style={styles.userInfoContainer}>
        <Text style={styles.username}>{userInfo.username}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Text style={styles.editButtonText}>Chỉnh sửa thông tin</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={shareProfile}>
            <Text style={styles.shareButtonText}>Chia sẻ hồ sơ</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Email: {userInfo.email}</Text>
        {userInfo.phone && <Text style={styles.infoText}>Số điện thoại: {userInfo.phone}</Text>}
        {userInfo.account_type === 'technician' && userInfo.technician_category_name && (
          <Text style={styles.infoText}>Chuyên môn: {userInfo.technician_category_name}</Text>
        )}
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.postContainer}>
            <Text style={styles.postTitle} onPress={() => togglePostDetails(item.id)}>{item.title}</Text>
            <Text style={styles.postContent}>{item.content}</Text>
            <Text style={styles.postAuthor}>Người đăng: {item.username}</Text>
            <Text style={styles.postCategory}>Chuyên môn: {item.technician_category_name}</Text>
            <Text style={styles.postCategory}>Ngày đăng: {item.created_at}</Text>
            {selectedPostId === item.id && item.comments && item.comments.length > 0 && (
              <FlatList
                data={item.comments}
                keyExtractor={(comment) => comment.id.toString()}
                renderItem={({ item: comment }) => (
                  <View style={styles.commentContainer}>
                    <Text style={styles.commentText}>
                      <Text style={styles.commentAuthor}>{comment.username}</Text>: {comment.content}
                    </Text>
                    <Text style={styles.commentDate}>{new Date(comment.created_at).toLocaleString()}</Text>
                  </View>
                )}
              />
            )}
          </View>
        )}
      />

      {/* Modal for editing user information */}
      <Modal visible={isEditing} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsEditing(false)}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Tên đăng nhập"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleEditProfile}>
              <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 16 },
  profileHeader: { alignItems: 'center', marginBottom: 16 },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  statsContainer: { flexDirection: 'row', marginTop: 8 },
  stat: { marginHorizontal: 16, alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: 'bold' },
  statLabel: { fontSize: 14, color: '#777' },
  userInfoContainer: { alignItems: 'center', marginBottom: 16 },
  username: { fontSize: 24, fontWeight: 'bold' },
  buttonContainer: { flexDirection: 'row', marginTop: 8 },
  editButton: { backgroundColor: '#007BFF', padding: 10, borderRadius: 5, marginRight: 8 },
  editButtonText: { color: '#fff', fontSize: 16 },
  shareButton: { backgroundColor: '#28A745', padding: 10, borderRadius: 5 },
  shareButtonText: { color: '#fff', fontSize: 16 },
  infoContainer: { marginBottom: 16 },
  infoText: { fontSize: 16, color: '#333' },
  postContainer: { padding: 16, backgroundColor: '#fff', borderRadius: 5, marginBottom: 8 },
  postTitle: { fontSize: 18, fontWeight: 'bold' },
  postContent: { fontSize: 14, color: '#666', marginVertical: 8 },
  postAuthor: { fontSize: 12, color: '#999' },
  postCategory: { fontSize: 12, color: '#999' },
  commentContainer: { marginTop: 8 },
  commentText: { fontSize: 14 },
  commentAuthor: { fontWeight: 'bold' },
  commentDate: { fontSize: 12, color: '#999' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContainer: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10 },
  closeButton: { alignSelf: 'flex-end' },
  closeButtonText: { fontSize: 18, color: '#007BFF' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 10, marginBottom: 10 },
  saveButton: { backgroundColor: '#007BFF', padding: 10, borderRadius: 5 },
  saveButtonText: { color: '#fff', textAlign: 'center' },
});

export default Profile;
