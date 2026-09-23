import React from "react";

export const InkCrystallizeFilterDef = () => {
  return (
    <svg className="absolute w-0 h-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <defs>
        <filter id="ink-crystallize-filter" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.18"
            numOctaves="2"
            result="fineNoise"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04"
            numOctaves="1"
            result="coarseNoise"
          />

          <feDisplacementMap
            in="SourceGraphic"
            in2="fineNoise"
            scale="4"
            xChannelSelector="R"
            yChannelSelector="G"
            result="pass5Base"
          />

          <feDisplacementMap
            in="SourceGraphic"
            in2="fineNoise"
            scale="10"
            xChannelSelector="R"
            yChannelSelector="B"
            result="pass12Raw"
          />
          <feColorMatrix
            in="pass12Raw"
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 0.6 0"
            result="pass12"
          />

          <feDisplacementMap
            in="SourceGraphic"
            in2="coarseNoise"
            scale="28"
            xChannelSelector="G"
            yChannelSelector="R"
            result="pass40Raw"
          />
          <feGaussianBlur in="pass40Raw" stdDeviation="0.8" result="pass40Blur" />
          <feColorMatrix
            in="pass40Blur"
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 0.15 0"
            result="pass40"
          />

          <feDisplacementMap
            in="SourceGraphic"
            in2="fineNoise"
            scale="3"
            xChannelSelector="B"
            yChannelSelector="R"
            result="pass5Top"
          />

          <feMerge>
            <feMergeNode in="pass40" />
            <feMergeNode in="pass12" />
            <feMergeNode in="pass5Base" />
            <feMergeNode in="pass5Top" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
};

export const InkText = ({ children, className = "", as: Component = "span" }) => {
  return (
    <Component className={`ink-crystallize inline-block ${className}`}>
      {children}
    </Component>
  );
};