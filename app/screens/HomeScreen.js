import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Repair Everything</Text>
      <Text style={styles.description}>Ứng dụng kết nối người dùng và thợ!</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Bắt đầu</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#004581', // Đổi nền thành màu
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#8CC7DC', // Đổi màu chữ tiêu đề
  },
  description: {
    marginBottom: 20,
    textAlign: 'center',
    color: '#8CC7DC', // Đổi màu chữ mô tả
  },
  button: {
    backgroundColor: '#004581', // Màu nền của nút
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#018ABD', // Màu chữ của nút
    fontSize: 22,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
