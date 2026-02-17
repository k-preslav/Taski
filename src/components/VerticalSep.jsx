import React from "react";

export default function VerticalSep() {
  return <div style={styles.verticalSep}></div>;
}

const styles = {
  verticalSep: {
    width: "1.8px",
    height: "auto",
    alignSelf: "stretch",
    backgroundColor: "#393939",
    margin: "0 4px",
  },
};
