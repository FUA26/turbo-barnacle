#!/bin/bash
set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR

echo "📦 Backing up database..."

docker exec postgres pg_dump -U postgres naiera > $BACKUP_FILE
gzip $BACKUP_FILE

echo "✅ Backup saved: ${BACKUP_FILE}.gz"
