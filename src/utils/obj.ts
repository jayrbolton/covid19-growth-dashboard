/*
 * Object utilities
 * Object.values crashes safari
 */

export function vals(obj) {
  const vals = [];
  for (let key in obj) {
    vals.push(obj[key]);
  }
  return vals;
}

export function keys(obj) {
  const keys = [];
  for (let key in obj) {
    keys.push(key);
  }
  return keys;
}
