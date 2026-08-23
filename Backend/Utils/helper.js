

exports.mailsend= async (to, subject, html) => {
  try {
    // const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    //   method: "POST",
    //   headers: {
    //     Accept: "application/json",
    //     "Content-Type": "application/json",
    //     "api-key": process.env.mailkey,
    //   },
    //   body: JSON.stringify({
    //     sender: {
    //       email: process.env.mailemail,
    //       name: process.env.name,
    //     },
    //     to: [{ email: to }],
    //     subject: subject,
    //     htmlContent: html,
    //   }),
    // });

    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(
    //     errorData.message || "Failed to send email via Brevo API",
    //   );
    // }

    // const data = await response.json();

    // return data;

    return "xyzdsv";
  } catch (err) {
    throw new Error(err.message);
  }
};
