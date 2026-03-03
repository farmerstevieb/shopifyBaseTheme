import { rIC } from "../../../utils";
import Video from "../Video";

type Source = {
  format: string;
  height: number;
  mime_type: string;
  url: string;
  width: number;
};

export default class HTML5Video extends Video {
  player!: HTMLVideoElement;

  createPlayer() {
    if (this.player) return;

    if (this.isMobile && !this.canPlayOnMobile) {
      return;
    }

    const mobileSources = this.container.dataset.sourcesMob;
    const mobileUrl = this.container.dataset.urlMob;

    let hasMobileVideo = false;
    if (this.isMobile) {
      if (mobileSources) {
        try {
          const parsed: any = JSON.parse(mobileSources);
          hasMobileVideo = !!(
            parsed &&
            parsed.sources &&
            Array.isArray(parsed.sources) &&
            parsed.sources.length > 0
          );
        } catch (error) {
          hasMobileVideo = false;
        }
      } else if (mobileUrl && mobileUrl.trim() !== "") {
        hasMobileVideo = true;
      }
    }

    let sourcesData: string;
    if (this.isMobile && hasMobileVideo) {
      sourcesData = mobileSources || "";
    } else {
      sourcesData = this.container.dataset.sources ?? "[]";
    }

    let sources: Source[] = [];
    try {
      const parsed: any = JSON.parse(sourcesData);
      if (Array.isArray(parsed)) {
        sources = parsed as Source[];
      } else if (parsed && parsed.sources && Array.isArray(parsed.sources)) {
        sources = parsed.sources as Source[];
      }
    } catch (error) {
      sources = [];
    }

    if (sources.length === 0) {
      return;
    }

    this.container.innerHTML = `
    <video
      class="js-object-video"
      playsinline
      preload="${this.canAutoplay ? "auto" : "metadata"}"
      autoplay="${this.canAutoplay ? "autoplay" : ""}"
      ${!this.canSound || this.canAutoplay ? "muted='muted'" : ""}
      ${this.canAutoplay ? "" : "controls"}
      loop="${this.canLoop ? "loop" : '"'}">
        ${[...new Set(sources.map((src) => src.format))]
          .map((format) => {
            const matchingSources = sources
              .filter((source) => source.format === format)
              .sort((a, b) => (a.width > b.width ? 1 : -1));

            const matchingSource =
              matchingSources.find(
                (source) => source.width >= window.innerWidth,
              ) ?? matchingSources[0];

            if (matchingSource) {
              return `<source src="${matchingSource.url}" type="${matchingSource.mime_type}">`;
            }
            return "";
          })
          .join("\n")}
    </video>`;

    // @ts-expect-error TODO: types
    this.player = this.container.firstElementChild;
    // @ts-expect-error TODO: types
    this.player.element = this.container.firstElementChild;

    this.player.addEventListener("canplay", () => {
      this.onReady();
    });
    this.player.addEventListener("ended", () => {
      this.onStop();
    });
    this.player.addEventListener("play", () => {
      this.onPlay();
    });
    this.player.addEventListener("pause", () => {
      this.pause();
    });
  }

  recreatePlayer() {
    const wasPlaying = this.isPlaying;
    const currentTime = this.player?.currentTime || 0;
    const wasAutoplay = this.canAutoplay;

    if (this.player) {
      this.player.pause();
      this.container.innerHTML = "";
      this.player = null as any;
    }

    this.isReady = false;
    this.isPlaying = false;
    this.element.dataset.status = "paused";

    if (this.isMobile && !this.canPlayOnMobile) {
      return;
    }

    this.createPlayer();

    if (this.player) {
      const restoreState = () => {
        if (!this.player) {
          return;
        }

        if (currentTime > 0) {
          this.player.currentTime = currentTime;
        }

        if (wasAutoplay || wasPlaying) {
          this.play();
        }
      };

      if (this.player.readyState >= 3) {
        restoreState();
      } else {
        this.player.addEventListener(
          "loadeddata",
          () => {
            restoreState();
          },
          { once: true },
        );
      }
    }
  }

  playVideo() {
    this.player.play();
  }

  pauseVideo() {
    this.player.pause();
  }

  onReady() {
    if (this.isReady) return;
    this.isReady = true;

    if (!this.canAutoplay) {
      this.element.dataset.status = "loaded ready";
    }

    rIC(() => {
      this.flushQueue();
    });
  }
}
