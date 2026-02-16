import slugifyLib from "slugify";

export function slugify(text) {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}

export default slugify;
