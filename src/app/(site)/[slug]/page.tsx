import {notFound} from 'next/navigation';
import {pageValues} from '@/lib/cms';
import {validPageSlug} from '@/content/page-builder';
import PageSections from '@/components/PageSections';
type Props={params:Promise<{slug:string}>};
async function content({params}:Props){const {slug}=await params;if(!validPageSlug(slug))notFound();return {key:'custom-'+slug,values:await pageValues('custom-'+slug)};}
export async function generateMetadata(props:Props){const {values}=await content(props);return {title:values.title,description:values.description};}
export default async function CustomPage(props:Props){const {key,values}=await content(props);return <><header className="builder-page-heading"><div className="wrap"><h1>{values.title}</h1></div></header><PageSections page={key} values={values} /></>;}
