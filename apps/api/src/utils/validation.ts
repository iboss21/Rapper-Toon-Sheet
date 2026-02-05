const INAPPROPRIATE_KEYWORDS = [
  'nsfw', 'nude', 'naked', 'sex', 'porn', 'explicit',
  'kill', 'murder', 'violence', 'gore', 'blood',
  'drug', 'cocaine', 'heroin', 'meth',
  'weapon', 'gun', 'knife', 'bomb',
  'child', 'kid', 'minor', 'underage'
];

export function containsInappropriateContent(text: string): boolean {
  const lowerText = text.toLowerCase();
  return INAPPROPRIATE_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

export function validateGenerationRequest(
  nickname: string | undefined,
  filesCount: number
): { valid: boolean; error?: string } {
  // Check files
  if (filesCount < 1) {
    return { valid: false, error: 'At least one image is required' };
  }

  if (filesCount > 2) {
    return { valid: false, error: 'Maximum 2 images allowed' };
  }

  // Check nickname
  if (nickname && containsInappropriateContent(nickname)) {
    return { valid: false, error: 'Inappropriate content detected in nickname' };
  }

  return { valid: true };
}
