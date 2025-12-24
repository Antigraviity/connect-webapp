import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

export interface SMSProvider {
  sendOTP(phone: string, otp: string): Promise<boolean>;
  sendMessage(phone: string, message: string): Promise<boolean>;
}

// AWS SNS SMS Provider
export class AWSSNSProvider implements SMSProvider {
  private snsClient: SNSClient;

  constructor() {
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
      const params = {
        Message: message,
        PhoneNumber: phone,
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional', // or 'Promotional'
          },
        },
      };

      const command = new PublishCommand(params);
      const response = await this.snsClient.send(command);
      
      console.log('✅ SMS sent successfully via AWS SNS:', response.MessageId);
      return true;
    } catch (error) {
      console.error('❌ AWS SNS SMS error:', error);
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

      return response.ok;
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
            mobile: phone,
            otp: otp,
          }),
        }
      );

      return response.ok;
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

// Fast2SMS Provider (India)
export class Fast2SMSProvider implements SMSProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.FAST2SMS_API_KEY || '';
  }

  async sendOTP(phone: string, otp: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://www.fast2sms.com/dev/bulkV2`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authorization': this.apiKey,
          },
          body: JSON.stringify({
            variables_values: otp,
            route: 'otp',
            numbers: phone,
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Fast2SMS error:', error);
      return false;
    }
  }

  async sendMessage(phone: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://www.fast2sms.com/dev/bulkV2`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authorization': this.apiKey,
          },
          body: JSON.stringify({
            route: 'q',
            message: message,
            language: 'english',
            flash: 0,
            numbers: phone,
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Fast2SMS error:', error);
      return false;
    }
  }
}

// Factory to get the SMS provider
export function getSMSProvider(): SMSProvider {
  const provider = process.env.SMS_PROVIDER || 'aws-sns';

  switch (provider.toLowerCase()) {
    case 'msg91':
      return new MSG91Provider();
    case 'fast2sms':
      return new Fast2SMSProvider();
    case 'twilio':
      return new TwilioProvider();
    case 'aws-sns':
    default:
      return new AWSSNSProvider();
  }
}
