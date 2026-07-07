/**
 * Email templates for InovaHelix transactional emails.
 * Uses inline styles for maximum email client compatibility.
 */

export function legalInviteEmail(params: {
  inviterName: string;
  projectTitle: string;
  message?: string;
  inviteLink: string;
}): { subject: string; html: string } {
  const { inviterName, projectTitle, message, inviteLink } = params;

  return {
    subject: `[InovaHelix] Convite para Curadoria Jurídica — ${projectTitle}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#020617;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#020617;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#0f172a;border-radius:16px;border:1px solid #1e293b;overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px;background:linear-gradient(135deg,#00897B 0%,#0d1520 100%);border-bottom:1px solid #1e293b;">
              <h1 style="margin:0;font-size:24px;font-weight:700;background:linear-gradient(to right,#00B59C,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
                InovaHelix
              </h1>
              <p style="margin:8px 0 0;color:#94a3b8;font-size:13px;">
                Ecossistema de Inovação Aberta
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#e2e8f0;font-size:20px;font-weight:600;">
                Convite para Curadoria Jurídica
              </h2>
              
              <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
                <strong style="color:#c7d2fe;">${inviterName}</strong> convidou seu escritório para atuar como curador jurídico do projeto 
                <strong style="color:#c7d2fe;">"${projectTitle}"</strong> na plataforma InovaHelix.
              </p>

              ${message ? `
              <div style="background-color:#1e293b;border-left:3px solid #818cf8;border-radius:0 8px 8px 0;padding:16px 20px;margin:0 0 24px;">
                <p style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;font-weight:600;">
                  Mensagem do Inventor
                </p>
                <p style="color:#cbd5e1;font-size:14px;line-height:1.5;margin:0;font-style:italic;">
                  "${message}"
                </p>
              </div>
              ` : ''}

              <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 32px;">
                Como curador, você terá acesso ao Virtual Data Room (VDR) do projeto para validar a documentação de Propriedade Intelectual, 
                conferir a Due Diligence e emitir o Selo de Aptidão para investidores.
              </p>

              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:linear-gradient(135deg,#00897B,#00B59C);border-radius:12px;padding:14px 32px;">
                    <a href="${inviteLink}" style="color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;display:block;">
                      Aceitar Convite
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #1e293b;background-color:#020617;">
              <p style="color:#475569;font-size:11px;line-height:1.5;margin:0;text-align:center;">
                Este email foi enviado automaticamente pela plataforma InovaHelix.<br/>
                Seus dados são protegidos por criptografia e todas as negociações ocorrem sob NDA digital.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  };
}
