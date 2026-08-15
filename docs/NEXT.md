# Store Canary Next

## Unblocked

1. Add a static-export check that `role` attributes contain only valid WAI-ARIA role tokens.
2. Add a static-export check that no `id` value starts with a digit or contains whitespace.
3. Add a static-export check that every HTML document has exactly one html element and one body
   element.
4. Add a static-export check that generated HTML contains no `autofocus` attributes.
5. Add a static-export check that every HTML document has exactly one `h1`.
6. Add a static-export check that every HTML document has a non-empty meta description.
7. Add a static-export check that `aria-hidden="true"` elements contain no focusable controls.
8. Add a static-export check that generated HTML contains no `accesskey` attributes.
9. Add a static-export check that every `html` element either omits `dir` (defaulting to `ltr`) or
    uses a valid `dir` value.
10. Add a static-export check that landing-page `meta robots`, when present, does not include
    `noindex`.
11. Add a static-export check that generated links never use `data:` URLs.
12. Add a static-export check that every generated `iframe`, if any, has a non-empty title.
13. Add a static-export check that generated HTML contains no `http-equiv="refresh"` metadata.
14. Add a static-export check that every `img` has an `alt` attribute, permitting an empty value
    only when the image is explicitly decorative.
15. Add a static-export check that resource source attributes such as `src`, `srcset`, and `poster`
    never use `data:` URLs.
16. Add a static-export check that every form control has a non-empty accessible name.
17. Add a static-export check that every `button` has a non-empty accessible name.
18. Add a static-export check that the document body never has `aria-hidden="true"`.
19. Add a static-export check that repeated landmarks have unique accessible names within each
    document.
20. Add a static-export check that no element has `aria-busy="true"`.
21. Add a static-export check that every `table`, if any, has a caption or non-empty `aria-label`.
22. Add a static-export check that generated links never use an empty `href=""`.
23. Add a static-export check that any `link rel="manifest"` URL stays on the Store Canary origin.
24. Add a static-export check that every `area`, if any, has a non-empty `alt` attribute.
25. Add a static-export check that `download` is not used on cross-origin links.
26. Add a static-export check that generated HTML contains no `ping` attributes.

## Waits on Erik

- Configure the Google Workspace secondary domain and authenticated mail DNS, then approve any access-CTA address change.
- Approve any commercial terms or payment work; the current site must not accept payment.
- Approve and perform production/Cloudflare deployment and owner-led participant outreach.
