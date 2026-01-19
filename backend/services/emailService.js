const nodemailer = require('nodemailer');

// Configuração do transportador (exemplo com Gmail/Outlook)
const transporter = nodemailer.createTransport({
  host: "smtp.seuservidor.com", // ex: smtp.gmail.com
  port: 587,
  secure: false, // true para 465, false para outras portas
  auth: {
    user: process.env.EMAIL_USER, // Seu e-mail corporativo
    pass: process.env.EMAIL_PASS, // Sua senha ou App Password
  },
});

const sendResetPasswordEmail = async (userEmail, token) => {
  // O link deve apontar para a página ResetPassword que você criou no Frontend
  const resetLink = `http://localhost:5173/reset-password/${token}`;

  const mailOptions = {
    from: '"ShortWin Suporte" <contato@suaempresa.com>',
    to: userEmail,
    subject: "Recuperação de Senha - ShortWin",
    html: `
      <div style="font-family: sans-serif; color: #1e3a8a;">
        <h2>Olá!</h2>
        <p>Você solicitou a redefinição de senha para sua conta no <b>ShortWin</b>.</p>
        <p>Clique no botão abaixo para criar uma nova senha. Este link expira em 1 hora.</p>
        <a href="${resetLink}" style="background-color: #1d4ed8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
          REDEFINIR MINHA SENHA
        </a>
        <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">
          Se você não solicitou isso, ignore este e-mail.
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendResetPasswordEmail };