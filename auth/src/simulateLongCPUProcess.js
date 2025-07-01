function simulateLongIOProcess(durationMs) {
  return new Promise((resolve) => {
    console.log(`Simulating I/O process for ${durationMs}ms...`);
    setTimeout(() => {
      console.log(`I/O process finished after ${durationMs}ms.`);
      resolve("I/O process completed.");
    }, durationMs);
  });
}

module.exports = simulateLongIOProcess;
