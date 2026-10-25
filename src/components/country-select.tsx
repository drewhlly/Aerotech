import {countries} from '@/lib/countries';
export default function CountrySelect(props:React.SelectHTMLAttributes<HTMLSelectElement>){return <select {...props}><option value="">Select country</option>{countries.map(country=><option key={country} value={country}>{country}</option>)}</select>}
