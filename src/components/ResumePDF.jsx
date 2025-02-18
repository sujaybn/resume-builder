import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  section: {
    marginBottom: 10,
  },
  heading: {
    fontSize: 18,
    marginBottom: 5,
    fontWeight: "bold",
  },
  content: {
    fontSize: 12,
  },
});

const ResumePDF = ({ content }) => {
  const sections = content.split("\n\n").map((section) => section.trim());

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.heading}>{section.split("\n")[0]}</Text>
            <Text style={styles.content}>{section.split("\n").slice(1).join("\n")}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
};

export default ResumePDF;