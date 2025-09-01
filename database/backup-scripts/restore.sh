#!/bin/bash

# PostgreSQL Restore Script for Production Environment
# This script restores database from backup files

set -e

# Configuration
BACKUP_DIR="/backups"
BACKUP_FILE="$1"

# Database connection parameters
PGHOST=${PGHOST:-postgres}
PGPORT=${PGPORT:-5432}
PGDATABASE=${PGDATABASE:-chinook}
PGUSER=${PGUSER:-chinook_user}

# Check if backup file is provided
if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    echo "Available backups:"
    ls -la "${BACKUP_DIR}"/chinook_backup_*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

# Check if backup file exists
if [ ! -f "${BACKUP_DIR}/${BACKUP_FILE}" ]; then
    echo "Error: Backup file ${BACKUP_DIR}/${BACKUP_FILE} not found"
    echo "Available backups:"
    ls -la "${BACKUP_DIR}"/chinook_backup_*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

echo "Starting restore at $(date)"
echo "Restore file: ${BACKUP_FILE}"

# Check if file is compressed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "Decompressing backup file..."
    TEMP_FILE="/tmp/restore_temp.sql"
    gunzip -c "${BACKUP_DIR}/${BACKUP_FILE}" > "$TEMP_FILE"
    RESTORE_FILE="$TEMP_FILE"
else
    RESTORE_FILE="${BACKUP_DIR}/${BACKUP_FILE}"
fi

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h "$PGHOST" -p "$PGPORT" -U "$PGUSER"; do
    echo "PostgreSQL is not ready yet, waiting..."
    sleep 2
done

echo "PostgreSQL is ready, starting restore..."

# Restore the database
psql \
    --host="${PGHOST}" \
    --port="${PGPORT}" \
    --username="${PGUSER}" \
    --dbname="postgres" \
    --file="$RESTORE_FILE" \
    --verbose

# Check if restore was successful
if [ $? -eq 0 ]; then
    echo "Database restore completed successfully"
    
    # Log restore information
    echo "$(date): Database restored from ${BACKUP_FILE}" >> "${BACKUP_DIR}/restore.log"
    
    # Clean up temporary file if it was created
    if [ "$RESTORE_FILE" = "/tmp/restore_temp.sql" ]; then
        rm -f "$RESTORE_FILE"
    fi
    
else
    echo "Error: Database restore failed"
    
    # Clean up temporary file if it was created
    if [ "$RESTORE_FILE" = "/tmp/restore_temp.sql" ]; then
        rm -f "$RESTORE_FILE"
    fi
    
    exit 1
fi

echo "Restore completed at $(date)"