import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Image, TouchableOpacity, FlatList, KeyboardAvoidingView, Modal, TextInput } from 'react-native';
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

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

  if (!userInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Thông tin người dùng không có.</Text>
      </View>
    );
  }

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
          <TouchableOpacity style={styles.editButton}>
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
  container: {
    flex: 1,
    backgroundColor: '#004581',
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1,
    marginLeft: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 18,
    color: '#fff',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  username: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#808080',
    padding: 8,
    borderRadius: 8,
    marginRight: 4, // Thêm khoảng cách giữa nút chỉnh sửa và chia sẻ
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  shareButton: {
    backgroundColor: '#808080',
    padding: 8, // Giảm padding để thu ngắn nút chia sẻ
    borderRadius: 8,
    alignItems: 'centerri',
  },
  shareButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  infoContainer: {
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginVertical: 4,
    fontWeight: '400',
    lineHeight: 18,
  },
  postContainer: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 3,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  postAuthor: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
  postCategory: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  commentContainer: {
    backgroundColor: '#f1f1f1',
    borderRadius: 5,
    padding: 5,
    marginTop: 5,
  },
  commentText: {
    fontSize: 14,
  },
  commentAuthor: {
    fontWeight: 'bold',
  },
  commentDate: {
    fontSize: 12,
    color: '#999',
  },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContainer: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10 },
  closeButton: { alignSelf: 'flex-end' },
  closeButtonText: { fontSize: 18, color: '#007BFF' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 10, marginBottom: 10 },
  saveButton: { backgroundColor: '#007BFF', padding: 10, borderRadius: 5 },
  saveButtonText: { color: '#fff', textAlign: 'center' },
});

export default Profile;
