// Keep user-supplied text inside a JSON-LD script, including literal closing script tags.
export function serializeJsonLd(value:unknown){return JSON.stringify(value).replace(/</g,'\\u003c')}
