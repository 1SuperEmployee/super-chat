## UI customization guide

This guide explains how to safely restyle and customize Super Chat’s UI to match your brand and workflows.

### Theming via CSS variables

Core colors are defined in `app/assets/stylesheets/colors.css` using OKLCH variables with light/dark mappings.

- Edit brand bases:
  - `--lch-super-green-dark`, `--lch-super-lime-accent`
  - Neutral grays: `--lch-gray*`, `--lch-white`
- Light mode mappings live under `:root`; dark mode under `@media (prefers-color-scheme: dark)`.
- Frequently used derived tokens:
  - `--color-text`, `--color-bg`, `--color-border`
  - `--color-link`, `--color-selected`, `--color-button`
  - `--color-message-bg`

Tip: Prefer editing the base `--lch-*` variables; the mapped `--color-*` tokens will update across the app.

### Account-level custom CSS

`ApplicationHelper#custom_styles_tag` injects account-specific CSS from `Current.account.custom_styles` into the `<head>` with `data-turbo-track="reload"`. This allows per-tenant theming without changing global assets.

How to use:

1. Expose a text area in your account admin to edit `custom_styles` (already wired if using the built-in accounts UI).
2. Paste CSS such as:

```css
:root { --lch-super-lime-accent: 90% 0.22 120; }
.message__author { font-weight: 700; }
```

### Icons, logos, and PWA theme

- App icons are fed from `fresh_account_logo_path` in `app/views/layouts/application.html.erb` and `app/views/pwa/manifest.json.erb`.
- Replace or brand per account by attaching a logo to the account; the layout uses `account-has-logo` body class for conditional styling.
- Theme color for the browser UI is set via `<meta name="theme-color" ...>` with light/dark variants in the layout.

### Layout structure

Main shell: `app/views/layouts/application.html.erb`

- `<nav id="nav">` and `<aside id="sidebar">` regions are yielded from views. Tweak spacing or visibility using CSS and the `toggle-class` Stimulus controller bound to `#sidebar`.
- The app logo link `#app-logo` is absolute-positioned; customize its placement or hide on certain viewports with media queries.
- Flash messages use `.flash` and CSS variable `--color-negative` for alerts.

### Messages UI

- Message HTML lives in `app/views/messages/_message.html.erb` and renders `messages/_presentation`.
- Client formatting is applied by `MessageFormatter` via the `messages_controller.js` Stimulus controller targets:
  - Targets: `messages`, `body`, `message`, `latest`, `template`
  - CSS classes: `firstOfDay`, `formatted`, `me`, `mentioned`, `threaded`
- To change structure (e.g., author placement, timestamp): edit `_message.html.erb` and `_presentation.html.erb`. Keep IDs/targets intact for Turbo updates.

### Typography and spacing

- Define font stacks via global CSS in your own stylesheet, or inject via `custom_styles`.
- Adjust density by targeting `.message__body`, `.message__meta`, and container paddings.
- Day separators use `.message__day-separator`; restyle for more/less emphasis.

### Dark mode adjustments

- Modify the `@media (prefers-color-scheme: dark)` block in `colors.css` to refine contrast.
- Verify `--color-link`, `--color-selected`, and `--color-message-bg` meet contrast guidelines.

### Sounds and interaction accents

- Incoming sounds are triggered in `messages_controller.js` via `#playSoundForLastMessage()` when a `.sound` element exists in the last message. Add/remove sound cues by controlling when that element is included in message partials.

### Stimulus controllers overview

Controllers live in `app/javascript/controllers/` and are auto-registered. Useful ones for UI tweaks:

- `toggle_class_controller.js`: toggle classes on an element; used by the sidebar.
- `lightbox_controller.js`: handles image zoom/lightbox.
- `local_time_controller.js`: localizes timestamps.
- `maintain_scroll_controller.js` and `scroll_into_view_controller.js`: scroll behaviors.

You can add new controllers and bind via `data-controller` attributes.

### Safe-edit checklist

- Keep Turbo frame IDs and `data-*-target` attributes unchanged when possible.
- When changing message markup, update both `_message.html.erb` and `_template.html.erb` (the pending client message template) to match.
- After CSS changes, verify PWA `manifest.json.erb` theme/background colors still align.

### Example: brand accent change

Edit `app/assets/stylesheets/colors.css`:

```css
:root {
  --lch-super-lime-accent: 88% 0.25 130; /* new brand */
}
```

Dark mode:

```css
@media (prefers-color-scheme: dark) {
  :root { --color-link: oklch(var(--lch-super-lime-accent)); }
}
```


