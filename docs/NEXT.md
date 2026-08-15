# Store Canary Next

## Unblocked

1. Add a static-export check that any `link rel="manifest"` URL stays on the Store Canary origin.
2. Add a static-export check that every `area`, if any, has a non-empty `alt` attribute.
3. Add a static-export check that `download` is not used on cross-origin links.
4. Add a static-export check that generated HTML contains no `ping` attributes.
5. Add a static-export check that no element retains `aria-invalid="true"`.
6. Add a static-export check that the document body does not have a `hidden` attribute.
7. Add a static-export check that `theme-color` and `color-scheme` metadata, when present, each has
   non-empty content.
8. Add a static-export check that no static disclosure retains `aria-expanded="true"`.
9. Add a static-export check that every `label` with a `for` attribute references an existing
   control in the same document.
10. Add a static-export check that the document body does not have `spellcheck="false"`.
11. Add a static-export check that heading levels do not skip from one level to a deeper,
    non-adjacent level.
12. Add a static-export check that generated HTML contains no obsolete presentational elements
    such as `center`, `font`, or `big`.
13. Add a static-export check that every inline `svg` is either hidden from assistive technology or
    has a non-empty accessible name.
14. Add a static-export check that every HTML document starts with exactly one HTML5 doctype.
15. Add a static-export check that every `link rel="icon"` has a non-empty href that resolves inside
    the static export.
16. Add a static-export check that generated HTML contains no `contenteditable` attributes.
17. Add a static-export check that `lang` and `xml:lang` on an `html` element agree when both are
    present.
18. Add a static-export check that no start tag contains duplicate attribute names.
19. Add a static-export check that generated `audio` and `video` elements do not use `autoplay`.
20. Add a static-export check that every `details`, if any, begins with a non-empty `summary`.
21. Add a static-export check that every `fieldset`, if any, has a non-empty `legend`.
22. Add a static-export check that `aria-live`, when present, uses only `off`, `polite`, or
    `assertive`.
23. Add a static-export check that every HTML document contains exactly one `main` landmark.
24. Add a static-export check that every `aria-controls` token references an existing ID in the
    same document.
25. Add a static-export check that generated HTML contains no `http-equiv="set-cookie"` metadata.
26. Add a static-export check that every character-set declaration appears within the first 1,024
    bytes of its HTML document.
27. Add a static-export check that every `link rel="preload"`, if any, has a non-empty `as`
    attribute.
28. Add a static-export check that `meta name="referrer"`, when present, contains a recognized
    referrer-policy token.
29. Add a static-export check that every `aria-label`, when present, contains non-whitespace text.
30. Add a static-export check that `aria-current`, when present, uses a recognized token.
31. Add a static-export check that token-list attributes such as `rel` contain no duplicate tokens.
32. Add a static-export check that viewport metadata does not disable or excessively restrict
    browser zoom.
33. Add a static-export check that every `input type="image"`, if any, has a non-empty `alt`
    attribute.
34. Add a static-export check that generated `iframe` elements contain no `srcdoc` attributes.
35. Add a static-export check that every `object`, if any, has fallback text or a non-empty
    accessible name.
36. Add a static-export check that the document `html` element never has `aria-hidden="true"`.
37. Add a static-export check that every `title` attribute, when present, contains non-whitespace
    text.
38. Add a static-export check that `aria-sort`, when present, uses only `ascending`, `descending`,
    `none`, or `other`.
39. Add a static-export check that every `meter` and `progress` element has a non-empty accessible
    name.
40. Add a static-export check that every `script` with a `src` attribute has a non-empty URL that
    resolves inside the static export.
41. Add a static-export check that every stylesheet link has a non-empty `href` that resolves
    inside the static export.
42. Add a static-export check that every form submission target, if any, stays on the Store Canary
    origin.
43. Add a static-export check that generated links never use protocol-relative `//` URLs.
44. Add a static-export check that every `link` element has a non-empty `rel` token list.
45. Add a static-export check that elements with a `hidden` attribute contain no focusable
    descendants.
46. Add a static-export check that every heading contains non-whitespace text or has a non-empty
    accessible name.
47. Add a static-export check that generated HTML contains no obsolete `frame`, `frameset`, or
    `applet` elements.
48. Add a static-export check that every `source`, if any, has a non-empty `src` or `srcset`
    attribute.
49. Add a static-export check that URL-bearing attributes never contain embedded username or
    password credentials.
50. Add a static-export check that any `base` element contains no `target` attribute.
51. Add a static-export check that `meta http-equiv="content-security-policy"`, when present, has
    non-empty content.
52. Add a static-export check that every `map`, if any, has a non-empty, unique `name` attribute.
53. Add a static-export check that every `img usemap`, if any, references an existing named `map`
    in the same document.
54. Add a static-export check that integer-valued attributes such as `colspan`, `rowspan`, and
    `maxlength` contain valid positive integers when present.
55. Add a static-export check that every `img` has a non-empty `src` or `srcset` attribute.
56. Add a static-export check that every `track`, if any, has non-empty `src`, `kind`, and `label`
    attributes.
57. Add a static-export check that every `time` with a `datetime` attribute uses a valid
    machine-readable date or time.
58. Add a static-export check that every `input type`, when present, uses a recognized HTML input
    type token.
59. Add a static-export check that every `option` has non-whitespace text or a non-empty `label`
    attribute.
60. Add a static-export check that every `optgroup`, if any, has a non-empty `label` attribute.
61. Add a static-export check that generated HTML contains no `inert` attributes.
62. Add a static-export check that `aria-pressed`, when present, uses only `true`, `false`, or
    `mixed`.
63. Add a static-export check that `aria-selected`, when present, uses only `true` or `false`.
64. Add a static-export check that `aria-orientation`, when present, uses only `horizontal` or
    `vertical`.
65. Add a static-export check that `aria-relevant`, when present, contains only recognized,
    non-duplicate tokens.
66. Add a static-export check that every link has non-whitespace text or a non-empty accessible
    name.
67. Add a static-export check that generated HTML contains no nested interactive controls.
68. Add a static-export check that every `aria-describedby` reference contributes visible,
    non-whitespace description text.
69. Add a static-export check that `aria-checked`, when present, uses only `true`, `false`, or
    `mixed`.
70. Add a static-export check that `aria-level`, when present, contains a positive integer.
71. Add a static-export check that `aria-autocomplete`, when present, uses only `none`, `inline`,
    `list`, or `both`.
72. Add a static-export check that every `button` has an explicit recognized `type` attribute.
73. Add a static-export check that generated HTML contains no obsolete
    `http-equiv="x-ua-compatible"` metadata.
74. Add a static-export check that every `datalist`, if any, has a non-empty, unique `id` referenced
    by an `input` in the same document.
75. Add a static-export check that every `th` `scope`, when present, uses `row`, `col`, `rowgroup`,
    or `colgroup`.
76. Add a static-export check that every `abbr`, if any, has a non-empty `title` attribute.
77. Add a static-export check that `aria-multiline`, when present, uses only `true` or `false`.
78. Add a static-export check that every `output for`, when present, references existing form
    controls in the same document.
79. Add a static-export check that every form-associated element with a `form` attribute references
    an existing `form` in the same document.
80. Add a static-export check that every `figcaption`, if any, is the first or last child of its
    `figure`.

## Waits on Erik

- Configure the Google Workspace secondary domain and authenticated mail DNS, then approve any access-CTA address change.
- Approve any commercial terms or payment work; the current site must not accept payment.
- Approve and perform production/Cloudflare deployment and owner-led participant outreach.
