# Ask Mavis website

A one-page "Join the waitlist" website, plus a privacy notice page. Plain HTML, no build step, no trackers.

## Before it goes live

1. Make a free waitlist form (for example on Tally) and copy its link.
2. In `index.html`, replace both copies of `https://tally.so/r/YOUR-FORM` (search for `WAITLIST-LINK`).
3. Replace `hello@example.com` with the Ask Mavis email address.
4. In `privacy.html`, fill in everything in [square brackets] and delete the yellow note.

## Putting it online for free

Cloudflare Pages: sign in, choose Workers & Pages, then Create, then Pages, then Connect to Git. Pick this repository, set the build output directory to `website`, and leave the build command empty. Then add your domain under Custom domains.
