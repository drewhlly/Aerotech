// Public business contacts only. Never put provider keys in this configuration.
const phone=(process.env.SUPPORT_PHONE||'+2349045657917').replace(/[^+\d]/g,'').replace(/^0/,'+234');
export const supportContact={email:process.env.SUPPORT_EMAIL||'aerotechhrsolutions@gmail.com',phone};
export const supportPhoneHref='tel:'+supportContact.phone.replace(/[^+\d]/g,'').replace(/^0/,'+234');
