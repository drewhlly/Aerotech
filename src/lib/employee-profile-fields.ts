export const profileSections = [
 {key:"personal",title:"Personal information",fields:[["dateOfBirth","Date of birth","date"],["gender","Gender","text"],["maritalStatus","Marital status","text"],["nationality","Nationality","text"],["residentialAddress","Residential address","text"],["nin","NIN (Nigeria)","text"],["middleName","Middle name","text"]]},
 {key:"contact",title:"Contact information",fields:[["alternateEmail","Alternate email","email"],["alternatePhone","Alternate phone","tel"],["homeAddress","Home address","text"]]},
 {key:"banking",title:"Banking information",fields:[["bankName","Bank name","text"],["accountName","Account name","text"],["accountNumber","Account number","text"],["bvn","BVN (Nigeria)","text"]]},
 {key:"employment",title:"Employment information",fields:[["employeeNumber","Employee number","text"],["hireDate","Hire date","date"],["employmentType","Employment type","text"],["workLocation","Work location","text"],["lineManager","Line manager","text"]]},
 {key:"pension",title:"Pension information",fields:[["pfa","Pension fund administrator","text"],["rsaPin","RSA PIN","text"]]},
 {key:"tax",title:"Tax information",fields:[["taxId","Tax identification number","text"],["taxState","State of tax residence","text"]]},
 {key:"rentRelief",title:"Rent relief",fields:[["eligible","Eligibility / status","text"],["annualRent","Annual rent (NGN)","text"],["landlordName","Landlord name","text"],["rentalAddress","Rental address","text"]]},
 {key:"nextOfKin",title:"Next of kin",fields:[["name","Full name","text"],["relationship","Relationship","text"],["phone","Phone","tel"],["address","Address","text"]]},
 {key:"emergency",title:"Emergency contact",fields:[["name","Full name","text"],["relationship","Relationship","text"],["phone","Phone","tel"],["alternatePhone","Alternate phone","tel"]]}
] as const;
export const validProfileKeys = new Set(profileSections.flatMap(s=>s.fields.map(f=>s.key+"."+f[0])));
export function sanitizeProfile(input:unknown){if(!input||typeof input!=="object"||Array.isArray(input))throw Error("Invalid profile");const out:Record<string,Record<string,string>>={};for(const [section,fields] of Object.entries(input)){if(!fields||typeof fields!=="object"||Array.isArray(fields))throw Error("Invalid section");for(const [field,value] of Object.entries(fields)){if(!validProfileKeys.has(section+"."+field)||typeof value!=="string"||value.length>500)throw Error("Invalid profile field");if((field==="nin"||field==="bvn")&&value.trim()&&!/^\d{11}$/.test(value.trim()))throw Error("NIN and BVN must contain 11 digits");(out[section]??={})[field]=value.trim();}}return out;}
export const profileOptions:Record<string,string[]>={
 'personal.gender':['Female','Male','Self-described','Prefer not to say'],
 'personal.maritalStatus':['Single','Married','Separated','Divorced','Widowed','Prefer not to say'],
 'employment.employmentType':['Full-time','Part-time','Contract','Temporary','Internship'],
 'tax.taxState':['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','Federal Capital Territory','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'],
 'nextOfKin.relationship':['Spouse','Parent','Child','Sibling','Guardian','Other'],
 'emergency.relationship':['Spouse','Parent','Child','Sibling','Guardian','Colleague','Other'],
 'rentRelief.eligible':['Pending HR review','Verified eligible','Not eligible','Not applicable']
};
