import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, TextInput, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
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
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/name_technician`);
      setCategories(response.data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lấy danh sách loại thợ.');
    }
  };

  const fetchPosts = async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get(`${API_URL}/posts`, {
          headers: { Authorization: token },
        });
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
    if (!commentContent) {
      Alert.alert('Vui lòng điền nội dung bình luận.');
      return;
    }

    const token = await AsyncStorage.getItem('token');

    try {
      const response = await axios.post(`${API_URL}/posts/${postId}/comments`, { content: commentContent }, {
        headers: { Authorization: token },
      });

      if (response.status === 200) {
        //Alert.alert('Thành công', 'Bình luận thành công.');
        setCommentContent('');
        fetchPosts();
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
    setSelectedCategory(''); 
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
      keyboardVerticalOffset={100} // Điều chỉnh giá trị này nếu cần
    >
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Profile')}>
        <Text style={[styles.buttonText, { fontSize: 20 }, {color: '#31A9D4'}]}>Profile</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Danh sách bài viết</Text>
      <Button title={isFormVisible ? "Hủy" : "Đăng bài viết"} onPress={toggleForm} />

      {isFormVisible && (
        <ScrollView>
          <View>
            <TextInput
              placeholder="Tiêu đề"
              value={title}
              onChangeText={setTitle}
              style={[styles.input, { height: 40 }]}
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
        </ScrollView>
      )}

      {!isFormVisible && (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.postContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.postTitle} onPress={() => togglePostDetails(item.id)}>
                  {item.title}
                </Text>
                <Text style={styles.categoryText}>{item.technician_category_name}</Text>
              </View>
              <Text style={styles.usernameText}>Người đăng: {item.username}</Text>
              <Text style={styles.contentText}>{item.content}</Text>
              <Text style={styles.dateText}>Được tạo lúc: {new Date(item.created_at).toLocaleString()}</Text>

              {selectedPostId === item.id && ( 
                <>
                  {item.user_id === userId ? (
                    <View style={styles.buttonContainer}>
                      <Button title="Chỉnh sửa" onPress={() => handleEditPost(item)} />
                      <Button title="Xóa" onPress={() => handleDeletePost(item.id)} />
                    </View>
                  ) : (
                    <View>
                      <TextInput
                        placeholder="Viết bình luận..."
                        value={commentContent}
                        onChangeText={setCommentContent}
                        style={[styles.input, { height: 60 }]}
                        multiline
                      />
                      <Button title="Gửi bình luận" onPress={() => handleComment(item.id)} />
                    </View>
                  )}
                </>
              )}

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
    textAlign: 'center',
    marginBottom: 10,
  },
  postContainer: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  postTitle: {
    width: '60%', // Chỉ chiếm 60% chiều rộng
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  usernameText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  categoryText: {
    fontSize: 14,
    color: '#007AFF',
  },
  contentText: {
    fontSize: 16,
    color: '#555',
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 8,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 8,
  },
  commentContainer: {
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
  },
  commentAuthor: {
    fontWeight: 'bold',
  },
  commentDate: {
    fontSize: 12,
    color: '#999',
  },
});

export default InterfaceScreen;
