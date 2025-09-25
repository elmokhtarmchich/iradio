
// The Cloudflare Worker code for handling contact form submissions

export default {
  async fetch(request, env) {
    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response('Only POST requests are accepted', { status: 405 });
    }

    // Only allow requests from the website's origin
    const origin = request.headers.get('Origin');
    // TODO: Replace with your website's domain
    if (origin !== 'https://iradio.ma') {
      return new Response('Request not allowed from this origin', { status: 403 });
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
        return new Response(JSON.stringify({ success: false, message: 'reCAPTCHA validation failed.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // If reCAPTCHA is successful, send the email using MailChannels
      // (No signup required for MailChannels)
      const emailData = {
        personalizations: [
          {
            to: [{ email: env.EMAIL_TO, name: 'iRadio Contact Form' }],
          },
        ],
        from: {
          email: 'no-reply@iradio.ma', // This can be any email, it will be rewritten by MailChannels
          name: 'iRadio Contact Form',
        },
        subject: `New message from ${name}`,
        content: [
          {
            type: 'text/plain',
            value: `You have received a new message from your contact form.

Name: ${name}
Email: ${email}
Message:
${message}`,
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
        return new Response(JSON.stringify({ success: true, message: 'Message sent successfully!' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        const errorText = await sendEmailResult.text();
        return new Response(JSON.stringify({ success: false, message: `Failed to send email. MailChannels response: ${errorText}` }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

    } catch (error) {
      return new Response(JSON.stringify({ success: false, message: 'An error occurred.', error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
