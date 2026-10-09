import React, { useState } from 'react';
import { DEFAULT_PRODUCT_IMAGE } from '../services/imageStorage';

interface ProductImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc = DEFAULT_PRODUCT_IMAGE,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  const imageSrc = (!hasError && src && src.trim()) ? src.trim() : fallbackSrc;

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      {...props}
    />
  );
};
