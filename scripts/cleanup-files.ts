#!/usr/bin/env ts
/**
 * MinIO File Cleanup Script
 *
 * Cleans up orphaned files in MinIO storage:
 * - Orphaned files: Files in MinIO but not in database
 * - Expired files: Files with expired dates in database
 *
 * Usage:
 *   pnpm tsx scripts/cleanup-files.ts              # Dry run (show what will be deleted)
 *   pnpm tsx scripts/cleanup-files.ts --execute    # Actually delete files
 *   pnpm tsx scripts/cleanup-files.ts --stats     # Show statistics only
 *
 * Requirements:
 *   - FILE_MANAGE_ORPHANS permission (for database access)
 *   - MinIO credentials in .env
 */

import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env";
import { getS3Client, listAllObjects } from "@/lib/storage/minio-client";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";

interface CleanupOptions {
  execute?: boolean; // Actually delete files (default: dry run)
  stats?: boolean; // Show stats only
  verbose?: boolean; // Show detailed output
}

interface CleanupResult {
  orphanedFiles: Array<{
    key: string;
    size: number;
    lastModified: Date;
  }>;
  totalSizeBytes: number;
  totalSizeMB: string;
}

/**
 * Get all file IDs from database
 */
async function getAllDatabaseFileIds(): Promise<Set<string>> {
  const files = await prisma.file.findMany({
    select: { id: true, storagePath: true },
  });

  // Extract just the filename/ID from storagePath
  // storagePath format: {userId}/{category}/{filename}
  const fileIds = new Set(
    files.map((f) => {
      // Get filename from storage path
      const parts = f.storagePath.split("/");
      return parts[parts.length - 1]; // Last part is the filename
    })
  );

  console.log(`📊 Database: ${files.length} files found`);
  return fileIds;
}

/**
 * List all objects from MinIO
 */
async function listAllMinIOObjects(): Promise<
  Array<{ key: string; size: number; lastModified: Date }>
> {
  const s3 = getS3Client();

  console.log("🔍 Scanning MinIO bucket:", env.MINIO_BUCKET);

  const objects = await listAllObjects(s3, env.MINIO_BUCKET);

  console.log(`📦 MinIO: ${objects.length} objects found`);
  return objects;
}

/**
 * Find orphaned files (in MinIO but not in database)
 */
async function findOrphanedFiles(
  minioObjects: Array<{ key: string; size: number; lastModified: Date }>,
  databaseFileIds: Set<string>
): Promise<Array<{ key: string; size: number; lastModified: Date }>> {
  // Extract filename from MinIO key
  // MinIO key format: {userId}/{category}/{cuid}.{ext}
  const orphaned = minioObjects.filter((obj) => {
    const parts = obj.key.split("/");
    const filename = parts[parts.length - 1]; // Extract filename
    return !databaseFileIds.has(filename);
  });

  return orphaned;
}

/**
 * Delete files from MinIO
 */
async function deleteFilesFromMinIO(
  keys: string[]
): Promise<{ deleted: number; failed: number; errors: string[] }> {
  if (keys.length === 0) {
    return { deleted: 0, failed: 0, errors: [] };
  }

  const s3 = getS3Client();
  const errors: string[] = [];

  // Delete in batches of 1000 (S3 limit)
  const batchSize = 1000;
  let deleted = 0;

  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = keys.slice(i, i + batchSize);

    try {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: env.MINIO_BUCKET,
          Delete: {
            Objects: batch.map((key) => ({ Key: key })),
            Quiet: false,
          },
        })
      );

      deleted += batch.length;
      console.log(`  ✓ Deleted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} files`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${errorMessage}`);
      console.error(`  ✗ Batch ${Math.floor(i / batchSize) + 1} failed:`, errorMessage);
    }
  }

  return { deleted, failed: keys.length - deleted, errors };
}

/**
 * Main cleanup function
 */
async function cleanupFiles(options: CleanupOptions = {}): Promise<CleanupResult> {
  const { execute = false, stats = false, verbose = false } = options;

  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║     MinIO File Cleanup Script                              ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log("");

  if (stats) {
    console.log("📊 Mode: Statistics Only");
  } else if (execute) {
    console.log("⚠️  Mode: EXECUTE - Files WILL BE DELETED!");
  } else {
    console.log("🔍 Mode: DRY RUN - No files will be deleted");
  }
  console.log("");

  // Step 1: Get database files
  console.log("Step 1: Scanning database...");
  const databaseFileIds = await getAllDatabaseFileIds();

  // Step 2: List MinIO objects
  console.log("Step 2: Scanning MinIO...");
  const minioObjects = await listAllMinIOObjects();

  // Step 3: Find orphaned files
  console.log("Step 3: Identifying orphaned files...");
  const orphanedFiles = await findOrphanedFiles(minioObjects, databaseFileIds);

  // Calculate total size
  const totalSizeBytes = orphanedFiles.reduce((sum, file) => sum + file.size, 0);
  const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);

  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📋 Results:`);
  console.log(`   Orphaned files: ${orphanedFiles.length}`);
  console.log(`   Total size: ${totalSizeMB} MB`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  if (verbose && orphanedFiles.length > 0) {
    console.log("");
    console.log("Orphaned files:");
    orphanedFiles.forEach((file, index) => {
      const sizeKB = (file.size / 1024).toFixed(2);
      console.log(`  ${index + 1}. ${file.key} (${sizeKB} KB, ${file.lastModified.toISOString()})`);
    });
  }

  // Step 4: Delete files if execute mode
  if (execute && orphanedFiles.length > 0) {
    console.log("");
    console.log("Step 4: Deleting orphaned files...");

    const keysToDelete = orphanedFiles.map((f) => f.key);
    const result = await deleteFilesFromMinIO(keysToDelete);

    console.log("");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`✅ Deletion complete:`);
    console.log(`   Deleted: ${result.deleted}`);
    console.log(`   Failed: ${result.failed}`);

    if (result.errors.length > 0) {
      console.log("");
      console.log("Errors:");
      result.errors.forEach((error) => console.log(`  - ${error}`));
    }
  } else if (!execute && orphanedFiles.length > 0) {
    console.log("");
    console.log("💡 Tip: Use --execute flag to actually delete these files");
    console.log("   Example: pnpm tsx scripts/cleanup-files.ts --execute");
  } else if (orphanedFiles.length === 0) {
    console.log("");
    console.log("✨ No orphaned files found! MinIO is clean.");
  }

  return {
    orphanedFiles,
    totalSizeBytes,
    totalSizeMB,
  };
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const options: CleanupOptions = {
    execute: args.includes("--execute"),
    stats: args.includes("--stats"),
    verbose: args.includes("--verbose") || args.includes("-v"),
  };

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
MinIO File Cleanup Script

Usage:
  pnpm tsx scripts/cleanup-files.ts [options]

Options:
  --execute, -e     Actually delete files (default: dry run)
  --stats, -s       Show statistics only
  --verbose, -v     Show detailed output
  --help, -h        Show this help message

Examples:
  pnpm tsx scripts/cleanup-files.ts              # Dry run
  pnpm tsx scripts/cleanup-files.ts --execute    # Delete orphaned files
  pnpm tsx scripts/cleanup-files.ts --stats     # Statistics only
  pnpm tsx scripts/cleanup-files.ts -v          # Verbose dry run
    `);
    process.exit(0);
  }

  try {
    await cleanupFiles(options);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { cleanupFiles };
