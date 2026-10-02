/**
 * Eleventy config — ContractorLogic.
 *
 * Source:        src/
 *   _data/       — global JSON data (site, faqs)
 *   robots.txt.liquid, sitemap.xml.liquid — generated from site.json and the page list
 *   _includes/   — layouts, partials
 *   *.liquid     — page templates
 * Output:        dist/
 *
 * Vue 3 is installed via npm and copied from node_modules so the build has
 * no external CDN dependency in production.
 */
module.exports = function (eleventyConfig) {
  // Static asset pass-through
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("phone-config.js");
  eleventyConfig.addPassthroughCopy("form.min.js");
  eleventyConfig.addPassthroughCopy("ccpa-form.min.js");
  eleventyConfig.addPassthroughCopy("favicon.svg");
  eleventyConfig.addPassthroughCopy("apple-touch-icon.png");
  eleventyConfig.addPassthroughCopy("site.webmanifest");

  // Vue 3 global build — copy from node_modules into dist/js/
  eleventyConfig.addPassthroughCopy({
    "node_modules/vue/dist/vue.global.prod.js": "js/vue.global.prod.js"
  });

  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));
  eleventyConfig.addGlobalData("currentYear", () => new Date().getFullYear());

  eleventyConfig.addWatchTarget("./css/");
  eleventyConfig.addWatchTarget("./js/");
  eleventyConfig.addWatchTarget("./phone-config.js");

  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["liquid", "html", "md"],
    htmlTemplateEngine: "liquid",
    markdownTemplateEngine: "liquid",
    pathPrefix: "/",
  };
};
