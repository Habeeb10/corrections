export let environment = "prelive";

export default () => {
  if (environment === "prod") {
    /* ===== PROD ===== */
    return {
      target: environment,

      creditVille: "https://vigil.lendsqr.com/pecunia/api",
      utility: "",
      signature: "",
      api_key:
        "CRTG1Bcd7sZf4KsCBpcyuJdfyleDi3NFAPkfY4J1yEnVvzwdIOHg4ufKrX3AW5xP3ffTtACb1Pk5Ba5aNN98o5PvCIUd3z1z0i81DRjY9V9gUf7AgQUgct20Fhma7SxnN2eX6hk5hcaRNHV6zhlxJksqcn8jXconsnhHyGDEpRvVOgdnue10UN43Y4orzBS0vcxYCWbuvPRtvSFtUvRMZtzNZjS7B0F6y20LxiQtUpVKj1Ck4cdLUcKrNY5lE89H",
      accessKey: "",
    };
  } else if (environment == "uat") {
    /* ===== DEV ===== */
    return {
      target: environment,

      creditVille: "https://apigateway.creditvilleapp.com",
      utility: "",
      signature: "=",
      api_key:
        "CRTG1Bcd7sZf4KsCBpcyuJdfyleDi3NFAPkfY4J1yEnVvzwdIOHg4ufKrX3AW5xP3ffTtACb1Pk5Ba5aNN98o5PvCIUd3z1z0i81DRjY9V9gUf7AgQUgct20Fhma7SxnN2eX6hk5hcaRNHV6zhlxJksqcn8jXconsnhHyGDEpRvVOgdnue10UN43Y4orzBS0vcxYCWbuvPRtvSFtUvRMZtzNZjS7B0F6y20LxiQtUpVKj1Ck4cdLUcKrNY5lE89H",
      accessKey: "",
    };
  } else {
    /* ===== DEV ===== */
    return {
      target: environment,

      creditVille: "https://creditvilleprelive.com",
      utility: "",
      signature: "=",
      api_key:
        "CRTG1Bcd7sZf4KsCBpcyuJdfyleDi3NFAPkfY4J1yEnVvzwdIOHg4ufKrX3AW5xP3ffTtACb1Pk5Ba5aNN98o5PvCIUd3z1z0i81DRjY9V9gUf7AgQUgct20Fhma7SxnN2eX6hk5hcaRNHV6zhlxJksqcn8jXconsnhHyGDEpRvVOgdnue10UN43Y4orzBS0vcxYCWbuvPRtvSFtUvRMZtzNZjS7B0F6y20LxiQtUpVKj1Ck4cdLUcKrNY5lE89H",
      accessKey: "",
    };
  }
};
