import { SiGithub } from "@icons-pack/react-simple-icons";
import { MailIcon } from "lucide-react";
import React from "react";

export default function ContactIcon() {
  return (
    <a
      href="mailto:support@taski.dev"
      target="_blank"
      rel="noopener noreferrer"
      style={{ ...styles.container, color: "var(--text-muted)" }}
    >
      <MailIcon color="currentColor" size={24} strokeWidth={2.5} />
    </a>
  );
}

const styles = {
  container: {
    position: "absolute",
    bottom: "13px",
    right: "53px",
    zIndex: 9999,
    cursor: "pointer",
    display: "flex",
    opacity: 0.25,
  },
};
