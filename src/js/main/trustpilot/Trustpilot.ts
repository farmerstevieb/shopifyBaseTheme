import { get } from "../../utils";
import {
  TrustpilotAPI,
  type BusinessUnitData,
  type TrustpilotReview,
} from "./TrustpilotAPI";

class Trustpilot extends HTMLElement {
  api: TrustpilotAPI | null = null;
  isLoading = false;

  get apiKey() {
    return this.getAttribute("data-api-key") || "";
  }

  get businessUnitId() {
    return this.getAttribute("data-business-unit-id") || "";
  }

  get starFilter(): number[] {
    const filter = this.getAttribute("data-star-filter") || "";
    if (!filter) return [1, 2, 3, 4, 5];
    try {
      const parsed = JSON.parse(filter) as number[];
      return Array.isArray(parsed) ? parsed : [1, 2, 3, 4, 5];
    } catch {
      return filter.split(",").map((s) => parseInt(s.trim(), 10));
    }
  }

  get displayCount(): number {
    const count = this.getAttribute("data-display-count");
    return count ? parseInt(count, 10) : 10;
  }

  get fetchCount(): number {
    const count = this.getAttribute("data-fetch-count");
    return count ? parseInt(count, 10) : 50;
  }

  get verifiedOnly(): boolean {
    return this.getAttribute("data-verified-only") === "true";
  }

  get cacheExpiration(): number {
    const minutes = this.getAttribute("data-cache-expiration");
    return minutes ? parseInt(minutes, 10) * 60 * 1000 : 60 * 60 * 1000;
  }

  hideSection = (): void => {
    const sectionClass = this.getAttribute("data-section-class");
    if (sectionClass) {
      const section = document.querySelector(sectionClass) as HTMLElement;
      if (section) {
        section.style.display = "none";
        return;
      }
    }
    this.style.display = "none";
  };

  constructor() {
    super();

    this.init();
  }

  init = async () => {
    if (!this.apiKey || !this.businessUnitId) {
      console.warn("Trustpilot: Missing API key or Business Unit ID");
      this.hideSection();
      return;
    }

    if (this.isLoading) return;
    this.isLoading = true;

    try {
      this.api = new TrustpilotAPI(
        this.apiKey,
        this.businessUnitId,
        this.cacheExpiration,
      );

      // Fetch reviews and business unit data in parallel
      const [reviewsData, businessData] = await Promise.all([
        this.api.getReviews(this.fetchCount),
        this.api.getBusinessUnit(),
      ]);

      // Check if we have reviews
      if (
        !reviewsData ||
        !reviewsData.reviews ||
        !Array.isArray(reviewsData.reviews)
      ) {
        console.error(
          "Trustpilot: Invalid API response structure",
          reviewsData,
        );
        this.hideSection();
        return;
      }

      // Filter reviews based on configuration
      const filteredReviews = this.filterReviews(reviewsData.reviews);

      // Limit to display count
      const reviewsToDisplay = filteredReviews.slice(0, this.displayCount);

      if (reviewsToDisplay.length === 0) {
        console.warn("Trustpilot: No reviews to display after filtering");
        this.hideSection();
        return;
      }

      this.renderCarousel(reviewsToDisplay, businessData);
    } catch (error) {
      console.error("Trustpilot: Error loading reviews", error);
      this.hideSection();
    } finally {
      this.isLoading = false;
    }
  };

  filterReviews = (reviews: TrustpilotReview[]): TrustpilotReview[] => {
    return reviews.filter((review) => {
      // Filter by star rating
      if (!this.starFilter.includes(review.stars)) {
        return false;
      }

      // Filter by verified status
      if (this.verifiedOnly && !review.isVerified) {
        return false;
      }

      return true;
    });
  };

  formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return "1 week ago";
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 60) return "1 month ago";
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    if (diffDays < 730) return "1 year ago";
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  getStarSvg = (type: "full" | "half" | "empty"): string => {
    const svgs = {
      full: `<svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 18.1291H18.1068V0H0V18.1291Z" fill="#692034"/>
          <path d="M15.4356 7.71329L5.1656 15.183L6.66419 10.5664L2.74133 7.71329H7.59018L9.08845 3.09644L10.5867 7.71329H15.4356ZM9.08882 12.3301L11.8936 11.7394L13.0111 15.183L9.08882 12.3301Z" fill="white"/>
        </svg>`,
      half: `<svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 18.1291H9.0534V0H0V18.1291Z" fill="#692034"/>
          <path d="M9.0534 18.1291H18.1068V0H9.0534V18.1291Z" fill="#DCDCE6"/>
          <path d="M15.4356 7.71329L5.1656 15.183L6.66419 10.5664L2.74133 7.71329H7.59018L9.08845 3.09644L10.5867 7.71329H15.4356ZM9.08882 12.3301L11.8936 11.7394L13.0111 15.183L9.08882 12.3301Z" fill="white"/>
        </svg>`,
      empty: `<svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 18.1291H18.1068V0H0V18.1291Z" fill="#DCDCE6"/>
          <path d="M0 18.1291H9.0534V0H0V18.1291Z" fill="#DCDCE6"/>
          <path d="M15.435 7.71329L5.16536 15.183L6.66363 10.5664L2.74078 7.71329H7.58962L9.0879 3.09644L10.5862 7.71329H15.435ZM9.08827 12.3301L11.893 11.7394L13.0105 15.183L9.08827 12.3301Z" fill="white"/>
        </svg>`,
    };
    return svgs[type];
  };

  renderStars = (stars: number): string => {
    const fullStars = stars;
    const emptyStars = 5 - fullStars;

    let starsHtml = "";

    for (let i = 0; i < fullStars; i++) {
      starsHtml += this.getStarSvg("full");
    }

    for (let i = 0; i < emptyStars; i++) {
      starsHtml += this.getStarSvg("empty");
    }

    return `
      <div class="c-trustpilot__stars">
        ${starsHtml}
      </div>
    `;
  };

  renderBusinessStars = (stars: number): string => {
    const fullStars = Math.floor(stars);
    const hasHalfStar = stars % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starsHtml = "";

    for (let i = 0; i < fullStars; i++) {
      starsHtml += this.getStarSvg("full");
    }

    if (hasHalfStar) {
      starsHtml += this.getStarSvg("half");
    }

    for (let i = 0; i < emptyStars; i++) {
      starsHtml += this.getStarSvg("empty");
    }

    return starsHtml;
  };

  getScoreText = (stars: number): string => {
    if (stars >= 4.5) return "Excellent";
    if (stars >= 4.0) return "Great";
    if (stars >= 3.0) return "Average";
    if (stars >= 2.0) return "Poor";
    return "Bad";
  };

  getBusinessUrl = (identifyingName: string): string => {
    return `https://uk.trustpilot.com/review/${identifyingName}`;
  };

  getReviewUrl = (review: TrustpilotReview): string => {
    return `https://uk.trustpilot.com/reviews/${review.id}`;
  };

  renderCarousel = (
    reviews: TrustpilotReview[],
    businessData: BusinessUnitData,
  ): void => {
    const track = get("[data-trustpilot-reviews]", this) as HTMLElement;
    if (!track) {
      console.warn("Trustpilot: Could not find carousel track");
      return;
    }

    const reviewCards = reviews
      .map((review) => {
        const reviewUrl = this.getReviewUrl(review);
        return `
          <li class="slider__item">
            <a href="${reviewUrl}" target="_blank" rel="noopener" class="c-trustpilot__card-link">
              <div class="c-trustpilot__card">
                <div class="c-trustpilot__card-header">
                  <div class="c-trustpilot__card-header--top">
                    ${this.renderStars(review.stars)}
                    ${
                      review.isVerified ?
                        `<div class="c-trustpilot__card-header--verified">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_9551_25)">
                              <path fill-rule="evenodd" clip-rule="evenodd" d="M7 14C10.866 14 14 10.866 14 7C14 3.13401 10.866 0 7 0C3.13401 0 0 3.13401 0 7C0 10.866 3.13401 14 7 14ZM6.09217 7.81401L9.20311 4.7031C9.44874 4.45757 9.84688 4.45757 10.0923 4.7031C10.338 4.94864 10.338 5.34673 10.0923 5.59226L6.62009 9.06448C6.59573 9.10283 6.56682 9.13912 6.53333 9.17256C6.28787 9.41821 5.88965 9.41821 5.64402 9.17256L3.7059 7.11031C3.46046 6.86464 3.46046 6.46669 3.7059 6.22102C3.95154 5.97548 4.34968 5.97548 4.59512 6.22102L6.09217 7.81401Z" fill="#4D3C2F"/>
                            </g>
                          </svg>
                          <span>Verified</span>
                        </div>`
                      : ""
                    }
                  </div>
                  ${review.title ? `<h3 class="c-trustpilot__card-title">${review.title}</h3>` : ""}
                </div>
                <div class="c-trustpilot__card-content">
                  <p class="c-trustpilot__card-text">${review.text}</p>
                </div>
                <div class="c-trustpilot__card-footer">
                  <p class="c-trustpilot__card-author">${review.consumer.displayName},<span class="c-trustpilot__card-author--date"> ${this.formatDate(review.createdAt)}</span></p>
                </div>
              </div>
            </a>
          </li>
        `;
      })
      .join("");

    track.innerHTML = reviewCards;

    requestAnimationFrame(() => {
      // Update business unit info (score and total reviews)
      this.renderBusinessInfo(businessData);

      // Reinitialize the slider after adding reviews
      this.reinitializeSlider();
    });
  };

  renderBusinessInfo = (businessData: BusinessUnitData): void => {
    const scoreText = this.getScoreText(businessData.score.stars);
    const totalReviews = businessData.numberOfReviews.total;
    const stars = businessData.score.stars;

    // Store data as attributes
    this.setAttribute("data-score-text", scoreText);
    this.setAttribute("data-score-stars", stars.toString());
    this.setAttribute("data-total-reviews", totalReviews.toString());

    // Check if business stats snippet is rendered
    const statsContent = get("[data-trustpilot-stats-content]") as HTMLElement;
    if (!statsContent) {
      return;
    }

    // Populate business stats elements
    const scoreTextEl = get("[data-score-text]", statsContent) as HTMLElement;
    if (scoreTextEl) {
      scoreTextEl.textContent = scoreText;
    }

    const starsContainer = get(
      "[data-score-stars-container]",
      statsContent,
    ) as HTMLElement;
    if (starsContainer) {
      const starsHtml = this.renderBusinessStars(stars);
      starsContainer.innerHTML = starsHtml;
    }

    const totalReviewsEl = get(
      "[data-total-reviews-text]",
      statsContent,
    ) as HTMLElement;
    if (totalReviewsEl) {
      totalReviewsEl.innerHTML = `Based on <span class="c-trustpilot__business--reviews-count">${totalReviews.toLocaleString()} reviews</span>`;
    }

    const logoEl = get("[data-trustpilot-logo]", statsContent) as HTMLElement;
    if (logoEl) {
      logoEl.style.opacity = "1";
    }

    // Add business profile link to stats container
    const businessUrl = this.getBusinessUrl(businessData.name.identifying);
    statsContent.setAttribute("data-business-url", businessUrl);

    if (statsContent.parentElement?.tagName !== "A") {
      const link = Object.assign(document.createElement("a"), {
        href: businessUrl,
        target: "_blank",
        rel: "noopener",
        className: "c-trustpilot__business--link",
      });
      statsContent.parentElement?.insertBefore(link, statsContent);
      link.appendChild(statsContent);
    }
  };

  reinitializeSlider = (): void => {
    const slider = get("juno-slider", this) as any;
    if (!slider) return;

    if (slider.reload) {
      slider.reload();
    }
  };
}

// Define element

customElements.define("trustpilot-reviews", Trustpilot);
