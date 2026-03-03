import { get, getAll } from "../../utils";

export class Addresses {
  constructor(element) {
    this.addresses = element;
    this.newAddressForm = get(".js-new-address-form");
    this.addAddressButton = get(".js-add-address-button");

    this.closeNewAddressFormButtons = getAll(
      ".js-new-address-form-close",
      this.addresses
    );

    this.addressListEl = get(".js-address-list");
    this.addressEditButtons = getAll(
      ".js-edit-address-button",
      this.addressListEl
    );
    this.addressDeleteButtons = getAll(
      ".js-delete-address-button",
      this.addressListEl
    );
    this.editAddressForms = getAll(".js-edit-address-form", this.addressListEl);
    this.closeEditAddressForms = getAll(
      ".js-edit-address-form-close",
      this.addressListEl
    );
    this.bindListener();
  }

  bindListener() {
    this.releasePreloadTransitions();
    this.addAddressListeners();
  }

  addAddressListeners() {
    this.addAddressButton.addEventListener("click", () => {
      this.openNewAddressForm();
    });
    this.closeNewAddressFormButtons.forEach((closes) => {
      closes.addEventListener("click", () => {
        this.closeNewAddressForm();
      });
    });
    // this.newAddressForm.addEventListener("click", () => {
    //     this.closeNewAddressForm();
    // });
    this.addressEditButtons.forEach((edit) => {
      const { id } = edit.dataset;
      edit.addEventListener("click", () => {
        const editForm = this.editAddressForms.find((form) =>
          form.id.includes(id)
        );
        this.openEditAddressForm(editForm);
      });
    });
    this.closeEditAddressForms.forEach((closes) => {
      const { id } = closes.dataset;
      closes.addEventListener("click", () => {
        const editForm = this.editAddressForms.find((form) =>
          form.id.includes(id)
        );
        this.closeEditAddressForm(editForm);
      });
    });
  }

  releasePreloadTransitions() {
    window.addEventListener("load", () => {
      this.newAddressForm.classList.remove("preload");
      this.editAddressForms.forEach((form) => {
        form.classList.remove("preload");
      });
    });
  }

  closeNewAddressForm() {
    this.newAddressForm.classList.add("hidden-modal");
  }

  openNewAddressForm() {
    this.newAddressForm.classList.remove("hidden-modal");
  }

  closeEditAddressForm(form) {
    form.classList.add("hidden-modal");
  }

  openEditAddressForm(form) {
    form.classList.remove("hidden-modal");
  }
}
