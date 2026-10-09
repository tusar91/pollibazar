import React, { useEffect, useState } from 'react';
import { getResolvedImageUrl } from '../services/imageStorage';

const DEFAULT_FALLBACK_IMAGE = '/src/assets/images/category_daily_bazaar_1791438890146.jpg';

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
  fallbackSrc = DEFAULT_FALLBACK_IMAGE,
  ...props
}) => {
  const [resolvedSrc, setResolvedSrc] = useState<string>(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setHasError(false);

    if (!src) {
      setResolvedSrc(fallbackSrc);
      return;
    }

    if (src.startsWith('/api/uploads/')) {
      getResolvedImageUrl(src).then((resolved) => {
        if (isMounted && resolved) {
          setResolvedSrc(resolved);
        }
      });
    } else {
      setResolvedSrc(src);
    }

    return () => {
      isMounted = false;
    };
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setResolvedSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};
