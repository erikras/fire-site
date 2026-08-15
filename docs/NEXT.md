# Store Canary Next

## Unblocked

1. Add a static-export check that every `html` element either omits `dir` (defaulting to `ltr`) or
   uses a valid `dir` value.
2. Add a static-export check that landing-page `meta robots`, when present, does not include
   `noindex`.
3. Add a static-export check that generated links never use `data:` URLs.
4. Add a static-export check that every generated `iframe`, if any, has a non-empty title.
5. Add a static-export check that generated HTML contains no `http-equiv="refresh"` metadata.
6. Add a static-export check that every `img` has an `alt` attribute, permitting an empty value
   only when the image is explicitly decorative.
7. Add a static-export check that resource source attributes such as `src`, `srcset`, and `poster`
   never use `data:` URLs.
8. Add a static-export check that every form control has a non-empty accessible name.
9. Add a static-export check that every `button` has a non-empty accessible name.
10. Add a static-export check that the document body never has `aria-hidden="true"`.
11. Add a static-export check that repeated landmarks have unique accessible names within each
    document.
12. Add a static-export check that no element has `aria-busy="true"`.
13. Add a static-export check that every `table`, if any, has a caption or non-empty `aria-label`.
14. Add a static-export check that generated links never use an empty `href=""`.
15. Add a static-export check that any `link rel="manifest"` URL stays on the Store Canary origin.
16. Add a static-export check that every `area`, if any, has a non-empty `alt` attribute.
17. Add a static-export check that `download` is not used on cross-origin links.
18. Add a static-export check that generated HTML contains no `ping` attributes.
19. Add a static-export check that no element retains `aria-invalid="true"`.
20. Add a static-export check that every `nav` has a non-empty accessible name when a document has
    more than one.
21. Add a static-export check that the document body does not have a `hidden` attribute.
22. Add a static-export check that `theme-color` and `color-scheme` metadata, when present, each has
    non-empty content.
23. Add a static-export check that no static disclosure retains `aria-expanded="true"`.
24. Add a static-export check that every `label` with a `for` attribute references an existing
    control in the same document.
25. Add a static-export check that the document body does not have `spellcheck="false"`.
26. Add a static-export check that heading levels do not skip from one level to a deeper,
    non-adjacent level.
27. Add a static-export check that generated HTML contains no obsolete presentational elements
    such as `center`, `font`, or `big`.
28. Add a static-export check that every inline `svg` is either hidden from assistive technology or
    has a non-empty accessible name.
29. Add a static-export check that every HTML document starts with exactly one HTML5 doctype.
30. Add a static-export check that every `link rel="icon"` has a non-empty href that resolves inside
    the static export.
31. Add a static-export check that generated HTML contains no `contenteditable` attributes.
32. Add a static-export check that `lang` and `xml:lang` on an `html` element agree when both are
    present.
33. Add a static-export check that no start tag contains duplicate attribute names.
34. Add a static-export check that generated `audio` and `video` elements do not use `autoplay`.
35. Add a static-export check that every `details`, if any, begins with a non-empty `summary`.
36. Add a static-export check that every `fieldset`, if any, has a non-empty `legend`.
37. Add a static-export check that `aria-live`, when present, uses only `off`, `polite`, or
    `assertive`.
38. Add a static-export check that every HTML document contains exactly one `main` landmark.
39. Add a static-export check that every `aria-controls` token references an existing ID in the
    same document.
40. Add a static-export check that generated HTML contains no `http-equiv="set-cookie"` metadata.
41. Add a static-export check that every character-set declaration appears within the first 1,024
    bytes of its HTML document.
42. Add a static-export check that every `link rel="preload"`, if any, has a non-empty `as`
    attribute.
43. Add a static-export check that `meta name="referrer"`, when present, contains a recognized
    referrer-policy token.
44. Add a static-export check that every `aria-label`, when present, contains non-whitespace text.
45. Add a static-export check that `aria-current`, when present, uses a recognized token.
46. Add a static-export check that token-list attributes such as `rel` contain no duplicate tokens.
47. Add a static-export check that viewport metadata does not disable or excessively restrict
    browser zoom.
48. Add a static-export check that every `input type="image"`, if any, has a non-empty `alt`
    attribute.
49. Add a static-export check that generated `iframe` elements contain no `srcdoc` attributes.
50. Add a static-export check that every `object`, if any, has fallback text or a non-empty
    accessible name.
51. Add a static-export check that the document `html` element never has `aria-hidden="true"`.

## Waits on Erik

- Configure the Google Workspace secondary domain and authenticated mail DNS, then approve any access-CTA address change.
- Approve any commercial terms or payment work; the current site must not accept payment.
- Approve and perform production/Cloudflare deployment and owner-led participant outreach.
