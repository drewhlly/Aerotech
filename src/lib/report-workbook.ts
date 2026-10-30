import ExcelJS from 'exceljs';
/** Keep untrusted text as literal cells, including strings that begin like spreadsheet formulas. */
export function reportText(value:unknown){const text=String(value??'');return /^\s*[=+@\-]/.test(text)?"'"+text:text}
export async function workbookResponse(title:string,columns:{header:string;key:string;width:number}[],rows:Record<string,unknown>[],filename:string){
 const workbook=new ExcelJS.Workbook();workbook.creator='Aerotech';workbook.created=new Date();const sheet=workbook.addWorksheet(title,{views:[{state:'frozen',ySplit:1}]});sheet.columns=columns;sheet.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'}};sheet.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF173E91'}};sheet.getRow(1).height=24;sheet.autoFilter={from:'A1',to:{row:1,column:columns.length}};
 for(const row of rows){const safe:Record<string,string|number>={};for(const col of columns){const value=row[col.key];safe[col.key]=typeof value==='number'&&Number.isFinite(value)?value:reportText(value)}sheet.addRow(safe)}
 const bytes=await workbook.xlsx.writeBuffer();return new Response(new Uint8Array(bytes),{headers:{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':`attachment; filename="${filename}"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
}
