import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../env'; // Nhập biến môi trường từ file env.js

const InterfaceScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [categories, setCategories] = useState([]); // State để lưu danh sách loại thợ
  const [selectedCategory, setSelectedCategory] = useState(''); // State để lưu loại thợ được chọn

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };

    fetchUserId();
    fetchPosts();
    fetchCategories(); // Gọi hàm lấy danh sách loại thợ
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/name_technician`);
      setCategories(response.data); // Lưu danh sách loại thợ vào state
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lấy danh sách loại thợ.');
    }
  };

  const fetchPosts = async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get(`${API_URL}/posts`, {
          headers: {
            Authorization: token,
          },
        });
        // Sắp xếp các bài viết theo thứ tự được tạo gần nhất trước tiên
        const sortedPosts = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setPosts(sortedPosts);
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể lấy danh sách bài viết.');
      }
    }
  };
  

  const handlePost = async () => {
    if (!title || !content || !selectedCategory) {
      Alert.alert('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    const token = await AsyncStorage.getItem('token');
    const endpoint = editingPostId ? `${API_URL}/posts/${editingPostId}` : `${API_URL}/posts`;
    const method = editingPostId ? 'put' : 'post';

    try {
      const response = await axios[method](endpoint, { title, content, technician_category_name: selectedCategory }, {
        headers: {
          Authorization: token,
        },
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert('Thành công', editingPostId ? 'Cập nhật bài viết thành công.' : 'Đăng bài viết thành công.');
        setTitle('');
        setContent('');
        setSelectedCategory(''); // Reset lại loại thợ được chọn
        setIsFormVisible(false);
        setEditingPostId(null);
        fetchPosts();
      } else {
        Alert.alert('Lỗi', response.data || 'Có lỗi xảy ra.');
      }
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data || 'Có lỗi xảy ra.');
    }
  };

  const handleEditPost = (post) => {
    setTitle(post.title);
    setContent(post.content);
    setSelectedCategory(post.technician_category_name); // Set loại thợ khi chỉnh sửa
    setEditingPostId(post.id);
    setIsFormVisible(true);
  };

  const handleDeletePost = async (postId) => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await axios.delete(`${API_URL}/posts/${postId}`, {
        headers: {
          Authorization: token,
        },
      });

      if (response.status === 200) {
        Alert.alert('Thành công', 'Xóa bài viết thành công.');
        fetchPosts();
      } else {
        Alert.alert('Lỗi', response.data || 'Có lỗi xảy ra.');
      }
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data || 'Có lỗi xảy ra.');
    }
  };

  const handleComment = async (postId) => {
    // Kiểm tra nội dung bình luận
    if (!commentContent) {
      Alert.alert('Vui lòng điền nội dung bình luận.');
      return;
    }
  
    // Lấy loại thợ của người dùng
    const userCategory = await AsyncStorage.getItem('userCategory'); // Lưu loại thợ trong AsyncStorage khi đăng nhập
  
    // Tìm bài viết tương ứng
    const post = posts.find(p => p.id === postId);
  
    // Kiểm tra loại thợ có phù hợp không
    if (userCategory !== post.technician_category_name) {
      Alert.alert('Lỗi', 'Bạn không thể bình luận vì loại thợ không phù hợp với bài viết.');
      return;
    }
  
    const token = await AsyncStorage.getItem('token');
  
    try {
      const response = await axios.post(`${API_URL}/posts/${postId}/comments`, 
        { content: commentContent }, {
          headers: {
            Authorization: token,
          },
        });
  
      if (response.status === 200) {
        Alert.alert('Thành công', 'Bình luận thành công.');
        setCommentContent('');
        fetchPosts(); // Làm mới danh sách bài viết để hiển thị bình luận mới
      } else {
        Alert.alert('Lỗi', response.data || 'Có lỗi xảy ra.');
      }
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data || 'Có lỗi xảy ra.');
    }
  };

  const toggleForm = () => {
    setTitle('');
    setContent('');
    setSelectedCategory(''); // Reset lại loại thợ được chọn
    setEditingPostId(null);
    setIsFormVisible((prev) => !prev);
  };

  const togglePostDetails = (postId) => {
    setSelectedPostId(prevId => (prevId === postId ? null : postId));
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100} // Điều chỉnh độ cao cho bàn phím
    >
      <Text style={styles.title}>Danh sách bài viết</Text>
      <Button title={isFormVisible ? "Hủy" : "Đăng bài viết"} onPress={toggleForm} />

      {isFormVisible && (
        <View>
          <TextInput
            placeholder="Tiêu đề"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
          <TextInput
            placeholder="Nội dung"
            value={content}
            onChangeText={setContent}
            style={[styles.input, { height: 100 }]}
            multiline
          />
          <Picker
            selectedValue={selectedCategory}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          >
            <Picker.Item label="Chọn loại thợ" value="" />
            {categories.map((category) => (
              <Picker.Item key={category.name} label={category.name} value={category.name} />
            ))}
          </Picker>
          <Button title={editingPostId ? "Cập nhật" : "Gửi bài viết"} onPress={handlePost} />
        </View>
      )}

      {/* Ẩn danh sách bài viết khi đang đăng bài */}
      {!isFormVisible && (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.postContainer}>
              <Text style={styles.postTitle} onPress={() => togglePostDetails(item.id)}>
                {item.title}
              </Text>
              <Text style={styles.usernameText}>Người đăng: {item.username}</Text>
              <Text style={styles.contentText}>{item.content}</Text>
              <Text style={styles.dateText}>Được tạo lúc: {new Date(item.created_at).toLocaleString()}</Text>

              {selectedPostId === item.id && ( 
                <>
                  {item.user_id === userId ? (
                    <View style={styles.buttonContainer}>
                      <Button title="Chỉnh sửa" onPress={() => handleEditPost(item)} />
                      <Button title="Xóa" onPress={() => handleDeletePost(item.id)} color="red" />
                    </View>
                  ) : (
                    <View style={styles.commentContainer}>
                      <TextInput
                        placeholder="Viết bình luận..."
                        value={commentContent}
                        onChangeText={setCommentContent}
                        style={styles.commentInput}
                      />
                      <Button title="Gửi bình luận" onPress={() => handleComment(item.id)} />
                    </View>
                  )}
                  
                  {/* Hiển thị bình luận nếu có */}
                  {item.comments && item.comments.length > 0 ? (
                    <View style={styles.commentsContainer}>
                      {item.comments.map(comment => (
                        <View key={comment.id} style={styles.commentContainer}>
                          <Text style={styles.commentUsername}>{comment.username}</Text>
                          <Text style={styles.commentText}>{comment.content}</Text>
                          <Text style={styles.commentDateText}>{new Date(comment.created_at).toLocaleString()}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text>Chưa có bình luận nào.</Text>
                  )}
                </>
              )}
            </View>
          )}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  picker: {
    height: 1,
    width: '100%',
    marginBottom: 10,
  },
  postContainer: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  usernameText: {
    fontSize: 14,
    color: '#555',
  },
  contentText: {
    fontSize: 16,
    marginVertical: 5,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  commentContainer: {
    marginTop: 10,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  commentsContainer: {
    marginTop: 10,
  },
  commentUsername: {
    fontWeight: 'bold',
  },
  commentText: {
    fontSize: 14,
  },
  commentDateText: {
    fontSize: 12,
    color: '#999',
  },
  formContainer: {
    marginTop: 'auto', // Đẩy form xuống dưới cùng
    paddingTop: 10,
  },
  
});

export default InterfaceScreen;
