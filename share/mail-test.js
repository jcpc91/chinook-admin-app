const assert = require('assert');
const nodemailer = require('nodemailer');

// --- Manual Mock for nodemailer ---
const mockTransport = {
  sendMail: async (options) => {
    mockTransport.lastMailOptions = options;
    mockTransport.callCount++;
    return Promise.resolve({ messageId: 'mock-message-id' });
  },
  lastMailOptions: null,
  callCount: 0,
  reset: () => {
    mockTransport.lastMailOptions = null;
    mockTransport.callCount = 0;
  }
};

// Monkey-patch nodemailer.createTransport
nodemailer.createTransport = () => mockTransport;
// --- End Mock ---

// Dynamically import sendMail after the mock is in place
const { sendMail } = require('./mail');

async function runTest() {
  console.log('Running test: sendMail should send an email successfully');

  // Reset mock state before test
  mockTransport.reset();

  const mailOptions = {
    from: '"Test Sender" <sender@example.com>',
    to: 'recipient@example.com',
    subject: 'Test Subject',
    text: 'Hello world?',
    html: '<b>Hello world?</b>',
  };

  try {
    const info = await sendMail(mailOptions);

    // Assertions
    assert.strictEqual(info.messageId, 'mock-message-id', 'Test failed: Incorrect messageId');
    assert.strictEqual(mockTransport.callCount, 1, 'Test failed: sendMail was not called exactly once');
    assert.deepStrictEqual(mockTransport.lastMailOptions, mailOptions, 'Test failed: mailOptions mismatch');

    console.log('Test passed: sendMail sent email successfully');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1); // Exit with error code on failure
  }
}

runTest();
