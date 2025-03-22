const bcrypt = require('bcrypt');

const hashPasswords = async () => {
  const saltRounds = 10;
  const plainPassword = '123456789';
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
  console.log('Hashed Password:', hashedPassword);
  // Dùng giá trị này để cập nhật bảng Account qua SSMS
};

hashPasswords();