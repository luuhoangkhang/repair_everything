const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const db = require('./db'); // Kết nối MySQL
const cors = require('cors');

const app = express(); // Khởi tạo app trước khi sử dụng
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = 'your_secret_key';

// Middleware để xác thực JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('Token là bắt buộc.');

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).send('Token không hợp lệ.');
    req.user = user;
    next();
  });
};

// Đăng ký tài khoản
app.post('/user_register', async (req, res) => {
  const { username, email, password, phone, account_type } = req.body;

  const query = 'INSERT INTO Users (username, email, password, account_type, phone) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [username, email, password, account_type, phone], (err, result) => {
    if (err) return res.status(500).send(err.message);
    res.send('Đăng ký thành công!');
  });
});

// Đăng ký tài khoản thợ
app.post('/technician_register', async (req, res) => {
  const { username, email, password, phone, account_type, technician_category_name } = req.body;

  if (account_type !== 'technician') {
    return res.status(400).send('Account type must be "technician" for this registration.');
  }

  const query = 'INSERT INTO Users (username, email, password, account_type, phone, technician_category_name) VALUES (?, ?, ?, ?, ?, ?)';
  
  db.query(query, [username, email, password, account_type, phone, technician_category_name], (err, result) => {
    if (err) return res.status(500).send(err.message);
    res.send('Đăng ký thành công!');
  });
});

// Lấy danh sách các loại thợ
app.get('/name_technician', async (req, res) => {
  const query = 'SELECT name FROM TechnicianCategories'; // Giả sử bạn có bảng TechnicianCategories trong cơ sở dữ liệu

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send(err.message); // Trả về lỗi 500 nếu có lỗi xảy ra
    }
    res.json(results); // Trả về kết quả dưới dạng JSON
  });
});

// Đăng nhập tài khoản
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM Users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).send(err.message);
    if (results.length === 0) return res.status(400).send('Email không tồn tại.');

    const user = results[0];
    // Kiểm tra mật khẩu (bỏ qua so sánh băm)
    if (user.password !== password) return res.status(400).send('Mật khẩu không chính xác.');

    const token = jwt.sign({ id: user.id, account_type: user.account_type }, SECRET_KEY);
    res.json({ token });
  });
});

// Get danh sách các bài viết kèm theo bình luận, tên người dùng và tên loại thợ
app.get('/posts', (req, res) => {
  const query = `
      SELECT p.*, 
             u.username,
             u.technician_category_name,
             (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', c.id, 'content', c.content, 'created_at', c.created_at, 'username', u2.username)) 
              FROM Comments c 
              JOIN Users u2 ON c.user_id = u2.id 
              WHERE c.post_id = p.id) AS comments
      FROM Posts p
      JOIN Users u ON p.user_id = u.id`; // JOIN để lấy username và technician_category_name từ bảng Users

  db.query(query, (err, results) => {
      if (err) {
          return res.status(500).send(err.message); // Trả về lỗi nếu có vấn đề xảy ra
      }
      res.json(results); // Trả về danh sách bài viết kèm theo bình luận dưới dạng JSON
  });
});

// Đăng bài viết
app.post('/posts', authenticateToken, (req, res) => {
  const { title, content, technician_category_name } = req.body; // Thêm technician_category_name vào body
  const userId = req.user.id;

  if (req.user.account_type !== 'user') {
    return res.status(403).send('Chỉ người dùng thông thường mới có thể đăng bài.');
  }

  // Bước 1: Kiểm tra xem technician_category_name có hợp lệ hay không
  const categoryQuery = 'SELECT name FROM TechnicianCategories WHERE name = ?';
  db.query(categoryQuery, [technician_category_name], (err, results) => {
    if (err) return res.status(500).send(err.message);
    if (results.length === 0) {
      return res.status(400).send('Loại thợ không hợp lệ.');
    }

    // Bước 2: Nếu hợp lệ, thực hiện câu lệnh INSERT
    const query = 'INSERT INTO Posts (title, content, user_id, technician_category_name) VALUES (?, ?, ?, ?)';
    db.query(query, [title, content, userId, technician_category_name], (err, result) => {
      if (err) return res.status(500).send(err.message);
      res.send('Đăng bài viết thành công!');
    });
  });
});

// Chỉnh sửa bài viết
app.put('/posts/:postId', authenticateToken, (req, res) => {
  const postId = req.params.postId;
  const { title, content } = req.body;
  const userId = req.user.id; // Giả sử bạn có userId từ token sau khi giải mã

  // Kiểm tra quyền sở hữu
  const checkQuery = 'SELECT user_id FROM Posts WHERE id = ?';
  db.query(checkQuery, [postId], (err, results) => {
    if (err) return res.status(500).send(err.message);

    if (results.length === 0) {
      return res.status(404).send('Bài viết không tồn tại.');
    }

    if (results[0].user_id !== userId) {
      return res.status(403).send('Bạn không có quyền chỉnh sửa bài viết này.');
    }

    // Cập nhật bài viết
    const updateQuery = 'UPDATE Posts SET title = ?, content = ? WHERE id = ?';
    db.query(updateQuery, [title, content, postId], (err, results) => {
      if (err) return res.status(500).send(err.message);

      res.send('Cập nhật bài viết thành công.');
    });
  });
});

// Xóa bài viết
app.delete('/posts/:postId', authenticateToken, (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id; // Giả sử bạn có userId từ token sau khi giải mã
  console.log("Post ID:", postId);
  console.log("User ID:", userId);

  // Kiểm tra quyền sở hữu
  const checkQuery = 'SELECT user_id FROM Posts WHERE id = ?';
  db.query(checkQuery, [postId], (err, results) => {
    if (err) return res.status(500).send(err.message);

    if (results.length === 0) {
      return res.status(404).send('Bài viết không tồn tại.');
    }

    if (results[0].user_id !== userId) {
      return res.status(403).send('Bạn không có quyền xóa bài viết này.');
    }

    // Xóa bài viết
    const deleteQuery = 'DELETE FROM Posts WHERE id = ?';
    db.query(deleteQuery, [postId], (err, results) => {
      if (err) return res.status(500).send(err.message);

      res.send('Xóa bài viết thành công.');
    });
  });
});

// Bình luận và báo giá
app.post('/posts/:postId/comments', authenticateToken, (req, res) => {
  const { content } = req.body;
  const { postId } = req.params;
  const userId = req.user.id;

  if (req.user.account_type !== 'technician') {
    return res.status(403).send('Chỉ thợ sửa mới có thể bình luận.');
  }
  if (req.user.account_type !== 'technician') {
    return res.status(403).send('Chỉ thợ sửa mới có thể bình luận.');
  }
  const query = 'INSERT INTO Comments (content, post_id, user_id) VALUES (?, ?, ?)';
  db.query(query, [content, postId, userId], (err, result) => {
    if (err) return res.status(500).send(err.message);
    res.send('Bình luận thành công!');
  });
});

// Mở tin nhắn sau khi chọn thợ sửa và giá
app.post('/messages', authenticateToken, (req, res) => {
  const { receiver_id, content } = req.body;
  const sender_id = req.user.id;

  const query = 'INSERT INTO Messages (sender_id, receiver_id, content) VALUES (?, ?, ?)';
  db.query(query, [sender_id, receiver_id, content], (err, result) => {
    if (err) return res.status(500).send(err.message);
    res.send('Tin nhắn đã được gửi!');
  });
});

// Khởi chạy server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
