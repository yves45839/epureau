/* eslint-disable @typescript-eslint/no-require-imports */
// Read-only checks: never sends mail, changes DNS or prints secret values.
const { loadEnvConfig } = require('@next/env');
const { Resolver } = require('node:dns').promises;
loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const resolver = new Resolver({ timeout: 4000, tries: 1 });
const domain = 'epureau-ci.com';
const mailDomain = value => (value || '').match(/@([^\s>]+)/)?.[1] || null;
async function main() {
  console.log(JSON.stringify({ scope: 'local environment only', configuration: {
    RESEND_API_KEY: Boolean(process.env.RESEND_API_KEY),
    MAIL_FROM: Boolean(process.env.MAIL_FROM),
    MAIL_REPLY_TO: Boolean(process.env.MAIL_REPLY_TO),
    fromDomain: mailDomain(process.env.MAIL_FROM),
    replyToDomain: mailDomain(process.env.MAIL_REPLY_TO),
  } }));
  for (const [name, type] of [[domain,'NS'],[domain,'A'],['www.'+domain,'CNAME'],['www.'+domain,'A'],
    [domain,'MX'],[domain,'TXT'],['_dmarc.'+domain,'TXT'],['resend._domainkey.'+domain,'TXT'],
    ['send.'+domain,'TXT'],['send.'+domain,'MX'],['selector1._domainkey.'+domain,'CNAME'],['selector2._domainkey.'+domain,'CNAME']]) {
    try { console.log(JSON.stringify({name,type,records:await resolver.resolve(name,type)})); }
    catch(error) { console.log(JSON.stringify({name,type,error:error.code})); }
  }
  for (const name of [domain,'www.'+domain]) {
    try { const response=await fetch('https://'+name,{method:'HEAD',signal:AbortSignal.timeout(15000)});
      console.log(JSON.stringify({url:'https://'+name,status:response.status,finalUrl:response.url,server:response.headers.get('server')}));
    } catch(error) { console.log(JSON.stringify({url:'https://'+name,error:error.cause?.code||error.name})); }
  }
}
main().catch(error=>{console.error(error.code||error.name);process.exitCode=1;});
