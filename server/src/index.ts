addEventListener("fetch", (event: FetchEvent) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request: Request): Promise<Response> {
  // Check if the request method is POST and the path is "/invoice"
  if (request.method !== "POST" || new URL(request.url).pathname !== "/invoice") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Read the request body
  const requestBody = await request.text();

  const formData = new URLSearchParams(requestBody);

// Convert it to a TypeScript object
  const reqBody: Record<string, string> = {};
  formData.forEach((value: string, key: string) => {
    reqBody[key] = value;
  });

  console.log(reqBody);
  const { v4: uuidv4 } = await import('uuid');
  const botToken = "REPLACE_ME";
  const apiUrl = `https://api.telegram.org/bot${botToken}/createInvoiceLink`;

  const invoice = {
    chat_id: reqBody.user_id,
    title: reqBody.title,
    description: reqBody.description,
    payload: uuidv4(), // Replace with your actual invoice payload
    provider_token: 'REPLACE_ME', // Payment provider token
    start_parameter: uuidv4(), // A unique start parameter for the invoice
    currency: 'USD',
    prices: [{ label: 'Total Amount', amount: reqBody.price },], // Amount in cents (e.g., $100.00)
    photo_url: reqBody.photo
  };

  // Forward the request to the target API endpoint
  const response = await fetch(apiUrl, {
    method: "POST",
    body: JSON.stringify(invoice),
    headers: {
      "Content-Type": "application/json", // Adjust content type as needed
      // Add any other headers you need to forward to the target API
    },
  });

  // Create a response that includes the CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // Allow requests from any domain
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Check if the target API responded successfully
  if (response.ok) {
    var res = await response.text()
    // console.log(response.json());
    console.log(JSON.parse(res));
    return new Response(res, {
      status: response.status,
      headers: corsHeaders,
    });
  } else {
    // If the target API returned an error, forward that error to the client
    return new Response("Internal Server Error", {
      status: 500,
      headers: corsHeaders,
    });
  }
}
