const nodemailer = require('nodemailer');

// Cấu hình transporter cho Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'phamvanhoang05082004@gmail.com', // Email của hệ thống
        pass: 'dtvslafekamlmihc' // Mật khẩu ứng dụng của Gmail
    }
});

// Hàm gửi email OTP
const sendOtpEmail = async (accountName, otp) => {
    const mailOptions = {
        from: 'MTB 67CS1 <phamvanhoang05082004@gmail.com>',
        to: accountName, // AccountName chính là email của người dùng
        subject: 'Mã OTP đặt lại mật khẩu - MTB 67CS1',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #FF4D6D;">Đặt lại mật khẩu</h2>
                <p>Xin chào,</p>
                <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản MTB 67CS1. Vui lòng sử dụng mã OTP sau để tiếp tục:</p>
                <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
                    <strong>${otp}</strong>
                </div>
                <p>Mã OTP này sẽ hết hạn sau 60 giây.</p>
                <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                <p>Trân trọng,<br>MTB 67CS1</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Lỗi gửi email:', error);
        return false;
    }
};

module.exports = {
    sendOtpEmail
}; 
