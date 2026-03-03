import { get, rIC } from "../../utils";

async function newsletterController() {
  const elNewsletter = get("#newsletter");
  if (!elNewsletter) return;

  const { NewsletterConnector } = await import("./NewsletterConnector");
  new NewsletterConnector();
}

export default () => rIC(newsletterController);
