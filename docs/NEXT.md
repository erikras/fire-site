# Store Canary Next

## Unblocked

1. Add a static-export check that every HTML document has exactly one `h1`.
2. Add a static-export check that every HTML document has a non-empty meta description.
3. Add a static-export check that `aria-hidden="true"` elements contain no focusable controls.
4. Add a static-export check that generated HTML contains no `accesskey` attributes.
5. Add a static-export check that every `html` element either omits `dir` (defaulting to `ltr`) or
   uses a valid `dir` value.
6. Add a static-export check that landing-page `meta robots`, when present, does not include
   `noindex`.
7. Add a static-export check that generated links never use `data:` URLs.
8. Add a static-export check that every generated `iframe`, if any, has a non-empty title.
9. Add a static-export check that generated HTML contains no `http-equiv="refresh"` metadata.
10. Add a static-export check that every `img` has an `alt` attribute, permitting an empty value
    only when the image is explicitly decorative.
11. Add a static-export check that resource source attributes such as `src`, `srcset`, and `poster`
    never use `data:` URLs.
12. Add a static-export check that every form control has a non-empty accessible name.
13. Add a static-export check that every `button` has a non-empty accessible name.
14. Add a static-export check that the document body never has `aria-hidden="true"`.
15. Add a static-export check that repeated landmarks have unique accessible names within each
    document.
16. Add a static-export check that no element has `aria-busy="true"`.
17. Add a static-export check that every `table`, if any, has a caption or non-empty `aria-label`.
18. Add a static-export check that generated links never use an empty `href=""`.
19. Add a static-export check that any `link rel="manifest"` URL stays on the Store Canary origin.
20. Add a static-export check that every `area`, if any, has a non-empty `alt` attribute.
21. Add a static-export check that `download` is not used on cross-origin links.
22. Add a static-export check that generated HTML contains no `ping` attributes.
23. Add a static-export check that no element retains `aria-invalid="true"`.
24. Add a static-export check that every `nav` has a non-empty accessible name when a document has
    more than one.
25. Add a static-export check that the document body does not have a `hidden` attribute.
26. Add a static-export check that `theme-color` and `color-scheme` metadata, when present, each has
    non-empty content.
27. Add a static-export check that no static disclosure retains `aria-expanded="true"`.
28. Add a static-export check that every `label` with a `for` attribute references an existing
    control in the same document.
29. Add a static-export check that the document body does not have `spellcheck="false"`.
30. Add a static-export check that heading levels do not skip from one level to a deeper,
    non-adjacent level.
31. Add a static-export check that generated HTML contains no obsolete presentational elements
    such as `center`, `font`, or `big`.
32. Add a static-export check that every inline `svg` is either hidden from assistive technology or
    has a non-empty accessible name.
33. Add a static-export check that every HTML document starts with exactly one HTML5 doctype.
34. Add a static-export check that every `link rel="icon"` has a non-empty href that resolves inside
    the static export.
35. Add a static-export check that generated HTML contains no `contenteditable` attributes.
36. Add a static-export check that `lang` and `xml:lang` on an `html` element agree when both are
    present.
37. Add a static-export check that no start tag contains duplicate attribute names.
38. Add a static-export check that generated `audio` and `video` elements do not use `autoplay`.
39. Add a static-export check that every `details`, if any, begins with a non-empty `summary`.
40. Add a static-export check that every `fieldset`, if any, has a non-empty `legend`.
41. Add a static-export check that `aria-live`, when present, uses only `off`, `polite`, or
    `assertive`.

## Waits on Erik

- Configure the Google Workspace secondary domain and authenticated mail DNS, then approve any access-CTA address change.
- Approve any commercial terms or payment work; the current site must not accept payment.
- Approve and perform production/Cloudflare deployment and owner-led participant outreach.
