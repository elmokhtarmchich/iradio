// The Cloudflare Worker code for handling contact form submissions using Cloudflare Email Routing

export default {
  async fetch(request, env) {
    // Define allowed origin for CORS
    const allowedOrigin = 'https://iradio.ma';

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleOptions(request, allowedOrigin);
    }

    // Prepare a response object to add headers
    let response;

    // Only allow POST requests
    if (request.method !== 'POST') {
      response = new Response('Only POST requests are accepted', { status: 405 });
    } else {
      // Check the origin of the request
      const origin = request.headers.get('Origin');
      if (origin !== allowedOrigin) {
        response = new Response('Request not allowed from this origin', { status: 403 });
      } else {
        try {
          const formData = await request.json();
          const { name, email, message, 'g-recaptcha-response': recaptchaResponse } = formData;

          // Validate reCAPTCHA
          if (!await this.isRecaptchaValid(recaptchaResponse, env.RECAPTCHA_SECRET_KEY)) {
            response = new Response(JSON.stringify({ success: false, message: 'reCAPTCHA validation failed.' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            });
          } else {
            // If reCAPTCHA is successful, send the email using the Cloudflare Send Email binding
            const emailMessage = {
              to: [{ email: "contact@iradio.ma" }], // The custom address you created in Email Routing
              from: [{ email: "form-handler@iradio.ma", name: "iRadio Contact Form" }], // This is an authorized sender
              subject: `New message from ${name}`,
              content: [
                {
                  type: 'text/plain',
                  value: `You have received a new message from your contact form.\n\nName: ${name}\nFrom Email: ${email}\n\nMessage:\n${message}`,
                },
              ],
            };

            await env.SEND_EMAIL.send(emailMessage);
            response = new Response(JSON.stringify({ success: true, message: 'Message sent successfully!' }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            });
          }
        } catch (error) {
          response = new Response(JSON.stringify({ success: false, message: 'An error occurred.', error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    }
    
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    return response;
  },

  async isRecaptchaValid(response, secret) {
    const recaptchaURL = 'https://www.google.com/recaptcha/api/siteverify';
    const recaptchaData = new URLSearchParams();
    recaptchaData.append('secret', secret);
    recaptchaData.append('response', response);

    const recaptchaResult = await fetch(recaptchaURL, {
      method: 'POST',
      body: recaptchaData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const recaptchaJson = await recaptchaResult.json();
    return recaptchaJson.success;
  }
};

// Helper function to handle CORS preflight requests
function handleOptions(request, allowedOrigin) {
    const headers = request.headers;
    if (
      headers.get("Origin") !== null &&
      headers.get("Access-Control-Request-Method") !== null &&
      headers.get("Access-Control-Request-Headers") !== null
    ) {
      // Handle CORS preflight requests.
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    } else {
      // Handle standard OPTIONS request.
      return new Response(null, {
        headers: {
          Allow: "POST, OPTIONS",
        },
      });
    }
}