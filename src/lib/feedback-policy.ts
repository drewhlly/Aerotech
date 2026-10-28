export function isCompletedFeedback(message:string){
 if(/^(enter|use|open|check|please|verify|confirm|keep)\b/i.test(message)||/\b(error|failed|unable|could not|cannot|not|quarantin\w*|pending|retry|warning)\b/i.test(message))return false;
 return /\b(saved|successfully|submitted|received|shared|sent|created|updated|deleted|removed|completed|marked as read|imported|assigned|restored|recorded|published|cancelled)\b/i.test(message);
}
