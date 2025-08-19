// mock mail sender
const nodemailer = require('nodemailer');

const mockTransport = {
    lastMailOptions: null,
    callCount: 0,
    reset: () => {
        mockTransport.lastMailOptions = null;
        mockTransport.callCount = 0;
    },
    createTransport: () => mockTransport,
    sendMail: async (options) => {
        mockTransport.lastMailOptions = options;
        mockTransport.callCount++;
        return Promise.resolve({ messageId: 'mock-message-id' });
    }
};

// Monkey-patch nodemailer.createTransport
nodemailer.createTransport = () => mockTransport;

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

async function sendMail({ from, to, subject, text, html }) {
  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = {nodemailer, sendMail};
