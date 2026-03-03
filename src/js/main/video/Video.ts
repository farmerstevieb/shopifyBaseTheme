import { attachEvent, device, get } from "../../utils";
import type { VimeoPlayer } from "./types/Vimeo";
import type { YtPlayer } from "./types/YouTube";

type Task = "play" | "pause";

abstract class Video {
  canAutoplay: boolean;
  canLoop: boolean;
  canSound: boolean;
  canPlayOnMobile: boolean;
  fit: "cover" | "contain" = "contain";
  element: HTMLElement;
  container: HTMLElement;
  playTrigger: HTMLElement | null;
  id!: string;
  isPlaying = false;
  isReady = false;
  queue: Set<Task> = new Set();
  abstract player: VimeoPlayer | YtPlayer | HTMLVideoElement;
  playPromise?: Promise<any>;

  isMobile: boolean;
  hasMobileSources: boolean;
  resizeTimeout?: number;

  constructor(element: HTMLElement) {
    this.element = element;
    this.container = get(".js-video-container", element) as HTMLElement;

    this.isMobile = window.innerWidth <= 768;
    this.hasMobileSources = this.checkForMobileSources();

    this.updateVideoId();

    this.playTrigger = get(".js-video-trigger", element) as HTMLElement | null;

    const settings = element.dataset.settings ?? "";
    this.fit = settings.includes("cover") ? "cover" : "contain";
    this.canAutoplay = settings.includes("autoplay");
    this.canLoop = settings.includes("loop");
    this.canSound = !settings.includes("mute");
    this.canPlayOnMobile = settings.includes("canPlayOnMobile");

    device.isAutoplaySupported((supports) => {
      if (this.canSound) this.canSound = supports;
    });

    this.addResizeListener();

    this.observeElement();
  }

  checkForMobileSources(): boolean {
    const mobileId = this.element.getAttribute("data-id-mob");
    const mobileSources = this.container.dataset.sourcesMob;
    const mobileUrl = this.container.dataset.urlMob;

    return !!(mobileId || mobileSources || mobileUrl);
  }

  updateVideoId(): void {
    const mobileId = this.element.getAttribute("data-id-mob");
    const desktopId = this.element.getAttribute("data-id");

    this.id = this.isMobile && mobileId ? mobileId : desktopId!;
  }

  addResizeListener(): void {
    if (!this.hasMobileSources) return;

    window.addEventListener("resize", () => {
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }

      this.resizeTimeout = window.setTimeout(() => {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;

        if (wasMobile !== this.isMobile) {
          this.updateVideoId();
          this.recreatePlayer();
        }
      }, 250);
    });
  }

  abstract recreatePlayer(): void;

  abstract createPlayer(): void;
  abstract playVideo(): void;
  abstract pauseVideo(): void;

  shouldShowVideo(): boolean {
    if (!this.isMobile) {
      return true;
    }

    if (this.isMobile) {
      if (!this.canPlayOnMobile) {
        return false;
      }

      const mobileSources = this.container.dataset.sourcesMob;
      const mobileUrl = this.container.dataset.urlMob;

      let hasMobileVideo = false;
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

      return true;
    }

    return false;
  }

  showImagePlaceholder(): void {
    const placeholder = this.element.querySelector(
      ".js-video-image",
    ) as HTMLElement;
    if (placeholder) {
      placeholder.style.display = "";
    }
    this.container.style.display = "none";
  }

  hideImagePlaceholder(): void {
    const placeholder = this.element.querySelector(
      ".js-video-image",
    ) as HTMLElement;
    if (placeholder) {
      placeholder.style.display = "none";
    }
    this.container.style.display = "";
  }

  play() {
    if (this.isPlaying) return;
    if (!this.isReady) {
      this.createPlayer();
      this.queueTask("play");
      return;
    }

    this.playPromise = Promise.resolve(this.playVideo());
  }

  async pause() {
    if (!this.isPlaying) return;
    if (!this.isReady || typeof this.playPromise === "undefined") {
      this.queueTask("pause");
      return;
    }

    await this.playPromise;
    this.pauseVideo();
    this.onStop();
  }

  onPlay() {
    this.element.setAttribute("data-status", "loaded playing");
    this.isPlaying = true;
  }

  onStop() {
    this.element.setAttribute("data-status", "loaded paused");
    this.isPlaying = false;
  }

  watchResize(videoWidth: number, videoHeight: number) {
    const updateSize = () => {
      const widthScale = this.container.clientWidth / videoWidth,
        heightScale = this.container.clientHeight / videoHeight;

      let multiplier = 1;

      if (widthScale >= heightScale) {
        multiplier = heightScale;

        if (this.container.clientWidth > videoWidth * heightScale) {
          multiplier = widthScale;
        }
      } else {
        multiplier = widthScale;

        if (this.container.clientHeight > videoHeight * widthScale) {
          multiplier = heightScale;
        }
      }

      this.player.element.style.width = `${videoWidth * multiplier}px`;
      this.player.element.style.height = `${videoHeight * multiplier}px`;
    };

    requestAnimationFrame(() => {
      updateSize();
      this.player.element.style.position = "relative";
      this.player.element.style.top = "50%";
      this.player.element.style.transform = "translateY(-50%)";
    });
    new ResizeObserver(() => updateSize()).observe(this.container);
  }

  flushQueue() {
    this.queue.forEach((command) => {
      this[command]();
    });
    this.queue.clear();
  }

  queueTask(command: Task) {
    this.queue.add(command);
  }

  observeElement() {
    if (this.playTrigger) {
      attachEvent("click", this.playTrigger, (event) => {
        event.stopPropagation();
        this.play();
        this.playTrigger?.remove();
      });
    }

    new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (!this.shouldShowVideo()) {
          return;
        }

        if (entry.isIntersecting) {
          this.canAutoplay ? this.play() : this.createPlayer();
        } else if (this.isReady) {
          this.pause();
        }
      },
      { threshold: 0.1 },
    ).observe(this.element);
  }
}

export default Video;
