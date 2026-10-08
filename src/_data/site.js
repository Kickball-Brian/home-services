const site = {
  name: "ContractorLogic",
  legalName: "ContractorLogic",
  copyrightHolder: "Email Agency",
  url: "https://staging.contractorlogic.net/",
  productionUrl: "https://contractorlogic.net/",
  description: "Get matched with pre-screened, local home service professionals for any home project. Completely free, with no commitment required.",
  email: "info@contractorlogic.com",
  defaultPhone: "8005550199",
  defaultPhoneFormatted: "800-555-0199",
  address: { addressCountry: "US" },
  areaServed: "United States",
  hours: [
    { days: "Monday-Friday", time: "9am-9pm EST" },
    { days: "Saturday-Sunday", time: "CLOSED" }
  ],
  indexable: true
};

// SITE_ENV=staging is set on the staging Netlify project. Staging stays
// crawlable but is marked noindex, and canonicals point at the staging host.
if (process.env.SITE_ENV === "staging") {
  site.staging = true;
  site.productionUrl = site.url;
}

// Appended to CSS/JS URLs so a new deploy is never served from the
// year-long immutable browser cache set in netlify.toml.
site.buildId = (process.env.COMMIT_REF || Date.now().toString(36)).slice(0, 10);

module.exports = site;
