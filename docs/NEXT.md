# Store Canary Next

## Unblocked

1. Add a static-export check that `aria-hidden="true"` elements contain no focusable controls.
2. Add a static-export check that generated HTML contains no `accesskey` attributes.
3. Add a static-export check that every `html` element either omits `dir` (defaulting to `ltr`) or
   uses a valid `dir` value.
4. Add a static-export check that landing-page `meta robots`, when present, does not include
   `noindex`.
5. Add a static-export check that generated links never use `data:` URLs.
6. Add a static-export check that every generated `iframe`, if any, has a non-empty title.
7. Add a static-export check that generated HTML contains no `http-equiv="refresh"` metadata.
8. Add a static-export check that every `img` has an `alt` attribute, permitting an empty value
   only when the image is explicitly decorative.
9. Add a static-export check that resource source attributes such as `src`, `srcset`, and `poster`
   never use `data:` URLs.
10. Add a static-export check that every form control has a non-empty accessible name.
11. Add a static-export check that every `button` has a non-empty accessible name.
12. Add a static-export check that the document body never has `aria-hidden="true"`.
13. Add a static-export check that repeated landmarks have unique accessible names within each
    document.
14. Add a static-export check that no element has `aria-busy="true"`.
15. Add a static-export check that every `table`, if any, has a caption or non-empty `aria-label`.
16. Add a static-export check that generated links never use an empty `href=""`.
17. Add a static-export check that any `link rel="manifest"` URL stays on the Store Canary origin.
18. Add a static-export check that every `area`, if any, has a non-empty `alt` attribute.
19. Add a static-export check that `download` is not used on cross-origin links.
20. Add a static-export check that generated HTML contains no `ping` attributes.
21. Add a static-export check that no element retains `aria-invalid="true"`.
22. Add a static-export check that every `nav` has a non-empty accessible name when a document has
    more than one.
23. Add a static-export check that the document body does not have a `hidden` attribute.
24. Add a static-export check that `theme-color` and `color-scheme` metadata, when present, each has
    non-empty content.
25. Add a static-export check that no static disclosure retains `aria-expanded="true"`.
26. Add a static-export check that every `label` with a `for` attribute references an existing
    control in the same document.
27. Add a static-export check that the document body does not have `spellcheck="false"`.
28. Add a static-export check that heading levels do not skip from one level to a deeper,
    non-adjacent level.
29. Add a static-export check that generated HTML contains no obsolete presentational elements
    such as `center`, `font`, or `big`.
30. Add a static-export check that every inline `svg` is either hidden from assistive technology or
    has a non-empty accessible name.
31. Add a static-export check that every HTML document starts with exactly one HTML5 doctype.
32. Add a static-export check that every `link rel="icon"` has a non-empty href that resolves inside
    the static export.
33. Add a static-export check that generated HTML contains no `contenteditable` attributes.
34. Add a static-export check that `lang` and `xml:lang` on an `html` element agree when both are
    present.
35. Add a static-export check that no start tag contains duplicate attribute names.
36. Add a static-export check that generated `audio` and `video` elements do not use `autoplay`.
37. Add a static-export check that every `details`, if any, begins with a non-empty `summary`.
38. Add a static-export check that every `fieldset`, if any, has a non-empty `legend`.
39. Add a static-export check that `aria-live`, when present, uses only `off`, `polite`, or
    `assertive`.
40. Add a static-export check that every HTML document contains exactly one `main` landmark.
41. Add a static-export check that every `aria-controls` token references an existing ID in the
    same document.
42. Add a static-export check that generated HTML contains no `http-equiv="set-cookie"` metadata.
43. Add a static-export check that every character-set declaration appears within the first 1,024
    bytes of its HTML document.
44. Add a static-export check that every `link rel="preload"`, if any, has a non-empty `as`
    attribute.
45. Add a static-export check that `meta name="referrer"`, when present, contains a recognized
    referrer-policy token.

## Waits on Erik

- Configure the Google Workspace secondary domain and authenticated mail DNS, then approve any access-CTA address change.
- Approve any commercial terms or payment work; the current site must not accept payment.
- Approve and perform production/Cloudflare deployment and owner-led participant outreach.
