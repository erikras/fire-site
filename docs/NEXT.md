# Store Canary Next

## Unblocked

1. Add a static-export check that generated links and resource URLs never use the `javascript:` scheme.
2. Require unique non-empty document titles across generated HTML pages.
3. Add a static-export check that every skip link targets an ID in the same document.
4. Add a static-export check that `tabindex` values are never positive.
5. Add a static-export check that generated links and resource URLs never use plain `http://` URLs.
6. Add a static-export check that `target="_blank"` links include `rel="noopener"`.
7. Add a static-export check that `role` attributes contain only valid WAI-ARIA role tokens.
8. Add a static-export check that no `id` value starts with a digit or contains whitespace.
9. Add a static-export check that every HTML document has exactly one html element and one body
   element.
10. Add a static-export check that generated HTML contains no `autofocus` attributes.
11. Add a static-export check that every HTML document has exactly one `h1`.
12. Add a static-export check that every HTML document has a non-empty meta description.
13. Add a static-export check that `aria-hidden="true"` elements contain no focusable controls.
14. Add a static-export check that generated HTML contains no `accesskey` attributes.
15. Add a static-export check that every `html` element either omits `dir` (defaulting to `ltr`) or
    uses a valid `dir` value.
16. Add a static-export check that landing-page `meta robots`, when present, does not include
    `noindex`.

## Waits on Erik

- Configure the Google Workspace secondary domain and authenticated mail DNS, then approve any access-CTA address change.
- Approve any commercial terms or payment work; the current site must not accept payment.
- Approve and perform production/Cloudflare deployment and owner-led participant outreach.
