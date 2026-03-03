import { get, getAll } from "../../utils";

class GeoIpBlock {
  constructor() {
    this.geoLocation = sessionStorage.getItem("geoLocation");
    this.bindEvents();
  }

  bindEvents() {
    if (!this.geoLocation) this.getLocation();
    if (this.geoLocation) this.productBlock();
  }

  getLocation() {
    fetch("/browsing_context_suggestions.json")
      .then((response) => response.json())
      .then((data) => {
        sessionStorage.setItem(
          "geoLocation",
          data.detected_values.country.handle
        );
      })
      .catch((e) => console.error(e))
      .finally(() => {
        this.productBlock();
      });
  }

  productBlock() {
    const PDPformBtnUK = get(".js-uk-only");
    const multiDisabledForms = getAll(".js-uk-only.disabled-form");
    const isGB = this.geoLocation !== "GB";
    if (multiDisabledForms.length > 0)
      this.multipleForms(multiDisabledForms, isGB);
    if (PDPformBtnUK) this.singleForm(PDPformBtnUK, isGB);
  }

  singleForm(form, location) {
    location ? this.appendMsg(form) : form.removeAttribute("disabled");
  }

  multipleForms(forms, location) {
    for (const form of forms) {
      this.singleForm(form, location);
    }
  }

  appendMsg(el) {
    el.innerHTML =
      '<button disabled class="button--collection flex items-center justify-center max-lg:flex-col-reverse max-lg:gap-y-[11px] lg:px-5 lg:py-3 button--primary lg:text-white relative hover:opacity-90">Unavailable</button>';
    el.insertAdjacentHTML(
      "afterbegin",
      '<span class="mt-2 text-2xs text-red-20 text-center">This product is only available for delivery to a GB address*</span>'
    );
  }
}

export { GeoIpBlock };
