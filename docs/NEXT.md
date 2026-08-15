# Store Canary Next

## Unblocked

1. Add a static-export check that every `label` with a `for` attribute references an existing
   control in the same document.
2. Add a static-export check that the document body does not have `spellcheck="false"`.
3. Add a static-export check that heading levels do not skip from one level to a deeper,
   non-adjacent level.
4. Add a static-export check that generated HTML contains no obsolete presentational elements such
   as `center`, `font`, or `big`.
5. Add a static-export check that every inline `svg` is either hidden from assistive technology or
   has a non-empty accessible name.
6. Add a static-export check that every HTML document starts with exactly one HTML5 doctype.
7. Add a static-export check that every `link rel="icon"` has a non-empty href that resolves inside
   the static export.
8. Add a static-export check that generated HTML contains no `contenteditable` attributes.
9. Add a static-export check that `lang` and `xml:lang` on an `html` element agree when both are
    present.
10. Add a static-export check that no start tag contains duplicate attribute names.
11. Add a static-export check that generated `audio` and `video` elements do not use `autoplay`.
12. Add a static-export check that every `details`, if any, begins with a non-empty `summary`.
13. Add a static-export check that every `fieldset`, if any, has a non-empty `legend`.
14. Add a static-export check that `aria-live`, when present, uses only `off`, `polite`, or
    `assertive`.
15. Add a static-export check that every HTML document contains exactly one `main` landmark.
16. Add a static-export check that every `aria-controls` token references an existing ID in the
    same document.
17. Add a static-export check that generated HTML contains no `http-equiv="set-cookie"` metadata.
18. Add a static-export check that every character-set declaration appears within the first 1,024
    bytes of its HTML document.
19. Add a static-export check that every `link rel="preload"`, if any, has a non-empty `as`
    attribute.
20. Add a static-export check that `meta name="referrer"`, when present, contains a recognized
    referrer-policy token.
21. Add a static-export check that every `aria-label`, when present, contains non-whitespace text.
22. Add a static-export check that `aria-current`, when present, uses a recognized token.
23. Add a static-export check that token-list attributes such as `rel` contain no duplicate tokens.
24. Add a static-export check that viewport metadata does not disable or excessively restrict
    browser zoom.
25. Add a static-export check that every `input type="image"`, if any, has a non-empty `alt`
    attribute.
26. Add a static-export check that generated `iframe` elements contain no `srcdoc` attributes.
27. Add a static-export check that every `object`, if any, has fallback text or a non-empty
    accessible name.
28. Add a static-export check that the document `html` element never has `aria-hidden="true"`.
29. Add a static-export check that every `title` attribute, when present, contains non-whitespace
    text.
30. Add a static-export check that `aria-sort`, when present, uses only `ascending`, `descending`,
    `none`, or `other`.
31. Add a static-export check that every `meter` and `progress` element has a non-empty accessible
    name.
32. Add a static-export check that every `script` with a `src` attribute has a non-empty URL that
    resolves inside the static export.
33. Add a static-export check that every stylesheet link has a non-empty `href` that resolves inside
    the static export.
34. Add a static-export check that every form submission target, if any, stays on the Store Canary
    origin.
35. Add a static-export check that generated links never use protocol-relative `//` URLs.
36. Add a static-export check that every `link` element has a non-empty `rel` token list.
37. Add a static-export check that elements with a `hidden` attribute contain no focusable
    descendants.
38. Add a static-export check that every heading contains non-whitespace text or has a non-empty
    accessible name.
39. Add a static-export check that generated HTML contains no obsolete `frame`, `frameset`, or
    `applet` elements.
40. Add a static-export check that every `source`, if any, has a non-empty `src` or `srcset`
    attribute.
41. Add a static-export check that URL-bearing attributes never contain embedded username or
    password credentials.
42. Add a static-export check that any `base` element contains no `target` attribute.
43. Add a static-export check that `meta http-equiv="content-security-policy"`, when present, has
    non-empty content.
44. Add a static-export check that every `map`, if any, has a non-empty, unique `name` attribute.
45. Add a static-export check that every `img usemap`, if any, references an existing named `map` in
    the same document.
46. Add a static-export check that integer-valued attributes such as `colspan`, `rowspan`, and
    `maxlength` contain valid positive integers when present.
47. Add a static-export check that every `img` has a non-empty `src` or `srcset` attribute.
48. Add a static-export check that every `track`, if any, has non-empty `src`, `kind`, and `label`
    attributes.
49. Add a static-export check that every `time` with a `datetime` attribute uses a valid
    machine-readable date or time.
50. Add a static-export check that every `input type`, when present, uses a recognized HTML input
    type token.
51. Add a static-export check that every `option` has non-whitespace text or a non-empty `label`
    attribute.
52. Add a static-export check that every `optgroup`, if any, has a non-empty `label` attribute.
53. Add a static-export check that generated HTML contains no `inert` attributes.
54. Add a static-export check that `aria-pressed`, when present, uses only `true`, `false`, or
    `mixed`.
55. Add a static-export check that `aria-selected`, when present, uses only `true` or `false`.
56. Add a static-export check that `aria-orientation`, when present, uses only `horizontal` or
    `vertical`.
57. Add a static-export check that `aria-relevant`, when present, contains only recognized,
    non-duplicate tokens.
58. Add a static-export check that every link has non-whitespace text or a non-empty accessible name.
59. Add a static-export check that generated HTML contains no nested interactive controls.
60. Add a static-export check that every `aria-describedby` reference contributes visible,
    non-whitespace description text.
61. Add a static-export check that `aria-checked`, when present, uses only `true`, `false`, or
    `mixed`.
62. Add a static-export check that `aria-level`, when present, contains a positive integer.
63. Add a static-export check that `aria-autocomplete`, when present, uses only `none`, `inline`,
    `list`, or `both`.
64. Add a static-export check that every `button` has an explicit recognized `type` attribute.
65. Add a static-export check that generated HTML contains no obsolete
    `http-equiv="x-ua-compatible"` metadata.
66. Add a static-export check that every `datalist`, if any, has a non-empty, unique `id` referenced
    by an `input` in the same document.
67. Add a static-export check that every `th` `scope`, when present, uses `row`, `col`, `rowgroup`,
    or `colgroup`.
68. Add a static-export check that every `abbr`, if any, has a non-empty `title` attribute.
69. Add a static-export check that `aria-multiline`, when present, uses only `true` or `false`.
70. Add a static-export check that every `output for`, when present, references existing form
    controls in the same document.
71. Add a static-export check that every form-associated element with a `form` attribute references
    an existing `form` in the same document.
72. Add a static-export check that every `figcaption`, if any, is the first or last child of its
    `figure`.
73. Add a static-export check that `crossorigin`, when present, is empty or uses `anonymous` or
    `use-credentials`.
74. Add a static-export check that every `link rel="alternate"` with `hreflang` has a non-empty
    `href` and language tag.
75. Add a static-export check that generated `textarea` elements do not use ignored `value`
    attributes.
76. Add a static-export check that `aria-roledescription`, when present, contains non-whitespace
    text.
77. Add a static-export check that `meta name="robots"`, when present, contains only recognized,
    non-contradictory tokens.
78. Add a static-export check that `aria-disabled`, when present, uses only `true` or `false`.
79. Add a static-export check that `aria-multiselectable`, when present, uses only `true` or `false`.
80. Add a static-export check that `draggable`, when present, uses only `true` or `false`.
81. Add a static-export check that generated HTML contains no `nonce` attributes.
82. Add a static-export check that every `iframe`, if any, has a `sandbox` attribute.
83. Add a static-export check that every `aria-errormessage` token references an existing ID in the
    same document.
84. Add a static-export check that `aria-keyshortcuts`, when present, contains non-whitespace text
    and no duplicate shortcuts.
85. Add a static-export check that `aria-colcount` and `aria-rowcount`, when present, contain
    positive integers or the recognized unknown value `-1`.

## Waits on Erik

- Configure the Google Workspace secondary domain and authenticated mail DNS, then approve any access-CTA address change.
- Approve any commercial terms or payment work; the current site must not accept payment.
- Approve and perform production/Cloudflare deployment and owner-led participant outreach.
