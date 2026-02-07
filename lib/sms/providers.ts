import { SNSClient, PublishCommand, SetSMSAttributesCommand } from '@aws-sdk/client-sns';

export interface SMSProvider {
  sendOTP(phone: string, otp: string): Promise<boolean>;
  sendMessage(phone: string, message: string): Promise<boolean>;
}

// AWS SNS SMS Provider
export class AWSSNSProvider implements SMSProvider {
  private snsClient: SNSClient;

  constructor() {
    console.log('🔧 Initializing AWS SNS Provider...');
    console.log('AWS Region:', process.env.AWS_REGION || 'us-east-1');
    console.log('AWS Access Key ID:', process.env.AWS_ACCESS_KEY_ID ? '✓ Set' : '✗ Not Set');
    console.log('AWS Secret Access Key:', process.env.AWS_SECRET_ACCESS_KEY ? '✓ Set' : '✗ Not Set');

    this.snsClient = new SNSClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async sendOTP(phone: string, otp: string): Promise<boolean> {
    const message = `Your ConnectApp verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
    return this.sendMessage(phone, message);
  }

  async sendMessage(phone: string, message: string): Promise<boolean> {
    try {
      // Ensure phone number is in E.164 format
      let formattedPhone = phone.replace(/[\s-]/g, '');
      
      // Remove any existing + or country code prefix
      formattedPhone = formattedPhone.replace(/^\+/, '');
      
      // If it's a 10-digit Indian number, add +91 prefix
      if (/^\d{10}$/.test(formattedPhone)) {
        formattedPhone = '+91' + formattedPhone;
      } else if (/^91\d{10}$/.test(formattedPhone)) {
        formattedPhone = '+' + formattedPhone;
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+' + formattedPhone;
      }

      console.log('📱 Sending SMS via AWS SNS...');
      console.log('Phone:', formattedPhone);
      console.log('Message length:', message.length);

      // Set SMS attributes for better delivery
      try {
        const setAttributesCommand = new SetSMSAttributesCommand({
          attributes: {
            'DefaultSMSType': 'Transactional',
            'DefaultSenderID': process.env.AWS_SNS_SENDER_ID || 'ConnectApp',
          },
        });
        await this.snsClient.send(setAttributesCommand);
        console.log('✅ SMS attributes set successfully');
      } catch (attrError) {
        console.warn('⚠️ Could not set SMS attributes:', attrError);
      }

      const params = {
        Message: message,
        PhoneNumber: formattedPhone,
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional',
          },
          'AWS.SNS.SMS.SenderID': {
            DataType: 'String',
            StringValue: process.env.AWS_SNS_SENDER_ID || 'ConnectApp',
          },
        },
      };

      console.log('📤 Sending publish command...');
      const command = new PublishCommand(params);
      const response = await this.snsClient.send(command);
      
      console.log('✅ SMS sent successfully via AWS SNS!');
      console.log('Message ID:', response.MessageId);
      return true;
    } catch (error: any) {
      console.error('❌ AWS SNS SMS error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error code:', error.Code || error.code);
      
      // Common AWS SNS errors
      if (error.name === 'InvalidParameterValue') {
        console.error('💡 Tip: Check if the phone number is in correct E.164 format (e.g., +919876543210)');
      }
      if (error.name === 'AuthorizationError' || error.message?.includes('not authorized')) {
        console.error('💡 Tip: Check IAM permissions for SNS:Publish');
      }
      if (error.message?.includes('sandbox')) {
        console.error('💡 Tip: Your AWS account may be in SMS sandbox mode. You need to:');
        console.error('   1. Go to AWS SNS Console > Text messaging (SMS)');
        console.error('   2. Add destination phone numbers to sandbox, OR');
        console.error('   3. Request to move out of sandbox for production use');
      }
      
      return false;
    }
  }
}

// Twilio SMS Provider
export class TwilioProvider implements SMSProvider {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';
  }

  async sendOTP(phone: string, otp: string): Promise<boolean> {
    const message = `Your ConnectApp verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
    return this.sendMessage(phone, message);
  }

  async sendMessage(phone: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64'),
          },
          body: new URLSearchParams({
            To: phone,
            From: this.fromNumber,
            Body: message,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        console.error('Twilio error:', data);
        return false;
      }
      console.log('✅ SMS sent via Twilio:', data.sid);
      return true;
    } catch (error) {
      console.error('Twilio SMS error:', error);
      return false;
    }
  }
}

// MSG91 SMS Provider (Popular in India)
export class MSG91Provider implements SMSProvider {
  private authKey: string;
  private senderId: string;
  private templateId: string;

  constructor() {
    this.authKey = process.env.MSG91_AUTH_KEY || '';
    this.senderId = process.env.MSG91_SENDER_ID || '';
    this.templateId = process.env.MSG91_TEMPLATE_ID || '';
  }

  async sendOTP(phone: string, otp: string): Promise<boolean> {
    try {
      // Remove +91 prefix if present, MSG91 expects just the number
      let mobileNumber = phone.replace(/^\+91/, '').replace(/^\+/, '');
      
      const response = await fetch(
        `https://api.msg91.com/api/v5/otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authkey': this.authKey,
          },
          body: JSON.stringify({
            template_id: this.templateId,
            mobile: '91' + mobileNumber,
            otp: otp,
          }),
        }
      );

      const data = await response.json();
      console.log('MSG91 response:', data);
      return response.ok && data.type === 'success';
    } catch (error) {
      console.error('MSG91 SMS error:', error);
      return false;
    }
  }

  async sendMessage(phone: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://api.msg91.com/api/v5/flow/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authkey': this.authKey,
          },
          body: JSON.stringify({
            sender: this.senderId,
            short_url: '0',
            mobiles: phone,
            message: message,
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('MSG91 SMS error:', error);
      return false;
    }
  }
}

// Fast2SMS Provider (India - Easy to setup)
export class Fast2SMSProvider implements SMSProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.FAST2SMS_API_KEY || '';
    console.log('🔧 Fast2SMS API Key:', this.apiKey ? `✓ Set (${this.apiKey.substring(0, 8)}...)` : '✗ NOT SET');
  }

  async sendOTP(phone: string, otp: string): Promise<boolean> {
    try {
      // Remove +91 prefix if present, keep only 10 digits
      let mobileNumber = phone.replace(/^\+91/, '').replace(/^\+/, '').replace(/\D/g, '');
      
      // If number starts with 91 and is 12 digits, remove 91
      if (mobileNumber.length === 12 && mobileNumber.startsWith('91')) {
        mobileNumber = mobileNumber.substring(2);
      }
      
      console.log('═══════════════════════════════════════════');
      console.log('📱 FAST2SMS OTP REQUEST');
      console.log('═══════════════════════════════════════════');
      console.log('Phone (original):', phone);
      console.log('Phone (formatted):', mobileNumber);
      console.log('OTP:', otp);
      console.log('API Key:', this.apiKey ? `${this.apiKey.substring(0, 8)}...` : 'NOT SET!');

      if (!this.apiKey) {
        console.error('❌ FAST2SMS_API_KEY is not set in .env!');
        return false;
      }

      // Use Quick SMS route (doesn't require website verification)
      const smsMessage = `Your ConnectApp verification code is: ${otp}. Valid for 10 minutes. Do not share this OTP with anyone.`;
      const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(this.apiKey)}&route=q&message=${encodeURIComponent(smsMessage)}&language=english&flash=0&numbers=${encodeURIComponent(mobileNumber)}`;
      
      console.log('📤 Calling Fast2SMS API (GET method)...');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'cache-control': 'no-cache',
        },
      });

      const responseText = await response.text();
      console.log('📥 Fast2SMS raw response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse Fast2SMS response:', responseText);
        return false;
      }
      
      console.log('📥 Fast2SMS parsed response:', JSON.stringify(data, null, 2));
      
      if (data.return === true) {
        console.log('✅ SMS sent successfully via Fast2SMS!');
        console.log('Request ID:', data.request_id);
        console.log('Message:', data.message);
        return true;
      } else {
        console.error('❌ Fast2SMS error:', data.message || data.status_code || 'Unknown error');
        console.error('Full response:', JSON.stringify(data));
        return false;
      }
    } catch (error: any) {
      console.error('═══════════════════════════════════════════');
      console.error('❌ FAST2SMS EXCEPTION:', error.message || error);
      console.error('═══════════════════════════════════════════');
      return false;
    }
  }

  async sendMessage(phone: string, message: string): Promise<boolean> {
    try {
      let mobileNumber = phone.replace(/^\+91/, '').replace(/^\+/, '').replace(/\D/g, '');
      if (mobileNumber.length === 12 && mobileNumber.startsWith('91')) {
        mobileNumber = mobileNumber.substring(2);
      }

      const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(this.apiKey)}&route=q&message=${encodeURIComponent(message)}&language=english&flash=0&numbers=${encodeURIComponent(mobileNumber)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'cache-control': 'no-cache',
        },
      });

      const data = await response.json();
      console.log('Fast2SMS message response:', data);
      return data.return === true;
    } catch (error) {
      console.error('Fast2SMS error:', error);
      return false;
    }
  }
}

// Console/Development Provider (just logs OTP)
export class ConsoleProvider implements SMSProvider {
  async sendOTP(phone: string, otp: string): Promise<boolean> {
    console.log('═══════════════════════════════════════════');
    console.log('📱 CONSOLE SMS PROVIDER (Development Mode)');
    console.log('═══════════════════════════════════════════');
    console.log(`📞 Phone: ${phone}`);
    console.log(`🔐 OTP: ${otp}`);
    console.log('═══════════════════════════════════════════');
    return true;
  }

  async sendMessage(phone: string, message: string): Promise<boolean> {
    console.log('═══════════════════════════════════════════');
    console.log('📱 CONSOLE SMS PROVIDER (Development Mode)');
    console.log('═══════════════════════════════════════════');
    console.log(`📞 Phone: ${phone}`);
    console.log(`💬 Message: ${message}`);
    console.log('═══════════════════════════════════════════');
    return true;
  }
}

// Factory to get the SMS provider
export function getSMSProvider(): SMSProvider {
  const provider = process.env.SMS_PROVIDER || 'console';

  console.log(`📱 SMS Provider: ${provider}`);

  switch (provider.toLowerCase()) {
    case 'msg91':
      return new MSG91Provider();
    case 'fast2sms':
      return new Fast2SMSProvider();
    case 'twilio':
      return new TwilioProvider();
    case 'aws-sns':
      return new AWSSNSProvider();
    case 'console':
    default:
      console.log('⚠️ Using Console provider - OTPs will only be logged, not sent');
      return new ConsoleProvider();
  }
}
