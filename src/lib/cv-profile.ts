const headings: Record<string, "skills" | "experience" | "education"> = {
  skills: "skills",
  "core skills": "skills",
  "key skills": "skills",
  "technical skills": "skills",
  "core competencies": "skills",
  experience: "experience",
  "work experience": "experience",
  "employment history": "experience",
  "professional experience": "experience",
  "career history": "experience",
  education: "education",
  qualifications: "education",
  "education and qualifications": "education",
  certifications: "education",
};
export function structureCV(text: string) {
  const fields = { skills: "", experience: "", education: "" };
  let section: "skills" | "experience" | "education" | null = null;
  for (const line of text
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)) {
    const key = line
      .toLowerCase()
      .replace(/[:—–-]+$/, "")
      .trim();
    if (headings[key]) {
      section = headings[key];
      continue;
    }
    if (
      /^(references|hobbies|interests|personal details|contact|profile|summary|professional summary|objective)$/i.test(
        key,
      )
    ) {
      section = null;
      continue;
    }
    if (section) fields[section] += (fields[section] ? "\n" : "") + line;
  }
  for (const key of Object.keys(fields) as (keyof typeof fields)[])
    fields[key] = fields[key].slice(0, 10000);
  return {
    ...fields,
    missing: (Object.keys(fields) as (keyof typeof fields)[]).filter(
      (k) => !fields[k],
    ),
  };
}
export function matchRequirementTerms(
  requirements: string,
  profile: { skills: string; experience: string; education: string },
) {
  const stop = new Set([
    "with",
    "have",
    "will",
    "that",
    "this",
    "from",
    "your",
    "must",
    "should",
    "years",
    "year",
    "role",
    "work",
    "experience",
    "skills",
    "required",
    "requirements",
    "relevant",
    "ability",
    "strong",
    "and",
    "the",
    "for",
  ]);
  const terms = [
      ...new Set(
        (
          requirements.toLowerCase().match(/[a-z][a-z+#.-]{2,30}/g) || []
        ).filter((t) => !stop.has(t)),
      ),
    ].slice(0, 60),
    text = Object.values(profile).join(" ").toLowerCase();
  return {
    matched: terms.filter((t) => text.includes(t)),
    notFound: terms.filter((t) => !text.includes(t)),
    method: "Keyword hints only. Not evidence of competence or a hiring score.",
  };
}
