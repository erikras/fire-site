# Store Canary Next

## Unblocked

1. Add a static-export check that every `base` URL, if present, stays on the Store Canary origin.
2. Add a static-export check that an `html` element's `xmlns`, when present, is the HTML namespace
   `http://www.w3.org/1999/xhtml`.
3. Add a static-export check that generated HTML contains no `autofocus` attributes.
4. Add a static-export check that every HTML document has exactly one `h1`.
5. Add a static-export check that every HTML document has a non-empty meta description.
6. Add a static-export check that `aria-hidden="true"` elements contain no focusable controls.
7. Add a static-export check that generated HTML contains no `accesskey` attributes.
8. Add a static-export check that every `html` element either omits `dir` (defaulting to `ltr`) or
   uses a valid `dir` value.
9. Add a static-export check that landing-page `meta robots`, when present, does not include
    `noindex`.
10. Add a static-export check that generated links never use `data:` URLs.
11. Add a static-export check that every generated `iframe`, if any, has a non-empty title.
12. Add a static-export check that generated HTML contains no `http-equiv="refresh"` metadata.
13. Add a static-export check that every `img` has an `alt` attribute, permitting an empty value
    only when the image is explicitly decorative.
14. Add a static-export check that resource source attributes such as `src`, `srcset`, and `poster`
    never use `data:` URLs.
15. Add a static-export check that every form control has a non-empty accessible name.
16. Add a static-export check that every `button` has a non-empty accessible name.
17. Add a static-export check that the document body never has `aria-hidden="true"`.
18. Add a static-export check that repeated landmarks have unique accessible names within each
    document.
19. Add a static-export check that no element has `aria-busy="true"`.
20. Add a static-export check that every `table`, if any, has a caption or non-empty `aria-label`.
21. Add a static-export check that generated links never use an empty `href=""`.
22. Add a static-export check that any `link rel="manifest"` URL stays on the Store Canary origin.
23. Add a static-export check that every `area`, if any, has a non-empty `alt` attribute.
24. Add a static-export check that `download` is not used on cross-origin links.
25. Add a static-export check that generated HTML contains no `ping` attributes.
26. Add a static-export check that no element retains `aria-invalid="true"`.
27. Add a static-export check that every `nav` has a non-empty accessible name when a document has
    more than one.
28. Add a static-export check that the document body does not have a `hidden` attribute.
29. Add a static-export check that `theme-color` and `color-scheme` metadata, when present, each has
    non-empty content.
30. Add a static-export check that no static disclosure retains `aria-expanded="true"`.
31. Add a static-export check that every `label` with a `for` attribute references an existing
    control in the same document.
32. Add a static-export check that the document body does not have `spellcheck="false"`.
33. Add a static-export check that heading levels do not skip from one level to a deeper,
    non-adjacent level.
34. Add a static-export check that generated HTML contains no obsolete presentational elements
    such as `center`, `font`, or `big`.
35. Add a static-export check that every inline `svg` is either hidden from assistive technology or
    has a non-empty accessible name.

## Waits on Erik

- Configure the Google Workspace secondary domain and authenticated mail DNS, then approve any access-CTA address change.
- Approve any commercial terms or payment work; the current site must not accept payment.
- Approve and perform production/Cloudflare deployment and owner-led participant outreach.
