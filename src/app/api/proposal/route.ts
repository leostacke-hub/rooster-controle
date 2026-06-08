import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Lead enviado", body);
    const { eventType, name, email, phone, eventDate, location, options, totalPrice, pdfBase64, leadSource, referredBy, notes } = body;

    // 1. Save proposal to Supabase
    let dbSuccess = false;
    let dbErrorDetails = null;
    let pdfUrl = null;

    try {
      if (pdfBase64) {
        try {
          const pdfBuffer = Buffer.from(pdfBase64, 'base64');
          const filename = `proposal_${Date.now()}_${name.replace(/\s+/g, '_')}.pdf`;
          
          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('proposals')
            .upload(filename, pdfBuffer, {
              contentType: 'application/pdf',
              upsert: true
            });

          if (uploadError) {
            console.error('Error uploading PDF to storage:', uploadError);
          } else {
            const { data: publicUrlData } = supabase
              .storage
              .from('proposals')
              .getPublicUrl(filename);
            pdfUrl = publicUrlData?.publicUrl || null;
          }
        } catch (storageErr) {
          console.error('Failed to upload PDF to Supabase Storage:', storageErr);
        }
      }

      const { error } = await supabase
        .from('budgets')
        .insert({
          event_type: eventType || 'casamento',
          name,
          email,
          phone,
          event_date: eventDate,
          location,
          options,
          total_price: totalPrice,
          status: 'pending',
          pdf_url: pdfUrl,
          lead_source: leadSource || null,
          referred_by: referredBy || null,
          notes: notes || null
        });
      
      if (error) {
        console.error("Erro ao salvar lead", error);
        dbErrorDetails = error;
      } else {
        console.log("Lead salvo", { name, email, eventType });
        dbSuccess = true;
      }
    } catch (e: any) {
      console.error("Erro ao salvar lead", e.message || e);
      dbErrorDetails = e.message || e;
    }

    // 2. Handle email sending
    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL || 'contato@roosterfilms.com.br';
    
    let emailSent = false;
    let mockMode = false;
    let emailErrorDetails = null;

    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        
        // Convert PDF from base64 back to buffer
        const pdfBuffer = Buffer.from(pdfBase64, 'base64');

        const eventTypeName = eventType === 'aniversario' ? 'Aniversário' : eventType === 'revelacao' ? 'Chá Revelação' : 'Casamento';
        const clientLabel = eventType === 'casamento' ? 'Nome do Casal' : eventType === 'aniversario' ? 'Aniversariante' : 'Nome do Cliente';

        // Email structure for client
        await resend.emails.send({
          from: 'Rooster Films <onboarding@resend.dev>', // Uses Resend dev onboarding sender
          to: email,
          subject: `Sua Proposta de ${eventTypeName} Exclusiva - Rooster Films | ${name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #fafafa; color: #1f2937;">
              <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: #aa824f; font-family: Georgia, serif; font-size: 28px; margin: 0; letter-spacing: 2px;">ROOSTER FILMS</h1>
                <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 3px; color: #6b7280; margin: 5px 0 0 0;">Weddings & Cinematography</p>
              </div>
              
              <div style="border-top: 2px solid #b88e55; padding-top: 20px;">
                <p>Olá, <strong>${name}</strong>,</p>
                <p>Agradecemos o seu contato e o interesse em nosso trabalho de cinematografia de ${eventTypeName.toLowerCase()}s.</p>
                <p>O seu dia especial merece ser eternizado com sensibilidade, dedicação e exclusividade. Conforme simulado em nosso site, preparamos uma proposta personalizada detalhando os serviços escolhidos.</p>
                
                <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin: 20px 0;">
                  <h3 style="color: #aa824f; font-family: Georgia, serif; font-size: 18px; margin-top: 0; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px;">Resumo do Orçamento</h3>
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                      <td style="padding: 6px 0; color: #6b7280;"><strong>Data do Evento:</strong></td>
                      <td style="padding: 6px 0; text-align: right;">${eventDate}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #6b7280;"><strong>Local do Evento:</strong></td>
                      <td style="padding: 6px 0; text-align: right;">${location}</td>
                    </tr>
                    <tr style="border-top: 1px solid #f3f4f6;">
                      <td style="padding: 10px 0 0 0; font-size: 16px; font-weight: bold; color: #1f2937;"><strong>Valor Total:</strong></td>
                      <td style="padding: 10px 0 0 0; font-size: 18px; font-weight: bold; color: #b88e55; text-align: right;">
                        R$ ${totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </table>
                </div>
                
                <p><strong>Em anexo, você encontrará a sua Proposta Comercial em PDF</strong> com o detalhamento dos pacotes, prazos de entrega e condições de pagamento.</p>
                
                <p>Em breve, nossa equipe entrará em contato pelo WhatsApp <strong>${phone}</strong> para conversarmos sobre os detalhes do seu roteiro e sanar eventuais dúvidas.</p>
                
                <p style="margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 14px; text-align: center; color: #6b7280;">
                  Com carinho,<br>
                  <strong>Equipe Rooster Films</strong><br>
                  <a href="https://roosterfilms.com.br" style="color: #b88e55; text-decoration: none;">roosterfilms.com.br</a>
                </p>
              </div>
            </div>
          `,
          attachments: [
            {
              filename: `Proposta_Rooster_Films_${name.replace(/\s+/g, '_')}.pdf`,
              content: pdfBuffer,
            }
          ]
        });

        // Email structure for admin notification
        await resend.emails.send({
          from: 'Rooster Films <onboarding@resend.dev>',
          to: adminEmail,
          subject: `[Novo Orçamento] Proposta de ${eventTypeName} - ${name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; padding: 25px; border: 1px solid #e5e7eb; border-radius: 8px; color: #1f2937;">
              <h2 style="color: #aa824f; border-bottom: 2px solid #b88e55; padding-bottom: 10px; margin-top: 0;">Novo Lead de ${eventTypeName} Capturado!</h2>
              <p>Um cliente gerou um orçamento personalizado no simulador da landing page:</p>
              <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin: 15px 0;">
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; width: 35%;">${clientLabel}</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Email</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;"><a href="mailto:${email}">${email}</a></td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Telefone</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${phone}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Data do Evento</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${eventDate}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Local</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${location}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Valor Total</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; color: #b88e55; font-weight: bold; font-size: 16px;">
                    R$ ${totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </table>
              <p>O PDF completo foi gerado e enviado ao cliente. O arquivo também está anexado a esta mensagem.</p>
            </div>
          `,
          attachments: [
            {
              filename: `Proposta_${name.replace(/\s+/g, '_')}.pdf`,
              content: pdfBuffer,
            }
          ]
        });

        emailSent = true;
      } catch (err: any) {
        console.error('Resend service failure:', err);
        emailErrorDetails = err.message || err;
      }
    } else {
      console.log('--- [DEVELOPMENT MOCK EMAIL SENDER] ---');
      console.log(`Para: ${email}`);
      console.log(`Notificar Admin: ${adminEmail}`);
      console.log(`Assunto: Sua Proposta Exclusiva - Rooster Films`);
      console.log(`Resumo dos dados:`, { name, email, phone, eventDate, location, totalPrice });
      console.log(`PDF Recebido: ${pdfBase64.substring(0, 50)}... [Base64 String, length: ${pdfBase64.length}]`);
      console.log('----------------------------------------');
      mockMode = true;
      emailSent = true; // Simulate success in development mode
    }

    return NextResponse.json({
      success: true,
      dbSuccess,
      dbError: dbErrorDetails,
      emailSent,
      mockMode,
      emailError: emailErrorDetails
    });
  } catch (error: any) {
    console.error('Fatal API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Ocorreu um erro interno ao processar a proposta' },
      { status: 500 }
    );
  }
}
