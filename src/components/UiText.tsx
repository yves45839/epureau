"use client";
import {createContext,useContext,type ReactNode} from "react";
import {uiText} from "@/content/ui-english";
const Language=createContext<"fr"|"en">("fr");
export function PublicLanguage({language,children}:{language:"fr"|"en";children:ReactNode}){return <Language.Provider value={language}>{children}</Language.Provider>;}
export function useLanguage(){return useContext(Language);}
export function useUi(){const language=useContext(Language);return (text:string)=>uiText(text,language);}
export default function UiText({text}:{text:string}){const ui=useUi();return <>{ui(text)}</>;}
