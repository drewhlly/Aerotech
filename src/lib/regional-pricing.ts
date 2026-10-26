import {countryOptions} from './countries';
undefineexport function normalizeCountry(value:string){const x=(value||'NG').trim();if(/^[A-Za-z]{2}$/.test(x))return x.toUpperCase();return countryOptions.find(option=>option.name.toLowerCase()===x.toLowerCase())?.code||x}
d