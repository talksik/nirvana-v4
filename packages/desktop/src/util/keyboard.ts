type Shortcut = { label: string; shortcutKey: string };

export const KeyboardShortcuts: Record<string, Shortcut> = {
  search: {
    label: '/',
    shortcutKey: '/',
  },
  escape: {
    shortcutKey: 'Escape',
    label: 'esc',
  },
};
