const fs = require("fs");
const path = require("path");

fs.readdir("./esm", (err, files) => {
  files.forEach((file) => {
    if (file.endsWith(".js")) {
      fs.rename(
        path.join("./esm", file),
        path.join("./esm", file.replace(".js", ".mjs")),
        (err) => {
          if (err) throw err;
          console.log(`${file} renamed to ${file.replace(".js", ".mjs")}`);
        }
      );
    }
  });
});
