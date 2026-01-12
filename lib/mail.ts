import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false
    }
});

interface InvoiceData {
    invoiceNumber: string;
    customerName: string;
    customerEmail: string;
    planName: string;
    billingCycle: string;
    amount: number;
    taxAmount: number;
    totalAmount: number;
    date: string;
    invoiceUrl: string;
}

export async function sendInvoiceEmail(data: InvoiceData) {
    const {
        invoiceNumber,
        customerName,
        customerEmail,
        planName,
        billingCycle,
        amount,
        taxAmount,
        totalAmount,
        date,
        invoiceUrl
    } = data;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; display: block; color: white; text-decoration: none; }
            .content { padding: 40px; }
            .invoice-title { font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 24px; text-align: center; }
            .details-grid { background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
            .detail-label { color: #6b7280; }
            .detail-value { font-weight: 600; color: #374151; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { text-align: left; font-size: 12px; text-transform: uppercase; color: #9ca3af; padding-bottom: 12px; border-bottom: 2px solid #f3f4f6; }
            td { padding: 16px 0; border-bottom: 1px solid #f3f4f6; }
            .item-name { font-weight: 600; color: #111827; }
            .item-desc { font-size: 12px; color: #6b7280; }
            .amount { text-align: right; font-weight: 600; color: #111827; }
            
            .totals { margin-left: auto; width: 240px; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
            .grand-total { border-top: 2px solid #f3f4f6; padding-top: 12px; margin-top: 12px; font-size: 18px; font-weight: 700; color: #10b981; }
            
            .button-container { text-align: center; margin-top: 40px; }
            .button { background-color: #10b981; color: white !important; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; display: inline-block; transition: background-color 0.2s; }
            
            .footer { background-color: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">FORGE INDIA CONNECT</div>
                <div style="font-size: 14px; opacity: 0.9;">Payment Receipt & Tax Invoice</div>
            </div>
            <div class="content">
                <p>Hello <strong>${customerName}</strong>,</p>
                <p>Thank you for your purchase! We've successfully processed your payment for the <strong>${planName} Plan</strong>.</p>
                
                <div class="details-grid">
                    <div class="detail-row">
                        <span class="detail-label">Invoice Number</span>
                        <span class="detail-value">${invoiceNumber}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date</span>
                        <span class="detail-value">${date}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status</span>
                        <span class="detail-value" style="color: #059669;">PAID</span>
                    </div>
                </div>

                <div class="invoice-title">Order Summary</div>
                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <div class="item-name">${planName} Plan Subscription</div>
                                <div class="item-desc">${billingCycle} Billing Cycle</div>
                            </td>
                            <td class="amount">₹${amount.toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="totals">
                    <div class="total-row">
                        <span>Subtotal</span>
                        <span>₹${amount.toLocaleString()}</span>
                    </div>
                    <div class="total-row">
                        <span>GST (18%)</span>
                        <span>₹${taxAmount.toLocaleString()}</span>
                    </div>
                    <div class="total-row grand-total">
                        <span>Total Paid</span>
                        <span>₹${totalAmount.toLocaleString()}</span>
                    </div>
                </div>

                <div class="button-container">
                    <a href="${invoiceUrl}" class="button">View & Download PDF Invoice</a>
                </div>
            </div>
            <div class="footer">
                <p>Forge India Connect Pvt Ltd.<br>No 10-I KNT Manickam Road, New bus stand, Krishnagiri-635001</p>
                <p style="margin-top: 10px;">This is an automated receipt. If you have any questions, please contact our support team.</p>
                <p>© 2026 Forge India Connect. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        await transporter.sendMail({
            from: `"Forge India Connect" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: customerEmail,
            subject: `Tax Invoice ${invoiceNumber} - Forge India Connect`,
            html: html,
            text: `Thank you for your purchase! Invoice ${invoiceNumber} for ${planName} Plan (${totalAmount} INR) has been paid. View it here: ${invoiceUrl}`,
        });
        console.log(`Invoice email sent to ${customerEmail}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to send invoice email:', error);
        return { success: false, error };
    }
}
