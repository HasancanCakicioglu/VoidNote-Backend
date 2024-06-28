// nodemailer.js

import nodemailer from "nodemailer";

let transporter;

// Fonksiyon oluşturarak transporter oluşturmayı ve verify işlemlerini yapmayı sağlayabiliriz.
export function createTransporter() {
    transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // Use `true` for port 465, `false` for all other ports
        auth: {
            user: process.env.EMAIL_USER || "",
            pass: process.env.EMAIL_PASS || "",
        },
    });

    // Verify the transporter
    transporter.verify((error, success) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Node mailer is ready to send emails!");
        }
    });
}

export { transporter };
