"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = void 0;
const nodemailer = require("nodemailer");
const htmlToText = require("html-to-text");
const mustache_1 = __importDefault(require("mustache"));
const fs_1 = require("fs");
class Email {
    constructor(user, url) {
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
    async send(template, subject) {
        const htmlTemplate = (0, fs_1.readFileSync)(`src/views/${template}.html`, "utf-8");
        const view = {
            name: this.name,
            url: this.url,
        };
        const html = mustache_1.default.render(htmlTemplate, view);
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
exports.Email = Email;
