self.importScripts("speakGenerator.js");

self.addEventListener("message", event => {
  const { text, args } = event.data;
  
  try {
    const { buffer } = generateSpeech(text, args);
    
    self.postMessage(buffer, { transfer: [buffer] });
  } catch(err) {
    console.error(err);
    throw err;
  }
});
