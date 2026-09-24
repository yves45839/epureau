import Image, {type ImageProps} from "next/image";

/** Optimize public site assets; preserve compatibility with external CMS URLs. */
export default function SiteImage(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  const origin = process.env.NEXT_PUBLIC_SITE_IMAGE_ORIGIN;
  const publicAsset = src.startsWith("/") && !src.startsWith("//");
  const storageAsset = origin && src.startsWith(`${origin}/storage/v1/object/public/site-media/`);
  return <Image {...props} alt={props.alt} unoptimized={props.unoptimized ?? !(publicAsset || storageAsset)} />;
}
