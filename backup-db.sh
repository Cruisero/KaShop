#!/bin/bash
# 数据库备份脚本
# 每天自动备份MySQL数据库

BACKUP_DIR="/var/www/haodongxi/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/haodongxi_${DATE}.sql"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 导出数据库
docker exec haodongxi-mysql mysqldump -u haodongxi -pkashop123 haodongxi > $BACKUP_FILE

# 压缩备份
gzip $BACKUP_FILE

# 删除7天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
