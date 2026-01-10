function initAbout() {
  // EmailJS configuration from config.js
  const EMAILJS_SERVICE_ID = CONFIG.EMAILJS_SERVICE_ID;
  const EMAILJS_TEMPLATE_ID_TEAM = CONFIG.EMAILJS_TEMPLATE_ID_TEAM;
  const EMAILJS_TEMPLATE_ID_USER = CONFIG.EMAILJS_TEMPLATE_ID_USER;
  const EMAILJS_PUBLIC_KEY = CONFIG.EMAILJS_PUBLIC_KEY;

  // EmailJS API endpoint
  const EMAILJS_API_URL = "https://api.emailjs.com/api/v1.0/email/send";

  // Section toggle removed - now using normal scrolling

  // Contact form handling
  const contactForm = document.getElementById("contact-form");
  const statusEl = document.getElementById("contact-status");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector(".contact-submit");
      const originalBtnText = submitBtn.textContent;

      // Get form values
      const name = document.getElementById("contact-name").value.trim();
      const surname = document.getElementById("contact-surname").value.trim();
      const email = document.getElementById("contact-email").value.trim();
      const message = document.getElementById("contact-message").value.trim();

      // Basic validation
      if (!name || !surname || !email || !message) {
        showStatus("Please fill in all fields.", "error");
        return;
      }

      if (!isValidEmail(email)) {
        showStatus("Please enter a valid email address.", "error");
        return;
      }

      // Disable button and show loading state
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
      hideStatus();

      try {
        // Send email to "our" TripPlanner+ team
        await sendEmail(EMAILJS_TEMPLATE_ID_TEAM, {
          from_name: `${name} ${surname}`,
          from_email: email,
          message: message,
          to_name: "TripPlanner+ Team",
        });

        // Send confirmation email to the user
        await sendEmail(
          EMAILJS_TEMPLATE_ID_USER,
          {
            to_name: `${name} ${surname}`,
            from_name: "TripPlanner+ Team",
            message:
              "We have received your message and our team will respond as soon as possible. Thank you for reaching out to us!",
          },
          email, // User's email as recipient
        );

        showStatus(
          "Message sent successfully! Check your email for confirmation.",
          "success",
        );
        contactForm.reset();
      } catch (error) {
        console.error("EmailJS Error:", error);
        showStatus(
          "Failed to send message. Please try again later.",
          "error",
        );
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });
  }

  /**
   * Send email using EmailJS api
   */
  async function sendEmail(templateId, templateParams, recipientEmail = null) {
    const payload = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: templateId,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: templateParams,
    };

    // Add recipient email if provided (for the auto-response email since that is entered by user)
    if (recipientEmail) {
      payload.template_params.to_email = recipientEmail;
    }

    const response = await fetch(EMAILJS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`EmailJS error: ${errorText}`);
    }

    return response.text();
  }

  /**
   * Validate email format
   */
  function isValidEmail(email) {
    // Changed regex to try being more valid
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Show status message
   */
  function showStatus(message, type) {
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = `contact-status ${type}`;
    }
  }

  /**
   * Hide status message
   */
  function hideStatus() {
    if (statusEl) {
      statusEl.className = "contact-status";
      statusEl.textContent = "";
    }
  }
}
