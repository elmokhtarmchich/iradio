// The Cloudflare Worker code for handling contact form submissions

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
      response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
      return response;
    }

    // Check the origin of the request
    const origin = request.headers.get('Origin');
    if (origin !== allowedOrigin) {
      response = new Response('Request not allowed from this origin', { status: 403 });
      response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
      return response;
    }

    try {
      const formData = await request.json();
      const { name, email, message, 'g-recaptcha-response': recaptchaResponse } = formData;

      // Validate reCAPTCHA
      const recaptchaURL = 'https://www.google.com/recaptcha/api/siteverify';
      const recaptchaData = new URLSearchParams();
      recaptchaData.append('secret', env.RECAPTCHA_SECRET_KEY);
      recaptchaData.append('response', recaptchaResponse);

      const recaptchaResult = await fetch(recaptchaURL, {
        method: 'POST',
        body: recaptchaData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const recaptchaJson = await recaptchaResult.json();

      if (!recaptchaJson.success) {
        response = new Response(JSON.stringify({ success: false, message: 'reCAPTCHA validation failed.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        // If reCAPTCHA is successful, send the email using MailChannels
        const emailData = {
          personalizations: [
            {
              to: [{ email: env.EMAIL_TO, name: 'iRadio Contact Form' }],
              dkim_domain: 'iradio.ma', // Explicitly set the domain for DKIM
            },
          ],
          from: {
            email: 'no-reply@iradio.ma',
            name: 'iRadio Contact Form',
          },
          subject: `New message from ${name}`,
          content: [
            {
              type: 'text/plain',
              value: `You have received a new message from your contact form.\n\nName: ${name}\nEmail: ${email}\nMessage:\n${message}`,
            },
          ],
        };

        const sendEmailResult = await fetch('https://api.mailchannels.net/tx/v1/send', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(emailData),
        });

        if (sendEmailResult.status === 202) {
          response = new Response(JSON.stringify({ success: true, message: 'Message sent successfully!' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        } else {
          const errorText = await sendEmailResult.text();
          response = new Response(JSON.stringify({ success: false, message: `Failed to send email. MailChannels response: ${errorText}` }), {
            status: 500,
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
    
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    return response;
  },
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
