export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/\s/g, "-")
    .replace(/[^a-z\-]/g, "");
}
