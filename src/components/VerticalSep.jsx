import React from "react";

export default function VerticalSep() {
  return <div style={styles.verticalSep}></div>;
}

const styles = {
  verticalSep: {
    width: "2.8px",
    height: "auto",
    alignSelf: "stretch",
    backgroundColor: "#434343",
    margin: "0 4px",
    borderRadius: "100px",
  },
};
