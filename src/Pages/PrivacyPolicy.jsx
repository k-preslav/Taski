import React from "react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <Link to="/" style={styles.backLink}>← Back to Home</Link>

                <h1 style={styles.title}>Privacy Policy</h1>
                <p style={styles.lastUpdated}>Last Updated: March 4, 2026</p>

                <section style={styles.section}>
                    <h2 style={styles.heading}>1. Introduction</h2>
                    <p style={styles.paragraph}>
                        Welcome to Taski. We respect your privacy and are committed to protecting your personal data.
                        This privacy policy will inform you about how we handle your personal data when you use our Service.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>2. Information We Collect</h2>
                    <p style={styles.paragraph}>
                        We collect the following types of information:
                    </p>
                    <ul style={styles.list}>
                        <li><strong>Account Information:</strong> Name, email address, and authentication credentials when you create an account</li>
                        <li><strong>Content Data:</strong> Tasks, notes, images, and other content you create within the Service</li>
                        <li><strong>Usage Information:</strong> Information about how you interact with the Service</li>
                        <li><strong>Technical Data:</strong> IP address, browser type, device information, and access times</li>
                    </ul>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>3. How We Use Your Information</h2>
                    <p style={styles.paragraph}>
                        We use the information we collect to:
                    </p>
                    <ul style={styles.list}>
                        <li>Provide, maintain, and improve the Service</li>
                        <li>Process your authentication and manage your account</li>
                        <li>Enable collaboration features with other users</li>
                        <li>Respond to your comments, questions, and customer service requests</li>
                        <li>Monitor and analyze trends and usage of the Service</li>
                        <li>Detect, prevent, and address technical issues and security threats</li>
                    </ul>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>4. Data Storage and Security</h2>
                    <p style={styles.paragraph}>
                        Your data is stored using Appwrite, a secure backend-as-a-service platform. We implement
                        appropriate technical and organizational measures to protect your personal data against
                        unauthorized or unlawful processing, accidental loss, destruction, or damage.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>5. Data Sharing</h2>
                    <p style={styles.paragraph}>
                        We do not sell your personal data. We may share your information only in the following circumstances:
                    </p>
                    <ul style={styles.list}>
                        <li><strong>With collaborators:</strong> When you share projects, the shared content is visible to collaborators</li>
                        <li><strong>Service providers:</strong> We use Appwrite to host and process data</li>
                        <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
                    </ul>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>6. Third-Party Authentication</h2>
                    <p style={styles.paragraph}>
                        When you use OAuth authentication (e.g., GitHub, Google), we receive limited information from these
                        services as permitted by your privacy settings with those services. We recommend reviewing the
                        privacy policies of these third-party providers.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>7. Your Rights</h2>
                    <p style={styles.paragraph}>
                        You have the right to:
                    </p>
                    <ul style={styles.list}>
                        <li>Access your personal data</li>
                        <li>Correct inaccurate or incomplete data</li>
                        <li>Request deletion of your data</li>
                        <li>Withdraw consent at any time</li>
                    </ul>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>8. Data Retention</h2>
                    <p style={styles.paragraph}>
                        We retain your personal data only for as long as necessary to provide you with the Service and
                        for legitimate business purposes. When you delete your account, we will delete your personal data,
                        except where we are required to retain it for legal purposes.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>9. Cookies and Tracking</h2>
                    <p style={styles.paragraph}>
                        We use local storage and session storage to maintain your authentication state and user preferences.
                        We do not use third-party tracking cookies for advertising purposes.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>10. Children's Privacy</h2>
                    <p style={styles.paragraph}>
                        Our Service is not intended for users under the age of 13. We do not knowingly collect personal
                        information from children under 13. If you become aware that a child has provided us with personal
                        data, please contact us.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>11. Changes to This Privacy Policy</h2>
                    <p style={styles.paragraph}>
                        We may update our Privacy Policy from time to time. We will notify you of any changes by posting
                        the new Privacy Policy on this page and updating the "Last Updated" date.
                    </p>
                </section>

                <section style={styles.section}>
                    <h2 style={styles.heading}>12. Contact Us</h2>
                    <p style={styles.paragraph}>
                        If you have any questions about this Privacy Policy or our data practices, please contact us.
                    </p>
                </section>

                <div style={styles.footer}>
                    <Link to="/tos" style={styles.footerLink}>Terms of Service</Link>
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
