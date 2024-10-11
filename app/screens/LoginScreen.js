import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../env'; // Nhập biến môi trường từ file env.js

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // Kiểm tra xem người dùng đã nhập email và mật khẩu chưa
    if (!email || !password) {
      Alert.alert('Vui lòng nhập email và mật khẩu');
      return;
    }

    try {
      // Gửi yêu cầu đăng nhập đến backend
      const response = await axios.post(`${API_URL}/login`, {
        email, // Sử dụng email để gửi lên server
        password,
      });

      // Nếu đăng nhập thành công, lưu token
      const { token } = response.data;

      // Lưu token vào AsyncStorage
      await AsyncStorage.setItem('token', token);
      console.log("Token received:", token);

      Alert.alert('Đăng nhập thành công!', 'Chào mừng bạn đến với ứng dụng!');

      // Điều hướng đến giao diện chính sau khi đăng nhập thành công
      navigation.navigate('Interface');
    } catch (error) {
      if (error.response) {
        // Nếu lỗi đến từ server
        Alert.alert('Lỗi', error.response.data);
      } else {
        Alert.alert('Có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Repair Everything</Text>
      <TextInput
        style={styles.input}
        placeholder="Email" // Thay đổi placeholder cho phù hợp
        value={email} // Sử dụng biến email
        onChangeText={setEmail} // Cập nhật biến email
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Đăng nhập" onPress={handleLogin} />
      <Button title="Đăng ký" onPress={() => navigation.navigate('RegisterType')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});

export default LoginScreen;
