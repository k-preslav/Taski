import React from "react";
import { Link } from "react-router-dom";

export default function TermsOfService() {
    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <Link to="/" style={styles.backLink}>← Back to Home</Link>

                <h1 style={styles.title}>Terms of Service</h1>
                <p style={styles.lastUpdated}>Last Updated: March 4, 2026</p>

                <section style={styles.section}>
                    <h2 style={styles.heading}>1. Acceptance of Terms</h2>
                    <p style={styles.paragraph}>
                        By accessing and using Taski ("the Service"), you accept and agree to be bound by the terms
                        and provision of this agreement. If you do not agree to these Terms of Service, please do not
                        use the Service.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>2. Use of Service</h2>
                    <p style={styles.paragraph}>
                        Taski provides a visual workspace for organizing tasks and ideas. You may use the Service for
                        lawful purposes only. You agree not to use the Service:
                    </p>
                    <ul style={styles.list}>
                        <li>In any way that violates any applicable law or regulation</li>
                        <li>To transmit any harmful, offensive, or unlawful content</li>
                        <li>To impersonate or attempt to impersonate another user or person</li>
                        <li>To interfere with or disrupt the Service or servers</li>
                    </ul>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>3. User Accounts</h2>
                    <p style={styles.paragraph}>
                        You are responsible for maintaining the confidentiality of your account credentials and for all
                        activities that occur under your account. You agree to notify us immediately of any unauthorized
                        use of your account.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>4. User Content</h2>
                    <p style={styles.paragraph}>
                        You retain all rights to the content you create and upload to Taski. By uploading content, you
                        grant us a license to store, process, and display your content solely for the purpose of providing
                        the Service to you.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>5. Intellectual Property</h2>
                    <p style={styles.paragraph}>
                        The Service and its original content, features, and functionality are owned by Taski and are
                        protected by international copyright, trademark, and other intellectual property laws.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>6. Termination</h2>
                    <p style={styles.paragraph}>
                        We may terminate or suspend your account and access to the Service immediately, without prior
                        notice or liability, for any reason, including breach of these Terms of Service.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>7. Disclaimer of Warranties</h2>
                    <p style={styles.paragraph}>
                        The Service is provided "as is" and "as available" without warranties of any kind, either express
                        or implied. We do not guarantee that the Service will be uninterrupted, secure, or error-free.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>8. Limitation of Liability</h2>
                    <p style={styles.paragraph}>
                        In no event shall Taski, its directors, employees, or affiliates be liable for any indirect,
                        incidental, special, consequential, or punitive damages arising out of your use of the Service.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>9. Changes to Terms</h2>
                    <p style={styles.paragraph}>
                        We reserve the right to modify or replace these Terms at any time. If a revision is material,
                        we will provide at least 30 days' notice prior to any new terms taking effect.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>10. Contact Us</h2>
                    <p style={styles.paragraph}>
                        If you have any questions about these Terms of Service, please contact us.
                    </p>
                </section>

                <div style={styles.footer}>
                    <Link to="/privacy-policy" style={styles.footerLink}>Privacy Policy</Link>
                    <Link to="mailto:support@taski.dev" style={styles.footerLink}>Contact</Link>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: "100vh",
        backgroundColor: "var(--bg)",
        color: "var(--text)",
        padding: "40px 20px",
    },
    content: {
        maxWidth: "800px",
        margin: "0 auto",
    },
    backLink: {
        color: "var(--accent)",
        textDecoration: "none",
        fontSize: "14px",
        display: "inline-block",
        marginBottom: "20px",
    },
    title: {
        fontSize: "42px",
        fontWeight: "700",
        marginBottom: "10px",
        color: "var(--text)",
    },
    lastUpdated: {
        fontSize: "14px",
        color: "var(--text-muted)",
        marginBottom: "40px",
    },
    section: {
        marginBottom: "32px",
    },
    heading: {
        fontSize: "24px",
        fontWeight: "600",
        marginBottom: "12px",
        color: "var(--text)",
    },
    paragraph: {
        fontSize: "16px",
        lineHeight: "1.6",
        color: "var(--text)",
        marginBottom: "12px",
    },
    list: {
        marginLeft: "20px",
        fontSize: "16px",
        lineHeight: "1.8",
        color: "var(--text)",
    },
    footer: {
        marginTop: "60px",
        paddingTop: "20px",
        borderTop: "1px solid var(--border)",
        gap: "20px",
        display: "flex",
    },
    footerLink: {
        color: "var(--accent)",
        textDecoration: "none",
        fontSize: "14px",
    },
};
