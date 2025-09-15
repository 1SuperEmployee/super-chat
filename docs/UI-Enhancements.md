## UI enhancements and component ideas

This document outlines pragmatic UI upgrades that fit the current Turbo/Stimulus architecture and Rails views.

### Quick wins (low-risk)

- Message density toggle
  - Add a user preference (cookie or account setting) and body class, e.g., `density--compact`.
  - CSS target `.message__body`, `.message__meta` to reduce paddings/margins when compact.

- Improved day separators
  - Replace `.message__day-separator` with a full-width sticky header when the day changes.
  - Use `position: sticky; top: 0; backdrop-filter: blur(6px);` for a subtle, premium feel.

- Link previews alignment
  - In presentation helper, ensure preview cards have a fixed max-width and media queries for mobile.

- Subtle hover states
  - Add `:hover` backgrounds to `.message` rows and `.message__actions`.

### Medium scope

- Typographic scale
  - Introduce CSS custom props for font sizes: `--font-size-body`, `--font-size-meta` and adjust in `:root` + dark mode.

- Avatar sizes and shapes
  - Support circular/squircle via CSS mask or `border-radius: 12px` toggle controlled by a setting.

- Inline message actions toolbar
  - Move the actions rendered by `messages/_actions.html.erb` into a floating toolbar that appears on hover/focus.
  - Keep buttons accessible via keyboard focus.

- Threaded styling
  - Increase indentation and add a connecting vertical rule for threaded replies (class is available via `threadedClass`).

### Larger features

- Quick reactions (emoji)
  - Add a small reactions bar to each message with most-used emojis.
  - Persist server-side as a `Reaction` model or reuse `Boost` mechanics if suitable.

- Color-coded mentions and roles
  - Style `@mentions` differently based on role (admin/moderator) using server-rendered spans in `message_presentation`.

- Message composer improvements
  - Add slash-command menu (existing `/play` is supported); show a suggestions popup when typing `/` using Stimulus.
  - Add attachment dropzone previews with progress indicators (there's an `upload_preview_controller.js` you can extend).

### Accessibility and polish

- Ensure sufficient contrast in dark mode (test `--color-text` and link colors).
- Increase hit targets for touch (44px min height) for action buttons.
- Provide `prefers-reduced-motion` variants for animations.

### Code pointers

- Views: `app/views/messages/*.erb` for markup.
- JS: `app/javascript/controllers/messages_controller.js` for formatting and scroll behavior.
- Styles: `app/assets/stylesheets/*` and account `custom_styles`.

### Example CSS snippets

Compact density:

```css
body.density--compact .message__body { padding-block: 4px; }
body.density--compact .message__meta { gap: 6px; }
```

Sticky day separator:

```css
.message__day-separator {
  position: sticky;
  top: 0;
  z-index: 10;
  background: color-mix(in oklab, var(--color-bg), transparent 20%);
  backdrop-filter: blur(6px);
}
```


