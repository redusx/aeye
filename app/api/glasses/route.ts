import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * GET /api/glasses
 * 
 * Scans the `public/models/sunglasses/` directory and returns
 * all .glb / .gltf files found. This makes the product grid
 * fully dynamic — drop a model into the folder and it appears.
 */
export async function GET() {
  try {
    const sunglassesDir = path.join(process.cwd(), 'public', 'models', 'sunglasses');

    // Ensure directory exists
    if (!fs.existsSync(sunglassesDir)) {
      return NextResponse.json({ models: [] });
    }

    const files = fs.readdirSync(sunglassesDir);

    const models = files
      .filter((file) => /\.(glb|gltf)$/i.test(file))
      .map((file, index) => {
        const stats = fs.statSync(path.join(sunglassesDir, file));
        const nameWithoutExt = file.replace(/\.(glb|gltf)$/i, '');

        // Extract a human-readable name from the filename
        // e.g. "metadata_sunglasses_Rayban_01" -> "Rayban 01"
        const displayName = parseDisplayName(nameWithoutExt);

        return {
          id: index + 1,
          fileName: file,
          modelPath: `/models/sunglasses/${file}`,
          displayName,
          fileSize: stats.size,
          lastModified: stats.mtime.toISOString(),
        };
      })
      // Sort alphabetically by displayName
      .sort((a, b) => a.displayName.localeCompare(b.displayName));

    return NextResponse.json({ models });
  } catch (error) {
    console.error('[api/glasses] Failed to read sunglasses directory:', error);
    return NextResponse.json({ models: [] }, { status: 500 });
  }
}

/**
 * Converts a filename like "metadata_sunglasses_Rayban_01" into "Rayban 01"
 * by stripping common prefixes and replacing underscores with spaces.
 */
function parseDisplayName(raw: string): string {
  let name = raw;

  // Remove common prefixes (case-insensitive)
  const prefixesToRemove = ['metadata_sunglasses_', 'metadata_', 'sunglasses_'];
  for (const prefix of prefixesToRemove) {
    if (name.toLowerCase().startsWith(prefix.toLowerCase())) {
      name = name.slice(prefix.length);
      break;
    }
  }

  // Replace underscores and hyphens with spaces
  name = name.replace(/[_-]/g, ' ').trim();

  // Capitalize first letter of each word
  name = name.replace(/\b\w/g, (c) => c.toUpperCase());

  return name || raw;
}
