export function baseTemplate(content: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body style="margin:0;padding:0;background:#f5f3ef;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,24,20,0.08);">
              
              <!-- Header -->
              <tr>
                <td style="background:#1a1814;padding:24px 32px;">
                  <p style="margin:0;font-family:Georgia,serif;font-size:22px;font-weight:700;color:#ffffff;">
                    🏷 UniDeal
                  </p>
                  <p style="margin:4px 0 0;font-size:11px;color:#a8a39d;text-transform:uppercase;letter-spacing:0.1em;">
                    LPU Campus Marketplace
                  </p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding:32px;">
                  ${content}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 32px;border-top:1px solid #e8e4de;background:#faf9f7;">
                  <p style="margin:0;font-size:12px;color:#a8a39d;line-height:1.6;">
                    You're receiving this because you have an account on UniDeal — LPU Campus Marketplace.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function button(text: string, href: string): string {
    return `<a href="${href}" style="display:inline-block;padding:12px 24px;background:#d97706;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;margin-top:8px;">${text}</a>`;
}

export function heading(text: string): string {
    return `<h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;font-weight:700;color:#1a1814;line-height:1.2;">${text}</h1>`;
}

export function subtext(text: string): string {
    return `<p style="margin:0 0 20px;font-size:15px;color:#4a4640;line-height:1.6;">${text}</p>`;
}

export function divider(): string {
    return `<hr style="border:none;border-top:1px solid #e8e4de;margin:24px 0;"/>`;
}
