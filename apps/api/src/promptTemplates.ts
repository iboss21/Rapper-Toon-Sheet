import { GenerateOptions } from '@rapper-toon-sheet/shared';

export interface PromptTemplate {
  systemPrompt: string;
  userPrompt: string;
  negativePrompt: string;
}

export function buildPrompt(options: GenerateOptions, nickname: string = 'CHARACTER'): PromptTemplate {
  const { stylePreset, background, layout, includeTurnaround, includeActionPoses } = options;

  // Style variations
  const styleDescriptions: Record<string, string> = {
    cartoon_realism: 'High quality stylized cartoon realism for an animated rap music video. Cinematic lighting, ultra-detailed face, expressive eyes, clean linework, soft shading, subtle film grain.',
    anime_ish: 'Anime-inspired character design with expressive features, dynamic shading, and vibrant colors. Detailed line art with cel-shaded style.',
    comic_ink: 'Bold comic book style with strong ink lines, dramatic shadows, and halftone textures. Dynamic comic book illustration aesthetic.',
    clean_cell_shade: 'Clean cell-shaded style with flat colors, crisp edges, and minimal gradients. Modern vector art aesthetic.'
  };

  // Background descriptions
  const backgroundDescriptions: Record<string, string> = {
    neon_city_blur: 'blurred neon city night background with purple and blue tones',
    plain_studio_grey: 'plain neutral grey studio background',
    transparent: 'transparent or white background for easy cutout'
  };

  const styleDesc = styleDescriptions[stylePreset] || styleDescriptions.cartoon_realism;
  const bgDesc = backgroundDescriptions[background] || backgroundDescriptions.neon_city_blur;
  const layoutDesc = layout === 'two_posters' ? 'Split into two separate poster compositions' : 'Single comprehensive poster layout';

  const systemPrompt = `You are an expert character designer creating reference sheets for animation and music videos. 
Focus on maintaining facial identity consistency and professional character design standards.`;

  let userPrompt = `TASK: Create a "Character Reference Sheet" poster from the uploaded photo(s).

STYLE:
${styleDesc}
Keep the person's facial identity strongly recognizable from the reference photo(s).
Do NOT change gender or age drastically.
No plastic-looking skin, no uncanny face changes.

OUTPUT LAYOUT (${layoutDesc}):
- Title at top: "${nickname}" in bold graffiti/hip-hop lettering
- Sections:`;

  if (includeTurnaround) {
    userPrompt += `
  1) Head turnarounds: front, 3/4, side view
  2) Full body turnarounds: front, side, back view`;
  } else {
    userPrompt += `
  1) Front headshot with detailed facial features
  2) Full body front view`;
  }

  if (includeActionPoses) {
    userPrompt += `
  3) Action poses: (A) holding keys / tossing keys (B) sitting in car interior pose`;
  }

  userPrompt += `
- Background: ${bgDesc}
- Add small notes: "consistent character design", "front/side/back", etc

CLOTHING:
Use modern luxury streetwear consistent with underground rap aesthetic.
If the user photo shows a distinctive clothing item (bag, watch, jewelry), keep it as a signature accessory.

CAMERA / ART DIRECTION:
Cinematic, sharp character silhouettes, consistent proportions, no face drift between views.

NICKNAME: "${nickname}"

Return exactly 1 high-resolution poster image (1024x1792px or similar portrait format).`;

  const negativePrompt = `face mismatch, different identity, different person, extra people, multiple characters, 
deformed hands, bad anatomy, blurry text, misspelled nickname, watermark, logos, signatures, 
NSFW, nudity, sexual content, explicit content, violence, gore, weapons, drugs, 
uncanny valley, plastic skin, distorted features, inconsistent character`;

  return {
    systemPrompt,
    userPrompt,
    negativePrompt
  };
}

export function validateNickname(nickname: string): boolean {
  // Reject inappropriate content
  const inappropriate = /\b(nsfw|nude|sex|explicit|kill|weapon|drug|violence)\b/i;
  if (inappropriate.test(nickname)) {
    return false;
  }
  
  // Basic length check
  if (nickname.length > 30 || nickname.length < 1) {
    return false;
  }
  
  return true;
}

export function sanitizeNickname(nickname: string): string {
  // Remove special characters except space, dash, underscore
  return nickname.replace(/[^a-zA-Z0-9\s\-_]/g, '').trim().substring(0, 30);
}
