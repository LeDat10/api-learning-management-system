const sendMailHelper = require("./sendMail");

module.exports.sendOtpEmail = async (email, otp) => {
    const subject = "Mã OTP xác thực tài khoản";
    const html = `<div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 480px; margin: auto; background-color: #ffffff; padding: 32px; border-radius: 10px; border: 1px solid #e0e0e0; box-shadow: 0 2px 6px rgba(0,0,0,0.05); color: #333;">
                        <h2 style="margin-top: 0; font-weight: 600; color: #2c3e50;">🔐 Xác minh địa chỉ email</h2>
                        <p>Xin chào,</p>
                        <p>Cảm ơn bạn đã đăng ký tài khoản với chúng tôi. Vui lòng sử dụng mã OTP dưới đây để xác minh địa chỉ email:</p>
                        
                        <div style="font-size: 28px; font-weight: bold; color: #d84315; background-color: #fff3e0; padding: 12px 24px; display: inline-block; border-radius: 6px; letter-spacing: 4px; margin: 20px 0;">
                            ${otp}
                        </div>

                        <p style="margin-top: 20px;"><strong>Lưu ý:</strong> Mã OTP có hiệu lực trong <strong>3 phút</strong>. Không chia sẻ mã này với bất kỳ ai.</p>
                        <p>Nếu bạn không yêu cầu xác minh, vui lòng bỏ qua email này.</p>

                        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

                        <p style="font-size: 14px; color: #888;">Trân trọng,</p>
                        <p style="font-size: 14px; color: #888;"><strong>Đội ngũ hỗ trợ - ...</strong></p>
                    </div>`;
    sendMailHelper.sendMail(email, subject, html);
};