function toKebabCase(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`) // Convert camelCase to kebab-case
    .replace(/_+/g, '-') // Replace underscores with dashes
    .replace(/--+/g, '-') // Replace multiple dashes with a single one
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
}

export { toKebabCase };
