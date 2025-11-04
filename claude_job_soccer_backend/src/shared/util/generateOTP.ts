export const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    // return otp.toString();
    return "123456"; // For testing purposes, return a fixed OTP
}