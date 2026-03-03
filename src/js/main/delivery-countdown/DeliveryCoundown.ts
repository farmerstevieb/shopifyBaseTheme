import dayjs, { type Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import duration from "dayjs/plugin/duration";
import isTomorrow from "dayjs/plugin/isTomorrow";

dayjs.extend(customParseFormat);
dayjs.extend(duration);
dayjs.extend(isTomorrow);

const DAYS_OF_WEEK = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
} as const;

class DeliveryTimer {
  isPastCutoff = false;
  cutoffDate: Dayjs;
  excludedDates: Dayjs[] = [];

  constructor(
    cutoffTime: string,
    private nextDayLabel: string,
    private countDownLabel: string,
    excludedDates: string[]
  ) {
    const [hour = "13", minute = "00"] = cutoffTime.split(":");
    this.cutoffDate = dayjs()
      .set("hour", +hour)
      .set("minute", +minute)
      .set("second", 0);
    this.excludedDates = excludedDates.map((s) =>
      dayjs(s.trim(), "DD/MM/YYYY")
    );
  }

  isExcludedDate(date: Dayjs) {
    return (
      ["Saturday", "Sunday"].includes(
        DAYS_OF_WEEK[date.day() as keyof typeof DAYS_OF_WEEK]
      ) || this.excludedDates.some((d) => date.isSame(d, "date"))
    );
  }

  findDeliveryDate() {
    let deliveryDate = dayjs();

    this.isPastCutoff = deliveryDate.isAfter(this.cutoffDate);

    // Make sure its not excluded date
    while (this.isExcludedDate(deliveryDate)) {
      deliveryDate = deliveryDate.add(1, "day");
    }

    if (this.isPastCutoff) {
      // Add one day as we missed cutoff time
      deliveryDate = deliveryDate.add(1, "day");
    }

    // Make sure its not excluded date
    while (this.isExcludedDate(deliveryDate)) {
      deliveryDate = deliveryDate.add(1, "day");
    }

    // Add one day for next day delivery
    deliveryDate = deliveryDate.add(1, "day");

    // Make sure its not excluded date
    while (this.isExcludedDate(deliveryDate)) {
      deliveryDate = deliveryDate.add(1, "day");
    }

    return deliveryDate;
  }

  print(element: HTMLElement) {
    const deliveryDate = this.findDeliveryDate();

    if (deliveryDate.isTomorrow()) {
      const now = dayjs();

      setTimeout(() => {
        this.print(element);
      }, 1000 * 60 - now.second());

      const diff = dayjs.duration(this.cutoffDate.diff(now));
      element.innerHTML = this.countDownLabel
        .replace("[time]", `${diff.hours()} hours, ${diff.minutes()} minutes`)
        .replace("[date]", deliveryDate.format("dddd, DD MMMM"));
      return;
    }

    element.innerHTML = this.nextDayLabel.replace(
      "[day]",
      DAYS_OF_WEEK[deliveryDate.day() as keyof typeof DAYS_OF_WEEK]
    );
  }
}

export class DeliveryCountdown extends HTMLElement {
  elLabel: HTMLElement;
  timer?: DeliveryTimer;

  get cutoffTime() {
    return this.getAttribute("cutoff");
  }

  get nextDayLabel() {
    return this.getAttribute("nextdaylabel");
  }

  get nextWeekLabel() {
    return this.getAttribute("nextweeklabel");
  }

  get excludedDates() {
    return (
      this.getAttribute("excludedDates")
        ?.split(",")
        .map((d) => d.trim()) ?? []
    );
  }

  constructor() {
    super();
    this.elLabel = this.querySelector("p") as HTMLElement;

    if (!this.cutoffTime) return;
    if (!this.nextWeekLabel) return;
    if (!this.nextDayLabel) return;

    this.timer = new DeliveryTimer(
      this.cutoffTime,
      this.nextWeekLabel,
      this.nextDayLabel,
      this.excludedDates
    );
  }

  connectedCallback() {
    this.timer?.print(this.elLabel);
    this.elLabel.classList.remove("invisible");
  }
}

customElements.define("delivery-countdown", DeliveryCountdown);
