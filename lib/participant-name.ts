export function participantDisplayName(value:string|undefined|null,email:string){
  const candidate=value?.trim()||"";
  const localPart=email.split("@")[0]?.trim()||"";
  if(!candidate)return"Participant";
  if(candidate.toLowerCase()===email.toLowerCase()||candidate.toLowerCase()===localPart.toLowerCase()){
    const words=localPart.split(/[._-]+/).filter(Boolean);
    if(words.length>1)return words.map(word=>word.charAt(0).toUpperCase()+word.slice(1).toLowerCase()).join(" ");
    return"Participant";
  }
  return candidate;
}
