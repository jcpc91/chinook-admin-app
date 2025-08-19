class ConsoleMailer {
    send(to, subject, body) {
      console.log("====================");
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${body}`);
      console.log("====================");
    }
  }

  module.exports = ConsoleMailer;
