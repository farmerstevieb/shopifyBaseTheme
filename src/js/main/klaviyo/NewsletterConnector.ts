import { get } from "../../utils";

export class NewsletterConnector {
  form: HTMLFormElement;
  formFields: HTMLElement;
  formMessage: HTMLDivElement;

  constructor() {
    this.form = get("#newsletter") as HTMLFormElement;
    this.formFields = get(".form__fields") as HTMLElement;
    this.formMessage = document.createElement("div");
    this.bindEvents();
  }

  bindEvents() {
    this.form.addEventListener("submit", this.handleSubmit);
  }

  handleSubmit = (e: Event) => {
    e.preventDefault();

    const email: string = (
      get("#newsletter #newsletter-email") as HTMLInputElement
    ).value;
    const listId = "VWHj9K";
    const apiKey = "UAh9DK";

    const formData: FormData = new FormData();
    formData.append("email", email);
    formData.append("g", listId);

    const url = `https://manage.kmail-lists.com/ajax/subscriptions/subscribe?g=${listId}&email=${email}&api_key=${apiKey}`;

    fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => this.handleResponse(data))
      .catch(this.handleError);
  };

  handleResponse = (data: any) => {
    this.formFields.style.display = "none";
    if (data.data.is_subscribed === false) {
      this.formMessage.textContent =
        "Please check your email to confirm subscrition.";
    } else {
      this.formMessage.textContent = "You're already subscribed!";
    }
    this.formMessage.classList.add("form__state", "form__state--success");
    this.form.appendChild(this.formMessage);
  };

  handleError = (error: Error) => {
    console.error("Error:", error);
    this.formMessage.textContent = "There was an error with your subscription.";
    this.formMessage.classList.add("form__state", "form__state--error");
    this.form.appendChild(this.formMessage);
  };
}
