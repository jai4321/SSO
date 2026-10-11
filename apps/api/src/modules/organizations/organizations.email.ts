const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function buildVerificationEmail(params: {
  organizationName: string;
  userName: string;
  verifyUrl: string;
  expiresInHours: number;
}) {
  const org = escapeHtml(params.organizationName);
  const name = escapeHtml(params.userName);
  const url = escapeHtml(params.verifyUrl);

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr><td align="center">
        <table role="presentation" width="480" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:8px;padding:32px;">
          <tr><td>
            <h2 style="margin:0 0 16px;">Verify your organization</h2>
            <p>Hi ${name},</p>
            <p>Thanks for registering <strong>${org}</strong>. Please confirm your email address to verify the organization.</p>
            <p style="text-align:center;margin:32px 0;">
              <a href="${url}" style="background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:bold;display:inline-block;">Confirm organization</a>
            </p>
            <p style="font-size:13px;color:#6b7280;">This link expires in ${params.expiresInHours} hours.</p>
            <p style="font-size:13px;color:#6b7280;">If you did not register this organization, you can ignore this email.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  const text = `Hi ${params.userName},\n\nConfirm your organization "${params.organizationName}" by opening this link (valid for ${params.expiresInHours} hours):\n${params.verifyUrl}\n\nIf you did not register this organization, ignore this email.`;

  return { subject: `Verify your organization: ${params.organizationName}`, html, text };
}
