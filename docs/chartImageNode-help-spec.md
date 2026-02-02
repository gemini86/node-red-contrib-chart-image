# Node-RED Help Text Spec: chartImageNode.html

## Purpose
This document provides a reference for writing and maintaining the help text in `src/chartImageNode.html` for the `chart-image` node, following the [Node-RED Help Style Guide](https://nodered.org/docs/creating-nodes/help-style-guide). It ensures consistency, clarity, and alignment with the project's README.

---

## General Guidelines
- Use clear, concise language.
- Use Markdown for formatting (headings, lists, code blocks).
- Use the correct heading levels: `### Inputs`, `### Outputs`, `### Details`, `### Examples`, `### Resources`.
- Use `:` for field descriptions, not `-` or `*`.
- Use code blocks for JSON and JavaScript examples.
- Use bullet lists for resources.
- Avoid duplicating information; reference the README for details.
- Use American English spelling, but note where both spellings are supported.

---

## Section-by-Section Template

### Title
- Start with a short, clear summary: "Generate a Chart.js image buffer."

### Inputs
- List each input as `: field (type) : description`.
- Example:
  - `: payload (object) : Chart.js configuration containing type, data, and options in msg.payload.`
  - `: width (number) : Optional pixel width override supplied by msg.width.`

### Outputs
- List each output as `: field (type) : description`.
- Example:
  - `: payload (buffer) : Image buffer rendered from the Chart.js configuration.`

### Details
- Explain how the node works, including:
  - How to set canvas size (msg.width/msg.height)
  - Default color palette behavior
  - Canvas background color options (American/British spelling)
  - Plugin support (annotation, datalabels, custom plugins via msg.plugins)
- Use short paragraphs and bullet points for clarity.

### Examples
- Provide at least two example configurations (bar chart, line chart) in JSON code blocks.
- Ensure examples match those in the README.

### Resources
- List relevant documentation links as bullet points.

---

## Review Checklist
- [ ] All sections present and in correct order
- [ ] Inputs/outputs use `:` syntax
- [ ] Examples match README
- [ ] Plugin and background color options described accurately
- [ ] Resource links are up to date
- [ ] No test code or implementation details included

---

## File Location
Place this spec in a `docs/` or `spec/` folder at the project root (not in `/src`).

---

## References
- [Node-RED Help Style Guide](https://nodered.org/docs/creating-nodes/help-style-guide)
- [README.md](../README.md)
