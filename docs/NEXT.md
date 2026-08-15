# Store Canary Next

## Unblocked

1. Require unique non-empty document titles across generated HTML pages.
2. Add a static-export check that every skip link targets an ID in the same document.
3. Add a static-export check that `tabindex` values are never positive.
4. Add a static-export check that generated links and resource URLs never use plain `http://` URLs.
5. Add a static-export check that `target="_blank"` links include `rel="noopener"`.
6. Add a static-export check that `role` attributes contain only valid WAI-ARIA role tokens.
7. Add a static-export check that no `id` value starts with a digit or contains whitespace.
8. Add a static-export check that every HTML document has exactly one html element and one body
   element.
9. Add a static-export check that generated HTML contains no `autofocus` attributes.
10. Add a static-export check that every HTML document has exactly one `h1`.
11. Add a static-export check that every HTML document has a non-empty meta description.
12. Add a static-export check that `aria-hidden="true"` elements contain no focusable controls.
13. Add a static-export check that generated HTML contains no `accesskey` attributes.
14. Add a static-export check that every `html` element either omits `dir` (defaulting to `ltr`) or
    uses a valid `dir` value.
15. Add a static-export check that landing-page `meta robots`, when present, does not include
    `noindex`.
16. Add a static-export check that generated links never use `data:` URLs.
17. Add a static-export check that every generated `iframe`, if any, has a non-empty title.
18. Add a static-export check that generated HTML contains no `http-equiv="refresh"` metadata.

## Waits on Erik

- Configure the Google Workspace secondary domain and authenticated mail DNS, then approve any access-CTA address change.
- Approve any commercial terms or payment work; the current site must not accept payment.
- Approve and perform production/Cloudflare deployment and owner-led participant outreach.
