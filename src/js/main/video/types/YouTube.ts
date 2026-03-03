import { rIC } from "../../../utils";
import Video from "../Video";

export type YtPlayer = YT.Player & {
  element: HTMLIFrameElement;
};

let youtubeApiCallbacks: (() => void)[] = [];
window.onYouTubeIframeAPIReady = () => {
  for (const callback of youtubeApiCallbacks) {
    callback();
  }
  youtubeApiCallbacks = [];
};

export default class YTVideo extends Video {
  player!: YtPlayer;
  static preconnected?: boolean;

  createPlayer() {
    if (this.player) return;
    YTVideo.warmConnections();

    const { Player: YoutubePlayer } = window.YT || {};
    if (!YoutubePlayer) {
      this.loadScript();
      return;
    }

    this.container.innerHTML = "<div></div>";
    this.player = new YoutubePlayer(
      this.container.firstElementChild as HTMLElement,
      {
        videoId: this.id,
        playerVars: {
          autoplay: +this.canAutoplay,
          controls: +!this.canAutoplay,
          loop: +this.canLoop,
          mute: +!this.canSound,
          modestbranding: 1,
          playlist: this.id,
          playsinline: 1,
          rel: 0,
          color: "white",
        },
        events: {
          onReady: () => {
            this.onReady();
          },
          onStateChange: ({ data }) => {
            switch (data) {
              case YT.PlayerState.ENDED: {
                this.onStop();
                break;
              }
              case YT.PlayerState.PLAYING: {
                this.onPlay();
                break;
              }
              case YT.PlayerState.PAUSED: {
                this.pause();
                break;
              }
              default: {
                break;
              }
            }
          },
        },
      },
    );

    this.player.element = this.player.getIframe();

    if (this.playTrigger) {
      this.playTrigger.style.backgroundImage = `url("https://i.ytimg.com/vi/${this.id}/maxresdefault.jpg")`;
    }
  }

  async playVideo() {
    this.player.playVideo();
  }

  pauseVideo() {
    this.player.pauseVideo();
  }

  recreatePlayer() {
    this.container.style.opacity = "0";

    if (this.player) {
      this.player.destroy();
      this.player = null as any;
    }

    this.isReady = false;
    this.isPlaying = false;
    this.element.dataset.status = "paused";

    this.container.innerHTML = "";

    this.createPlayer();

    setTimeout(() => {
      this.container.style.opacity = "";
    }, 100);
  }

  onReady() {
    this.isReady = true;
    if (!this.canSound) this.player.mute();

    if (this.fit === "cover") {
      this.setupCoverMode();
    }

    this.element.dataset.status = "loaded paused";

    rIC(() => {
      this.flushQueue();
    });
  }

  setupCoverMode() {
    const updateSize = () => {
      const containerRect = this.container.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      if (containerWidth === 0 || containerHeight === 0) {
        return;
      }

      const videoAspectRatio = 16 / 9;
      const containerAspectRatio = containerWidth / containerHeight;

      let width, height;

      if (containerAspectRatio > videoAspectRatio) {
        width = containerWidth;
        height = containerWidth / videoAspectRatio;
      } else {
        height = containerHeight;
        width = containerHeight * videoAspectRatio;
      }

      this.player.element.style.width = `${width}px`;
      this.player.element.style.height = `${height}px`;
      this.player.element.style.position = "absolute";
      this.player.element.style.top = "50%";
      this.player.element.style.left = "50%";
      this.player.element.style.transform = "translate(-50%, -50%)";
    };

    requestAnimationFrame(updateSize);

    new ResizeObserver(updateSize).observe(this.container);
  }

  loadScript() {
    youtubeApiCallbacks.push(() => {
      this.createPlayer();
    });
    const elScript = document.createElement("script");
    elScript.src = "https://www.youtube.com/player_api";
    document.head.append(elScript);
  }

  static warmConnections() {
    if (YTVideo.preconnected) return;
    let elLink = document.createElement("link");
    elLink.rel = "preconnect";
    elLink.href = "https://www.youtube.com";
    elLink.crossOrigin = "anonymous";
    document.head.append(elLink);

    elLink = document.createElement("link");
    elLink.rel = "preconnect";
    elLink.href = "https://www.google.com";
    elLink.crossOrigin = "anonymous";
    document.head.append(elLink);

    YTVideo.preconnected = true;
  }
}
