import { SiGithub } from "@icons-pack/react-simple-icons";
import React from "react";

export default function GithubIcon() {
  return (
    <a
      href="https://github.com/k-preslav/Taski"
      target="_blank"
      rel="noopener noreferrer"
      style={{ ...styles.container, color: "var(--text-muted)" }}
    >
      <SiGithub color="currentColor" size={22} />
    </a>
  );
}

const styles = {
  container: {
    position: "absolute",
    bottom: "15px",
    right: "15px",
    zIndex: 100,
    cursor: "pointer",
    display: "flex",
    opacity: 0.25,
  },
};
