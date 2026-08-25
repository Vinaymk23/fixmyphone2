# fixmyphone2
first deployable webiste with full flow.

## Email

Custom domain email (`@gofixmyphone.com`) is set up via **ImprovMX** (free email forwarding).
- Mail sent to addresses on the domain forwards to an existing personal Gmail account.
- DNS records (MX + TXT/SPF) for this are added directly in Netlify's DNS panel for the domain — no nameserver change was needed/used.
- Gmail "Send As" is configured so replies go out showing the `@gofixmyphone.com` address.
- Domain is registered through Netlify; hosting is Netlify; backend/data is Firebase project `fixmyphone-website-889b5`.
