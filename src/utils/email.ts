const nodemailer = require("nodemailer");
const htmlToText = require("html-to-text");
import mustache from "mustache";
import { readFileSync } from "fs";

export class Email {
    public to: string;
    public name: string;
    public url: string;
    public from: string;

    constructor(user: any, url: string) {
        this.to = user.email;
        this.name = user.firstName;
        this.url = url;
        this.from = `Akansie Team ${process.env.EMAIL_FROM}`;
    }

    // create transporter instance
    newTransport() {
        if (process.env.NODE_ENV === "production") {
            // TODO: use sendgrid
            return nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    async send(template: string, subject: string) {
        const htmlTemplate = readFileSync(
            `src/views/${template}.html`,
            "utf-8"
        );
        const view = {
            name: this.name,
            url: this.url,
        };
        const html = mustache.render(htmlTemplate, view);
        // define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
            text: htmlToText.toString(html),
            html,
        };

        // send email
        await this.newTransport().sendMail(mailOptions);
    }

    // user account verification email
    async sendAccountVerificationEmail() {
        await this.send("verify-email", "Verify Your Email Address");
    }

    async sendPasswordResetEmail() {
        await this.send("reset-password", "Reset Your Account Password");
    }
}
