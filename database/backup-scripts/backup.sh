#!/bin/bash

# PostgreSQL Backup Script for Production Environment
# This script creates automated backups with rotation and compression

set -e

# Configuration
BACKUP_DIR="/backups"
ARCHIVE_DIR="/backups/archive"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="chinook_backup_${TIMESTAMP}.sql"
COMPRESSED_FILE="${BACKUP_FILE}.gz"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

# Database connection parameters
PGHOST=${PGHOST:-postgres}
PGPORT=${PGPORT:-5432}
PGDATABASE=${PGDATABASE:-chinook}
PGUSER=${PGUSER:-chinook_user}

# Create backup directories if they don't exist
mkdir -p "${BACKUP_DIR}"
mkdir -p "${ARCHIVE_DIR}"

echo "Starting backup at $(date)"
echo "Backup file: ${BACKUP_FILE}"

# Create the backup
pg_dump \
    --host="${PGHOST}" \
    --port="${PGPORT}" \
    --username="${PGUSER}" \
    --dbname="${PGDATABASE}" \
    --verbose \
    --clean \
    --if-exists \
    --create \
    --format=plain \
    --no-password \
    --file="${BACKUP_DIR}/${BACKUP_FILE}"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Database backup completed successfully"
    
    # Compress the backup
    gzip "${BACKUP_DIR}/${BACKUP_FILE}"
    
    if [ $? -eq 0 ]; then
        echo "Backup compressed successfully: ${COMPRESSED_FILE}"
        
        # Create a symlink to the latest backup
        ln -sf "${COMPRESSED_FILE}" "${BACKUP_DIR}/latest_backup.sql.gz"
        
        # Remove old backups (keep only last N days)
        find "${BACKUP_DIR}" -name "chinook_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete
        
        # Clean up old archive files
        find "${ARCHIVE_DIR}" -name "*.sql" -type f -mtime +${RETENTION_DAYS} -delete
        
        echo "Old backups cleaned up (retention: ${RETENTION_DAYS} days)"
        
        # Log backup information
        echo "$(date): Backup ${COMPRESSED_FILE} created successfully" >> "${BACKUP_DIR}/backup.log"
        
        # Display backup size
        BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${COMPRESSED_FILE}" | cut -f1)
        echo "Backup size: ${BACKUP_SIZE}"
        
    else
        echo "Error: Failed to compress backup file"
        exit 1
    fi
else
    echo "Error: Database backup failed"
    exit 1
fi

echo "Backup completed at $(date)"