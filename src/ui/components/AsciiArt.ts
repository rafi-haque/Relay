/**
 * ASCII Art for Relay CLI
 * Beautiful gradient logos inspired by Gemini CLI
 */

export const relayLogo = `
██████ ███████ ██      █████  ██    ██     ██████ ██     ██
██   ██ ██     ██     ██   ██  ██  ██     ██      ██     ██
██████  ████   ██     ███████   ████      ██      ██     ██
██   ██ ██     ██     ██   ██    ██       ██      ██     ██
██   ██ ███████ █████ ██   ██    ██       ██████ ███████ ██
`;

export const relayLogoLarge = `
██████ ███████ ██      █████  ██    ██     ██████ ██     ██
██   ██ ██     ██     ██   ██  ██  ██     ██      ██     ██
██████  ████   ██     ███████   ████      ██      ██     ██
██   ██ ██     ██     ██   ██    ██       ██      ██     ██
██   ██ ███████ █████ ██   ██    ██       ██████ ███████ ██
`;

export const relayLogoSmall = `
██████ ███████ ██      █████  ██    ██     ██████ ██     ██
██   ██ ██     ██     ██   ██  ██  ██     ██      ██     ██
██████  ████   ██     ███████   ████      ██      ██     ██
██   ██ ██     ██     ██   ██    ██       ██      ██     ██
██   ██ ███████ █████ ██   ██    ██       ██████ ███████ ██
`;

export const relayLogoTiny = `
█▀█ █▀▀ █   █▀█ █▄█   ▄▀█ █   █
█▀▄ ██▄ █▄▄ █▀█  █ ▄▄ █▀█ █▄▄ █
`;

export function getAsciiArtWidth(art: string): number {
  const lines = art.trim().split('\n');
  return Math.max(...lines.map(line => line.length));
}

export function selectLogoByWidth(terminalWidth: number): string {
  const largeWidth = getAsciiArtWidth(relayLogoLarge);
  const normalWidth = getAsciiArtWidth(relayLogo);
  const smallWidth = getAsciiArtWidth(relayLogoSmall);

  if (terminalWidth >= largeWidth) {
    return relayLogoLarge;
  } else if (terminalWidth >= normalWidth) {
    return relayLogo;
  } else if (terminalWidth >= smallWidth) {
    return relayLogoSmall;
  } else {
    return relayLogoTiny;
  }
}