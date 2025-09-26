// The Cloudflare Worker code for handling contact form submissions using the Resend API

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

          // 1. Validate reCAPTCHA
          if (!await this.isRecaptchaValid(recaptchaResponse, env.RECAPTCHA_SECRET_KEY)) {
            response = new Response(JSON.stringify({ success: false, message: 'reCAPTCHA validation failed.' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            });
          } else {
            // 2. If reCAPTCHA is successful, send the email using the Resend API
            const resendResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
              },
              body: JSON.stringify({
                from: 'iRadio Contact Form <form-handler@iradio.ma>', // IMPORTANT: This domain must be verified in your Resend account.
                to: 'contact@iradio.ma', // Your destination email address.
                subject: `New message from ${name}`,
                text: `You have received a new message from your contact form.\n\nName: ${name}\nFrom Email: ${email}\n\nMessage:\n${message}`,
                reply_to: email, // Sets the reply-to address for convenience.
              }),
            });

            if (resendResponse.ok) {
              response = new Response(JSON.stringify({ success: true, message: 'Message sent successfully!' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              });
            } else {
              // Forward the error from Resend for easier debugging
              const errorData = await resendResponse.json();
              response = new Response(JSON.stringify({ success: false, message: 'Failed to send email.', error: errorData }), {
                status: resendResponse.status,
                headers: { 'Content-Type': 'application/json' },
              });
            }
          }
        } catch (error) {
          response = new Response(JSON.stringify({ success: false, message: 'An error occurred.', error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    }
    
    // Add CORS headers to the response
    if (response) {
        response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    }
    
    return response;
  },

  /**
   * Validates a reCAPTCHA response with Google's API.
   * @param {string} response - The g-recaptcha-response token.
   * @param {string} secret - The reCAPTCHA secret key.
   * @returns {Promise<boolean>} - True if the reCAPTCHA is valid.
   */
  async isRecaptchaValid(response, secret) {
    if (!response) return false;
    const recaptchaURL = 'https://www.google.com/recaptcha/api/siteverify';
    
    const formData = new URLSearchParams();
    formData.append('secret', secret);
    formData.append('response', response);

    try {
        const recaptchaResult = await fetch(recaptchaURL, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const recaptchaJson = await recaptchaResult.json();
        return recaptchaJson.success;
    } catch (error) {
        console.error("reCAPTCHA validation request failed:", error);
        return false;
    }
  }
};

/**
 * Handles CORS preflight (OPTIONS) requests.
 * @param {Request} request - The incoming request.
 * @param {string} allowedOrigin - The allowed origin.
 * @returns {Response}
 */
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
          "Access-Control-Allow-Headers": "Content-Type, Authorization", // Added Authorization
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
