import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as Save, c as Play, d as FolderOpen, f as Copy, i as Trash2, l as Pause, m as ChevronLeft, n as Volume2, o as Repeat, p as ChevronRight, s as Plus, t as VolumeX, u as Minus } from "../_libs/lucide-react.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { i as Slot } from "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { n as Portal, r as Provider, t as Content2 } from "../_libs/@radix-ui/react-tooltip+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Dmw4I2f8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("press-scale inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium select-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-fg shadow-[var(--shadow-play)] hover:opacity-95",
			accent: "bg-accent text-accent-fg hover:opacity-95",
			outline: "hairline bg-transparent text-fg hover:bg-elevated",
			ghost: "text-muted hover:bg-elevated hover:text-fg",
			subtle: "bg-elevated text-fg hover:bg-surface",
			danger: "text-danger hover:bg-elevated"
		},
		size: {
			default: "h-11 rounded-lg px-4 text-sm",
			sm: "h-9 rounded-md px-3 text-sm",
			lg: "h-14 rounded-xl px-6 text-base",
			chip: "h-9 rounded-full px-3.5 text-sm",
			icon: "size-11 rounded-lg",
			play: "size-16 rounded-full"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		ref,
		...props
	});
});
Button.displayName = "Button";
var PATTERNS = [
	{
		id: "block",
		label: "Block",
		hint: "All notes together",
		kind: "block",
		meter: 4
	},
	{
		id: "sustain",
		label: "Pad hold",
		hint: "Long overlapping voicing",
		kind: "block",
		meter: 4
	},
	{
		id: "down",
		label: "Downstrum",
		hint: "Rolled attacks on the beat",
		kind: "strum",
		meter: 4
	},
	{
		id: "downup",
		label: "Down-up",
		hint: "Quarter down, up, down, up",
		kind: "strum",
		meter: 4
	},
	{
		id: "folk",
		label: "Folk",
		hint: "Bass–strum–bass–strum",
		kind: "strum",
		meter: 4
	},
	{
		id: "bass-chord",
		label: "Bass & chord",
		hint: "Root on 1 & 3, stab on 2 & 4",
		kind: "strum",
		meter: 4
	},
	{
		id: "waltz",
		label: "Waltz",
		hint: "Oom-pah-pah in 3",
		kind: "strum",
		meter: 3
	},
	{
		id: "arp-up",
		label: "Arp up",
		hint: "Rising eighths",
		kind: "arp",
		meter: 4
	},
	{
		id: "arp-down",
		label: "Arp down",
		hint: "Falling eighths",
		kind: "arp",
		meter: 4
	},
	{
		id: "arp-ud",
		label: "Arp wave",
		hint: "Up then down",
		kind: "arp",
		meter: 4
	},
	{
		id: "alberti",
		label: "Alberti",
		hint: "Low–high–mid–high",
		kind: "arp",
		meter: 4
	},
	{
		id: "roll",
		label: "Finger roll",
		hint: "Sixteenth cascade, then hold",
		kind: "arp",
		meter: 4
	}
];
Object.fromEntries(PATTERNS.map((p) => [p.id, p]));
var VOICES = [
	{
		id: "piano",
		label: "Piano",
		hint: "Felt upright"
	},
	{
		id: "nylon",
		label: "Nylon",
		hint: "Plucked guitar"
	},
	{
		id: "pad",
		label: "Pad",
		hint: "Warm keys"
	}
];
function uniq(midis) {
	return Array.from(new Set(midis)).sort((a, b) => a - b);
}
function compilePattern(patternId, beats, bass, tones) {
	const chord = uniq([bass, ...tones]);
	const treble = tones.length ? tones : chord.slice(-3);
	const fifth = treble[2] ?? treble[treble.length - 1] ?? bass + 7;
	const hold = Math.max(.18, beats * .92);
	switch (patternId) {
		case "block": return [{
			beat: 0,
			duration: hold,
			midis: chord,
			stagger: 0,
			velocity: .86
		}];
		case "sustain": return [{
			beat: 0,
			duration: Math.max(beats, .5),
			midis: chord,
			stagger: .006,
			velocity: .7
		}];
		case "down": {
			const events = [{
				beat: 0,
				duration: Math.min(1.85, hold),
				midis: chord,
				stagger: .016,
				velocity: .88
			}];
			if (beats >= 4) events.push({
				beat: 2,
				duration: 1.7,
				midis: chord,
				stagger: .014,
				velocity: .72
			});
			return events;
		}
		case "downup": {
			const events = [];
			for (let b = 0; b < beats; b += 1) {
				const up = b % 2 === 1;
				events.push({
					beat: b,
					duration: .92,
					midis: up ? treble : chord,
					stagger: up ? -.012 : .014,
					velocity: up ? .62 : .84
				});
			}
			return events;
		}
		case "folk": {
			const events = [];
			for (let b = 0; b < beats; b += 1) if (b % 2 === 0) events.push({
				beat: b,
				duration: .95,
				midis: [b % 4 === 2 ? fifth - 12 < 36 ? bass : wrapBass(fifth) : bass],
				stagger: 0,
				velocity: .9
			});
			else events.push({
				beat: b,
				duration: .9,
				midis: treble,
				stagger: .01,
				velocity: .7
			});
			return events;
		}
		case "bass-chord": {
			const events = [];
			for (let b = 0; b < beats; b += 1) if (b % 2 === 0) events.push({
				beat: b,
				duration: .95,
				midis: [bass],
				stagger: 0,
				velocity: .92
			});
			else events.push({
				beat: b,
				duration: .7,
				midis: treble,
				stagger: .008,
				velocity: .68
			});
			return events;
		}
		case "waltz": {
			const span = beats < 3 ? beats : 3;
			const events = [{
				beat: 0,
				duration: .95,
				midis: [bass],
				stagger: 0,
				velocity: .9
			}];
			if (span > 1) events.push({
				beat: 1,
				duration: .88,
				midis: treble,
				stagger: .01,
				velocity: .66
			});
			if (span > 2) events.push({
				beat: 2,
				duration: .88,
				midis: treble,
				stagger: .01,
				velocity: .6
			});
			if (beats > 3) events.push({
				beat: 3,
				duration: .8,
				midis: [bass],
				stagger: 0,
				velocity: .7
			});
			return events;
		}
		case "arp-up": return arpEvents(beats, treble, 1);
		case "arp-down": return arpEvents(beats, [...treble].reverse(), 1);
		case "arp-ud": {
			const wave = [...treble, ...[...treble].reverse().slice(1, -1)];
			return arpEvents(beats, wave.length ? wave : treble, 1);
		}
		case "alberti": {
			const low = treble[0] ?? bass;
			const mid = treble[1] ?? low + 4;
			const high = treble[2] ?? treble[treble.length - 1] ?? mid + 3;
			return arpEvents(beats, [
				bass,
				high,
				mid,
				high
			], 1);
		}
		case "roll": {
			const cascade = uniq([bass, ...treble]);
			const step = .25;
			return cascade.map((midi, i) => ({
				beat: i * step,
				duration: Math.max(.9, beats - i * step),
				midis: [midi],
				stagger: 0,
				velocity: .62 + i * .05
			}));
		}
	}
}
function wrapBass(midi) {
	let n = midi;
	while (n > 52) n -= 12;
	while (n < 36) n += 12;
	return n;
}
function arpEvents(beats, seq, subdiv) {
	const notes = seq.length ? seq : [60];
	const steps = Math.max(1, Math.round(beats * (subdiv === 1 ? 2 : 4)));
	const dur = beats / steps;
	const events = [];
	for (let i = 0; i < steps; i += 1) events.push({
		beat: i * dur,
		duration: dur * .92,
		midis: [notes[i % notes.length] ?? 60],
		stagger: 0,
		velocity: i % 4 === 0 ? .82 : .64
	});
	return events;
}
/** Circle-of-fifths order, twelve unique pitch classes. */
var KEYS = [
	{
		id: "C",
		pc: 0,
		label: "C",
		flats: false
	},
	{
		id: "G",
		pc: 7,
		label: "G",
		flats: false
	},
	{
		id: "D",
		pc: 2,
		label: "D",
		flats: false
	},
	{
		id: "A",
		pc: 9,
		label: "A",
		flats: false
	},
	{
		id: "E",
		pc: 4,
		label: "E",
		flats: false
	},
	{
		id: "B",
		pc: 11,
		label: "B",
		flats: false
	},
	{
		id: "F#",
		pc: 6,
		label: "F♯",
		flats: false
	},
	{
		id: "Db",
		pc: 1,
		label: "D♭",
		flats: true
	},
	{
		id: "Ab",
		pc: 8,
		label: "A♭",
		flats: true
	},
	{
		id: "Eb",
		pc: 3,
		label: "E♭",
		flats: true
	},
	{
		id: "Bb",
		pc: 10,
		label: "B♭",
		flats: true
	},
	{
		id: "F",
		pc: 5,
		label: "F",
		flats: true
	}
];
var KEY_BY_ID = Object.fromEntries(KEYS.map((k) => [k.id, k]));
var MODES = {
	major: {
		label: "Major",
		short: "maj",
		steps: [
			0,
			2,
			4,
			5,
			7,
			9,
			11
		],
		qualities: [
			"maj",
			"min",
			"min",
			"maj",
			"maj",
			"min",
			"dim"
		]
	},
	minor: {
		label: "Minor",
		short: "min",
		steps: [
			0,
			2,
			3,
			5,
			7,
			8,
			10
		],
		qualities: [
			"min",
			"dim",
			"maj",
			"min",
			"min",
			"maj",
			"maj"
		]
	},
	dorian: {
		label: "Dorian",
		short: "dor",
		steps: [
			0,
			2,
			3,
			5,
			7,
			9,
			10
		],
		qualities: [
			"min",
			"min",
			"maj",
			"maj",
			"min",
			"dim",
			"maj"
		]
	},
	mixolydian: {
		label: "Mixolydian",
		short: "mix",
		steps: [
			0,
			2,
			4,
			5,
			7,
			9,
			10
		],
		qualities: [
			"maj",
			"min",
			"dim",
			"maj",
			"min",
			"min",
			"maj"
		]
	},
	"harmonic-minor": {
		label: "Harmonic minor",
		short: "h.min",
		steps: [
			0,
			2,
			3,
			5,
			7,
			8,
			11
		],
		qualities: [
			"min",
			"dim",
			"aug",
			"min",
			"maj",
			"maj",
			"dim"
		]
	}
};
var MODE_LIST = Object.entries(MODES).map(([id, meta]) => ({
	id,
	...meta
}));
var QUALITY_INTERVALS = {
	maj: [
		0,
		4,
		7
	],
	min: [
		0,
		3,
		7
	],
	dim: [
		0,
		3,
		6
	],
	aug: [
		0,
		4,
		8
	],
	"7": [
		0,
		4,
		7,
		10
	],
	maj7: [
		0,
		4,
		7,
		11
	],
	min7: [
		0,
		3,
		7,
		10
	],
	m7b5: [
		0,
		3,
		6,
		10
	],
	dim7: [
		0,
		3,
		6,
		9
	],
	sus2: [
		0,
		2,
		7
	],
	sus4: [
		0,
		5,
		7
	],
	add9: [
		0,
		4,
		7,
		14
	],
	"6": [
		0,
		4,
		7,
		9
	],
	m6: [
		0,
		3,
		7,
		9
	],
	power: [0, 7]
};
var QUALITY_OPTIONS = [
	{
		id: "auto",
		label: "diatonic"
	},
	{
		id: "maj",
		label: "maj"
	},
	{
		id: "min",
		label: "min"
	},
	{
		id: "dim",
		label: "dim"
	},
	{
		id: "aug",
		label: "aug"
	},
	{
		id: "7",
		label: "7"
	},
	{
		id: "maj7",
		label: "maj7"
	},
	{
		id: "min7",
		label: "min7"
	},
	{
		id: "m7b5",
		label: "m7♭5"
	},
	{
		id: "dim7",
		label: "dim7"
	},
	{
		id: "sus2",
		label: "sus2"
	},
	{
		id: "sus4",
		label: "sus4"
	},
	{
		id: "add9",
		label: "add9"
	},
	{
		id: "6",
		label: "6"
	},
	{
		id: "m6",
		label: "m6"
	},
	{
		id: "power",
		label: "5"
	}
];
var BEAT_OPTIONS = [
	1,
	2,
	3,
	4,
	8
];
var SHARP_NAMES = [
	"C",
	"C♯",
	"D",
	"D♯",
	"E",
	"F",
	"F♯",
	"G",
	"G♯",
	"A",
	"A♯",
	"B"
];
var FLAT_NAMES = [
	"C",
	"D♭",
	"D",
	"E♭",
	"E",
	"F",
	"G♭",
	"G",
	"A♭",
	"A",
	"B♭",
	"B"
];
var ROMAN = [
	"I",
	"II",
	"III",
	"IV",
	"V",
	"VI",
	"VII"
];
function pcName(pc, flats) {
	const n = (pc % 12 + 12) % 12;
	return (flats ? FLAT_NAMES : SHARP_NAMES)[n] ?? "C";
}
function resolveQuality(mode, slot) {
	if (slot.quality !== "auto") return slot.quality;
	return MODES[mode].qualities[slot.degree - 1];
}
function slotRootPc(tonicPc, mode, slot) {
	return (tonicPc + (MODES[mode].steps[slot.degree - 1] ?? 0) + slot.accidental + 120) % 12;
}
function isMinorish(quality) {
	return quality === "min" || quality === "min7" || quality === "m6" || quality === "dim" || quality === "dim7" || quality === "m7b5";
}
function isDim(quality) {
	return quality === "dim" || quality === "dim7" || quality === "m7b5";
}
function romanNumeral(mode, slot) {
	const quality = resolveQuality(mode, slot);
	const acc = slot.accidental === -1 ? "♭" : slot.accidental === 1 ? "♯" : "";
	let numeral = ROMAN[slot.degree - 1] ?? "I";
	if (isMinorish(quality)) numeral = numeral.toLowerCase();
	if (isDim(quality)) numeral += "°";
	else if (quality === "aug") numeral += "+";
	if (quality === "7" || quality === "min7" || quality === "m7b5") numeral += "⁷";
	else if (quality === "maj7") numeral += "Δ";
	else if (quality === "dim7") numeral += "⁷";
	else if (quality === "sus2") numeral += "sus2";
	else if (quality === "sus4") numeral += "sus4";
	else if (quality === "add9") numeral += "add9";
	else if (quality === "6" || quality === "m6") numeral += "⁶";
	else if (quality === "power") numeral += "⁵";
	return acc + numeral;
}
function qualitySuffix(quality) {
	switch (quality) {
		case "maj": return "";
		case "min": return "m";
		case "dim": return "dim";
		case "aug": return "aug";
		case "7": return "7";
		case "maj7": return "maj7";
		case "min7": return "m7";
		case "m7b5": return "m7♭5";
		case "dim7": return "dim7";
		case "sus2": return "sus2";
		case "sus4": return "sus4";
		case "add9": return "add9";
		case "6": return "6";
		case "m6": return "m6";
		case "power": return "5";
	}
}
function chordName(tonic, mode, slot) {
	const flats = slot.accidental < 0 ? true : slot.accidental > 0 ? false : tonic.flats;
	return pcName(slotRootPc(tonic.pc, mode, slot), flats) + qualitySuffix(resolveQuality(mode, slot));
}
function slotLabel(tonic, mode, slot, numerals) {
	const name = chordName(tonic, mode, slot);
	const roman = romanNumeral(mode, slot);
	return numerals ? {
		primary: roman,
		secondary: name
	} : {
		primary: name,
		secondary: roman
	};
}
function wrapMidi(n, lo, hi) {
	while (n > hi) n -= 12;
	while (n < lo) n += 12;
	return n;
}
function voicingFor(tonic, mode, slot) {
	const quality = resolveQuality(mode, slot);
	const rootPc = slotRootPc(tonic.pc, mode, slot);
	const intervals = QUALITY_INTERVALS[quality];
	const bass = wrapMidi(36 + rootPc, 36, 51);
	let tones = intervals.map((iv) => 48 + rootPc + iv);
	if ((tones[tones.length - 1] ?? 60) > 79) tones = tones.map((n) => n - 12);
	if ((tones[0] ?? 48) < 48) tones = tones.map((n) => n + 12);
	const voiced = [...tones];
	for (let i = 0; i < slot.inversion; i += 1) {
		const lowest = voiced.shift();
		if (lowest === void 0) break;
		voiced.push(lowest + 12);
	}
	return {
		bass,
		tones: voiced,
		all: Array.from(/* @__PURE__ */ new Set([bass, ...voiced])).sort((a, b) => a - b)
	};
}
function midiToFreq(midi) {
	return 440 * 2 ** ((midi - 69) / 12);
}
function midiPc(midi) {
	return (midi % 12 + 12) % 12;
}
function diatonicPalette(tonic, mode) {
	return [
		1,
		2,
		3,
		4,
		5,
		6,
		7
	].map((degree) => {
		const slot = {
			id: "p",
			degree,
			accidental: 0,
			quality: "auto",
			inversion: 0,
			beats: 4
		};
		return {
			degree,
			accidental: 0,
			quality: "auto",
			roman: romanNumeral(mode, slot),
			name: chordName(tonic, mode, slot)
		};
	});
}
var BORROWED = [
	{
		degree: 7,
		accidental: -1,
		quality: "maj",
		tag: "♭VII"
	},
	{
		degree: 6,
		accidental: -1,
		quality: "maj",
		tag: "♭VI"
	},
	{
		degree: 3,
		accidental: -1,
		quality: "maj",
		tag: "♭III"
	},
	{
		degree: 2,
		accidental: -1,
		quality: "maj",
		tag: "♭II"
	},
	{
		degree: 2,
		accidental: 0,
		quality: "maj",
		tag: "II"
	},
	{
		degree: 4,
		accidental: 0,
		quality: "min",
		tag: "iv"
	}
];
function borrowedPalette(tonic, mode) {
	return BORROWED.map((b) => {
		const slot = {
			id: "b",
			degree: b.degree,
			accidental: b.accidental,
			quality: b.quality,
			inversion: 0,
			beats: 4
		};
		return {
			degree: b.degree,
			accidental: b.accidental,
			quality: b.quality,
			roman: b.tag,
			name: chordName(tonic, mode, slot)
		};
	});
}
function totalBeats(slots) {
	return slots.reduce((sum, s) => sum + s.beats, 0);
}
function slotStarts(slots) {
	const starts = [];
	let beat = 0;
	for (const slot of slots) {
		starts.push(beat);
		beat += slot.beats;
	}
	return starts;
}
function makeSlot(partial) {
	return {
		id: partial.id ?? Math.random().toString(36).slice(2, 10),
		degree: partial.degree,
		accidental: partial.accidental ?? 0,
		quality: partial.quality ?? "auto",
		inversion: partial.inversion ?? 0,
		beats: partial.beats ?? 4
	};
}
var DEFAULT_SLOTS = [
	{
		id: "s1",
		degree: 1,
		accidental: 0,
		quality: "auto",
		inversion: 0,
		beats: 4
	},
	{
		id: "s2",
		degree: 5,
		accidental: 0,
		quality: "auto",
		inversion: 0,
		beats: 4
	},
	{
		id: "s3",
		degree: 6,
		accidental: 0,
		quality: "auto",
		inversion: 0,
		beats: 4
	},
	{
		id: "s4",
		degree: 4,
		accidental: 0,
		quality: "auto",
		inversion: 0,
		beats: 4
	}
];
function compile(snap) {
	const starts = slotStarts(snap.slots);
	const total = totalBeats(snap.slots);
	const events = [];
	snap.slots.forEach((slot, slotIndex) => {
		const { bass, tones } = voicingFor(snap.tonic, snap.mode, slot);
		const origin = starts[slotIndex] ?? 0;
		for (const ev of compilePattern(snap.patternId, slot.beats, bass, tones)) events.push({
			beat: origin + ev.beat,
			duration: ev.duration,
			midis: ev.midis,
			stagger: ev.stagger,
			velocity: ev.velocity,
			slotIndex,
			kind: "note"
		});
		if (snap.metronome) for (let b = 0; b < slot.beats; b += 1) {
			const abs = origin + b;
			events.push({
				beat: abs,
				duration: .05,
				midis: [],
				stagger: 0,
				velocity: abs % 4 === 0 ? 1 : .45,
				slotIndex,
				kind: "click"
			});
		}
	});
	events.sort((a, b) => a.beat - b.beat || (a.kind === "click" ? -1 : 1));
	return {
		events,
		total,
		starts
	};
}
function slotAt(starts, slots, beat) {
	if (!slots.length) return 0;
	let idx = 0;
	for (let i = 0; i < starts.length; i += 1) {
		const start = starts[i] ?? 0;
		const end = start + (slots[i]?.beats ?? 0);
		if (beat >= start && beat < end) return i;
		if (beat >= start) idx = i;
	}
	return idx;
}
var CadenceEngine = class {
	ctx = null;
	master = null;
	compressor = null;
	timer = null;
	raf = 0;
	playing = false;
	origin = 0;
	spb = .5;
	loopPass = 0;
	eventIndex = -1;
	compiled = null;
	getSnapshot = null;
	onPlayhead = null;
	onStop = null;
	ensure() {
		if (typeof window === "undefined") return null;
		if (!this.ctx) {
			const AC = window.AudioContext || window.webkitAudioContext;
			this.ctx = new AC({ latencyHint: "interactive" });
			this.master = this.ctx.createGain();
			this.compressor = this.ctx.createDynamicsCompressor();
			this.compressor.threshold.value = -18;
			this.compressor.knee.value = 18;
			this.compressor.ratio.value = 3;
			this.compressor.attack.value = .004;
			this.compressor.release.value = .18;
			this.master.gain.value = 1e-4;
			this.master.connect(this.compressor);
			this.compressor.connect(this.ctx.destination);
			document.addEventListener("visibilitychange", () => {
				if (document.visibilityState === "visible") this.ctx?.resume();
			});
		}
		return this.ctx;
	}
	unlock() {
		const ctx = this.ensure();
		if (ctx?.state === "suspended") ctx.resume();
	}
	start(getSnapshot, handlers) {
		this.unlock();
		const ctx = this.ensure();
		if (!ctx || !this.master) return;
		const snap = getSnapshot();
		if (!snap.slots.length) return;
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
		if (this.raf) cancelAnimationFrame(this.raf);
		this.getSnapshot = getSnapshot;
		this.onPlayhead = handlers.onPlayhead;
		this.onStop = handlers.onStop;
		this.playing = true;
		this.compiled = compile(snap);
		this.spb = 60 / clampTempo(snap.tempo);
		this.origin = ctx.currentTime + .05;
		this.loopPass = 0;
		this.eventIndex = -1;
		this.applyGain(snap, true);
		this.tick();
		this.paint();
	}
	stop() {
		const was = this.playing;
		this.playing = false;
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
		if (this.raf) {
			cancelAnimationFrame(this.raf);
			this.raf = 0;
		}
		if (this.ctx && this.master) {
			const now = this.ctx.currentTime;
			this.master.gain.cancelScheduledValues(now);
			this.master.gain.setTargetAtTime(1e-4, now, .025);
		}
		this.onPlayhead?.(null);
		if (was) this.onStop?.();
	}
	isPlaying() {
		return this.playing;
	}
	applyGain(snap, immediate = false) {
		if (!this.master || !this.ctx) return;
		const now = this.ctx.currentTime;
		const gain = snap.muted ? 1e-4 : Math.max(1e-4, snap.volume * snap.volume * .85);
		this.master.gain.cancelScheduledValues(now);
		if (immediate) this.master.gain.setValueAtTime(gain, now);
		else this.master.gain.setTargetAtTime(gain, now, .03);
	}
	tick = () => {
		if (!this.playing || !this.ctx || !this.getSnapshot) return;
		const snap = this.getSnapshot();
		const compiled = compile(snap);
		this.compiled = compiled;
		this.spb = 60 / clampTempo(snap.tempo);
		this.applyGain(snap);
		const { events, total } = compiled;
		if (!total || !snap.slots.length || !events.length) {
			this.stop();
			return;
		}
		const now = this.ctx.currentTime;
		const horizon = (now + .14 - this.origin) / this.spb;
		let guard = 0;
		while (guard < 64) {
			guard += 1;
			let pass = this.loopPass;
			let index = this.eventIndex + 1;
			if (index >= events.length) {
				if (!snap.loop) {
					const endTime = this.origin + (pass * total + total) * this.spb;
					const wait = Math.max(.03, endTime - now);
					this.timer = setTimeout(() => this.stop(), wait * 1e3);
					return;
				}
				pass += 1;
				index = 0;
			}
			const ev = events[index];
			if (!ev) break;
			const abs = pass * total + ev.beat;
			if (abs > horizon) break;
			const when = this.origin + abs * this.spb;
			if (when >= now - .02) {
				if (ev.kind === "click") this.playClick(when, ev.velocity);
				else this.playChord(snap.voice, ev.midis, when, ev.duration * this.spb, ev.stagger, ev.velocity);
			}
			this.loopPass = pass;
			this.eventIndex = index;
		}
		this.timer = setTimeout(this.tick, 25);
	};
	paint = () => {
		if (!this.playing || !this.ctx || !this.compiled || !this.getSnapshot) return;
		const snap = this.getSnapshot();
		const total = this.compiled.total;
		if (!total) return;
		const beats = (this.ctx.currentTime - this.origin) / this.spb;
		if (!snap.loop && beats >= total) {
			this.raf = requestAnimationFrame(this.paint);
			return;
		}
		const local = (beats % total + total) % total;
		const idx = slotAt(this.compiled.starts, snap.slots, local);
		const start = this.compiled.starts[idx] ?? 0;
		const dur = snap.slots[idx]?.beats ?? 1;
		this.onPlayhead?.({
			slotIndex: idx,
			progress: Math.min(1, Math.max(0, (local - start) / dur)),
			beat: local
		});
		this.raf = requestAnimationFrame(this.paint);
	};
	playClick(when, velocity) {
		const ctx = this.ctx;
		const dest = this.master;
		if (!ctx || !dest) return;
		const osc = ctx.createOscillator();
		const g = ctx.createGain();
		osc.type = "sine";
		osc.frequency.value = velocity > .7 ? 1260 : 880;
		g.gain.setValueAtTime(1e-4, when);
		g.gain.exponentialRampToValueAtTime(.08 * velocity, when + .004);
		g.gain.exponentialRampToValueAtTime(1e-4, when + .04);
		osc.connect(g);
		g.connect(dest);
		osc.start(when);
		osc.stop(when + .05);
	}
	playChord(voice, midis, when, duration, stagger, velocity) {
		const abs = Math.abs(stagger);
		(stagger < 0 ? [...midis].reverse() : midis).forEach((midi, i) => {
			this.playNote(voice, midi, when + i * abs, duration, velocity * Math.max(.45, 1 - i * .04));
		});
	}
	playNote(voice, midi, when, duration, velocity) {
		const ctx = this.ctx;
		const dest = this.master;
		if (!ctx || !dest) return;
		const freq = midiToFreq(midi);
		const vel = Math.max(.05, Math.min(1, velocity));
		if (voice === "nylon") this.pluck(ctx, dest, freq, when, duration, vel, midi);
		else if (voice === "pad") this.pad(ctx, dest, freq, when, duration, vel);
		else this.piano(ctx, dest, freq, when, duration, vel, midi);
	}
	piano(ctx, dest, freq, when, duration, vel, midi) {
		const out = ctx.createGain();
		const filter = ctx.createBiquadFilter();
		filter.type = "lowpass";
		const brightness = 1800 + vel * 2400 + (midi - 48) * 18;
		filter.frequency.setValueAtTime(brightness, when);
		filter.frequency.exponentialRampToValueAtTime(Math.max(420, brightness * .28), when + Math.min(duration, 1.4));
		filter.Q.value = .7;
		out.connect(filter);
		filter.connect(dest);
		const amp = Math.min(.22, .12 + vel * .1) * (midi < 50 ? 1.15 : 1);
		out.gain.setValueAtTime(1e-4, when);
		out.gain.exponentialRampToValueAtTime(amp, when + .008);
		out.gain.exponentialRampToValueAtTime(amp * .38, when + Math.min(.28, duration * .4));
		out.gain.exponentialRampToValueAtTime(1e-4, when + duration + .18);
		const stopAt = when + duration + .22;
		for (const p of [
			{
				n: 1,
				g: 1,
				type: "triangle"
			},
			{
				n: 2,
				g: .42,
				type: "sine"
			},
			{
				n: 3,
				g: .18,
				type: "sine"
			},
			{
				n: 4,
				g: .1,
				type: "sine"
			},
			{
				n: 5,
				g: .06,
				type: "sine"
			},
			{
				n: 6,
				g: .03,
				type: "sine"
			}
		]) {
			const osc = ctx.createOscillator();
			const g = ctx.createGain();
			osc.type = p.type;
			osc.frequency.value = freq * p.n * Math.sqrt(1 + p.n * p.n * 12e-5);
			g.gain.value = p.g;
			osc.connect(g);
			g.connect(out);
			osc.start(when);
			osc.stop(stopAt);
		}
		const noise = ctx.createBufferSource();
		const nbuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * .03), ctx.sampleRate);
		const data = nbuf.getChannelData(0);
		for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
		noise.buffer = nbuf;
		const ng = ctx.createGain();
		const bp = ctx.createBiquadFilter();
		bp.type = "bandpass";
		bp.frequency.value = 3200;
		bp.Q.value = 1.1;
		ng.gain.setValueAtTime(1e-4, when);
		ng.gain.exponentialRampToValueAtTime(.045 * vel, when + .003);
		ng.gain.exponentialRampToValueAtTime(1e-4, when + .03);
		noise.connect(bp);
		bp.connect(ng);
		ng.connect(out);
		noise.start(when);
		noise.stop(when + .04);
	}
	pluck(ctx, dest, freq, when, duration, vel, midi) {
		const out = ctx.createGain();
		const filter = ctx.createBiquadFilter();
		filter.type = "lowpass";
		filter.frequency.value = Math.min(5200, 900 + freq * 6);
		filter.Q.value = 1.4;
		out.connect(filter);
		filter.connect(dest);
		const amp = .16 * vel * (midi < 52 ? 1.2 : .9);
		out.gain.setValueAtTime(1e-4, when);
		out.gain.exponentialRampToValueAtTime(amp, when + .004);
		out.gain.exponentialRampToValueAtTime(amp * .2, when + .12);
		out.gain.exponentialRampToValueAtTime(1e-4, when + Math.min(duration + .3, 1.8));
		const stopAt = when + duration + .35;
		for (const p of [
			{
				n: 1,
				g: 1,
				type: "triangle"
			},
			{
				n: 2,
				g: .55,
				type: "sine"
			},
			{
				n: 3,
				g: .22,
				type: "sine"
			},
			{
				n: 5,
				g: .08,
				type: "sine"
			}
		]) {
			const osc = ctx.createOscillator();
			const g = ctx.createGain();
			osc.type = p.type;
			osc.frequency.value = freq * p.n;
			g.gain.value = p.g;
			osc.connect(g);
			g.connect(out);
			osc.start(when);
			osc.stop(stopAt);
		}
		const burst = ctx.createBufferSource();
		const len = Math.floor(ctx.sampleRate * .018);
		const buf = ctx.createBuffer(1, len, ctx.sampleRate);
		const d = buf.getChannelData(0);
		for (let i = 0; i < len; i += 1) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
		burst.buffer = buf;
		const bg = ctx.createGain();
		bg.gain.value = .08 * vel;
		burst.connect(bg);
		bg.connect(filter);
		burst.start(when);
		burst.stop(when + .02);
	}
	pad(ctx, dest, freq, when, duration, vel) {
		const out = ctx.createGain();
		const filter = ctx.createBiquadFilter();
		filter.type = "lowpass";
		filter.frequency.setValueAtTime(420, when);
		filter.frequency.exponentialRampToValueAtTime(1100 + vel * 400, when + .12);
		filter.Q.value = .4;
		out.connect(filter);
		filter.connect(dest);
		const amp = .08 * vel;
		out.gain.setValueAtTime(1e-4, when);
		out.gain.linearRampToValueAtTime(amp, when + .08);
		out.gain.setValueAtTime(amp, when + Math.max(.1, duration - .12));
		out.gain.linearRampToValueAtTime(1e-4, when + duration + .28);
		const stopAt = when + duration + .32;
		for (const c of [
			-8,
			0,
			9
		]) {
			const osc = ctx.createOscillator();
			const g = ctx.createGain();
			osc.type = "sawtooth";
			osc.frequency.value = freq * 2 ** (c / 1200);
			g.gain.value = .33;
			osc.connect(g);
			g.connect(out);
			osc.start(when);
			osc.stop(stopAt);
		}
	}
};
function clampTempo(tempo) {
	return Math.max(48, Math.min(180, tempo));
}
var engine = new CadenceEngine();
var PRESETS = [
	{
		id: "pop",
		name: "Pop axis",
		hint: "I–V–vi–IV",
		genre: "Pop",
		recipe: [
			{ degree: 1 },
			{ degree: 5 },
			{ degree: 6 },
			{ degree: 4 }
		]
	},
	{
		id: "sensitive",
		name: "Sensitive",
		hint: "vi–IV–I–V",
		genre: "Pop",
		recipe: [
			{ degree: 6 },
			{ degree: 4 },
			{ degree: 1 },
			{ degree: 5 }
		]
	},
	{
		id: "doo-wop",
		name: "Doo-wop",
		hint: "I–vi–IV–V",
		genre: "Pop",
		recipe: [
			{ degree: 1 },
			{ degree: 6 },
			{ degree: 4 },
			{ degree: 5 }
		]
	},
	{
		id: "deceptive",
		name: "Deceptive",
		hint: "I–V–vi–iii",
		genre: "Pop",
		recipe: [
			{ degree: 1 },
			{ degree: 5 },
			{ degree: 6 },
			{ degree: 3 }
		]
	},
	{
		id: "classic",
		name: "Classic",
		hint: "I–IV–V–I",
		genre: "Folk",
		recipe: [
			{ degree: 1 },
			{ degree: 4 },
			{ degree: 5 },
			{ degree: 1 }
		]
	},
	{
		id: "country",
		name: "Country",
		hint: "I–IV–V–IV",
		genre: "Country",
		recipe: [
			{ degree: 1 },
			{ degree: 4 },
			{ degree: 5 },
			{ degree: 4 }
		]
	},
	{
		id: "folk-walk",
		name: "Folk walk",
		hint: "I–vi–ii–V",
		genre: "Folk",
		recipe: [
			{ degree: 1 },
			{ degree: 6 },
			{ degree: 2 },
			{ degree: 5 }
		]
	},
	{
		id: "canon",
		name: "Canon",
		hint: "I–V–vi–iii–IV–I–IV–V",
		genre: "Classical",
		recipe: [
			{ degree: 1 },
			{ degree: 5 },
			{ degree: 6 },
			{ degree: 3 },
			{ degree: 4 },
			{ degree: 1 },
			{ degree: 4 },
			{ degree: 5 }
		]
	},
	{
		id: "jazz-251",
		name: "ii–V–I",
		hint: "ii⁷–V⁷–IΔ",
		genre: "Jazz",
		recipe: [
			{
				degree: 2,
				quality: "min7",
				beats: 2
			},
			{
				degree: 5,
				quality: "7",
				beats: 2
			},
			{
				degree: 1,
				quality: "maj7",
				beats: 4
			}
		]
	},
	{
		id: "rhythm",
		name: "Rhythm A",
		hint: "I–vi–ii–V",
		genre: "Jazz",
		recipe: [
			{
				degree: 1,
				quality: "maj7",
				beats: 2
			},
			{
				degree: 6,
				quality: "min7",
				beats: 2
			},
			{
				degree: 2,
				quality: "min7",
				beats: 2
			},
			{
				degree: 5,
				quality: "7",
				beats: 2
			}
		]
	},
	{
		id: "turnaround",
		name: "Turnaround",
		hint: "I–VI–II–V",
		genre: "Jazz",
		recipe: [
			{
				degree: 1,
				quality: "maj7",
				beats: 2
			},
			{
				degree: 6,
				quality: "7",
				beats: 2
			},
			{
				degree: 2,
				quality: "7",
				beats: 2
			},
			{
				degree: 5,
				quality: "7",
				beats: 2
			}
		]
	},
	{
		id: "blues",
		name: "12-bar blues",
		hint: "I⁷–IV⁷–V⁷",
		genre: "Blues",
		recipe: [
			{
				degree: 1,
				quality: "7"
			},
			{
				degree: 1,
				quality: "7"
			},
			{
				degree: 1,
				quality: "7"
			},
			{
				degree: 1,
				quality: "7"
			},
			{
				degree: 4,
				quality: "7"
			},
			{
				degree: 4,
				quality: "7"
			},
			{
				degree: 1,
				quality: "7"
			},
			{
				degree: 1,
				quality: "7"
			},
			{
				degree: 5,
				quality: "7"
			},
			{
				degree: 4,
				quality: "7"
			},
			{
				degree: 1,
				quality: "7"
			},
			{
				degree: 5,
				quality: "7"
			}
		]
	},
	{
		id: "rock",
		name: "Mixo rock",
		hint: "I–♭VII–IV",
		genre: "Rock",
		recipe: [
			{
				degree: 1,
				quality: "maj"
			},
			{
				degree: 7,
				accidental: -1,
				quality: "maj"
			},
			{
				degree: 4,
				quality: "maj"
			},
			{
				degree: 1,
				quality: "maj"
			}
		]
	},
	{
		id: "andalusian",
		name: "Andalusian",
		hint: "i–♭VII–♭VI–V",
		genre: "Minor",
		recipe: [
			{
				degree: 1,
				quality: "min"
			},
			{
				degree: 7,
				accidental: -1,
				quality: "maj"
			},
			{
				degree: 6,
				accidental: -1,
				quality: "maj"
			},
			{
				degree: 5,
				quality: "maj"
			}
		]
	},
	{
		id: "lament",
		name: "Lament",
		hint: "i–VII–VI–V",
		genre: "Minor",
		recipe: [
			{ degree: 1 },
			{ degree: 7 },
			{ degree: 6 },
			{
				degree: 5,
				quality: "maj"
			}
		]
	},
	{
		id: "creep",
		name: "Creep",
		hint: "I–III–IV–iv",
		genre: "Alt",
		recipe: [
			{
				degree: 1,
				quality: "maj"
			},
			{
				degree: 3,
				quality: "maj"
			},
			{
				degree: 4,
				quality: "maj"
			},
			{
				degree: 4,
				quality: "min"
			}
		]
	},
	{
		id: "amen",
		name: "Amen",
		hint: "IV–I",
		genre: "Gospel",
		recipe: [{
			degree: 4,
			beats: 4
		}, {
			degree: 1,
			beats: 4
		}]
	},
	{
		id: "pop-minor",
		name: "Pop minor",
		hint: "i–VI–III–VII",
		genre: "Pop",
		recipe: [
			{ degree: 1 },
			{ degree: 6 },
			{ degree: 3 },
			{ degree: 7 }
		]
	}
];
var GENRES = ["All", ...Array.from(new Set(PRESETS.map((p) => p.genre)))];
function slotsFromRecipe(recipe) {
	return recipe.map((step) => makeSlot({
		degree: step.degree,
		accidental: step.accidental ?? 0,
		quality: step.quality ?? "auto",
		beats: step.beats ?? 4
	}));
}
function snapshot(s) {
	return {
		tonic: KEY_BY_ID[s.tonicId] ?? KEYS[0],
		mode: s.mode,
		slots: s.slots,
		patternId: s.patternId,
		voice: s.voice,
		tempo: s.tempo,
		volume: s.volume,
		muted: s.muted,
		loop: s.loop,
		metronome: s.metronome
	};
}
function bindEngine() {
	engine.start(() => snapshot(useCadence.getState()), {
		onPlayhead: (playhead) => useCadence.setState({ playhead }),
		onStop: () => useCadence.setState({
			playing: false,
			playhead: null
		})
	});
}
var useCadence = create()(persist((set, get) => ({
	tonicId: "C",
	mode: "major",
	slots: DEFAULT_SLOTS,
	selectedId: "s1",
	patternId: "folk",
	voice: "piano",
	tempo: 100,
	volume: .78,
	muted: false,
	loop: true,
	metronome: false,
	showNumerals: true,
	playing: false,
	playhead: null,
	saved: [],
	saveName: "Pop axis",
	hydrated: false,
	setTonic: (tonicId) => set({ tonicId }),
	setMode: (mode) => set({ mode }),
	setPattern: (patternId) => {
		const meter = PATTERNS.find((p) => p.id === patternId)?.meter ?? 4;
		set((s) => ({
			patternId,
			slots: meter === 3 ? s.slots.map((slot) => ({
				...slot,
				beats: 3
			})) : s.slots.map((slot) => slot.beats === 3 ? {
				...slot,
				beats: 4
			} : slot)
		}));
	},
	setVoice: (voice) => set({ voice }),
	setTempo: (tempo) => set({ tempo: Math.max(48, Math.min(180, Math.round(tempo))) }),
	setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
	toggleMute: () => set((s) => ({ muted: !s.muted })),
	toggleLoop: () => set((s) => ({ loop: !s.loop })),
	toggleMetronome: () => set((s) => ({ metronome: !s.metronome })),
	toggleNumerals: () => set((s) => ({ showNumerals: !s.showNumerals })),
	select: (selectedId) => set({ selectedId }),
	addChord: (partial) => {
		const slot = makeSlot({
			...partial,
			beats: partial.beats ?? (get().patternId === "waltz" ? 3 : 4)
		});
		set((s) => {
			const idx = s.slots.findIndex((x) => x.id === s.selectedId);
			const slots = [...s.slots];
			slots.splice(idx >= 0 ? idx + 1 : slots.length, 0, slot);
			return {
				slots,
				selectedId: slot.id
			};
		});
	},
	updateSlot: (id, patch) => set((s) => ({ slots: s.slots.map((slot) => slot.id === id ? {
		...slot,
		...patch,
		id: slot.id
	} : slot) })),
	removeSlot: (id) => set((s) => {
		const slots = s.slots.filter((slot) => slot.id !== id);
		return {
			slots,
			selectedId: s.selectedId === id ? slots[slots.length - 1]?.id ?? null : s.selectedId
		};
	}),
	duplicateSlot: (id) => set((s) => {
		const idx = s.slots.findIndex((slot) => slot.id === id);
		const src = s.slots[idx];
		if (!src) return s;
		const copy = makeSlot({
			degree: src.degree,
			accidental: src.accidental,
			quality: src.quality,
			inversion: src.inversion,
			beats: src.beats
		});
		const slots = [...s.slots];
		slots.splice(idx + 1, 0, copy);
		return {
			slots,
			selectedId: copy.id
		};
	}),
	moveSlot: (id, dir) => set((s) => {
		const idx = s.slots.findIndex((slot) => slot.id === id);
		const next = idx + dir;
		if (idx < 0 || next < 0 || next >= s.slots.length) return s;
		const slots = [...s.slots];
		const [item] = slots.splice(idx, 1);
		if (!item) return s;
		slots.splice(next, 0, item);
		return { slots };
	}),
	clearSlots: () => {
		get().stop();
		set({
			slots: [],
			selectedId: null
		});
	},
	loadPreset: (id) => {
		const preset = PRESETS.find((p) => p.id === id);
		if (!preset) return;
		get().stop();
		const slots = slotsFromRecipe(preset.recipe);
		if (get().patternId === "waltz") slots.forEach((slot) => {
			slot.beats = 3;
		});
		set({
			slots,
			selectedId: slots[0]?.id ?? null,
			saveName: preset.name
		});
	},
	setSaveName: (saveName) => set({ saveName }),
	saveChart: () => {
		const s = get();
		const name = s.saveName.trim() || "Untitled";
		set({ saved: [{
			id: Math.random().toString(36).slice(2, 10),
			name,
			tonic: s.tonicId,
			mode: s.mode,
			slots: s.slots.map((slot) => ({ ...slot })),
			patternId: s.patternId,
			voice: s.voice,
			tempo: s.tempo,
			savedAt: Date.now()
		}, ...s.saved].slice(0, 24) });
	},
	loadChart: (id) => {
		const chart = get().saved.find((c) => c.id === id);
		if (!chart) return;
		get().stop();
		set({
			tonicId: chart.tonic,
			mode: chart.mode,
			slots: chart.slots.map((slot) => ({ ...slot })),
			patternId: chart.patternId,
			voice: chart.voice,
			tempo: chart.tempo,
			selectedId: chart.slots[0]?.id ?? null,
			saveName: chart.name
		});
	},
	deleteChart: (id) => set((s) => ({ saved: s.saved.filter((c) => c.id !== id) })),
	play: () => {
		if (!get().slots.length) return;
		set({ playing: true });
		bindEngine();
	},
	stop: () => {
		engine.stop();
		set({
			playing: false,
			playhead: null
		});
	},
	togglePlay: () => {
		const s = get();
		if (s.playing) s.stop();
		else s.play();
	},
	markHydrated: () => set({ hydrated: true })
}), {
	name: "cadence-v1",
	skipHydration: true,
	partialize: (s) => ({
		tonicId: s.tonicId,
		mode: s.mode,
		slots: s.slots,
		patternId: s.patternId,
		voice: s.voice,
		tempo: s.tempo,
		volume: s.volume,
		muted: s.muted,
		loop: s.loop,
		metronome: s.metronome,
		showNumerals: s.showNumerals,
		saved: s.saved,
		saveName: s.saveName,
		selectedId: s.selectedId
	})
}));
function ChordStage() {
	const tonicId = useCadence((s) => s.tonicId);
	const mode = useCadence((s) => s.mode);
	const slots = useCadence((s) => s.slots);
	const selectedId = useCadence((s) => s.selectedId);
	const showNumerals = useCadence((s) => s.showNumerals);
	const playing = useCadence((s) => s.playing);
	const playhead = useCadence((s) => s.playhead);
	const select = useCadence((s) => s.select);
	const addChord = useCadence((s) => s.addChord);
	const tonic = KEY_BY_ID[tonicId] ?? KEYS[0];
	const activeIndex = playing && playhead ? playhead.slotIndex : slots.findIndex((s) => s.id === selectedId);
	const active = slots[activeIndex] ?? slots[0];
	const next = slots.length ? slots[(Math.max(0, activeIndex) + 1) % slots.length] : null;
	const voice = active ? voicingFor(tonic, mode, active) : null;
	const progress = playing && playhead && slots[playhead.slotIndex]?.id === active?.id ? playhead.progress : 0;
	const diatonic = diatonicPalette(tonic, mode);
	const borrowed = borrowedPalette(tonic, mode);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-3xl bg-surface p-2 hairline",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative overflow-hidden rounded-2xl bg-elevated px-5 py-8 text-center md:px-8 md:py-10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-kicker font-medium tracking-kicker text-muted uppercase",
							children: active ? romanNumeral(mode, active) : "Add a chord"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display mt-2 text-hero leading-none font-medium tracking-tight italic",
							children: active ? chordName(tonic, mode, active) : "—"
						}),
						voice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 font-mono text-sm text-subtle",
							children: Array.from(new Set(voice.all.map((m) => pcName(m, tonic.flats)))).join("  ·  ")
						}),
						next && active && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-sm text-muted",
							children: ["Next ", slotLabel(tonic, mode, next, showNumerals).primary]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-x-0 bottom-0 h-1 bg-bg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "progress-fill h-full bg-accent",
								style: { transform: `scaleX(${progress})` }
							})
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex items-baseline justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-medium text-muted",
					children: "Progression"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs text-subtle",
					children: slots.map((s) => romanNumeral(mode, s)).join(" – ") || "empty"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-3xl bg-surface p-2 hairline",
				children: slots.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-4 py-8 text-center text-sm text-muted",
					children: "Pick a preset or add a scale degree to start writing."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SequenceStrip, {
					slots,
					selectedId,
					showNumerals,
					tonicId,
					mode,
					playing,
					playIndex: playhead?.slotIndex ?? -1,
					progress: playhead?.progress ?? 0,
					onSelect: select
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inspector, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-2 text-sm font-medium text-muted",
					children: "Scale degrees"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [diatonic.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "subtle",
						size: "chip",
						onClick: () => addChord({
							degree: item.degree,
							accidental: 0,
							quality: "auto"
						}),
						className: "min-w-14 flex-col gap-0 py-2 h-auto",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-base leading-none",
							children: item.roman
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-kicker text-subtle",
							children: item.name
						})]
					}, item.degree)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						size: "icon",
						"aria-label": "Add tonic",
						onClick: () => addChord({ degree: 1 }),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mt-4 mb-2 text-sm font-medium text-muted",
					children: "Borrowed"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: borrowed.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "ghost",
						size: "chip",
						onClick: () => addChord({
							degree: item.degree,
							accidental: item.accidental,
							quality: item.quality
						}),
						className: "h-auto min-w-14 flex-col gap-0 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-sm leading-none",
							children: item.roman
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-kicker text-subtle",
							children: item.name
						})]
					}, `${item.roman}-${item.name}`))
				})
			] })
		]
	});
}
function SequenceStrip({ slots, selectedId, showNumerals, tonicId, mode, playing, playIndex, progress, onSelect }) {
	const tonic = KEY_BY_ID[tonicId] ?? KEYS[0];
	const scroller = (0, import_react.useRef)(null);
	const activeId = playing && playIndex >= 0 ? slots[playIndex]?.id : selectedId;
	(0, import_react.useEffect)(() => {
		if (!activeId || !scroller.current) return;
		scroller.current.querySelector(`[data-slot="${activeId}"]`)?.scrollIntoView({
			behavior: "smooth",
			inline: "center",
			block: "nearest"
		});
	}, [activeId]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: scroller,
		className: "flex gap-2 overflow-x-auto pb-1",
		children: slots.map((slot, i) => {
			const labels = slotLabel(tonic, mode, slot, showNumerals);
			const isPlay = playing && i === playIndex;
			const isSel = slot.id === selectedId;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				"data-slot": slot.id,
				onClick: () => onSelect(slot.id),
				className: cn("press-scale relative min-w-20 shrink-0 overflow-hidden rounded-xl px-3 py-3 text-left", isPlay ? "bg-accent text-accent-fg" : isSel ? "bg-primary text-primary-fg" : "bg-elevated text-fg"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-kicker tracking-wide uppercase opacity-70",
						children: labels.secondary
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display mt-1 block text-xl leading-none",
						children: labels.primary
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mt-2 block font-mono text-kicker opacity-70",
						children: [slot.beats, " beats"]
					}),
					isPlay && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "progress-fill absolute inset-x-0 bottom-0 h-0.5 bg-accent-fg",
						style: { transform: `scaleX(${progress})` }
					})
				]
			}, slot.id);
		})
	});
}
function Inspector() {
	const selectedId = useCadence((s) => s.selectedId);
	const slots = useCadence((s) => s.slots);
	const updateSlot = useCadence((s) => s.updateSlot);
	const removeSlot = useCadence((s) => s.removeSlot);
	const duplicateSlot = useCadence((s) => s.duplicateSlot);
	const moveSlot = useCadence((s) => s.moveSlot);
	const slot = slots.find((s) => s.id === selectedId);
	if (!slot) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-subtle",
		children: "Select a chord to edit quality, inversion, and length."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-3xl bg-surface p-3 hairline",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-medium text-muted",
					children: "Edit chord"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "icon",
							"aria-label": "Move left",
							className: "size-9",
							onClick: () => moveSlot(slot.id, -1),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "icon",
							"aria-label": "Move right",
							className: "size-9",
							onClick: () => moveSlot(slot.id, 1),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "icon",
							"aria-label": "Duplicate",
							className: "size-9",
							onClick: () => duplicateSlot(slot.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "danger",
							size: "icon",
							"aria-label": "Remove",
							className: "size-9",
							onClick: () => removeSlot(slot.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-1.5",
				children: QUALITY_OPTIONS.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => updateSlot(slot.id, { quality: q.id }),
					className: cn("press-scale h-8 rounded-full px-3 text-xs", slot.quality === q.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted hover:text-fg"),
					children: q.label
				}, q.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-kicker mb-1.5 text-subtle uppercase tracking-wide",
					children: "Beats"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-1",
					children: BEAT_OPTIONS.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => updateSlot(slot.id, { beats: b }),
						className: cn("press-scale size-9 rounded-md font-mono text-sm", slot.beats === b ? "bg-accent text-accent-fg" : "bg-elevated text-muted"),
						children: b
					}, b))
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-kicker mb-1.5 text-subtle uppercase tracking-wide",
					children: "Inversion"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-1",
					children: [
						0,
						1,
						2
					].map((inv) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => updateSlot(slot.id, { inversion: inv }),
						className: cn("press-scale h-9 rounded-md px-3 text-sm", slot.inversion === inv ? "bg-accent text-accent-fg" : "bg-elevated text-muted"),
						children: inv === 0 ? "Root" : inv === 1 ? "1st" : "2nd"
					}, inv))
				})] })]
			})
		]
	});
}
var START = 48;
var WHITE_PCS = /* @__PURE__ */ new Set([
	0,
	2,
	4,
	5,
	7,
	9,
	11
]);
function isWhite(midi) {
	return WHITE_PCS.has(midiPc(midi));
}
var WHITE_MIDIS = Array.from({ length: 25 }, (_, i) => START + i).filter(isWhite);
var BLACK_MIDIS = Array.from({ length: 25 }, (_, i) => START + i).filter((m) => !isWhite(m));
function PianoStrip() {
	const tonicId = useCadence((s) => s.tonicId);
	const mode = useCadence((s) => s.mode);
	const slots = useCadence((s) => s.slots);
	const selectedId = useCadence((s) => s.selectedId);
	const playing = useCadence((s) => s.playing);
	const slotIndex = useCadence((s) => s.playhead?.slotIndex ?? -1);
	const tonic = KEY_BY_ID[tonicId] ?? KEYS[0];
	const slot = slots[playing && slotIndex >= 0 ? slotIndex : slots.findIndex((s) => s.id === selectedId)] ?? slots[0];
	const tones = slot ? new Set(voicingFor(tonic, mode, slot).all) : /* @__PURE__ */ new Set();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-3xl bg-surface p-2 hairline",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex h-24 overflow-hidden rounded-2xl bg-bg",
			children: [WHITE_MIDIS.map((midi) => {
				const on = tones.has(midi) || tones.has(midi + 12) || tones.has(midi - 12);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("relative h-full min-w-0 flex-1 border-r border-bg last:border-r-0", on ? "bg-key-on" : "bg-key-white") }, midi);
			}), BLACK_MIDIS.map((midi) => {
				const whitesBefore = WHITE_MIDIS.filter((w) => w < midi).length;
				const whiteWidth = 100 / WHITE_MIDIS.length;
				const on = tones.has(midi) || tones.has(midi + 12) || tones.has(midi - 12);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("absolute top-0 z-10 h-3/5 rounded-b-sm", on ? "bg-accent" : "bg-key-black"),
					style: {
						left: `calc(${whitesBefore * whiteWidth}% - ${whiteWidth * .32}%)`,
						width: `${whiteWidth * .64}%`
					}
				}, midi);
			})]
		})
	});
}
function StudioSidebar() {
	const tonicId = useCadence((s) => s.tonicId);
	const mode = useCadence((s) => s.mode);
	const patternId = useCadence((s) => s.patternId);
	const voice = useCadence((s) => s.voice);
	const saveName = useCadence((s) => s.saveName);
	const saved = useCadence((s) => s.saved);
	const setTonic = useCadence((s) => s.setTonic);
	const setMode = useCadence((s) => s.setMode);
	const setPattern = useCadence((s) => s.setPattern);
	const setVoice = useCadence((s) => s.setVoice);
	const loadPreset = useCadence((s) => s.loadPreset);
	const setSaveName = useCadence((s) => s.setSaveName);
	const saveChart = useCadence((s) => s.saveChart);
	const loadChart = useCadence((s) => s.loadChart);
	const deleteChart = useCadence((s) => s.deleteChart);
	const [genre, setGenre] = (0, import_react.useState)("All");
	const presets = genre === "All" ? PRESETS : PRESETS.filter((p) => p.genre === genre);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "flex flex-col gap-6 rounded-3xl bg-surface p-3 hairline md:p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-2 text-sm font-medium text-muted",
					children: "Key"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-6 gap-1.5",
					children: KEYS.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setTonic(key.id),
						className: cn("press-scale h-11 rounded-lg font-display text-sm", tonicId === key.id ? "bg-primary text-primary-fg" : "bg-elevated text-fg hover:bg-surface"),
						children: key.label
					}, key.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex flex-wrap gap-1.5",
					children: MODE_LIST.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setMode(m.id),
						className: cn("press-scale h-9 rounded-full px-3 text-sm", mode === m.id ? "bg-accent text-accent-fg" : "bg-elevated text-muted hover:text-fg"),
						children: m.label
					}, m.id))
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-2 text-sm font-medium text-muted",
					children: "Presets"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-2 flex flex-wrap gap-1",
					children: GENRES.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setGenre(g),
						className: cn("press-scale h-8 rounded-full px-2.5 text-xs", genre === g ? "bg-elevated text-fg" : "text-subtle hover:text-muted"),
						children: g
					}, g))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col gap-1.5",
					children: presets.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => loadPreset(preset.id),
						className: "press-scale flex h-11 items-center justify-between rounded-xl bg-elevated px-3 text-left hover:bg-surface",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-fg",
							children: preset.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs text-subtle",
							children: preset.hint
						})]
					}, preset.id))
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 text-sm font-medium text-muted",
				children: "Pattern"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-1.5",
				children: PATTERNS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					title: p.hint,
					onClick: () => setPattern(p.id),
					className: cn("press-scale flex h-14 flex-col items-start justify-center rounded-xl px-3 text-left", patternId === p.id ? "bg-primary text-primary-fg" : "bg-elevated text-fg hover:bg-surface"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm leading-none",
						children: p.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("mt-1 text-kicker", patternId === p.id ? "opacity-70" : "text-subtle"),
						children: p.hint
					})]
				}, p.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 text-sm font-medium text-muted",
				children: "Voice"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-1.5",
				children: VOICES.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setVoice(v.id),
					className: cn("press-scale h-16 rounded-xl px-2 text-center", voice === v.id ? "bg-accent text-accent-fg" : "bg-elevated text-fg"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-sm",
						children: v.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("text-kicker", voice === v.id ? "opacity-70" : "text-subtle"),
						children: v.hint
					})]
				}, v.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-2 text-sm font-medium text-muted",
					children: "Save"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "flex gap-2",
					onSubmit: (e) => {
						e.preventDefault();
						saveChart();
						toast("Saved on this device");
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: saveName,
						onChange: (e) => setSaveName(e.target.value),
						placeholder: "Name this chart",
						className: "h-11 min-w-0 flex-1 rounded-lg bg-elevated px-3 text-sm text-fg placeholder:text-subtle"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						variant: "subtle",
						size: "icon",
						"aria-label": "Save chart",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "size-4" })
					})]
				}),
				saved.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-subtle",
					children: "Charts stay in this browser."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 flex flex-col gap-1.5",
					children: saved.map((chart) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => loadChart(chart.id),
							className: "press-scale flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl bg-elevated px-3 text-left hover:bg-surface",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderOpen, { className: "size-3.5 shrink-0 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate text-sm",
								children: chart.name
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "icon",
							"aria-label": `Delete ${chart.name}`,
							className: "size-11",
							onClick: () => deleteChart(chart.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
						})]
					}, chart.id))
				})
			] })
		]
	});
}
function Slider({ min, max, step = 1, value, onValueChange, className, "aria-label": ariaLabel }) {
	const current = value[0] ?? min;
	const pct = max === min ? 0 : (current - min) / (max - min) * 100;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type: "range",
		min,
		max,
		step,
		value: current,
		"aria-label": ariaLabel,
		onChange: (event) => onValueChange([Number(event.target.value)]),
		className: cn("range-input", className),
		style: { ["--range-pct"]: `${pct}%` }
	});
}
function Transport() {
	const playing = useCadence((s) => s.playing);
	const tempo = useCadence((s) => s.tempo);
	const volume = useCadence((s) => s.volume);
	const muted = useCadence((s) => s.muted);
	const loop = useCadence((s) => s.loop);
	const metronome = useCadence((s) => s.metronome);
	const slots = useCadence((s) => s.slots);
	const togglePlay = useCadence((s) => s.togglePlay);
	const setTempo = useCadence((s) => s.setTempo);
	const setVolume = useCadence((s) => s.setVolume);
	const toggleMute = useCadence((s) => s.toggleMute);
	const toggleLoop = useCadence((s) => s.toggleLoop);
	const toggleMetronome = useCadence((s) => s.toggleMetronome);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "border-t border-border bg-bg/95 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:gap-6 md:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-center gap-2 md:justify-start",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: loop ? "accent" : "subtle",
							size: "icon",
							"aria-pressed": loop,
							"aria-label": loop ? "Loop on" : "Loop off",
							onClick: toggleLoop,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "default",
							size: "play",
							"aria-label": playing ? "Pause" : "Play",
							disabled: slots.length === 0,
							onClick: togglePlay,
							children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-6" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5 size-6" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: metronome ? "accent" : "subtle",
							size: "chip",
							"aria-pressed": metronome,
							onClick: toggleMetronome,
							children: "Click"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 flex-1 items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "icon",
							"aria-label": "Slower",
							className: "size-11 shrink-0",
							onClick: () => setTempo(tempo - 1),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-kicker tracking-wide text-subtle uppercase",
									children: "Tempo"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-lg tabular-nums leading-none",
									children: tempo
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								min: 48,
								max: 180,
								step: 1,
								value: [tempo],
								onValueChange: ([v]) => setTempo(v ?? tempo),
								"aria-label": "Tempo"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "icon",
							"aria-label": "Faster",
							className: "size-11 shrink-0",
							onClick: () => setTempo(tempo + 1),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-36 items-center gap-2 md:w-48",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "icon",
						"aria-label": muted ? "Unmute" : "Mute",
						className: "size-11 shrink-0",
						onClick: toggleMute,
						children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						min: 0,
						max: 1,
						step: .01,
						value: [muted ? 0 : volume],
						onValueChange: ([v]) => {
							setVolume(v ?? volume);
							if (muted && (v ?? 0) > 0) toggleMute();
						},
						"aria-label": "Volume"
					})]
				})
			]
		})
	});
}
var TooltipProvider = Provider;
var TooltipContent = import_react.forwardRef(({ className, sideOffset = 8, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 rounded-md bg-elevated px-2.5 py-1.5 text-xs text-fg shadow-[var(--shadow-border)]", className),
	...props
}) }));
TooltipContent.displayName = "TooltipContent";
function CadenceApp() {
	const tonicId = useCadence((s) => s.tonicId);
	const mode = useCadence((s) => s.mode);
	const showNumerals = useCadence((s) => s.showNumerals);
	const toggleNumerals = useCadence((s) => s.toggleNumerals);
	const playing = useCadence((s) => s.playing);
	const tonic = KEY_BY_ID[tonicId] ?? KEYS[0];
	(0, import_react.useEffect)(() => {
		(async () => {
			await useCadence.persist.rehydrate();
			useCadence.getState().markHydrated();
		})();
	}, []);
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			const target = event.target;
			if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
			const s = useCadence.getState();
			if (event.code === "Space") {
				event.preventDefault();
				s.togglePlay();
				return;
			}
			if (event.key >= "1" && event.key <= "7") {
				s.addChord({ degree: Number(event.key) });
				return;
			}
			if ((event.key === "Backspace" || event.key === "Delete") && s.selectedId) {
				event.preventDefault();
				s.removeSlot(s.selectedId);
				return;
			}
			if (event.key === "Escape") s.select(null);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, {
		delayDuration: 400,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-dvh flex-col",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "mx-auto flex w-full max-w-6xl items-end justify-between gap-4 px-4 pt-6 pb-4 md:px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-kicker tracking-mark text-accent uppercase",
						children: "Play the changes"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-4xl leading-none font-medium tracking-tight italic md:text-5xl",
						children: "Cadence"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-end gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								tonic.label,
								" ",
								mode === "major" ? "major" : mode === "minor" ? "minor" : mode.replace("-", " ")
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: toggleNumerals,
							className: cn("press-scale h-8 rounded-full px-3 text-xs", showNumerals ? "bg-elevated text-fg" : "text-subtle hover:text-muted"),
							children: showNumerals ? "Roman numerals" : "Chord names"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
					className: "mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-start gap-8 px-4 pb-8 md:grid-cols-12 md:px-6 md:pb-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "flex min-w-0 flex-col gap-4 md:col-span-7 lg:col-span-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChordStage, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PianoStrip, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-subtle",
								children: ["Space plays. Keys 1–7 add degrees. ", playing ? "Looping the chart." : "Tap play to hear the voicing."]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "min-w-0 md:col-span-5 lg:col-span-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "studio-rail",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudioSidebar, {})
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "sticky bottom-0 z-20 pb-[env(safe-area-inset-bottom)]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Transport, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
					theme: "dark",
					position: "bottom-center"
				})
			]
		})
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CadenceApp, {});
}
//#endregion
export { Home as component };
