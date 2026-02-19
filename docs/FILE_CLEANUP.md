# File Cleanup Script Documentation

**Location**: `scripts/cleanup-files.ts`

## Overview

This script cleans up orphaned files in MinIO object storage. Orphaned files are files that exist in MinIO but have no corresponding record in the database.

**What it does**:

1. Scans database for all file records
2. Lists all objects from MinIO bucket
3. Identifies orphaned files (MinIO objects not in database)
4. Optionally deletes the orphaned files

## When to Use

Run this script when:

- **After bulk upload failures** - If upload process was interrupted, files may be in MinIO but not in database
- **After testing** - Clean up test files from development
- **Manual cleanup** - Remove accidentally uploaded files
- **Maintenance** - Periodic cleanup to save storage space
- **Before deployment** - Ensure clean production environment

## Prerequisites

### Required Permissions

- Database access (read only for dry run)
- MinIO credentials (configured in `.env`)
- For execution mode: `FILE_MANAGE_ORPHANS` permission

### Environment Variables

Ensure `.env` contains:

```bash
# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=naiera-uploads
MINIO_USE_SSL=false
```

## Usage

### Basic Commands

```bash
# Dry run (safe - shows what will be deleted)
pnpm tsx scripts/cleanup-files.ts

# Execute deletion
pnpm tsx scripts/cleanup-files.ts --execute

# Statistics only
pnpm tsx scripts/cleanup-files.ts --stats

# Verbose mode (shows each file)
pnpm scripts/cleanup-files.ts --verbose

# Show help
pnpm tsx scripts/cleanup-files.ts --help
```

### Command Options

| Option      | Short | Description                                       |
| ----------- | ----- | ------------------------------------------------- |
| `--execute` | `-e`  | Actually delete orphaned files (default: dry run) |
| `--stats`   | `-s`  | Show statistics only (no deletion)                |
| `--verbose` | `-v`  | Show detailed output of each file                 |
| `--help`    | `-h`  | Show help message                                 |

### Examples

#### Example 1: Check Before Cleanup

```bash
$ pnpm tsx scripts/cleanup-files.ts

╔══════════════════════════════════════════════════════════╗
║     MinIO File Cleanup Script                              ║
╚══════════════════════════════════════════════════════════╝

🔍 Mode: DRY RUN - No files will be deleted

Step 1: Scanning database...
📊 Database: 150 files found

Step 2: Scanning MinIO...
📦 MinIO: 180 objects found

Step 3: Identifying orphaned files...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Results:
   Orphaned files: 30
   Total size: 15.23 MB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Example 2: Execute Cleanup

```bash
$ pnpm tsx scripts/cleanup-files.ts --execute

Step 4: Deleting orphaned files...
  ✓ Deleted batch 1: 30 files

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Deletion complete:
   Deleted: 30
   Failed: 0
```

#### Example 3: Verbose Mode

```bash
$ pnpm tsx scripts/cleanup-files.ts -v

Orphaned files:
  1. cmlsjtv9z00009ltnptnegqv7/avatar/test.png (124.5 KB, 2026-02-18T12:30:00.000Z)
  2. cmlsjtv9z00009ltnptnegqv7/temp/file.pdf (2.1 MB, 2026-02-18T11:15:00.000Z)
  3. cmlsjtv9z00009ltnptnegqv7/debug.log (12 KB, 2026-02-17T09:45:00.000Z)
  ...
```

#### Example 4: Statistics Only

```bash
$ pnpm tsx scripts/cleanup-files.ts --stats

{
  "expiredCount": 0,
  "orphanedCount": 30,
  "totalSizeBytes": 15976432,
  "totalSizeMB": "15.23"
}
```

## How It Works

### Step-by-Step Process

```
┌─────────────────────────────────────────────────────┐
│ 1. Scan Database                                    │
│    - Query File table for all records                │
│    - Extract storagePath → get filename             │
│    - Store in Set for O(1) lookup                   │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 2. List MinIO Objects                             │
│    - Use S3 ListObjectsV2 with pagination          │
│    - Get all objects from bucket                    │
│    - Return array of {key, size, lastModified}      │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 3. Identify Orphaned Files                         │
│    - Compare MinIO objects with database files       │
│    - Extract filename from storage path              │
│    - Filter out files that exist in database         │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 4. Delete Orphaned Files (if --execute)             │
│    - Batch delete (1000 files per batch)           │
│    - Handle errors gracefully                     │
│    - Report deleted/failed counts                   │
└─────────────────────────────────────────────────────┘
```

### File Path Matching

**Database File Format**:

```
Storage Path: {userId}/{category}/{filename}
Example: cmlf6p4mo00009l3jo81imqki/AVATAR/cmlsjtv9z00009ltnptnegqv7.png
Filename: cmlsjtv9z00009ltnptnegqv7.png
```

**MinIO Key Format**:

```
Key: {userId}/{category}/{filename}
Example: cmlf6p4mo00009l3jo81imqki/AVATAR/cmlsjtv9z00009ltnptnegqv7.png
```

Script extracts filename from MinIO key and compares with database filenames.

## Safety Features

### Dry Run Mode (Default)

- **No files are deleted**
- Safe to run anytime
- Shows what will be deleted
- Use this first to preview

### Confirmation Required

- Must use `--execute` flag to actually delete
- Prevents accidental deletion
- Clear indication in output

### Batch Deletion

- Deletes in batches of 1000 files
- Prevents overwhelming S3 API
- Shows progress for each batch
- Continues on error (best-effort)

### Error Handling

- Logs errors for failed batches
- Continues processing other batches
- Reports failed count at end
- Individual file errors don't stop entire process

## Best Practices

### 1. Always Dry Run First

```bash
# Check what will be deleted
pnpm tsx scripts/cleanup-files.ts

# If satisfied, then execute
pnpm tsx scripts/cleanup-files.ts --execute
```

### 2. Backup Before Mass Deletion

```bash
# Optional: Create database backup
pnpm tsx scripts/cleanup-files.ts --stats > backup-cleanup-$(date +%F).log
```

### 3. Schedule Regular Cleanup

Add to cron job or GitHub Actions:

```yaml
# Example: Weekly cleanup every Sunday at 2 AM
0 2 * * 0 pnpm tsx scripts/cleanup-files.ts --execute
```

### 4. Monitor Storage Usage

```bash
# Before cleanup
pnpm tsx scripts/cleanup-files.ts --stats

# After cleanup
pnpm tsx scripts/cleanup-files.ts --stats
```

## Troubleshooting

### Error: "Cannot find module '@/lib/db/prisma'"

**Cause**: Script not in project root
**Solution**: Run from project root directory

```bash
cd /home/acn/code/naiera-next
pnpm tsx scripts/cleanup-files.ts
```

### Error: "Access Denied"

**Cause**: Missing MinIO credentials or permissions
**Solution**:

- Check `.env` file has correct MinIO credentials
- Ensure MinIO service is running: `docker-compose up -d minio`

### Error: "No files found"

**Possible causes**:

1. MinIO is empty
2. Database is empty
3. Bucket name mismatch

**Solution**:

```bash
# Check MinIO is accessible
curl http://localhost:9000  # Should return MinIO info

# Check bucket exists
# Look for bucket name in .env: MINIO_BUCKET
```

### Large Number of Files

If you have thousands of files:

- Script uses pagination (handles any number of files)
- May take longer to scan
- Use `--stats` first to estimate size

## API Alternative

If you prefer web UI instead of CLI, use the admin API:

### GET Statistics

```bash
curl http://localhost:3000/api/files/admin/cleanup
```

### Execute Cleanup

```bash
curl -X POST http://localhost:3000/api/files/admin/cleanup
```

## Related Files

- `scripts/cleanup-files.ts` - Cleanup CLI script
- `app/api/files/admin/cleanup/route.ts` - Admin API endpoint
- `lib/storage/minio-client.ts` - MinIO client with listAllObjects
- `lib/storage/file-cleaner.ts` - Cleanup logic functions

## Maintenance Schedule Recommendations

### Development Environment

- **Weekly** or after testing sessions
- Before database resets
- After bulk upload operations

### Production Environment

- **Monthly** during low-traffic periods
- Automated via cron job or GitHub Actions
- Monitor storage usage trends

### Trigger Events

Run cleanup when:

- Storage costs increase unexpectedly
- User reports "file not found" errors (may indicate orphaned files)
- Database migration or schema changes

## Performance Impact

### Resource Usage

- **Database**: 1 query (select all files)
- **MinIO**: ~1 API call per 1000 objects (pagination)
- **Memory**: Minimal (streams file lists)
- **Time**: Depends on file count
  - 1000 files: ~5 seconds
  - 10,000 files: ~30 seconds
  - 100,000 files: ~3 minutes

### Storage Savings

Typical savings:

- Development: 10-50 MB per cleanup
- Staging: 100-500 MB per cleanup
- Production: 500 MB - 5 GB per cleanup (depending on usage)

## Support

If you encounter issues:

1. Check `KNOWN_ISSUES.md` for common problems
2. Review MinIO logs: `docker logs minio`
3. Check database connection
4. Verify `.env` configuration

## Changelog

### v1.0.0 (2026-02-19)

- Initial release
- Dry run and execute modes
- Batch deletion support
- Verbose mode
- Statistics mode
