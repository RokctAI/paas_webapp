/* eslint-disable @next/next/no-img-element */
import React from "react";
import cls from "./fallbackImage.module.scss";
import Image from "next/image";

type Props = {
  src?: string;
  alt?: string;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  priority?: boolean;
  width?: number;
  height?: number;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  style?: React.CSSProperties;
};

export default function FallbackImage({
  src,
  alt = "image",
  onError,
  style,
  fill,
  width,
  height,
}: Props) {
  const isValidSrc =
    src &&
    (src.startsWith("/") ||
      src.startsWith("http://") ||
      src.startsWith("https://"));

  if (!isValidSrc) {
    console.error("Invalid image source:", src);
    return null; // Prevent rendering if src is invalid  (author: @frenchfkingbaguette)
  }
  return (
    <Image
      style={style}
      src={src}
      alt={alt}
      title={alt}
      fill={fill}
      width={width}
      height={height}
      className={cls.root}
      onError={(e) => {
        (e.target as HTMLImageElement).style.visibility = "hidden";
        onError?.(e);
      }}
    />
  );
}
