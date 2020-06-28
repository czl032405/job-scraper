console.info("[inject] Begin");
console.info($);

const wait = async function (timeout = 2000) {
  return await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
};

if (/zhipin.com/.test(location.host)) {
  const cityId = "c101281600";
  let config = JSON.parse(localStorage["job-scraper-config"] || "{}");
  let query =
    decodeURIComponent((location.href.match(/query=([^&?]*)/) || [])[1]) || "";
  let page =
    +decodeURIComponent((location.href.match(/page=([^&?]*)/) || [])[1]) || 1;

  window.start = function () {
    config.start = true;
    localStorage["job-scraper-config"] = JSON.stringify(config);
    action();
  };
  window.stop = function () {
    config.start = false;
    localStorage["job-scraper-config"] = JSON.stringify(config);
  };

  window.action = async function () {
    let list = [];

    $(".job-primary").each((ix, ele) => {
      let jobTitle = $(".job-name", ele).text().trim();
      let jobSalary = $(".job-limit .red", ele).text().trim();
      let jobLimit = $(".job-limit p", ele).text().trim();
      let publisher = $(".info-publis .name", ele).text().trim();
      let company = $(".info-company .name", ele).text().trim();
      let companyInfo = $(".info-company p", ele).text().trim();
      list.push({
        company,
        jobSalary,
        jobTitle,
        jobLimit,
        publisher,
        companyInfo,
        query,
      });
    });
    console.info(list);
    // ajax
    let result = await fetch("http://127.0.0.1:3000", {
      method: "POST",
      mode: "cors",
      withCredentials: false,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        platform: "zhipin",
        jobs: list,
      }),
    });
    console.info(result);

    if (page == 0 || page > 30 || isNaN(page) || list.length == 0) {
      window.stop();
    }
    if (config.start) {
      await wait();
      let nextLink = `https://www.zhipin.com/${cityId}/?query=${query}&page=${
        page + 1
      }&ka=page-${page + 1}`;
      location.href = nextLink;
    }
  };

  if (config.start) {
    window.action();
  }
}
