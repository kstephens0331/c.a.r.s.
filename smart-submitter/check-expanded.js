#!/usr/bin/env node
/**
 * Expanded health check — tests a large set of potential directory URLs
 */
const https = require('https');
const http = require('http');

const candidates = [
  // Already confirmed alive
  { name: "EZlocal", url: "https://dash.ezlocal.com/newlisting/", dr: 62 },
  { name: "MerchantCircle", url: "https://www.merchantcircle.com/signup", dr: 65 },
  { name: "n49", url: "https://www.n49.com/add-business", dr: 30 },
  { name: "VeteranOwnedBiz", url: "https://www.veteranownedbusiness.com/", dr: 40 },
  { name: "LocalBizNetwork", url: "https://www.localbiznetwork.com/add-business", dr: 26 },

  // Different URLs to try for known directories
  { name: "AddYP", url: "https://addyp.com/", dr: 30 },
  { name: "AddYP-listing", url: "https://addyp.com/add-listing", dr: 30 },
  { name: "Brownbook-new", url: "https://www.brownbook.net/business/add/", dr: 68 },
  { name: "HotFrog-admin", url: "https://admin.hotfrog.com/add/index-card", dr: 57 },
  { name: "Manta-free", url: "https://www.manta.com/add-your-company", dr: 78 },
  { name: "Manta-free2", url: "https://www.manta.com/business-listings/free-business-listing", dr: 78 },
  { name: "Jasmine", url: "https://www.jasminedirectory.com/submit.html", dr: 60 },
  { name: "Kompass-US", url: "https://us.kompass.com/registerNewCompany/identity", dr: 70 },
  { name: "Tupalo-register", url: "https://tupalo.com/en/register", dr: 72 },
  { name: "YellowBot", url: "https://www.yellowbot.com/", dr: 42 },
  { name: "Opendi-new", url: "https://www.opendi.us/spring/create", dr: 56 },

  // Fresh directories to try
  { name: "MapQuest", url: "https://www.mapquest.com/", dr: 87 },
  { name: "CitySearch", url: "https://www.citysearch.com/", dr: 82 },
  { name: "ShowMeLocal", url: "https://www.showmelocal.com/Submit.aspx", dr: 55 },
  { name: "Superpages", url: "https://www.superpages.com/", dr: 81 },
  { name: "DexKnows", url: "https://www.dexknows.com/", dr: 79 },
  { name: "CitySquares-new", url: "https://citysquares.com/", dr: 48 },
  { name: "Alignable-new", url: "https://www.alignable.com/", dr: 70 },
  { name: "ProvenExpert", url: "https://www.provenexpert.com/en-us/signup/", dr: 70 },
  { name: "Bark", url: "https://www.bark.com/en/us/register/pro/", dr: 65 },
  { name: "Porch", url: "https://pro.porch.com/", dr: 70 },
  { name: "Thumbtack", url: "https://www.thumbtack.com/pro/", dr: 80 },
  { name: "FindOpen", url: "https://www.findopen.com/add-business", dr: 30 },
  { name: "AllBiz", url: "https://www.allbiz.com/register", dr: 55 },
  { name: "Tuugo-new", url: "https://www.tuugo.us/CompanyRegistration", dr: 42 },
  { name: "iGlobal", url: "https://www.iglobal.co/united-states/add-company", dr: 40 },
  { name: "LocalStack", url: "https://localstack.com/", dr: 28 },
  { name: "YellowPages-add", url: "https://adsolutions.yp.com/listings/basic", dr: 88 },
  { name: "GetFave", url: "https://www.getfave.com/", dr: 25 },
  { name: "CompaniesInUSA", url: "https://www.companiesintheusa.com/", dr: 18 },
  { name: "Cylex-register", url: "https://www.cylex.us.com/company-registration.html", dr: 55 },
  { name: "eBusinessPages", url: "https://www.ebusinesspages.com/add-company.php", dr: 40 },
  { name: "BizExposed", url: "https://www.bizexposed.com/Free-Listing.php", dr: 26 },
  { name: "Foursquare-add", url: "https://foursquare.com/add-place", dr: 91 },
  { name: "ClassifiedAds", url: "https://www.classifiedads.com/services/", dr: 55 },
  { name: "Geebo", url: "https://www.geebo.com/", dr: 50 },
  { name: "Spoke-new", url: "https://www.spoke.com/", dr: 50 },
  { name: "iBegin-submit", url: "https://www.ibegin.com/directory/submit-your-business/", dr: 30 },
  { name: "Hub.biz-new", url: "https://hub.biz/", dr: 28 },
  { name: "ZipLeaf", url: "https://www.zipleaf.us/add-company", dr: 18 },
  { name: "Bunity", url: "https://www.bunity.com/", dr: 26 },
  { name: "BizSheet-alt", url: "https://bizsheet.com/add-listing", dr: 24 },
  { name: "USCityNet", url: "https://www.uscity.net/", dr: 20 },
  { name: "OpenStreetMap", url: "https://www.openstreetmap.org/", dr: 90 },
  { name: "TomTom-Places", url: "https://places.tomtom.com/", dr: 80 },
  { name: "Here-Places", url: "https://wego.here.com/", dr: 85 },
  { name: "Waze-Places", url: "https://www.waze.com/en/business/", dr: 80 },
  { name: "GBPImport-BingPlaces", url: "https://www.bingplaces.com/", dr: 92 },
  { name: "2FindLocal", url: "https://www.2findlocal.com/add-listing", dr: 10 },
  { name: "FindUSLocal", url: "https://www.finduslocal.com/add-business", dr: 10 },
  { name: "Enrollbusiness-new", url: "https://www.enrollbusiness.com/BusinessSignup", dr: 53 },
  { name: "SureHits", url: "https://www.surehits.com/", dr: 14 },
  { name: "Yalwa-US", url: "https://www.yalwa.com/Register", dr: 42 },
  { name: "Dealerbaba", url: "https://www.dealerbaba.com/register", dr: 28 },
  { name: "InfoTiger", url: "https://www.infotiger.com/addurl.html", dr: 22 },
  { name: "ListedIn", url: "https://www.listedin.us/", dr: 25 },
  { name: "SmartGuy", url: "https://smartguy.com/", dr: 30 },
  { name: "MyHuckleberry", url: "https://www.myhuckleberry.com/add-listing.aspx", dr: 28 },
  { name: "Cataloxy", url: "https://www.cataloxy.us/register.htm", dr: 28 },
  { name: "Wand", url: "https://www.wand.com/", dr: 28 },
  { name: "DataAxle", url: "https://local-listings.data-axle.com/", dr: 75 },
  { name: "FindUsHere", url: "https://www.find-us-here.com/listing.php", dr: 35 },
  { name: "Birdeye", url: "https://birdeye.com/", dr: 70 },
  { name: "Bizify-new", url: "https://www.bizify.co.uk/", dr: 30 },
];

function checkUrl(url, timeout = 8000) {
  return new Promise(resolve => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' } }, res => {
      res.resume();
      resolve({ status: res.statusCode, redirect: res.headers.location || null });
    });
    req.on('error', err => resolve({ status: 0, error: err.code }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'TIMEOUT' }); });
  });
}

(async () => {
  const alive = [];
  for (const c of candidates) {
    const r = await checkUrl(c.url);
    const ok = r.status >= 200 && r.status < 400;
    const icon = ok ? '✅' : '❌';
    console.log(`${icon} ${String(r.status || r.error).padStart(6)} | DR ${String(c.dr).padStart(2)} | ${c.name.padEnd(25)} | ${c.url}`);
    if (ok) alive.push(c);
  }
  console.log(`\n===== ${alive.length}/${candidates.length} ALIVE =====\n`);
  // Output as JSON for easy copy
  console.log(JSON.stringify(alive.map(a => ({
    name: a.name.replace(/-new|-alt|-register|-listing|-submit|-add|-free\d?$/g, ''),
    url: a.url,
    dr: a.dr,
    tier: a.dr >= 70 ? 'high' : a.dr >= 40 ? 'mid' : 'low',
  })), null, 2));
})();
