import { debounce, getAll } from "../../utils";

type VideoTypes = "html5" | "vimeo" | "youtube";
type VideoMap = Record<VideoTypes, HTMLElement[]>;

const typesMap = {
  html5: "HTML5",
  youtube: "YouTube",
  vimeo: "Vimeo",
};
async function createVideos([type, elements]: [VideoTypes, HTMLElement[]]) {
  if (elements.length === 0) return;
  const { default: VideoInstance } = await import(
    /* webpackChunkName: "[request]" */ `./types/${typesMap[type]}`
  );
  elements.forEach((e) => {
    e.dataset.interactive = "true";
    new VideoInstance(e);
  });
}

function bindVideos() {
  const elVideos = getAll(".js-video:not([data-interactive])");
  if (elVideos.length === 0) return;

  const videos: VideoMap = {
    html5: [],
    vimeo: [],
    youtube: [],
  };

  for (const elVideo of elVideos) {
    const type = elVideo.getAttribute("data-type") as VideoTypes | null;
    if (type) videos[type].push(elVideo);
  }

  const videosMap = Object.entries(videos) as [VideoTypes, HTMLElement[]][];
  videosMap.forEach(createVideos);
}

export default function videoController() {
  bindVideos();

  new MutationObserver(
    debounce(() => {
      bindVideos();
    }, 250),
    // @ts-expect-error This is an ID of main element
  ).observe(MainContent, {
    childList: true,
    subtree: true,
  });
}
