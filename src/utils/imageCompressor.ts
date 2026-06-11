/**
 * Utility to compress and resize images on the client side using HTML5 Canvas
 * before uploading or seeding to Firestore, preventing document size limit exceptions.
 */
export function compressImage(file: File, maxWidth = 256, maxHeight = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    // Standard validation
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      reject(new Error('Formato de imagen no soportado. Debe ser PNG o JPG.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate proportional dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback if canvas context cannot be retrieved
          resolve(event.target?.result as string);
          return;
        }

        // Draw and scale
        ctx.drawImage(img, 0, 0, width, height);

        // Keep PNG transparency or fallback to JPEG 0.85 quality
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const compressedBase64 = canvas.toDataURL(outputType, 0.85);
        resolve(compressedBase64);
      };
      
      img.onerror = (err) => {
        reject(err);
      };
      
      img.src = event.target?.result as string;
    };

    reader.onerror = (err) => {
      reject(err);
    };

    reader.readAsDataURL(file);
  });
}
