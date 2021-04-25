import * as crypto from 'crypto';

export const hashPwd = (p: string): string => {
  const hmac = crypto.createHmac('sha512', process.env.SECRET_PWD);
  hmac.update(p);
  return hmac.digest('hex');
}
