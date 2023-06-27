export type RGB = [number, number, number];

export function rgbToString(rgb: RGB): string {
    return `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`;
}

type HSL = [number, number, number];

function rgbToHsl([r, g, b]: RGB): HSL {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = (max + min) / 2;
    let s = (max + min) / 2;
    let l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h * 360, s * 100, l * 100];
}

function hslToRgb([h, s, l]: HSL): RGB {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r * 255, g * 255, b * 255].map(Math.round) as RGB;
}

export function createGradient(color1: RGB, color2: RGB, steps: number): RGB[] {
    const hsl1 = rgbToHsl(color1);
    const hsl2 = rgbToHsl(color2);
    const gradient = [];
    for (let i = 0; i < steps; i++) {
        const h = hsl1[0] + ((hsl2[0] - hsl1[0]) * (i / (steps - 1)));
        const s = hsl1[1] + ((hsl2[1] - hsl1[1]) * (i / (steps - 1)));
        const l = hsl1[2] + ((hsl2[2] - hsl1[2]) * (i / (steps - 1)));
        gradient.push(hslToRgb([h, s, l]));
    }
    return gradient;
}

export const START_RGB: RGB = [219, 168, 163];
export const END_RGB: RGB = [196, 168, 243];
