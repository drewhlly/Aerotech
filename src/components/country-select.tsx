import {countryOptions} from '@/lib/countries';
export default function CountrySelect({codeValues=false,...props}:React.SelectHTMLAttributes<HTMLSelectElement>&{codeValues?:boolean}){return <select {...props}><option value="" disabled>Select country</option>{countryOptions.map(({code,name})=><option key={code} value={codeValues?code:name}>{name}</option>)}</select>}
