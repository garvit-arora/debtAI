/**
 * Azure Document Intelligence / Vision OCR Service
 */

const ENDPOINT = import.meta.env.VITE_AZURE_VISION_ENDPOINT;
const KEY = import.meta.env.VITE_AZURE_VISION_KEY;

export const scanBill = async (imageFile) => {
  if (!ENDPOINT || !KEY) {
    throw new Error("Azure credentials not configured.");
  }

  try {
    // Note: This uses the Computer Vision Read API for simple OCR
    const url = `${ENDPOINT}/vision/v3.2/read/analyze`;
    
    // 1. Submit the image for analysis
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': KEY,
        'Content-Type': 'application/octet-stream'
      },
      body: imageFile
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to submit OCR task");
    }

    const operationLocation = response.headers.get('Operation-Location');
    
    // 2. Poll for the results
    let results = null;
    while (!results) {
      const resultResponse = await fetch(operationLocation, {
        headers: { 'Ocp-Apim-Subscription-Key': KEY }
      });
      const data = await resultResponse.json();
      
      if (data.status === 'succeeded') {
        results = data.analyzeResult;
      } else if (data.status === 'failed') {
        throw new Error("OCR analysis failed.");
      } else {
        await new Promise(r => setTimeout(r, 1000)); // Wait 1s
      }
    }

    // 3. Simple parser to find amounts (looks for currency patterns)
    const text = results.readResults.map(page => 
      page.lines.map(line => line.text).join(' ')
    ).join(' ');

    // Extract potential amounts using regex
    const amountMatches = text.match(/(\d+\.\d{2})/g);
    const amount = amountMatches ? Math.max(...amountMatches.map(Number)) : null;

    return {
      text,
      amount,
      detectedDate: new Date().toISOString().split('T')[0] // Fallback
    };

  } catch (error) {
    console.error("OCR Error:", error);
    throw error;
  }
};
