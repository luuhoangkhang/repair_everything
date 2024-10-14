import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { API_URL } from '../../env'; // Nhập biến môi trường từ file env.js

const UserRegistrationScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const handleUserRegistration = async () => {
    if (!username || !email || !password || !phone) {
      Alert.alert('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/user_register`, {
        username,
        email,
        password,
        phone,
        account_type: 'user',
      });

      if (response.status === 200) {
        Alert.alert('Đăng ký tài khoản thành công!', 'Bạn đã đăng ký tài khoản người dùng.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Đăng ký thất bại', response.data.message || 'Có lỗi xảy ra.');
      }
    } catch (error) {
      Alert.alert('Đăng ký thất bại', error.response?.data?.message || error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký Tài khoản Người dùng</Text>
      <TextInput 
        placeholder="Tên đăng nhập" 
        value={username} 
        onChangeText={setUsername} 
        style={styles.input} 
        placeholderTextColor="#DDE8F0" // Đổi màu chữ placeholder
      />
      <TextInput 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        keyboardType="email-address" 
        style={styles.input} 
        placeholderTextColor="#DDE8F0" // Đổi màu chữ placeholder
      />
      <TextInput 
        placeholder="Mật khẩu" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
        style={styles.input} 
        placeholderTextColor="#DDE8F0" // Đổi màu chữ placeholder
      />
      <TextInput 
        placeholder="Số điện thoại" 
        value={phone} 
        onChangeText={setPhone} 
        keyboardType="phone-pad" 
        style={styles.input} 
        placeholderTextColor="#DDE8F0" // Đổi màu chữ placeholder
      />
      <TouchableOpacity style={styles.button} onPress={handleUserRegistration}>
        <Text style={styles.buttonText}>Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#004581',
  },
  title: {
    fontSize: 24,
    color: '#8CC7DC',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#8CC7DC', // Màu viền
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    color: '#DDE8F0', // Màu chữ khi nhập
  },
  button: {
    backgroundColor: '#004581', // Màu nền nút
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#018ABD', // Màu chữ nút
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default UserRegistrationScreen;
