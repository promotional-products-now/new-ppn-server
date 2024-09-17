function toKebabCase(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`) // Convert camelCase to kebab-case
    .replace(/_+/g, '-') // Replace underscores with dashes
    .replace(/[^a-z0-9-]/g, '') // Remove special characters except dashes
    .replace(/--+/g, '-') // Replace multiple dashes with a single one
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
}

function cleanText(text) {
  // Remove numbers and symbols
  text = text.replace(/[0-9/:]+/g, '');

  // Remove all symbols except "&" and ","
  text = text.replace(/[^\w\s&,]/g, '');

  return text;
}

export { toKebabCase, cleanText };
