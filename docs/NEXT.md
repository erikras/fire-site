# Store Canary Next

## Unblocked

1. Add a deterministic check that public export paths contain no spaces, control characters, or URL-reserved characters.
2. Add a static-export check that every generated HTML document has one `rel=canonical` link.
3. Add a static-export check that generated HTML contains no inline event-handler attributes.
4. Add a static-export check that generated links and resource URLs never use the `javascript:` scheme.
5. Require unique non-empty document titles across generated HTML pages.
6. Add a static-export check that every skip link targets an ID in the same document.
7. Add a static-export check that `tabindex` values are never positive.
8. Add a static-export check that generated links and resource URLs never use plain `http://` URLs.
9. Add a static-export check that `target="_blank"` links include `rel="noopener"`.
10. Add a static-export check that `role` attributes contain only valid WAI-ARIA role tokens.

## Waits on Erik

- Configure the Google Workspace secondary domain and authenticated mail DNS, then approve any access-CTA address change.
- Approve any commercial terms or payment work; the current site must not accept payment.
- Approve and perform production/Cloudflare deployment and owner-led participant outreach.
