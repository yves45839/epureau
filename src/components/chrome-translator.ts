export type LocalTranslator = { translate: (text: string, options?: {signal?: AbortSignal}) => Promise<string>; destroy: () => void };
type TranslatorAPI = {
  availability: (options: {sourceLanguage: string; targetLanguage: string}) => Promise<string>;
  create: (options: {sourceLanguage:string;targetLanguage:string;signal?:AbortSignal;monitor:(monitor:{addEventListener:(name:string,listener:(event:{loaded:number})=>void)=>void})=>void}) => Promise<LocalTranslator>;
};
export function chromeTranslator(): TranslatorAPI | undefined {
  if (typeof window === "undefined" || !window.isSecureContext) return undefined;
  return (window as unknown as {Translator?:TranslatorAPI}).Translator;
}
/** Preserve line breaks and bound each request to avoid Chrome's input-size limit. */
export async function translateText(translator: LocalTranslator, text: string, signal: AbortSignal): Promise<string> {
  const output: string[] = [];
  for (const part of text.split(/(\r?\n)/)) {
    if (signal.aborted) throw new DOMException("Traduction annulée", "AbortError");
    if (!part.trim()) { output.push(part); continue; }
    const chunks = part.match(/.{1,800}(?:\s|$)|.{1,800}/gu) || [part];
    const results: string[] = [];
    for (const chunk of chunks) {
      const result = await translator.translate(chunk.trim(), { signal });
      if (!result.trim()) throw new Error("Chrome a renvoyé une traduction vide. Réessayez.");
      results.push(result.trim());
    }
    output.push((part.match(/^\s*/)?.[0] || "") + results.join(" ") + (part.match(/\s*$/)?.[0] || ""));
  }
  return output.join("");
}
