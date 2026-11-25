import React from "react";
import { POSES, computePoseTransforms, type MotionState } from "./pup-kinematics";

export const PUP_COLORS = {
  ink: "#2a170e",
  fur: "#f2be6b",
  furDark: "#e4a352",
  muzzle: "#fbe3b4",
  blush: "#f9b9a6",
  collar: "#a24a1a",
  tongue: "#e98c8c",
  mouth: "#6b2a1c",
};

export const PAW_PATH =
  "M32 30.5c-7.6 0-15.6 8.3-15.6 15.5 0 5.4 4.2 8.3 9.2 8.3 2.6 0 4.5-1.1 6.4-1.1s3.8 1.1 6.4 1.1c5 0 9.2-2.9 9.2-8.3 0-7.2-8-15.5-15.6-15.5zM19.28 26.71C21.07 30.08 20.42 33.92 17.84 35.29C15.25 36.67 11.71 35.05 9.92 31.69C8.13 28.32 8.78 24.48 11.36 23.11C13.95 21.73 17.49 23.35 19.28 26.71ZM29.62 15.64C30.32 19.62 28.46 23.26 25.47 23.79C22.48 24.32 19.48 21.53 18.78 17.56C18.08 13.58 19.94 9.94 22.93 9.41C25.92 8.88 28.92 11.67 29.62 15.64ZM45.22 17.56C44.52 21.53 41.52 24.32 38.53 23.79C35.54 23.26 33.68 19.62 34.38 15.64C35.08 11.67 38.08 8.88 41.07 9.41C44.06 9.94 45.92 13.58 45.22 17.56ZM54.08 31.69C52.29 35.05 48.75 36.67 46.16 35.29C43.58 33.92 42.93 30.08 44.72 26.71C46.51 23.35 50.05 21.73 52.64 23.11C55.22 24.48 55.87 28.32 54.08 31.69Z";

const STATIC_MOTION: MotionState = {
  phase: 0,
  stride: 0,
  time: 0,
  wag: 0,
  gazeX: 0,
  gazeY: 0,
  blink: 0,
  ear: 0,
};

export function PupSvgBody({ pose = "sit" }: { pose?: string }) {
  const f = computePoseTransforms(POSES[pose] ?? POSES.sit, STATIC_MOTION);

  return (
    <>
      <ellipse
        data-p="shadow"
        cx="150"
        cy="230"
        rx="92"
        ry="7"
        fill={PUP_COLORS.ink}
        opacity={f.shadowOpacity}
        transform={String(f.shadow)}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />

      <g data-p="body" transform={String(f.body)} opacity={f.side}>
        <g data-p="bf" transform={String(f.bf)} opacity={f.backLegs}>
          <path
            d="M-14 -14 C-14 4 -12 18 -12 27 C-12 34 -7 36 0 36 C9 36 13 33 13 27 C13 18 14 4 14 -14Z"
            fill={PUP_COLORS.furDark}
          />
          <path
            d="M-14 -14 C-14 4 -12 18 -12 27 C-12 34 -7 36 0 36 C9 36 13 33 13 27 C13 18 14 4 14 -14"
            stroke={PUP_COLORS.ink}
            strokeWidth="3.4"
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M-3.5 29 v5 M4.5 29 v5"
            stroke={PUP_COLORS.ink}
            strokeWidth="2.4"
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        <g data-p="ff" transform={String(f.ff)}>
          <path
            d="M-11 -14 C-11 4 -12 18 -12 27 C-12 34 -7 36 0 36 C9 36 13 33 13 27 C13 18 11 4 11 -14Z"
            fill={PUP_COLORS.furDark}
          />
          <path
            d="M-11 -14 C-11 4 -12 18 -12 27 C-12 34 -7 36 0 36 C9 36 13 33 13 27 C13 18 11 4 11 -14"
            stroke={PUP_COLORS.ink}
            strokeWidth="3.4"
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M-3.5 29 v5 M4.5 29 v5"
            stroke={PUP_COLORS.ink}
            strokeWidth="2.4"
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        <g data-p="tail" transform={String(f.tail)}>
          <path
            d="M86 152 C80 146 76 140 74 136"
            stroke={PUP_COLORS.ink}
            strokeWidth="9"
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M86 152 C80 146 76 140 74 136"
            stroke={PUP_COLORS.fur}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M70 110 Q78.1 105 80.9 113.7 Q90.5 114.8 86.7 123.2 Q93.4 129.9 84.7 134 Q85.2 143.1 75.8 141 Q70 148.3 64.2 141 Q54.8 143.1 55.3 134 Q46.6 129.9 53.3 123.2 Q49.5 114.8 59.1 113.7 Q61.9 105 70 110 Z"
            fill={PUP_COLORS.fur}
            stroke={PUP_COLORS.ink}
            strokeWidth="3.4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </g>

        <g data-p="bn" transform={String(f.bn)} opacity={f.backLegs}>
          <path
            d="M-15 -14 C-15 4 -12 16 -12 25 C-12 32 -7 34 0 34 C9 34 13 31 13 25 C13 16 15 4 15 -14Z"
            fill={PUP_COLORS.fur}
          />
          <path
            d="M-15 -14 C-15 4 -12 16 -12 25 C-12 32 -7 34 0 34 C9 34 13 31 13 25 C13 16 15 4 15 -14"
            stroke={PUP_COLORS.ink}
            strokeWidth="3.4"
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M-3.5 27 v5 M4.5 27 v5"
            stroke={PUP_COLORS.ink}
            strokeWidth="2.4"
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        <path
          d="M76.8 175.6 Q69 167.9 78.2 160.7 Q76.6 151.8 90.3 147.3 Q95.2 138.9 110.9 137.9 Q121.6 131.3 136.7 134 Q151.1 130.5 162.9 136.4 Q178.7 136.4 185.3 144.5 Q199.7 148.2 199.7 157.1 Q210.3 163.7 203.9 171.9 Q208.7 180.4 197 186.3 Q195.3 195.2 180.3 198 Q172.3 205.7 156.6 204.8 Q143.7 210 130 205.6 Q114.5 207.4 105.1 200.2 Q89.7 198.3 86.3 189.6 Q73.6 184.3 76.8 175.6 Z"
          fill={PUP_COLORS.fur}
          stroke={PUP_COLORS.ink}
          strokeWidth="3.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        <path
          d="M182.7 196.4 Q169.4 196.9 166.6 183 Q156.1 174.1 162.3 161.5 Q159.6 147.6 171.9 142.2 Q178.2 129.7 191 134 Q203.3 128.7 210.5 140.8 Q223.1 145.2 221.3 159.3 Q228.4 171.5 218.5 181 Q216.6 195.1 203.2 195.7 Q193.3 205.1 182.7 196.4 Z"
          fill={PUP_COLORS.fur}
          stroke={PUP_COLORS.ink}
          strokeWidth="3.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        <g data-p="fn" transform={String(f.fn)}>
          <path
            d="M-12 -14 C-12 4 -12 16 -12 25 C-12 32 -7 34 0 34 C9 34 13 31 13 25 C13 16 12 4 12 -14Z"
            fill={PUP_COLORS.fur}
          />
          <path
            d="M-12 -14 C-12 4 -12 16 -12 25 C-12 32 -7 34 0 34 C9 34 13 31 13 25 C13 16 12 4 12 -14"
            stroke={PUP_COLORS.ink}
            strokeWidth="3.4"
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M-3.5 27 v5 M4.5 27 v5"
            stroke={PUP_COLORS.ink}
            strokeWidth="2.4"
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </g>

      <g data-p="haunch" opacity={f.haunchOpacity} transform={String(f.haunch)}>
        <path
          d="M80 204 Q75.1 194.9 85.7 189.9 Q88.4 180.2 100.7 181.2 Q110 174.6 119.3 181.2 Q131.6 180.2 134.3 189.9 Q144.9 194.9 140 204 Q144.9 213.1 134.3 218.1 Q131.6 227.8 119.3 226.8 Q110 233.4 100.7 226.8 Q88.4 227.8 85.7 218.1 Q75.1 213.1 80 204 Z"
          fill={PUP_COLORS.fur}
          stroke={PUP_COLORS.ink}
          strokeWidth="3.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M112 214 C126 212 142 214 146 221 C148 226 144 229 136 229 L116 229 C108 229 104 224 106 219 Z"
          fill={PUP_COLORS.fur}
          stroke={PUP_COLORS.ink}
          strokeWidth="3.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M132 222 v5 M139 222 v5"
          stroke={PUP_COLORS.ink}
          strokeWidth="2.4"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      <g data-p="head" transform={String(f.head)}>
        <path
          d="M178 146 Q212 162 246 146 L246 154 Q212 170 178 154 Z"
          fill={PUP_COLORS.collar}
          stroke={PUP_COLORS.ink}
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M212 160 C212 156 206 155 206 159.4 C206 163 212 166.6 212 168.4 C212 166.6 218 163 218 159.4 C218 155 212 156 212 160 Z"
          fill={PUP_COLORS.muzzle}
          stroke={PUP_COLORS.ink}
          strokeWidth="2.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          data-p="earL"
          d="M177.1 78.7 Q186.9 70.8 186.6 87.4 Q196 89.9 189.9 105.5 Q195.2 117.3 185.5 126 Q184.7 142.8 175.2 141.2 Q168.7 156.5 162.9 145.3 Q153.1 153.2 153.4 136.6 Q144 134.1 150.1 118.5 Q144.8 106.7 154.5 98 Q155.3 81.2 164.8 82.8 Q171.3 67.5 177.1 78.7 Z"
          fill={PUP_COLORS.furDark}
          stroke={PUP_COLORS.ink}
          strokeWidth="3.4"
          strokeLinejoin="round"
          strokeLinecap="round"
          transform={String(f.earL)}
        />
        <path
          data-p="earR"
          d="M246.9 78.7 Q252.7 67.5 259.2 82.8 Q268.7 81.2 269.5 98 Q279.2 106.7 273.9 118.5 Q280 134.1 270.6 136.6 Q270.9 153.2 261.1 145.3 Q255.3 156.5 248.8 141.2 Q239.3 142.8 238.5 126 Q228.8 117.3 234.1 105.5 Q228 89.9 237.4 87.4 Q237.1 70.8 246.9 78.7 Z"
          fill={PUP_COLORS.furDark}
          stroke={PUP_COLORS.ink}
          strokeWidth="3.4"
          strokeLinejoin="round"
          strokeLinecap="round"
          transform={String(f.earR)}
        />
        <path
          d="M212 54 Q223.4 48.2 231.5 57.5 Q244.5 56.1 248.1 67.5 Q260.7 70.7 259.1 82.4 Q269.4 89.7 263 100 Q269.4 110.3 259.1 117.6 Q260.7 129.3 248.1 132.5 Q244.5 143.9 231.5 142.5 Q223.4 151.8 212 146 Q200.6 151.8 192.5 142.5 Q179.5 143.9 175.9 132.5 Q163.3 129.3 164.9 117.6 Q154.6 110.3 161 100 Q154.6 89.7 164.9 82.4 Q163.3 70.7 175.9 67.5 Q179.5 56.1 192.5 57.5 Q200.6 48.2 212 54 Z"
          fill={PUP_COLORS.fur}
          stroke={PUP_COLORS.ink}
          strokeWidth="3.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M195 52 Q190.7 45.8 200 43.5 Q203.2 36.9 212 40 Q220.8 36.9 224 43.5 Q233.3 45.8 229 52 Q233.3 58.2 224 60.5 Q220.8 67.1 212 64 Q203.2 67.1 200 60.5 Q190.7 58.2 195 52 Z"
          fill={PUP_COLORS.fur}
          stroke={PUP_COLORS.ink}
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M188 120 C188 106 200 100 212 100 C224 100 236 106 236 120 C236 133 225 140 212 140 C199 140 188 133 188 120 Z"
          fill={PUP_COLORS.muzzle}
        />
        <circle cx="181" cy="116" r="7" fill={PUP_COLORS.blush} opacity="0.85" />
        <circle cx="243" cy="116" r="7" fill={PUP_COLORS.blush} opacity="0.85" />
        <g data-p="eyes" transform={String(f.eyes)}>
          <g data-p="open" opacity={f.openEyes}>
            <g data-p="blink" transform={String(f.blink)}>
              <ellipse cx="194" cy="98" rx="7.4" ry="8.6" fill={PUP_COLORS.ink} />
              <ellipse cx="230" cy="98" rx="7.4" ry="8.6" fill={PUP_COLORS.ink} />
              <circle cx="196.6" cy="94.6" r="2.7" fill="#fff" />
              <circle cx="232.6" cy="94.6" r="2.7" fill="#fff" />
              <circle cx="192" cy="101.2" r="1.2" fill="#fff" />
              <circle cx="228" cy="101.2" r="1.2" fill="#fff" />
            </g>
          </g>
        </g>
        <path
          data-p="happy"
          d="M186.5 101 Q194 91.5 201.5 101 M222.5 101 Q230 91.5 237.5 101"
          stroke={PUP_COLORS.ink}
          strokeWidth="3.4"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
          opacity={f.happyEyes}
        />
        <path
          data-p="shut"
          d="M186.5 97 Q194 103.5 201.5 97 M222.5 97 Q230 103.5 237.5 97"
          stroke={PUP_COLORS.ink}
          strokeWidth="3.4"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
          opacity={f.shutEyes}
        />
        <path
          d="M204.5 111.5 Q212 107.2 219.5 111.5 Q218.2 118.4 212 120 Q205.8 118.4 204.5 111.5 Z"
          fill={PUP_COLORS.ink}
        />
        <path
          d="M212 120 V124.5 M212 124.5 Q207.2 129.6 202.8 125.2 M212 124.5 Q216.8 129.6 221.2 125.2"
          stroke={PUP_COLORS.ink}
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />
        <path
          data-p="tongue"
          d="M207.6 127.4 Q212 136.6 216.4 127.4 Z"
          fill={PUP_COLORS.tongue}
          stroke={PUP_COLORS.ink}
          strokeWidth="2.2"
          strokeLinejoin="round"
          opacity={f.tongue}
        />
        <g data-p="mouth" opacity={f.mouth}>
          <path
            d="M203 126 Q212 122 221 126 Q219 138 212 139 Q205 138 203 126 Z"
            fill={PUP_COLORS.mouth}
            stroke={PUP_COLORS.ink}
            strokeWidth="2.6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M206.5 133.5 Q212 130 217.5 133.5 Q215 138 212 138 Q209 138 206.5 133.5 Z"
            fill={PUP_COLORS.tongue}
          />
        </g>
      </g>

      <g data-p="ledge" opacity={f.ledge}>
        <path
          d="M175 159 C175 148 181 142 190 142 C199 142 205 148 205 159 Z M219 159 C219 148 225 142 234 142 C243 142 249 148 249 159 Z"
          fill={PUP_COLORS.fur}
          stroke={PUP_COLORS.ink}
          strokeWidth="3.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M186 153 v-4.5 M194 153 v-4.5 M230 153 v-4.5 M238 153 v-4.5"
          stroke={PUP_COLORS.ink}
          strokeWidth="2.4"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </>
  );
}

export function PupSvg({
  pose = "sit",
  facing = "right",
  className,
  label,
  style,
}: {
  pose?: string;
  facing?: "left" | "right";
  className?: string;
  label?: string;
  style?: React.CSSProperties;
}) {
  const rootTransform = facing === "left" ? "translate(300 0) scale(-1 1)" : undefined;
  return (
    <svg
      viewBox="0 0 300 240"
      className={className}
      aria-hidden={!label || undefined}
      aria-label={label}
      role={label ? "img" : undefined}
      focusable="false"
      style={{ overflow: "visible", ...style }}
    >
      <g data-p="root" transform={rootTransform}>
        <PupSvgBody pose={pose} />
      </g>
    </svg>
  );
}
