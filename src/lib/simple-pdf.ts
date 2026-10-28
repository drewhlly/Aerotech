import {readFile} from "node:fs/promises";import path from "node:path";import {PDFDocument,rgb} from "pdf-lib";import fontkit from "@pdf-lib/fontkit";
let fontBytes:Promise<Buffer>|undefined;
export async function textPDF(title:string,lines:string[]){
 const pdf=await PDFDocument.create();pdf.registerFontkit(fontkit);fontBytes||=readFile(path.join(process.cwd(),"assets/fonts/DejaVuSans.ttf"));const font=await pdf.embedFont(await fontBytes,{subset:true});pdf.setTitle(title);pdf.setAuthor("Aerotech");
 const supported=new Set(font.getCharacterSet()),all=[title,"",...lines].flatMap(s=>s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,"").replaceAll("\t","    ").split("\n"));for(const line of all)for(const char of line)if(!supported.has(char.codePointAt(0)!))throw Error("PDF font does not support this text. Download CSV for the original text.");
 let page=pdf.addPage([595,842]),y=745,index=1;
 const header=()=>{page.drawText("AEROTECH",{x:45,y:797,font,size:16,color:rgb(.025,.086,.247)});page.drawText(String(index),{x:535,y:30,font,size:9})};header();
 for(const line of all){let segment="";const output=(s:string)=>{if(y<55){page=pdf.addPage([595,842]);index++;y=745;header()}page.drawText(s,{x:45,y,font,size:10});y-=15};for(const char of line){if(segment&&font.widthOfTextAtSize(segment+char,10)>505){output(segment);segment=""}segment+=char}output(segment)}return Buffer.from(await pdf.save());
}
