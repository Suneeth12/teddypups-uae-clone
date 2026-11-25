export const ANCHOR = { x: 150, y: 228 };
export const DEFAULT_BOX: [number, number, number, number] = [48, 30, 288, 236];

export const POSE_BOXES: Record<string, [number, number, number, number]> = {
  sit: [50, 26, 284, 234],
  peek: [148, 34, 280, 163],
  snug: [148, 40, 280, 163],
  bow: [58, 56, 292, 236],
};

export const getPoseBox = (pose: string): [number, number, number, number] =>
  POSE_BOXES[pose] ?? DEFAULT_BOX;

export interface PupPoseState {
  bodyRot: number;
  bodyX: number;
  bodyY: number;
  stretch: number;
  headX: number;
  headY: number;
  headRot: number;
  earL: number;
  earR: number;
  tail: number;
  fn: number;
  ff: number;
  bn: number;
  bf: number;
  sit: number;
  eyes: number;
  happy: number;
  tongue: number;
  mouth: number;
  front: number;
}

const BASE_POSE: PupPoseState = {
  bodyRot: 0,
  bodyX: 0,
  bodyY: 0,
  stretch: 1,
  headX: 0,
  headY: 0,
  headRot: 0,
  earL: 0,
  earR: 0,
  tail: 0,
  fn: 0,
  ff: 0,
  bn: 0,
  bf: 0,
  sit: 0,
  eyes: 1,
  happy: 0,
  tongue: 0,
  mouth: 0,
  front: 0,
};

export const POSES: Record<string, PupPoseState> = {
  stand: BASE_POSE,
  walk: { ...BASE_POSE, tail: -6, tongue: 1 },
  sit: { ...BASE_POSE, bodyRot: -24, bodyY: -2, headX: -10, headY: -6, tail: 34, sit: 1, tongue: 1 },
  peek: { ...BASE_POSE, headY: 4, earL: -6, earR: 6, tail: -20, front: 1, tongue: 1 },
  snug: { ...BASE_POSE, headY: 9, headRot: 4, earL: 3, earR: -3, tail: -20, front: 1, tongue: 0 },
  lie: { ...BASE_POSE, bodyRot: -5, bodyY: 22, headX: 12, headY: 40, headRot: 3, fn: -84, ff: -80, sit: 1, tail: 58, tongue: 0 },
  sleep: { ...BASE_POSE, bodyRot: -5, bodyY: 22, headX: 14, headY: 44, headRot: -8, fn: -84, ff: -80, sit: 1, tail: 64, eyes: 0, earL: 4, earR: -4 },
  settle: { ...BASE_POSE, bodyRot: -5, bodyY: 22, headX: 10, headY: 16, fn: -84, ff: -80, sit: 1, tail: 40, tongue: 1 },
  hop: { ...BASE_POSE, bodyRot: -9, stretch: 1.06, headY: -6, fn: -42, ff: -32, bn: 40, bf: 30, earL: -26, earR: 26, tail: -24, tongue: 1 },
  sniff: { ...BASE_POSE, bodyRot: 7, headX: 16, headY: 32, headRot: 9, tail: -14, fn: 6, ff: 4 },
  bow: { ...BASE_POSE, bodyRot: 15, bodyY: 2, headX: 14, headY: 30, fn: -58, ff: -52, tail: -32, happy: 1, tongue: 1 },
  beg: { ...BASE_POSE, bodyRot: -36, bodyY: -6, headX: -18, headY: -18, sit: 1, fn: -70, ff: -64, tail: 30, happy: 1, tongue: 1 },
};

export interface MotionState {
  phase: number;
  stride: number;
  time: number;
  wag: number;
  gazeX: number;
  gazeY: number;
  blink: number;
  ear: number;
}

const JOINT_A: [number, number] = [196, 206];
const JOINT_R: [number, number] = [212, 100];
const JOINT_S: [number, number] = [186, 194];
const JOINT_I: [number, number] = [168, 192];
const JOINT_N: [number, number] = [110, 194];
const JOINT_O: [number, number] = [94, 192];
const JOINT_L: [number, number] = [84, 150];
const JOINT_D: [number, number] = [174, 82];
const JOINT_C: [number, number] = [250, 82];

const round2 = (v: number) => Math.round(100 * v) / 100;
const rotateStr = (angle: number, pivot: [number, number]) =>
  `rotate(${round2(angle)} ${pivot[0]} ${pivot[1]})`;

export function interpolatePose(a: PupPoseState, b: PupPoseState, t: number): PupPoseState {
  const result: PupPoseState = { ...a };
  for (const k of Object.keys(BASE_POSE) as (keyof PupPoseState)[]) {
    result[k] = a[k] + (b[k] - a[k]) * t;
  }
  return result;
}

export function computePoseTransforms(
  pose: PupPoseState,
  motion: MotionState
): Record<string, string | number> {
  const sinP = Math.sin(motion.phase);
  const sinPOff = Math.sin(motion.phase + Math.PI);
  const u = 20 + 10 * motion.stride;
  const p = (1 - Math.cos(2 * motion.phase)) / 2;
  const g = motion.stride > 0.01 ? 1 : 0;
  const m = Math.sin(2.4 * motion.time) * (1 - g);
  const bodyY = pose.bodyY - p * (2.5 + 4 * motion.stride) * g + 0.6 * m;
  const bodyRot = pose.bodyRot + 1.6 * Math.sin(motion.phase) * g;
  const counterRot = -pose.bodyRot;
  const wagAmp = 5 + 17 * motion.wag;
  const wagFreq = 1.2 + 2.6 * motion.wag;
  const tailRot = pose.tail + Math.sin(motion.time * wagFreq * Math.PI * 2) * wagAmp;
  const headBob = -((1 - Math.cos(2 * motion.phase - 0.7)) / 2) * (2 + 3 * motion.stride) * g + 0.9 * m;

  return {
    body: `translate(${round2(pose.bodyX)} ${round2(bodyY)}) ${rotateStr(bodyRot, JOINT_A)} translate(${JOINT_A[0]} 0) scale(${round2(pose.stretch)} 1) translate(${-JOINT_A[0]} 0)`,
    fn: `translate(${JOINT_S[0]} ${JOINT_S[1]}) rotate(${round2(pose.fn + counterRot + sinP * u * g)})`,
    ff: `translate(${JOINT_I[0]} ${JOINT_I[1]}) rotate(${round2(pose.ff + counterRot + sinPOff * u * g)})`,
    bn: `translate(${JOINT_N[0]} ${JOINT_N[1]}) rotate(${round2(pose.bn + sinPOff * u * g)})`,
    bf: `translate(${JOINT_O[0]} ${JOINT_O[1]}) rotate(${round2(pose.bf + sinP * u * g)})`,
    tail: rotateStr(tailRot, JOINT_L),
    haunch: `translate(0 ${round2(-0.06 * pose.bodyRot)})`,
    head: `translate(${round2(pose.headX)} ${round2(pose.headY + headBob)}) ${rotateStr(pose.headRot + 1.4 * Math.sin(motion.phase) * g, JOINT_R)}`,
    earL: rotateStr(pose.earL + motion.ear + 4 * Math.sin(2 * motion.phase) * g, JOINT_D),
    earR: rotateStr(pose.earR - motion.ear - 4 * Math.sin(2 * motion.phase) * g, JOINT_C),
    eyes: `translate(${round2(3.4 * motion.gazeX)} ${round2(2.6 * motion.gazeY)})`,
    blink: `translate(0 ${round2(98 * motion.blink * 0.92)}) scale(1 ${round2(1 - 0.92 * motion.blink)})`,
    openEyes: round2(Math.max(0, pose.eyes - pose.happy)),
    happyEyes: round2(Math.min(pose.happy, pose.eyes)),
    shutEyes: round2(1 - pose.eyes),
    tongue: round2(pose.tongue * (1 - pose.mouth)),
    mouth: round2(pose.mouth),
    backLegs: round2(1 - pose.sit),
    haunchOpacity: round2(pose.sit * (1 - pose.front)),
    side: round2(1 - pose.front),
    ledge: round2(pose.front),
    shadow: `translate(${round2(0.6 * pose.bodyX)} 0) scale(${round2(1 - 0.05 * p * g)} 1)`,
    shadowOpacity: round2(0.12 * (1 - pose.front)),
  };
}

const ATTR_MAP: [string, string, string][] = [
  ["root", "transform", "root"],
  ["shadow", "transform", "shadow"],
  ["shadow", "opacity", "shadowOpacity"],
  ["body", "transform", "body"],
  ["body", "opacity", "side"],
  ["bf", "transform", "bf"],
  ["bf", "opacity", "backLegs"],
  ["bn", "transform", "bn"],
  ["bn", "opacity", "backLegs"],
  ["ff", "transform", "ff"],
  ["fn", "transform", "fn"],
  ["tail", "transform", "tail"],
  ["haunch", "transform", "haunch"],
  ["haunch", "opacity", "haunchOpacity"],
  ["head", "transform", "head"],
  ["earL", "transform", "earL"],
  ["earR", "transform", "earR"],
  ["eyes", "transform", "eyes"],
  ["open", "opacity", "openEyes"],
  ["blink", "transform", "blink"],
  ["happy", "opacity", "happyEyes"],
  ["shut", "opacity", "shutEyes"],
  ["tongue", "opacity", "tongue"],
  ["mouth", "opacity", "mouth"],
  ["ledge", "opacity", "ledge"],
];

const expSmooth = (dt: number, speed: number) => 1 - Math.exp(-dt / speed);
const clampNum = (v: number, min = -1, max = 1) => Math.max(min, Math.min(max, v));

export class PupController {
  svg: SVGSVGElement;
  els: Map<string, SVGElement> = new Map();
  written: Map<string, string> = new Map();
  m: MotionState = {
    phase: 0,
    stride: 0,
    time: 0,
    wag: 0,
    gazeX: 0,
    gazeY: 0,
    blink: 0,
    ear: 0,
  };
  pose: PupPoseState;
  target: PupPoseState;
  facing: number;
  facingTarget: number;
  strideTarget = 0;
  wagTarget = 0.35;
  gazeTarget = { x: 0, y: 0 };
  tilt = 0;
  tiltTarget = 0;
  earV = 0;
  nextBlink = 1.2;
  blinkAt = -1;
  woofUntil = 0;
  bounce = 0;
  bounceV = 0;
  offset = 0;
  offsetTarget = 0;
  pet = 0;
  petTarget = 0;
  turn = 0.07;
  lean = 0;

  constructor(svg: SVGSVGElement, initialPose = "sit", initialFacing = 1) {
    this.svg = svg;
    svg.querySelectorAll<SVGElement>("[data-p]").forEach((el) => {
      if (el.dataset.p) this.els.set(el.dataset.p, el);
    });
    this.pose = { ...(POSES[initialPose] ?? POSES.sit) };
    this.target = this.pose;
    this.facing = initialFacing;
    this.facingTarget = initialFacing;
  }

  setPose(p: string | PupPoseState) {
    this.target = typeof p === "string" ? POSES[p] ?? POSES.sit : p;
  }

  jump(p: string, facing?: number) {
    this.pose = { ...(POSES[p] ?? POSES.sit) };
    this.target = this.pose;
    if (facing) this.facing = this.facingTarget = facing;
  }

  face(f: number, turnSpeed = 0.07) {
    this.facingTarget = f;
    this.turn = turnSpeed;
  }

  get facingDir() {
    return this.facingTarget;
  }

  stride(s: number) {
    this.strideTarget = clampNum(s, 0, 1);
  }

  advance(d: number) {
    this.m.phase += (d / 46) * Math.PI;
  }

  walkedTo(w: number) {
    this.m.phase = (w / 46) * Math.PI;
  }

  wag(w: number) {
    this.wagTarget = clampNum(w, 0, 1);
  }

  cock(deg: number) {
    this.tiltTarget = deg;
  }

  lookAt(target: { x: number; y: number } | null) {
    if (!target) {
      this.gazeTarget = { x: 0, y: 0 };
      return;
    }
    const rect = this.svg.getBoundingClientRect();
    const pivotX = this.facingTarget > 0 ? 212 : 300 - 212;
    const originX = rect.left + (pivotX / 300) * rect.width;
    const originY = rect.top + (98 / 240) * rect.height;
    const dx = target.x - originX;
    const dy = target.y - originY;
    const dist = Math.hypot(dx, dy) || 1;
    const scale = Math.min(1, dist / 160);
    this.gazeTarget = {
      x: (dx / dist) * scale * this.facingTarget,
      y: (dy / dist) * scale,
    };
  }

  woof(time: number) {
    this.woofUntil = time + 0.34;
    this.bounceV = -150;
    this.earV += 260;
  }

  jolt(scale = 1) {
    this.earV += 220 * scale;
  }

  hop(scale = 1) {
    this.bounceV = -230 * scale;
    this.earV += 200 * scale;
  }

  yawn(time: number, dur = 0.9) {
    this.woofUntil = time + dur;
  }

  dash(offset: number) {
    this.offsetTarget = offset;
  }

  petting(isPet: boolean) {
    this.petTarget = isPet ? 1 : 0;
  }

  reset() {
    this.offsetTarget = 0;
    this.tiltTarget = 0;
    this.petTarget = 0;
  }

  tick(dt: number, time: number) {
    dt = Math.min(dt, 0.05);
    const m = this.m;
    m.time = time;

    this.pose = interpolatePose(this.pose, this.target, expSmooth(dt, 0.16));
    this.facing += (this.facingTarget - this.facing) * expSmooth(dt, this.turn);
    m.stride += (this.strideTarget - m.stride) * expSmooth(dt, 0.12);
    if (m.stride < 0.012 && this.strideTarget === 0) m.stride = 0;

    m.wag += (this.wagTarget - m.wag) * expSmooth(dt, 0.4);
    m.gazeX += (this.gazeTarget.x - m.gazeX) * expSmooth(dt, 0.07);
    m.gazeY += (this.gazeTarget.y - m.gazeY) * expSmooth(dt, 0.07);

    this.tilt += (this.tiltTarget + 3 * m.gazeX - this.tilt) * expSmooth(dt, 0.18);
    this.earV += (-150 * m.ear - 10 * this.earV) * dt;
    m.ear = clampNum(m.ear + this.earV * dt, -28, 28);

    this.bounceV += (-260 * this.bounce - 16 * this.bounceV) * dt;
    this.bounce += this.bounceV * dt;

    const prevOffset = this.offset;
    this.offset += (this.offsetTarget - this.offset) * expSmooth(dt, 0.2);
    if (Math.abs(this.offsetTarget - this.offset) < 0.05) {
      this.offset = this.offsetTarget;
    }
    const offsetDelta = Math.abs(this.offset - prevOffset);
    if (offsetDelta) this.advance(offsetDelta);

    const strideOverride = dt > 0 ? Math.min(1, offsetDelta / dt / 180) : 0;
    this.pet += (this.petTarget - this.pet) * expSmooth(dt, 0.15);

    if (time > this.nextBlink && this.pose.eyes > 0.6) {
      this.blinkAt = time;
      this.nextBlink = time + 2.2 + 3.8 * Math.random();
      if (Math.random() < 0.18) this.nextBlink = time + 0.32;
    }
    const blinkProgress = (time - this.blinkAt) / 0.15;
    m.blink = blinkProgress >= 0 && blinkProgress <= 1 ? Math.sin(blinkProgress * Math.PI) : 0;

    const currentPose: PupPoseState = {
      ...this.pose,
      headRot: this.pose.headRot + this.tilt,
      bodyRot: this.pose.bodyRot + this.lean,
      bodyY: this.pose.bodyY + this.bounce,
      headY: this.pose.headY + 1.15 * this.bounce,
      mouth: time < this.woofUntil ? 1 : this.pose.mouth,
      happy: Math.max(this.pose.happy, this.pet),
    };

    const transforms = computePoseTransforms(
      currentPose,
      strideOverride > m.stride ? { ...m, stride: strideOverride } : m
    );

    const safeFacing = Math.abs(this.facing) < 0.02 ? 0.02 * Math.sign(this.facing || 1) : this.facing;
    const rootTransform = `translate(${this.offset.toFixed(1)} 0) translate(150 0) scale(${safeFacing.toFixed(3)} 1) translate(-150 0)`;

    for (const [part, attr, prop] of ATTR_MAP) {
      const el = this.els.get(part);
      if (!el) continue;
      const val = prop === "root" ? rootTransform : String(transforms[prop] ?? "");
      const key = `${part}:${attr}`;
      if (this.written.get(key) !== val) {
        el.setAttribute(attr, val);
        this.written.set(key, val);
      }
    }
  }
}
