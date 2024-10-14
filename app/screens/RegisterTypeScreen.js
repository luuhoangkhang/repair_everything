import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const RegisterTypeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn loại tài khoản:</Text>
      
      {/* Nút Tài khoản Người dùng */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('UserRegistration', { accountType: 'user' })}
      >
        <Text style={styles.buttonText}>Tài khoản Người dùng</Text>
      </TouchableOpacity>

      {/* Nút Tài khoản Thợ */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('TechnicianRegistration')}
      >
        <Text style={styles.buttonText}>Tài khoản Thợ</Text>
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
    color: '#8CC7DC', // Đổi màu chữ tiêu đề
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#004581', // Màu nền của nút
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 12,
  },
  buttonText: {
    color: '#018ABD', // Màu chữ trong nút
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RegisterTypeScreen;
