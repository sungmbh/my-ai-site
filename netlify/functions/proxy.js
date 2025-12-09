exports.handler = async function(event, context) {
  // 1. CORS: Allow your website to talk to this function
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    };
  }

  // 2. Security Check
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    console.error("CRITICAL ERROR: GEMINI_API_KEY is missing in Netlify.");
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Server Configuration Error: API Key is missing." }) 
    };
  }

  // 3. Receive Data from Your Website
  let incomingData;
  try {
    incomingData = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON received." }) };
  }

  // 4. The URL for the Free Google Gemini Model
  // We use 'v1beta' and 'gemini-1.5-flash' which is the most stable free model
  const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
    // 5. Send to Google
    const response = await fetch(googleUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(incomingData) // Pass the data exactly as your HTML formatted it
    });

    // 6. Handle Google Errors
    if (!response.ok) {
      const errorDetails = await response.text();
      console.error("Google API Error:", errorDetails);
      return { 
        statusCode: response.status, 
        body: JSON.stringify({ error: "AI Error", details: errorDetails }) 
      };
    }

    // 7. Success! Send answer back to your website
    const data = await response.json();
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error("Network Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Connection Failed" }) };
  }
};
