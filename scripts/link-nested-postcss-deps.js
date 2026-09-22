const fs = require("fs");
const path = require("path");

const nestedDir = path.join("node_modules", "next", "node_modules");
fs.mkdirSync(nestedDir, { recursive: true });

function exists(filePath) {
  try {
    fs.lstatSync(filePath);
    return true;
  } catch {
    return false;
  }
}

for (const pkg of ["picocolors", "source-map-js"]) {
  const dest = path.join(nestedDir, pkg);
  const root = path.join("node_modules", pkg);
  if (!exists(root) || exists(dest)) {
    continue;
  }

  fs.symlinkSync(path.join("..", "..", pkg), dest, "dir");
}
