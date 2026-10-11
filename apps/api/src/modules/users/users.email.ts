const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function buildInvitationEmail(params: {
  organizationName: string;
  userName: string;
  inviteUrl: string;
  expiresInHours: number;
}) {
  const org = escapeHtml(params.organizationName);
  const name = escapeHtml(params.userName);
  const url = escapeHtml(params.inviteUrl);

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr><td align="center">
        <table role="presentation" width="480" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:8px;padding:32px;">
          <tr><td>
            <h2 style="margin:0 0 16px;">You're invited to join ${org}</h2>
            <p>Hi ${name},</p>
            <p>An administrator of <strong>${org}</strong> has created an account for you. Set your password to activate your login.</p>
            <p style="text-align:center;margin:32px 0;">
              <a href="${url}" style="background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:bold;display:inline-block;">Set your password</a>
            </p>
            <p style="font-size:13px;color:#6b7280;">This link expires in ${params.expiresInHours} hours.</p>
            <p style="font-size:13px;color:#6b7280;">If you did not expect this invitation, you can ignore this email.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  const text = `Hi ${params.userName},\n\nAn administrator of "${params.organizationName}" has created an account for you. Set your password using this link (valid for ${params.expiresInHours} hours):\n${params.inviteUrl}\n\nIf you did not expect this invitation, ignore this email.`;

  return { subject: `You're invited to join ${params.organizationName}`, html, text };
}
