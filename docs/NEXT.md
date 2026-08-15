# Store Canary Next

## Unblocked

1. Add a static-export check that every generated `iframe`, if any, has a non-empty title.
2. Add a static-export check that generated HTML contains no `http-equiv="refresh"` metadata.
3. Add a static-export check that every `img` has an `alt` attribute, permitting an empty value
   only when the image is explicitly decorative.
4. Add a static-export check that resource source attributes such as `src`, `srcset`, and `poster`
   never use `data:` URLs.
5. Add a static-export check that every form control has a non-empty accessible name.
6. Add a static-export check that every `button` has a non-empty accessible name.
7. Add a static-export check that the document body never has `aria-hidden="true"`.
8. Add a static-export check that repeated landmarks have unique accessible names within each
   document.
9. Add a static-export check that no element has `aria-busy="true"`.
10. Add a static-export check that every `table`, if any, has a caption or non-empty `aria-label`.
11. Add a static-export check that generated links never use an empty `href=""`.
12. Add a static-export check that any `link rel="manifest"` URL stays on the Store Canary origin.
13. Add a static-export check that every `area`, if any, has a non-empty `alt` attribute.
14. Add a static-export check that `download` is not used on cross-origin links.
15. Add a static-export check that generated HTML contains no `ping` attributes.
16. Add a static-export check that no element retains `aria-invalid="true"`.
17. Add a static-export check that every `nav` has a non-empty accessible name when a document has
    more than one.
18. Add a static-export check that the document body does not have a `hidden` attribute.
19. Add a static-export check that `theme-color` and `color-scheme` metadata, when present, each has
    non-empty content.
20. Add a static-export check that no static disclosure retains `aria-expanded="true"`.
21. Add a static-export check that every `label` with a `for` attribute references an existing
    control in the same document.
22. Add a static-export check that the document body does not have `spellcheck="false"`.
23. Add a static-export check that heading levels do not skip from one level to a deeper,
    non-adjacent level.
24. Add a static-export check that generated HTML contains no obsolete presentational elements
    such as `center`, `font`, or `big`.
25. Add a static-export check that every inline `svg` is either hidden from assistive technology or
    has a non-empty accessible name.
26. Add a static-export check that every HTML document starts with exactly one HTML5 doctype.
27. Add a static-export check that every `link rel="icon"` has a non-empty href that resolves inside
    the static export.
28. Add a static-export check that generated HTML contains no `contenteditable` attributes.
29. Add a static-export check that `lang` and `xml:lang` on an `html` element agree when both are
    present.
30. Add a static-export check that no start tag contains duplicate attribute names.
31. Add a static-export check that generated `audio` and `video` elements do not use `autoplay`.
32. Add a static-export check that every `details`, if any, begins with a non-empty `summary`.
33. Add a static-export check that every `fieldset`, if any, has a non-empty `legend`.
34. Add a static-export check that `aria-live`, when present, uses only `off`, `polite`, or
    `assertive`.
35. Add a static-export check that every HTML document contains exactly one `main` landmark.
36. Add a static-export check that every `aria-controls` token references an existing ID in the
    same document.
37. Add a static-export check that generated HTML contains no `http-equiv="set-cookie"` metadata.
38. Add a static-export check that every character-set declaration appears within the first 1,024
    bytes of its HTML document.
39. Add a static-export check that every `link rel="preload"`, if any, has a non-empty `as`
    attribute.
40. Add a static-export check that `meta name="referrer"`, when present, contains a recognized
    referrer-policy token.
41. Add a static-export check that every `aria-label`, when present, contains non-whitespace text.
42. Add a static-export check that `aria-current`, when present, uses a recognized token.
43. Add a static-export check that token-list attributes such as `rel` contain no duplicate tokens.
44. Add a static-export check that viewport metadata does not disable or excessively restrict
    browser zoom.
45. Add a static-export check that every `input type="image"`, if any, has a non-empty `alt`
    attribute.
46. Add a static-export check that generated `iframe` elements contain no `srcdoc` attributes.
47. Add a static-export check that every `object`, if any, has fallback text or a non-empty
    accessible name.
48. Add a static-export check that the document `html` element never has `aria-hidden="true"`.
49. Add a static-export check that every `title` attribute, when present, contains non-whitespace
    text.
50. Add a static-export check that `aria-sort`, when present, uses only `ascending`, `descending`,
    `none`, or `other`.
51. Add a static-export check that every `meter` and `progress` element has a non-empty accessible
    name.
52. Add a static-export check that every `script` with a `src` attribute has a non-empty URL that
    resolves inside the static export.
53. Add a static-export check that every stylesheet link has a non-empty `href` that resolves
    inside the static export.
54. Add a static-export check that every form submission target, if any, stays on the Store Canary
    origin.
55. Add a static-export check that generated links never use protocol-relative `//` URLs.
56. Add a static-export check that every `link` element has a non-empty `rel` token list.
57. Add a static-export check that elements with a `hidden` attribute contain no focusable
    descendants.

## Waits on Erik

- Configure the Google Workspace secondary domain and authenticated mail DNS, then approve any access-CTA address change.
- Approve any commercial terms or payment work; the current site must not accept payment.
- Approve and perform production/Cloudflare deployment and owner-led participant outreach.
