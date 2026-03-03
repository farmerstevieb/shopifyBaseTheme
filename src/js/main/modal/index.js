import { getAll, rIC } from "../../utils";

async function load(elements) {
  const { Modal } = await import("./modal");
  new Modal(elements);
}

function modalController() {
  const elModal = getAll(".js-modal");
  if (elModal.length) load(elModal);
}

export default () => rIC(modalController);
