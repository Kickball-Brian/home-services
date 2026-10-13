const fs = require("fs");
const path = require("path");

// Maps a service slug to its image filename if one exists in images/services/
// (webp, png, svg or jpg), so a card shows the image and otherwise keeps its icon.
const dir = path.join(__dirname, "..", "..", "images", "services");
const slugs = [
  "bathroom-remodel", "flooring", "garage-doors", "home-warranty", "hvac",
  "kitchen-remodel", "pest-control", "roofing", "siding", "solar",
  "water-damage", "windows"
];

module.exports = () => {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  const found = {};
  for (const slug of slugs) {
    const file = ["webp", "png", "svg", "jpg"].map(e => `${slug}.${e}`).find(f => files.includes(f));
    if (file) found[slug] = file;
  }
  return found;
};
