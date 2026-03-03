import { get, rIC } from "../../utils";

async function lightboxController() {
  const hasTriggers = get("[data-lightbox]");
  if (!hasTriggers) return;

  const { Lightbox } = await import("./Lightbox");
  new Lightbox();
}

export default () => rIC(lightboxController);
