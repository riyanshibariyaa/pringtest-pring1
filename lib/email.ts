// lib/email.ts
// Replace your existing lib/email.ts with this corrected version

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface AccessRequestEmailData {
  profileOwnerEmail: string;
  profileOwnerName: string;
  profileType: string;
  requesterName?: string;
  requesterContact: string;
  approvalUrl: string;
  expiresAt: Date;
}

interface ApprovalEmailData {
  requesterEmail: string;
  requesterName?: string;
  accessUrl: string;
  profileOwnerName: string;
  expiresAt: Date;
}

export async function sendAccessRequestNotification(data: AccessRequestEmailData) {
  const { profileOwnerEmail, profileOwnerName, profileType, requesterName, requesterContact, approvalUrl, expiresAt } = data;
  
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'Pring QR Profile <noreply@live4client.com>', // ✅ Fixed: Using your verified domain
      to: [profileOwnerEmail],
      subject: `🔔 Access Request for Your QR Profile`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Profile Access Request</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🔒 Profile Access Request</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${profileOwnerName},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">Someone has requested access to view your professional QR profile.</p>
            
            <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin: 0 0 10px 0; color: #667eea;">Request Details:</h3>
              <p style="margin: 5px 0;"><strong>Profile:</strong> ${profileType}</p>
              ${requesterName ? `<p style="margin: 5px 0;"><strong>Requester:</strong> ${requesterName}</p>` : ''}
              <p style="margin: 5px 0;"><strong>Contact:</strong> ${requesterContact}</p>
              <p style="margin: 5px 0;"><strong>Expires:</strong> ${expiresAt.toLocaleString()}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${approvalUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 0 10px;">
                ✅ Review Request
              </a>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #856404;">
                <strong>⚠️ Security Note:</strong> Only approve access if you recognize this request. The access will automatically expire in 24 hours.
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #6c757d; text-align: center; margin: 0;">
              This is an automated message from Pring QR Profile System.<br>
              If you didn't expect this request, you can safely ignore this email.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Email sending failed:', error);
      throw error;
    }

    console.log('Access request notification sent:', emailData);
    return emailData;
  } catch (error) {
    console.error('Failed to send access request notification:', error);
    throw error;
  }
}

export async function sendApprovalNotification(data: ApprovalEmailData) {
  const { requesterEmail, requesterName, accessUrl, profileOwnerName, expiresAt } = data;

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'Pring QR Profile <noreply@live4client.com>', // ✅ Fixed: Using your verified domain
      to: [requesterEmail],
      subject: `✅ Profile Access Approved - View Now`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Access Approved</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Access Approved!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="font-size: 16px; margin-bottom: 20px;">
              ${requesterName ? `Hi ${requesterName},` : 'Hello,'}
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Great news! <strong>${profileOwnerName}</strong> has approved your request to view their professional profile.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${accessUrl}" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                🔗 View Profile Now
              </a>
            </div>
            
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #0c5460;">
                <strong>⏰ Time Limit:</strong> This access will expire on ${expiresAt.toLocaleString()}
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #6c757d; text-align: center; margin: 0;">
              Thank you for using Pring QR Profile System!<br>
              <a href="${accessUrl}" style="color: #667eea;">Click here if the button above doesn't work</a>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Email sending failed:', error);
      throw error;
    }

    console.log('Approval notification sent:', emailData);
    return emailData;
  } catch (error) {
    console.error('Failed to send approval notification:', error);
    throw error;
  }
}
// // lib/email.ts
// import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);

// interface AccessRequestEmailData {
//   profileOwnerEmail: string;
//   profileOwnerName: string;
//   profileType: string;
//   requesterName?: string;
//   requesterContact: string;
//   approvalUrl: string;
//   expiresAt: Date;
// }

// interface ApprovalEmailData {
//   requesterEmail: string;
//   requesterName?: string;
//   accessUrl: string;
//   profileOwnerName: string;
//   expiresAt: Date;
// }

// export async function sendAccessRequestNotification(data: AccessRequestEmailData) {
//   const { profileOwnerEmail, profileOwnerName, profileType, requesterName, requesterContact, approvalUrl, expiresAt } = data;
  
//   try {
//     const { data: emailData, error } = await resend.emails.send({
//       from: 'Pring QR Profile <live4client.com>', // Replace with your domain
//       to: [profileOwnerEmail],
//       subject: `🔔 Access Request for Your QR Profile`,
//       html: `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <meta charset="utf-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <title>Profile Access Request</title>
//         </head>
//         <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
//           <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
//             <h1 style="color: white; margin: 0; font-size: 24px;">🔒 Profile Access Request</h1>
//           </div>
          
//           <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
//             <p style="font-size: 16px; margin-bottom: 20px;">Hi ${profileOwnerName},</p>
            
//             <p style="font-size: 16px; margin-bottom: 20px;">Someone has requested access to view your professional QR profile.</p>
            
//             <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
//               <h3 style="margin: 0 0 10px 0; color: #667eea;">Request Details:</h3>
//               <p style="margin: 5px 0;"><strong>Profile:</strong> ${profileType}</p>
//               ${requesterName ? `<p style="margin: 5px 0;"><strong>Requester:</strong> ${requesterName}</p>` : ''}
//               <p style="margin: 5px 0;"><strong>Contact:</strong> ${requesterContact}</p>
//               <p style="margin: 5px 0;"><strong>Expires:</strong> ${expiresAt.toLocaleString()}</p>
//             </div>
            
//             <div style="text-align: center; margin: 30px 0;">
//               <a href="${approvalUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 0 10px;">
//                 ✅ Review Request
//               </a>
//             </div>
            
//             <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
//               <p style="margin: 0; font-size: 14px; color: #856404;">
//                 <strong>⚠️ Security Note:</strong> Only approve access if you recognize this request. The access will automatically expire in 24 hours.
//               </p>
//             </div>
            
//             <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
//             <p style="font-size: 14px; color: #6c757d; text-align: center; margin: 0;">
//               This is an automated message from Pring QR Profile System.<br>
//               If you didn't expect this request, you can safely ignore this email.
//             </p>
//           </div>
//         </body>
//         </html>
//       `,
//     });

//     if (error) {
//       console.error('Email sending failed:', error);
//       throw error;
//     }

//     console.log('Access request notification sent:', emailData);
//     return emailData;
//   } catch (error) {
//     console.error('Failed to send access request notification:', error);
//     throw error;
//   }
// }

// export async function sendApprovalNotification(data: ApprovalEmailData) {
//   const { requesterEmail, requesterName, accessUrl, profileOwnerName, expiresAt } = data;

//   try {
//     const { data: emailData, error } = await resend.emails.send({
//       from: 'Pring QR Profile <live4client.com>', // Replace with your domain
//       to: [requesterEmail],
//       subject: `✅ Profile Access Approved - View Now`,
//       html: `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <meta charset="utf-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <title>Access Approved</title>
//         </head>
//         <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
//           <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
//             <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Access Approved!</h1>
//           </div>
          
//           <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
//             <p style="font-size: 16px; margin-bottom: 20px;">
//               ${requesterName ? `Hi ${requesterName},` : 'Hello,'}
//             </p>
            
//             <p style="font-size: 16px; margin-bottom: 20px;">
//               Great news! <strong>${profileOwnerName}</strong> has approved your request to view their professional profile.
//             </p>
            
//             <div style="text-align: center; margin: 30px 0;">
//               <a href="${accessUrl}" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
//                 🔗 View Profile Now
//               </a>
//             </div>
            
//             <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
//               <p style="margin: 0; font-size: 14px; color: #0c5460;">
//                 <strong>⏰ Time Limit:</strong> This access will expire on ${expiresAt.toLocaleString()}
//               </p>
//             </div>
            
//             <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
//             <p style="font-size: 14px; color: #6c757d; text-align: center; margin: 0;">
//               Thank you for using Pring QR Profile System!<br>
//               <a href="${accessUrl}" style="color: #667eea;">Click here if the button above doesn't work</a>
//             </p>
//           </div>
//         </body>
//         </html>
//       `,
//     });

//     if (error) {
//       console.error('Email sending failed:', error);
//       throw error;
//     }

//     console.log('Approval notification sent:', emailData);
//     return emailData;
//   } catch (error) {
//     console.error('Failed to send approval notification:', error);
//     throw error;
//   }
// }