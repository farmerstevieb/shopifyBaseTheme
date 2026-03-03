import React from "react";
import * as Slider from "@radix-ui/react-slider";

import { formatMoney } from "../../../../utils/shopify";

type RangeSliderProps = {
  onValueChange: (value: number[]) => void;
  onValueCommit: (value: number[]) => void;
  min: number | undefined;
  max: number | undefined;
  currentMin: number;
  currentMax: number;
};

export default function RangeSlider({
  onValueChange,
  onValueCommit,
  min,
  max,
  currentMin,
  currentMax,
}: RangeSliderProps) {
  const thumbTriggerClass =
    "block w-4 h-4 bg-black rounded-full cursor-pointer";
  const thumbIndicationClass =
    "absolute text-xs text-black opacity-50 -top-4 font-heading";

  return (
    <Slider.Root
      className="relative flex min-h-[24px] items-center"
      onValueChange={onValueChange}
      onValueCommit={onValueCommit}
      min={min}
      max={max}
      value={[currentMin, currentMax]}
      step={1}
    >
      <Slider.Track className="relative h-[4px] flex-grow cursor-pointer overflow-hidden rounded-full bg-grey-60">
        <Slider.Range className="absolute h-full bg-black" />
      </Slider.Track>

      {/* Min Thumb */}
      <p className={`left-0 ${thumbIndicationClass}`}>
        {formatMoney({ cents: currentMin * 100 })}
      </p>
      <Slider.Thumb className={thumbTriggerClass} />

      {/* Max Thumb */}
      <p className={`right-0 ${thumbIndicationClass}`}>
        {formatMoney({ cents: currentMax * 100 })}
      </p>
      <Slider.Thumb className={thumbTriggerClass} />
    </Slider.Root>
  );
}
