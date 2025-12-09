exports.handler = async function(event, context) {
  // 1. CORS Headers
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

  // 2. Environment Check
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "API Key is missing in Netlify settings." }) };
  }

  // 3. Parse Data from HTML
  let incomingData;
  try {
    incomingData = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON." }) };
  }

  // 4. Send to Google (Free Model)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(incomingData) 
    });

    const data = await response.json();

    if (!response.ok) {
       return { statusCode: response.status, body: JSON.stringify({ error: "Google API Error", details: data }) };
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(data),
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: "Connection Failed" }) };
  }
};
