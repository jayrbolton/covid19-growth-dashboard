// Parse a CSV row into an array of strings, taking quotes into account.
// It would be better to use a library. But I got frustrated looking at the libraries on npm and
// decided to write this simple parser.
export function rowToArray(row) {
  let inQuoted = false; // Are we within a quoted string? If so, include commas in the column val
  let vals = [];
  let val = "";
  for (const ch of row) {
    if (ch === '"') {
      // Toggle the inQuoted bool
      inQuoted = !inQuoted;
    } else if (ch === "," && !inQuoted) {
      inQuoted = false;
      vals.push(parseColumnVal(val));
      val = "";
    } else {
      val += ch;
    }
  }
  if (val.length) {
    // Push any final column value
    vals.push(parseColumnVal(val));
  }
  return vals;
}

// Parse a string into a number, if it is a number. Otherwise leave it.
function parseColumnVal(val) {
  val = val.trim();
  if (val === "") {
    return null;
  } else if (isNaN(val)) {
    return val;
  } else {
    return Number(val);
  }
}
