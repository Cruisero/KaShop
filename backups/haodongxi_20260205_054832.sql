-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: haodongxi
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cards`
--

DROP TABLE IF EXISTS `cards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cards` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('AVAILABLE','SOLD','EXPIRED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AVAILABLE',
  `order_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sold_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `variant_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cards_product_id_fkey` (`product_id`),
  KEY `cards_order_id_fkey` (`order_id`),
  KEY `cards_variant_id_fkey` (`variant_id`),
  CONSTRAINT `cards_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `cards_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cards_variant_id_fkey` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cards`
--

LOCK TABLES `cards` WRITE;
/*!40000 ALTER TABLE `cards` DISABLE KEYS */;
INSERT INTO `cards` VALUES ('0cc82a4a-6d29-4250-8ec3-5a0cdf8227bc','9d5acd01-5561-4619-8b09-fb54d5e997e7','hdjaknsdjhakjjsdjkanda','SOLD','56cfb364-9ddb-4a55-a345-b9bc7665b653','2026-02-03 07:53:03.431','2026-02-03 06:44:45.356',NULL),('234cd2a4-9af8-490e-879f-8b22c41d84f4','9d5acd01-5561-4619-8b09-fb54d5e997e7','hdksjahkjdhsaj1','SOLD','aab296f8-01f9-4ea9-99a4-e4ec01e78c50','2026-02-03 17:05:58.981','2026-02-03 17:05:58.982',NULL),('397674e3-95dc-4113-8f9d-8924380236ef','9d5acd01-5561-4619-8b09-fb54d5e997e7','hdjaknsdjhakjjsdjkanda','SOLD','c869757b-22f8-40a6-b94a-95c2b254f0e3','2026-02-03 08:03:05.068','2026-02-03 06:44:48.116',NULL),('5aeaf8b2-d80f-4ff1-8f80-88f8c7bb20dc','9d5acd01-5561-4619-8b09-fb54d5e997e7','hdjaknsdjhakjjsdjkanda','SOLD','7db420c1-30dd-496e-b072-6ef84ef53d9b','2026-02-03 08:07:37.545','2026-02-03 06:44:46.619',NULL),('66b1083a-066a-49d5-8a89-69a1d0707aa3','9d5acd01-5561-4619-8b09-fb54d5e997e7','hdjaknsdjhakjjsdjkanda','SOLD','1cd53717-73ed-4790-99d9-cc692ecb30cc','2026-02-03 10:01:50.698','2026-02-03 06:44:50.721',NULL),('67ec165d-e605-43b0-b77e-c984230703a0','9d5acd01-5561-4619-8b09-fb54d5e997e7','dashlkdascnask','SOLD','106adb60-c4ee-478a-878c-ec6ff927253f','2026-02-03 13:46:04.664','2026-02-03 07:18:13.936',NULL),('6d2c8377-0aec-4238-9f3d-9e9cf30cfd8e','9d5acd01-5561-4619-8b09-fb54d5e997e7','hdjaknsdjhakjjsdjkanda','SOLD','2d8b6c68-bc1c-47b9-8432-90b3b8fcffb9','2026-02-03 15:53:08.707','2026-02-03 06:44:40.298',NULL),('6d4f83e3-a5c6-447f-b0ad-9a1aab67dd77','9d5acd01-5561-4619-8b09-fb54d5e997e7','hdjaknsdjhakjjsdjkanda','SOLD','e62a4271-4197-4f39-bbd5-7a1b596f1895','2026-02-03 15:59:54.671','2026-02-03 06:44:50.484',NULL),('6f8015eb-e6ab-4d14-944e-f3bacb8c835d','9d5acd01-5561-4619-8b09-fb54d5e997e7','hdjaknsdjhakjjsdjkanda','AVAILABLE',NULL,NULL,'2026-02-03 06:44:51.298',NULL),('84bd3a28-cdc9-432e-bd42-01e05f7eb535','9d5acd01-5561-4619-8b09-fb54d5e997e7','jkadhjhasjdlas3','SOLD','a4b3b407-7b58-4d97-a364-da2fb9fa5a0c','2026-02-03 16:29:53.648','2026-02-03 16:29:23.715',NULL),('9b59f4ec-e02b-476a-a6d0-455b6e3d630a','9d5acd01-5561-4619-8b09-fb54d5e997e7','hdjaknsdjhakjjsdjkanda','AVAILABLE',NULL,NULL,'2026-02-03 06:44:49.919',NULL),('b693a2dd-bac4-4bfa-ba9e-dbbc0e2109ad','9d5acd01-5561-4619-8b09-fb54d5e997e7','dadadfdafads','AVAILABLE',NULL,NULL,'2026-02-03 06:49:58.638',NULL),('c6c89de2-a588-483c-afb7-53b98dd7a912','9d5acd01-5561-4619-8b09-fb54d5e997e7','hdjaknsdjhakjjsdjkanda','AVAILABLE',NULL,NULL,'2026-02-03 06:44:50.935',NULL),('de16a5dd-9592-4b48-8e3a-a15416d7958e','9d5acd01-5561-4619-8b09-fb54d5e997e7','hdjaknsdjhakjjsdjkanda','AVAILABLE',NULL,NULL,'2026-02-03 06:44:51.119',NULL),('ffe96662-2bc4-4674-ba89-dd4f6f6039d1','9d5acd01-5561-4619-8b09-fb54d5e997e7','hdjaknsdjhakjjsdjkanda','AVAILABLE',NULL,NULL,'2026-02-03 06:44:47.371',NULL);
/*!40000 ALTER TABLE `cards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `status` enum('ACTIVE','INACTIVE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES ('683a940d-6bba-4eec-972d-3c32abaca526','Ai','','📦',0,'ACTIVE','2026-02-03 18:25:21.725','2026-02-03 18:25:21.725'),('游戏账号','游戏账号','各类游戏账号','🎮',1,'ACTIVE','2026-01-23 15:48:25.921','2026-01-31 17:04:12.960'),('社交账号','社交账号','社交平台账号','💬',5,'ACTIVE','2026-01-23 15:48:25.944','2026-01-31 17:04:13.103'),('网盘会员','网盘会员','网盘存储服务','☁️',6,'ACTIVE','2026-01-23 15:48:25.946','2026-01-31 17:04:13.107'),('视频会员','视频会员','视频、音乐等会员','📺',2,'ACTIVE','2026-01-23 15:48:25.932','2026-01-31 17:04:13.079'),('软件激活','软件激活','正版软件激活码','💿',4,'ACTIVE','2026-01-23 15:48:25.943','2026-01-31 17:04:13.096'),('音乐会员','音乐会员','音乐平台会员','🎵',3,'ACTIVE','2026-01-23 15:48:25.937','2026-01-31 17:04:13.088');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_no` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `variant_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `variant_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('PENDING','PAID','COMPLETED','CANCELLED','REFUNDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `payment_method` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_no` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_at` datetime(3) DEFAULT NULL,
  `completed_at` datetime(3) DEFAULT NULL,
  `ip_address` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `usdt_amount` decimal(10,2) DEFAULT NULL,
  `cancelled_at` datetime(3) DEFAULT NULL,
  `remark` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_order_no_key` (`order_no`),
  KEY `orders_user_id_fkey` (`user_id`),
  KEY `orders_product_id_fkey` (`product_id`),
  CONSTRAINT `orders_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `orders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES ('03c76998-6b79-45d2-8c40-496f1bd643e5','KA20260202_Z6VV5',NULL,'admin@kashop.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro',NULL,NULL,1,45.00,45.00,'CANCELLED','alipay',NULL,NULL,NULL,'::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-02 18:33:37.196','2026-02-03 13:32:00.017',NULL,'2026-02-03 13:32:00.016',NULL),('0956732a-17e8-45df-a065-e0d0b332290e','KA202602033PMJQD',NULL,'admin@kashop.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro (测试)',NULL,NULL,1,0.10,0.10,'CANCELLED','alipay',NULL,NULL,NULL,'::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-03 07:18:25.726','2026-02-03 13:32:00.017',NULL,'2026-02-03 13:32:00.016',NULL),('0fc99b11-3303-425a-96e1-6a6f49144aa2','KA2026020280-DPE',NULL,'test@test.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro',NULL,NULL,1,45.00,45.00,'CANCELLED','alipay',NULL,NULL,NULL,'::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-02 18:38:22.006','2026-02-03 13:32:00.017',NULL,'2026-02-03 13:32:00.016',NULL),('106adb60-c4ee-478a-878c-ec6ff927253f','KA20260203BRACTA','f506b92d-3740-429c-9e7e-777a493006d4','luochun15@gmail.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro (测试)',NULL,NULL,1,0.10,0.10,'COMPLETED','alipay','2026020322001447261434001415','2026-02-03 13:46:04.656','2026-02-03 13:46:04.671','::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-03 13:42:50.376','2026-02-03 13:46:04.672',NULL,NULL,NULL),('12619475-c849-4ccb-aca0-228326bd228e','KA20260203GEYIKR',NULL,'admin@kashop.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro (测试)',NULL,NULL,1,0.10,0.10,'CANCELLED','alipay',NULL,NULL,NULL,'::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-03 06:23:40.360','2026-02-03 13:32:00.017',NULL,'2026-02-03 13:32:00.016',NULL),('15704838-68e3-4e48-9405-cd10af25eba5','KA20260203M6Z9PS','f506b92d-3740-429c-9e7e-777a493006d4','luochun15@gmail.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro (测试)',NULL,NULL,1,0.10,0.10,'CANCELLED','usdt',NULL,NULL,NULL,'::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-03 13:50:53.366','2026-02-03 13:51:30.455',0.02,'2026-02-03 13:51:30.455',NULL),('1a702609-6adf-4538-84ca-dc7eb0d0af07','KA20260203TDWQ4J','f506b92d-3740-429c-9e7e-777a493006d4','luochun15@gmail.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro (测试)','b28946ac-5b3e-4b06-bad5-ca92700c7394','测试',1,0.10,0.10,'PAID','alipay','2026020422001447261434535065','2026-02-03 16:06:05.526',NULL,'::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-03 16:05:53.583','2026-02-03 16:06:05.527',NULL,NULL,NULL),('1cd53717-73ed-4790-99d9-cc692ecb30cc','KA20260203YFAI3M','f506b92d-3740-429c-9e7e-777a493006d4','luochun15@gmail.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro (测试)',NULL,NULL,1,0.10,0.10,'COMPLETED','alipay','2026020322001447261431300311','2026-02-03 10:01:50.690','2026-02-03 10:01:50.703','::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-03 10:01:11.572','2026-02-03 10:01:50.704',NULL,NULL,NULL),('1d87e744-a233-459f-b4de-e75257d8fe98','KA20260202KZXSC3',NULL,'admin@kashop.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro',NULL,NULL,1,45.00,45.00,'CANCELLED','alipay',NULL,NULL,NULL,'::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-02 16:08:29.821','2026-02-03 13:32:00.017',NULL,'2026-02-03 13:32:00.016',NULL),('1eca0fe6-c36d-4ee1-86c4-f22673115610','KA20260202CNCUYF',NULL,'admin@kashop.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro',NULL,NULL,1,45.00,45.00,'CANCELLED','alipay',NULL,NULL,NULL,'::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-02 18:16:03.465','2026-02-03 13:32:00.017',NULL,'2026-02-03 13:32:00.016',NULL),('2d8b6c68-bc1c-47b9-8432-90b3b8fcffb9','KA20260203NLQJTH','f506b92d-3740-429c-9e7e-777a493006d4','luochun15@gmail.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro (测试)',NULL,NULL,1,0.10,0.10,'COMPLETED','alipay','2026020322001447261434531354','2026-02-03 15:53:08.698','2026-02-03 15:53:08.716','::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-03 15:52:55.153','2026-02-03 15:53:08.717',NULL,NULL,NULL),('321183af-3f59-4cf5-b3e5-7f3728a09597','KA20260203WSMB0E',NULL,'admin@kashop.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro (测试)',NULL,NULL,1,0.10,0.10,'CANCELLED','alipay',NULL,NULL,NULL,'::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-03 06:39:20.857','2026-02-03 13:32:00.017',NULL,'2026-02-03 13:32:00.016',NULL),('37576047-9267-4c8a-a459-1aa389cbadf2','KA20260202MTZZUS',NULL,'admin@kashop.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro',NULL,NULL,1,45.00,45.00,'CANCELLED','alipay',NULL,NULL,NULL,'::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-02 18:34:04.944','2026-02-03 13:32:00.017',NULL,'2026-02-03 13:32:00.016',NULL),('56cfb364-9ddb-4a55-a345-b9bc7665b653','KA20260203GXGRH3',NULL,'admin@kashop.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro (测试)',NULL,NULL,1,0.10,0.10,'COMPLETED','alipay','2026020323001447261434588749','2026-02-03 07:53:03.424','2026-02-03 07:53:03.438','::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-03 07:52:49.726','2026-02-03 07:53:03.438',NULL,NULL,NULL),('68cf7e43-1d12-48cf-877e-62fe8fca9982','KA20260202BFPHIU',NULL,'admin@kashop.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro',NULL,NULL,1,45.00,45.00,'CANCELLED','alipay',NULL,NULL,NULL,'::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-02 18:18:35.989','2026-02-03 13:32:00.017',NULL,'2026-02-03 13:32:00.016',NULL),('6e43e3e2-36a8-480b-b6fa-0c127cb5e964','KA20260202H0VEP8',NULL,'admin@kashop.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro (测试)',NULL,NULL,1,0.10,0.10,'CANCELLED','alipay',NULL,NULL,NULL,'::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-02 19:01:14.172','2026-02-03 13:32:00.017',NULL,'2026-02-03 13:32:00.016',NULL),('6f5af94c-489f-4222-96e7-eef0a1a4524f','KA20260203TMAHQ1','f506b92d-3740-429c-9e7e-777a493006d4','luochun15@gmail.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro (测试)',NULL,NULL,2,0.10,0.20,'CANCELLED','usdt',NULL,NULL,NULL,'::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-03 12:44:26.277','2026-02-03 13:32:00.017',0.04,'2026-02-03 13:32:00.016',NULL),('721a7451-1c9e-4c01-a939-24eb513c9bda','KA20260203-FKKRA','f506b92d-3740-429c-9e7e-777a493006d4','luochun15@gmail.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro (测试)',NULL,NULL,1,0.10,0.10,'CANCELLED','alipay',NULL,NULL,NULL,'::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-03 13:17:29.986','2026-02-03 13:48:00.021',NULL,'2026-02-03 13:48:00.020',NULL),('7db420c1-30dd-496e-b072-6ef84ef53d9b','KA20260203SRM2WM',NULL,'admin@kashop.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro (测试)',NULL,NULL,1,0.10,0.10,'COMPLETED','alipay','2026020323001447261435722411','2026-02-03 08:07:37.538','2026-02-03 08:07:37.552','::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-03 08:07:11.673','2026-02-03 08:07:37.553',NULL,NULL,NULL),('7e516fae-edd7-4cef-8ed7-3f9b596392b9','KA20260203Z9JAO2','f506b92d-3740-429c-9e7e-777a493006d4','luochun15@gmail.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro (测试)',NULL,NULL,1,0.10,0.10,'CANCELLED','alipay',NULL,NULL,NULL,'::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-03 13:17:46.237','2026-02-03 13:48:00.021',NULL,'2026-02-03 13:48:00.020',NULL),('a4b3b407-7b58-4d97-a364-da2fb9fa5a0c','KA20260203O9ITXG','f506b92d-3740-429c-9e7e-777a493006d4','luochun15@gmail.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro (测试)','b28946ac-5b3e-4b06-bad5-ca92700c7394','测试',1,0.10,0.10,'COMPLETED','alipay','2026020422001447261431324776','2026-02-03 16:29:53.640','2026-02-03 16:29:53.657','::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-03 16:29:42.667','2026-02-03 16:29:53.658',NULL,NULL,NULL),('a85c1713-6a9f-4d29-8bb9-49b0ecddfba5','KA20260203AAFHM_','f506b92d-3740-429c-9e7e-777a493006d4','luochun15@gmail.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro (测试)',NULL,NULL,1,0.10,0.10,'CANCELLED','usdt',NULL,NULL,NULL,'::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-03 13:18:21.249','2026-02-03 13:49:00.024',0.02,'2026-02-03 13:49:00.023',NULL),('a9baba01-05c2-43d8-97f3-968982a2689b','KA20260202WSQX8O',NULL,'verify@test.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro (测试)',NULL,NULL,1,0.10,0.10,'CANCELLED','alipay',NULL,NULL,NULL,'::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-02 18:44:40.650','2026-02-03 13:32:00.017',NULL,'2026-02-03 13:32:00.016',NULL),('aab296f8-01f9-4ea9-99a4-e4ec01e78c50','KA20260203MIZ1V2','f506b92d-3740-429c-9e7e-777a493006d4','luochun15@gmail.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro (测试)','b28946ac-5b3e-4b06-bad5-ca92700c7394','测试',1,0.10,0.10,'COMPLETED','alipay','2026020423001447261436086486','2026-02-03 16:17:44.066','2026-02-03 17:05:58.986','::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-03 16:17:31.136','2026-02-03 17:05:58.987',NULL,NULL,NULL),('b1cc64f2-8816-4aea-9a51-22d154dbc8ff','KA20260202CBZMYN',NULL,'admin@kashop.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro',NULL,NULL,1,45.00,45.00,'CANCELLED','alipay',NULL,NULL,NULL,'::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-02 18:09:10.277','2026-02-03 13:32:00.017',NULL,'2026-02-03 13:32:00.016',NULL),('b63e6f5a-a0ab-444d-8f69-ed4dbba4b802','KA20260202NVZBRO',NULL,'admin@kashop.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro',NULL,NULL,1,45.00,45.00,'CANCELLED','alipay',NULL,NULL,NULL,'::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-02 16:13:11.893','2026-02-03 13:32:00.017',NULL,'2026-02-03 13:32:00.016',NULL),('ba529b56-80d4-448a-8ab9-aeaeda4310d0','KA20260203B0MO97',NULL,'admin@kashop.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro (测试)',NULL,NULL,1,0.10,0.10,'PAID','alipay','2026020322001447261434458088','2026-02-03 06:41:52.575',NULL,'::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-03 06:41:40.665','2026-02-03 06:41:52.576',NULL,NULL,NULL),('c7c64c64-0bcc-423d-a4c4-9bbfd6f695f6','KA20260202JIBSG2',NULL,'admin@kashop.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro (测试)',NULL,NULL,1,0.10,0.10,'CANCELLED','alipay',NULL,NULL,NULL,'::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-02 19:24:50.053','2026-02-03 13:32:00.017',NULL,'2026-02-03 13:32:00.016',NULL),('c869757b-22f8-40a6-b94a-95c2b254f0e3','KA20260203A149_M',NULL,'admin@kashop.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro (测试)',NULL,NULL,1,0.10,0.10,'COMPLETED','alipay','2026020322001447261431302954','2026-02-03 08:03:05.062','2026-02-03 08:03:05.074','::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-03 08:02:18.285','2026-02-03 08:03:05.074',NULL,NULL,NULL),('cbec728f-5540-4c2a-9036-7158169a9583','KA20260202BUFZBE',NULL,'admin@kashop.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro',NULL,NULL,1,45.00,45.00,'CANCELLED','alipay',NULL,NULL,NULL,'::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-02 16:19:39.861','2026-02-03 13:32:00.017',NULL,'2026-02-03 13:32:00.016',NULL),('e62a4271-4197-4f39-bbd5-7a1b596f1895','KA20260203YMOB0H','f506b92d-3740-429c-9e7e-777a493006d4','luochun15@gmail.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro (测试)',NULL,NULL,1,0.10,0.10,'COMPLETED','alipay','2026020323001447261437754235','2026-02-03 15:59:54.663','2026-02-03 15:59:54.679','::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-03 15:59:42.078','2026-02-03 15:59:54.680',NULL,NULL,NULL),('e8311e7e-0f06-4578-9b81-a4130f49f066','KA20260202KTELWW',NULL,'admin@kashop.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro',NULL,NULL,1,45.00,45.00,'CANCELLED','alipay',NULL,NULL,NULL,'::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-02 18:09:56.653','2026-02-03 13:32:00.017',NULL,'2026-02-03 13:32:00.016',NULL),('f2f2753f-75c1-47c3-9f54-c60364ac3aa8','KA20260202S1D4UE',NULL,'admin@kashop.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro (测试)',NULL,NULL,1,0.10,0.10,'CANCELLED','alipay',NULL,NULL,NULL,'::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-02 19:12:14.753','2026-02-03 13:32:00.017',NULL,'2026-02-03 13:32:00.016',NULL),('f71fa8c3-5d16-4bcd-81c3-e018e7dcae90','KA20260202LFXUOR',NULL,'admin@kashop.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro (测试)',NULL,NULL,1,0.10,0.10,'CANCELLED','alipay',NULL,NULL,NULL,'::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-02 19:30:17.299','2026-02-03 13:32:00.017',NULL,'2026-02-03 13:32:00.016',NULL),('fbeb4fcf-b638-4f36-9871-c4fbca36b166','KA202602037RR96-',NULL,'admin@kashop.com','9d5acd01-5561-4619-8b09-fb54d5e997e7','Gemini Pro (测试)',NULL,NULL,2,0.10,0.20,'CANCELLED','alipay',NULL,NULL,NULL,'::ffff:172.20.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-03 06:12:36.123','2026-02-03 13:32:00.017',NULL,'2026-02-03 13:32:00.016',NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_method` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `trade_no` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','SUCCESS','FAILED','REFUNDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `raw_data` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payments_order_id_key` (`order_id`),
  CONSTRAINT `payments_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES ('12d80c74-e3b3-4190-8ee1-2357282b1319','6e43e3e2-36a8-480b-b6fa-0c127cb5e964','alipay',0.10,NULL,'PENDING',NULL,'2026-02-02 19:01:19.559','2026-02-02 19:01:19.559'),('2d852285-c857-4a05-86a3-6c3f67172b54','a4b3b407-7b58-4d97-a364-da2fb9fa5a0c','alipay',0.10,'2026020422001447261431324776','SUCCESS',NULL,'2026-02-03 16:29:43.687','2026-02-03 16:29:53.639'),('37553024-5190-4e00-9f93-5b1fa00b3c8d','2d8b6c68-bc1c-47b9-8432-90b3b8fcffb9','alipay',0.10,'2026020322001447261434531354','SUCCESS',NULL,'2026-02-03 15:52:55.738','2026-02-03 15:53:08.697'),('3e916476-4789-4f35-a141-f9d42222a536','0956732a-17e8-45df-a065-e0d0b332290e','alipay',0.10,NULL,'PENDING',NULL,'2026-02-03 07:18:30.854','2026-02-03 07:43:34.336'),('3ea61465-3c05-49ed-a79e-0b7c119e5e81','15704838-68e3-4e48-9405-cd10af25eba5','usdt',0.10,NULL,'PENDING',NULL,'2026-02-03 13:50:53.935','2026-02-03 13:50:53.935'),('41b625fe-3faf-48fb-98b0-26cc791d256b','cbec728f-5540-4c2a-9036-7158169a9583','alipay',45.00,NULL,'PENDING',NULL,'2026-02-02 16:28:05.023','2026-02-02 16:28:05.023'),('4c4a005e-421d-4b2f-bbf7-d56d6824cf37','e62a4271-4197-4f39-bbd5-7a1b596f1895','alipay',0.10,'2026020323001447261437754235','SUCCESS',NULL,'2026-02-03 15:59:42.636','2026-02-03 15:59:54.662'),('605b7585-a9c7-4072-b7e3-b2dbf2780a96','12619475-c849-4ccb-aca0-228326bd228e','alipay',0.10,NULL,'PENDING',NULL,'2026-02-03 06:23:42.995','2026-02-03 06:26:17.079'),('672095e6-62e2-48ce-b43a-5da9c9d691bd','aab296f8-01f9-4ea9-99a4-e4ec01e78c50','alipay',0.10,'2026020423001447261436086486','SUCCESS',NULL,'2026-02-03 16:17:31.735','2026-02-03 16:17:44.063'),('6a5a5826-58da-46da-af50-26d1f41cfa51','f2f2753f-75c1-47c3-9f54-c60364ac3aa8','alipay',0.10,NULL,'PENDING',NULL,'2026-02-02 19:12:16.700','2026-02-02 19:12:16.700'),('7548d426-3a3d-4d74-b98e-8139b1033000','56cfb364-9ddb-4a55-a345-b9bc7665b653','alipay',0.10,'2026020323001447261434588749','SUCCESS',NULL,'2026-02-03 07:52:51.800','2026-02-03 07:53:03.423'),('76fc0358-836e-4d33-8d22-adb5df143de2','106adb60-c4ee-478a-878c-ec6ff927253f','alipay',0.10,'2026020322001447261434001415','SUCCESS',NULL,'2026-02-03 13:42:51.210','2026-02-03 13:46:04.654'),('7d0be0a2-6296-4e30-8b56-1255dbed99f6','fbeb4fcf-b638-4f36-9871-c4fbca36b166','alipay',0.20,NULL,'PENDING',NULL,'2026-02-03 06:12:39.131','2026-02-03 06:12:39.131'),('80723a29-8e03-40d5-baef-16ec7cc4de4b','1a702609-6adf-4538-84ca-dc7eb0d0af07','alipay',0.10,'2026020422001447261434535065','SUCCESS',NULL,'2026-02-03 16:05:57.355','2026-02-03 16:06:05.525'),('9a56a3a4-32a0-4baf-905d-3462dcb71908','7db420c1-30dd-496e-b072-6ef84ef53d9b','alipay',0.10,'2026020323001447261435722411','SUCCESS',NULL,'2026-02-03 08:07:23.807','2026-02-03 08:07:37.537'),('a4cb50a2-f271-4c09-8243-59c0033aaeec','c869757b-22f8-40a6-b94a-95c2b254f0e3','alipay',0.10,'2026020322001447261431302954','SUCCESS',NULL,'2026-02-03 08:02:51.032','2026-02-03 08:03:05.060'),('a4fb553d-2bf0-4f5f-989b-11f684d599fd','721a7451-1c9e-4c01-a939-24eb513c9bda','alipay',0.10,NULL,'PENDING',NULL,'2026-02-03 13:17:30.560','2026-02-03 13:18:53.690'),('a8be106e-cbea-49bf-83da-b5a847103be0','c7c64c64-0bcc-423d-a4c4-9bbfd6f695f6','alipay',0.10,NULL,'PENDING',NULL,'2026-02-02 19:24:52.035','2026-02-02 19:24:52.035'),('b354c5c6-24f7-4f51-9f22-3165c13ff6be','1cd53717-73ed-4790-99d9-cc692ecb30cc','alipay',0.10,'2026020322001447261431300311','SUCCESS',NULL,'2026-02-03 10:01:12.151','2026-02-03 10:01:50.689'),('bac433e0-544a-4f0d-a1ef-73aa5fcc5cee','321183af-3f59-4cf5-b3e5-7f3728a09597','alipay',0.10,NULL,'PENDING',NULL,'2026-02-03 06:39:23.306','2026-02-03 06:39:23.306'),('bb909d42-cb8a-4d88-be32-4695ef5b9e4c','7e516fae-edd7-4cef-8ed7-3f9b596392b9','alipay',0.10,NULL,'PENDING',NULL,'2026-02-03 13:17:46.922','2026-02-03 13:17:46.922'),('bf5b0027-a309-4a87-bfd2-cb2753ad0958','a9baba01-05c2-43d8-97f3-968982a2689b','alipay',0.10,NULL,'PENDING',NULL,'2026-02-02 18:53:59.700','2026-02-02 18:53:59.700'),('cc462ba8-8e3e-4b9e-972d-a61590d7fa24','a85c1713-6a9f-4d29-8bb9-49b0ecddfba5','usdt',0.10,NULL,'PENDING',NULL,'2026-02-03 13:18:21.801','2026-02-03 13:18:21.801'),('dda38697-b29e-42b4-ad15-95a3433a6bab','6f5af94c-489f-4222-96e7-eef0a1a4524f','usdt',0.20,NULL,'PENDING',NULL,'2026-02-03 12:44:26.885','2026-02-03 13:11:38.571'),('e454d4bf-801d-4403-895a-23f7d7984eee','f71fa8c3-5d16-4bcd-81c3-e018e7dcae90','alipay',0.10,NULL,'PENDING',NULL,'2026-02-02 19:30:19.332','2026-02-02 19:30:19.332'),('fd8f9d95-91f6-46d4-8012-c4a3af0565f4','ba529b56-80d4-448a-8ab9-aeaeda4310d0','alipay',0.10,'2026020322001447261434458088','SUCCESS',NULL,'2026-02-03 06:41:42.930','2026-02-03 06:41:52.573');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `sort_order` int NOT NULL DEFAULT '0',
  `status` enum('ACTIVE','INACTIVE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_variants_product_id_fkey` (`product_id`),
  CONSTRAINT `product_variants_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
INSERT INTO `product_variants` VALUES ('0e168618-1209-497a-95bc-e41fa8e1c2e9','4984fee1-b71b-4e84-bb29-e67738dbf9bc','一年',160.00,NULL,83,11,'ACTIVE','2026-02-04 21:15:53.616','2026-02-04 21:15:53.616','500G'),('0f090920-9606-45c8-b72d-39c393834efe','c17745fe-6678-4aac-bff5-e4445f5f7af7','2023年随机IP',7.80,NULL,32,0,'ACTIVE','2026-02-04 21:27:07.284','2026-02-04 21:27:07.284',NULL),('0fa4a913-fb87-47af-9932-cab0fb438c24','f3d04c8b-c851-4f5e-bd90-f7bbefe638a5','半年',85.00,NULL,37,2,'ACTIVE','2026-02-04 21:18:58.831','2026-02-04 21:18:58.831',NULL),('1983842d-6158-45fc-8306-24187d08a121','4984fee1-b71b-4e84-bb29-e67738dbf9bc','半年',30.00,NULL,43,1,'ACTIVE','2026-02-04 21:15:53.616','2026-02-04 21:15:53.616','100G'),('23ce96d9-7761-4564-87ec-85b14e4bf936','c17745fe-6678-4aac-bff5-e4445f5f7af7','22-24年美区',8.80,NULL,23,1,'ACTIVE','2026-02-04 21:27:07.284','2026-02-04 21:27:07.284',NULL),('2d194560-dd85-4c31-a9de-9e39c957c689','80c57e7d-917e-4524-9db5-647d46e4b8a7','半年',62.00,NULL,28,2,'ACTIVE','2026-02-04 21:22:04.629','2026-02-04 21:22:04.629',NULL),('39d5a59f-f705-4f8f-98e6-9437b9d00bfd','12059dcb-222a-4565-943c-3fe669edb6f6','一年',50.00,NULL,38,1,'ACTIVE','2026-02-04 21:06:26.141','2026-02-04 21:06:26.141','国区'),('3ba346a8-0d21-4b48-9d64-ade7298c6b9c','4984fee1-b71b-4e84-bb29-e67738dbf9bc','半年',40.00,NULL,43,4,'ACTIVE','2026-02-04 21:15:53.616','2026-02-04 21:15:53.616','200G'),('459e25c3-a909-4ea4-8c57-1a04ff710724','1ba2caf3-1e77-4f41-be5b-b9a097ff9c78','半年',70.00,NULL,82,0,'ACTIVE','2026-02-04 21:42:02.447','2026-02-04 21:42:02.447','随机IP'),('48cae2c0-9caa-4883-b10f-db19f5431bab','426ca931-18e6-4429-9204-98b39fcc36dc','半年',88.00,NULL,83,2,'ACTIVE','2026-02-04 21:45:11.222','2026-02-04 21:45:11.222',NULL),('54d274c6-117c-48bf-a874-06aef331375f','4984fee1-b71b-4e84-bb29-e67738dbf9bc','季度',25.00,NULL,34,6,'ACTIVE','2026-02-04 21:15:53.616','2026-02-04 21:15:53.616','300G'),('55905650-1d93-4984-958e-d1a7e4abc228','426ca931-18e6-4429-9204-98b39fcc36dc','季度',45.00,NULL,43,1,'ACTIVE','2026-02-04 21:45:11.222','2026-02-04 21:45:11.222',NULL),('55c5bd31-839e-4edd-9f48-821f593ee1ff','80c57e7d-917e-4524-9db5-647d46e4b8a7','一年',155.00,NULL,82,3,'ACTIVE','2026-02-04 21:22:04.629','2026-02-04 21:22:04.629',NULL),('5705c260-7456-451f-8fab-8313ed6a18fc','4984fee1-b71b-4e84-bb29-e67738dbf9bc','半年',50.00,NULL,43,7,'ACTIVE','2026-02-04 21:15:53.616','2026-02-04 21:15:53.616','300G'),('586b5bbc-87fd-476c-bb36-9e7fc9da75ff','f67a7ec4-e65a-4cbe-b757-b8d83656eaa6','新号',30.00,0.00,28,0,'ACTIVE','2026-02-04 20:57:54.529','2026-02-04 20:57:54.529',NULL),('58b583d5-8a20-4657-8bed-5a7455ef5e4d','77e2095a-7a1f-4ef7-bb8a-dd982f55a2f6','月卡',50.00,NULL,28,4,'ACTIVE','2026-02-04 21:37:32.393','2026-02-04 21:37:32.393','独享'),('5eb51c0e-2d08-4b59-944f-feb97b3d4421','77e2095a-7a1f-4ef7-bb8a-dd982f55a2f6','季度',150.00,NULL,38,5,'ACTIVE','2026-02-04 21:37:32.393','2026-02-04 21:37:32.393','独享'),('629d0050-69c3-4fed-9def-8c61d3f5c868','12059dcb-222a-4565-943c-3fe669edb6f6','一年',150.00,NULL,73,4,'ACTIVE','2026-02-04 21:06:26.141','2026-02-04 21:06:26.141','美区'),('6644b221-ad5f-4810-9157-f97a840ead67','4984fee1-b71b-4e84-bb29-e67738dbf9bc','季度',20.00,NULL,34,3,'ACTIVE','2026-02-04 21:15:53.616','2026-02-04 21:15:53.616','200G'),('6653f4a4-05b6-4c1b-8744-002eed4aae1f','77e2095a-7a1f-4ef7-bb8a-dd982f55a2f6','一年',550.00,NULL,82,7,'ACTIVE','2026-02-04 21:37:32.393','2026-02-04 21:37:32.393','独享'),('7328d665-33f1-4a4b-b741-e0777172ff00','4984fee1-b71b-4e84-bb29-e67738dbf9bc','一年',60.00,NULL,34,2,'ACTIVE','2026-02-04 21:15:53.616','2026-02-04 21:15:53.616','100G'),('73cdb098-e41a-45f5-8dcc-410bcb3647f4','77e2095a-7a1f-4ef7-bb8a-dd982f55a2f6','半年',300.00,NULL,82,6,'ACTIVE','2026-02-04 21:37:32.393','2026-02-04 21:37:32.393','独享'),('74aa7ef3-e710-4f4a-b6f9-1523c35f907e','4984fee1-b71b-4e84-bb29-e67738dbf9bc','季度',60.00,NULL,28,12,'ACTIVE','2026-02-04 21:15:53.616','2026-02-04 21:15:53.616','1TB'),('75e558c9-dbd8-471e-b23d-0d4d3290b3e8','08493870-1db1-4e59-a42d-16c77f113aa3','半年',30.00,NULL,87,0,'ACTIVE','2026-02-04 21:32:38.151','2026-02-04 21:32:38.151','家庭组'),('7c5b35ef-f4e5-4392-903a-971e012109e7','77e2095a-7a1f-4ef7-bb8a-dd982f55a2f6','一年',98.00,NULL,23,3,'ACTIVE','2026-02-04 21:37:32.393','2026-02-04 21:37:32.393','家庭组'),('827ba0db-2ce2-4752-accf-7da82069cf3c','08493870-1db1-4e59-a42d-16c77f113aa3','一年',120.00,NULL,38,2,'ACTIVE','2026-02-04 21:32:38.151','2026-02-04 21:32:38.151','个人'),('8a423e9b-e972-4947-b581-db01c4a3b1b8','4984fee1-b71b-4e84-bb29-e67738dbf9bc','半年',80.00,NULL,23,10,'ACTIVE','2026-02-04 21:15:53.616','2026-02-04 21:15:53.616','500G'),('8c28f951-67d8-4109-9118-3c9448e806a3','4984fee1-b71b-4e84-bb29-e67738dbf9bc','一年',220.00,NULL,73,14,'ACTIVE','2026-02-04 21:15:53.616','2026-02-04 21:15:53.616','1TB'),('8c37c93d-c4ae-49b2-a095-929aecd480ca','4984fee1-b71b-4e84-bb29-e67738dbf9bc','季度',15.00,NULL,43,0,'ACTIVE','2026-02-04 21:15:53.616','2026-02-04 21:15:53.616','100G'),('905b6851-74a3-483c-8042-12694b467636','1ba2caf3-1e77-4f41-be5b-b9a097ff9c78','半年',90.00,NULL,82,2,'ACTIVE','2026-02-04 21:42:02.447','2026-02-04 21:42:02.447','美区'),('9e1c48fd-626c-4329-844e-b5ef7c822b52','80c57e7d-917e-4524-9db5-647d46e4b8a7','一个月',12.00,NULL,32,0,'ACTIVE','2026-02-04 21:22:04.629','2026-02-04 21:22:04.629',NULL),('a8cc42c3-3edb-4ff5-8823-e77af5d4cc76','80c57e7d-917e-4524-9db5-647d46e4b8a7','季度',33.00,NULL,23,1,'ACTIVE','2026-02-04 21:22:04.629','2026-02-04 21:22:04.629',NULL),('a91a298f-32fd-444d-92de-71e491f2f00d','12059dcb-222a-4565-943c-3fe669edb6f6','季度',15.00,NULL,76,0,'ACTIVE','2026-02-04 21:06:26.141','2026-02-04 21:06:26.141','国区'),('ad1403ba-d873-44ea-af35-dbf976e8d6c5','4984fee1-b71b-4e84-bb29-e67738dbf9bc','半年',120.00,NULL,82,13,'ACTIVE','2026-02-04 21:15:53.616','2026-02-04 21:15:53.616','1TB'),('ad675539-163f-48c2-bb0c-880d436007ec','f3d04c8b-c851-4f5e-bd90-f7bbefe638a5','季度',45.00,NULL,92,1,'ACTIVE','2026-02-04 21:18:58.831','2026-02-04 21:18:58.831',NULL),('aee11c99-d56d-4436-b2c4-50ed225c2f3e','1ba2caf3-1e77-4f41-be5b-b9a097ff9c78','一年',135.00,NULL,89,1,'ACTIVE','2026-02-04 21:42:02.447','2026-02-04 21:42:02.447','随机IP'),('b272bd10-cdee-49cf-9f31-e9f9c8a18d2a','1ba2caf3-1e77-4f41-be5b-b9a097ff9c78','一年',168.00,NULL,92,3,'ACTIVE','2026-02-04 21:42:02.447','2026-02-04 21:42:02.447','美区'),('ba808230-c682-4b4c-9489-52578b47e6d2','426ca931-18e6-4429-9204-98b39fcc36dc','月卡',15.50,NULL,21,0,'ACTIVE','2026-02-04 21:45:11.222','2026-02-04 21:45:11.222',NULL),('bc87f75f-c14e-4b74-94ba-fa8e31c1e07b','f3d04c8b-c851-4f5e-bd90-f7bbefe638a5','月卡',15.90,NULL,37,0,'ACTIVE','2026-02-04 21:18:58.831','2026-02-04 21:18:58.831',NULL),('bdf01a06-64f6-4579-8751-386ab60bb237','12059dcb-222a-4565-943c-3fe669edb6f6','季度',50.00,NULL,53,2,'ACTIVE','2026-02-04 21:06:26.141','2026-02-04 21:06:26.141','美区'),('c5c3e250-4d05-44a5-a01d-3dd19217e02a','f67a7ec4-e65a-4cbe-b757-b8d83656eaa6','老号',45.00,NULL,53,1,'ACTIVE','2026-02-04 20:57:54.529','2026-02-04 20:57:54.529',NULL),('c88c99ce-3be8-4731-9e8f-227ae8c8d41b','426ca931-18e6-4429-9204-98b39fcc36dc','一年',160.00,NULL,83,3,'ACTIVE','2026-02-04 21:45:11.222','2026-02-04 21:45:11.222',NULL),('d7d6b903-d9c6-442d-b335-503cc3495e97','f3d04c8b-c851-4f5e-bd90-f7bbefe638a5','一年',150.00,NULL,83,3,'ACTIVE','2026-02-04 21:18:58.831','2026-02-04 21:18:58.831',NULL),('de6746cb-6bd0-4c9c-9bb0-a13e846259f6','4984fee1-b71b-4e84-bb29-e67738dbf9bc','季度',40.00,NULL,32,9,'ACTIVE','2026-02-04 21:15:53.616','2026-02-04 21:15:53.616','500G'),('e48d1c62-8a4b-4114-b794-df4e7ae8c8d7','12059dcb-222a-4565-943c-3fe669edb6f6','半年',90.00,NULL,188,3,'ACTIVE','2026-02-04 21:06:26.141','2026-02-04 21:06:26.141','美区'),('e4c78ef0-7d2a-4854-8309-ba44edb5a11d','c17745fe-6678-4aac-bff5-e4445f5f7af7','22-24年随机IP',7.30,NULL,43,2,'ACTIVE','2026-02-04 21:27:07.284','2026-02-04 21:27:07.284',NULL),('e52d0143-f21a-495c-8140-93a9339c171b','4984fee1-b71b-4e84-bb29-e67738dbf9bc','一年',80.00,NULL,38,5,'ACTIVE','2026-02-04 21:15:53.616','2026-02-04 21:15:53.616','200G'),('e65f2e9b-30e1-45dd-acc8-6a4887d859bf','08493870-1db1-4e59-a42d-16c77f113aa3','一年',55.00,NULL,72,1,'ACTIVE','2026-02-04 21:32:38.151','2026-02-04 21:32:38.151','家庭组'),('e89488e5-53a4-4d4e-b604-a30f1efafed1','4984fee1-b71b-4e84-bb29-e67738dbf9bc','一年',100.00,NULL,82,8,'ACTIVE','2026-02-04 21:15:53.616','2026-02-04 21:15:53.616','300G'),('ee9cee33-f29a-4441-a523-af895c20f8d4','77e2095a-7a1f-4ef7-bb8a-dd982f55a2f6','季度',25.00,NULL,87,1,'ACTIVE','2026-02-04 21:37:32.393','2026-02-04 21:37:32.393','家庭组'),('ef2a0f23-c6bc-42cb-84bd-7c51aa26c425','77e2095a-7a1f-4ef7-bb8a-dd982f55a2f6','月卡',9.00,NULL,21,0,'ACTIVE','2026-02-04 21:37:32.393','2026-02-04 21:37:32.393','家庭组'),('fabbd6be-5729-4926-9531-8890b263f600','77e2095a-7a1f-4ef7-bb8a-dd982f55a2f6','半年',47.00,NULL,73,2,'ACTIVE','2026-02-04 21:37:32.393','2026-02-04 21:37:32.393','家庭组');
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `full_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `sold_count` int NOT NULL DEFAULT '0',
  `image` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `images` json DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category_id`),
  CONSTRAINT `products_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES ('08493870-1db1-4e59-a42d-16c77f113aa3','软件激活','多邻国Super会员','多邻国DuoLingGo超级会员，官方正规渠道','本商品为 多邻国 Duolingo Super 会员，通过官方正规渠道开通。\n开通后可解锁多邻国完整高级功能，提升学习体验，适合长期语言学习用户。\n⭐ 无广告学习体验\n💗 无限爱心（错误不扣学习进度）\n📚 解锁高级课程与练习\n📊 学习进度与能力强化功能',30.00,NULL,197,0,'/uploads/products/1770240755058_83bb7026ab25c8eb.png','[\"/uploads/products/1770240755058_83bb7026ab25c8eb.png\"]','[\"热销\"]','ACTIVE',0,'2026-02-04 21:32:38.151','2026-02-04 21:32:38.151'),('12059dcb-222a-4565-943c-3fe669edb6f6',NULL,'APPLE MUSIC 会员','Apple Music 苹果音乐家庭组拼车','高效便捷 实时发货\nApple Music：1亿首歌曲，全无广告干扰（美区一亿首歌曲，国区一千万首）\n\n根据地区选择对应规格\n\n1.苹果安卓均可加入\n2.要求没有加入别人的家庭组\n\n注意事项：美区需自备美区账号，且没加入其他家庭拼车',15.00,NULL,428,0,'/uploads/products/1770239184550_f0b4c4c93214592f.jpeg','[\"/uploads/products/1770239184550_f0b4c4c93214592f.jpeg\"]','[\"热销\", \"拼车\"]','ACTIVE',0,'2026-02-04 21:06:01.687','2026-02-04 21:06:26.138'),('1ba2caf3-1e77-4f41-be5b-b9a097ff9c78','音乐会员','Spotify Premium 会员','Spotify高级会员，无广告畅听，支持离线下载','【商品说明】\n本商品为 Spotify Premium 高级会员服务，开通后可畅享 Spotify 全部会员功能，适合日常听歌、通勤、学习、工作等场景使用。\n🎵 海量正版音乐资源\n🚫 无广告打扰\n📶 支持离线下载\n🔊 高音质播放体验\n【发货与使用方式】\n下单后根据页面提示获取会员使用方式\n使用指定 Spotify 账号登录或绑定\n登录成功后即可享受 Premium 会员权益\n本商品为虚拟服务，自动或人工发货',70.00,NULL,345,0,'/uploads/products/1770241281434_6839fef0669a19d7.jpg','[\"/uploads/products/1770241281434_6839fef0669a19d7.jpg\"]','[\"热销\", \"音乐\"]','ACTIVE',0,'2026-02-04 21:42:02.447','2026-02-04 21:42:02.447'),('25d505fb-8e11-40c7-bb2d-905c862899ec','软件激活','Notion Plus Edu教育版','EDU邮箱+教程升级','【拍下秒发】Notion 原账号升级 永久Edu plus 会员无需转移资料 定制 教育邮箱 Notion Edu Plus 无限存储\n\n直接给你edu邮箱，随机前缀。支持Notion原账号升级，同时支持新账号注册，带教程，新手无忧操作\n\n⬆️服务升级\n⭐️升级Notion教育版：\n原账号升级，无需转移资料，邮箱更换为教育邮箱。后续使用教育邮箱+密码或验证码登录\n。\nQ问：可以用多久？\nA答：邮箱域名有效期已续费10年（最长期限），而且还继续自动续费，Notion政策不变就一直可以用，无后顾之忧。\n\nNotion免费版和教育增强版的区别如下:\n• 上传文件无限制（免费版单文件限制为5mb）\n• 数据库自动化（免费版只有基础的按钮功能）\n• 解锁30天历史功能（免费版只有7天）\n• 访客数量100（免费版限制10个）\n• 拥有可自定义的公共主页 notion.site 域名（免费版无此功能）\n• 无限的同步数据库功能（免费版限制为1个）\n\n直接把你原来的Notion工作区升级为教育版，无需转移资料，无痛升级。\n\nNotion教育版是Notion官方给学生和教育工作者的优惠福利，属于官方合规渠道。',7.00,NULL,453,0,'/uploads/products/1770241652463_9b2819384469b026.png','[\"/uploads/products/1770241652463_9b2819384469b026.png\"]','[\"推荐\"]','ACTIVE',0,'2026-02-04 21:47:35.227','2026-02-04 21:47:35.227'),('426ca931-18e6-4429-9204-98b39fcc36dc','视频会员','Netflix 高级会员','美区Netflix Premium会员｜4K超高清画质｜多设备','【商品说明】\n本商品为 美区 Netflix Premium 高级会员服务，支持 4K 超高清画质与多设备同时观看。\n内容资源丰富，适合追剧、电影、家庭娱乐等使用场景。\n🇺🇸 美区 Netflix 会员\n🎬 支持 4K Ultra HD 超高清\n📱 多设备同时观看\n🚫 无广告，纯净观影体验\n【发货与使用方式】\n下单后按页面提示获取账号信息 / 使用方式\n使用提供的账号登录 Netflix\n登录成功后即可观看 Premium 会员内容\n虚拟商品，系统自动或人工发货',15.50,NULL,230,0,'/uploads/products/1770241509542_213731f9038abae7.jpg','[\"/uploads/products/1770241509542_213731f9038abae7.jpg\"]','[\"热销\", \"4K\"]','ACTIVE',0,'2026-02-04 21:45:11.222','2026-02-04 21:45:11.222'),('4984fee1-b71b-4e84-bb29-e67738dbf9bc','社交账号','iPhone iCloud储存空间2T','iCloud扩容家庭共享拼车2T','苹果设备专属云端扩容服务，家庭组共享大容量存储，每人独立空间，照片/文件备份不卡顿，隐私数据互不可见。\n\n拍下后自动发操作指引，无需等待\n5分钟内就能加入，立刻使用，新手也能快速上手',15.00,NULL,715,0,'/uploads/products/1770239751775_5e3dd0b37cf45e9d.png','[\"/uploads/products/1770239751775_5e3dd0b37cf45e9d.png\"]','[\"热销\", \"拼车\"]','ACTIVE',0,'2026-02-04 21:14:35.530','2026-02-04 21:15:53.614'),('77e2095a-7a1f-4ef7-bb8a-dd982f55a2f6','视频会员','Disney+ Plus','Disney+ Plus，全区可用，不限内容','【会员权益】\nDisney+迪士尼+拼车车位，全区可用，不限内容，4K HDR，支持R18+ R21+，全设备都能用，独立车位，可设PIN码，中文字幕，漫威、星战、泰勒、国家地理等热门内容都能看。\n\n24小时自动发货，秒到账号，操作简单，省心省力。虚拟商品，一经发货不退不换，拍下即视为同意。',9.00,NULL,434,0,'/uploads/products/1770241050382_3aeb983c3445b01f.jpg','[\"/uploads/products/1770241050382_3aeb983c3445b01f.jpg\"]','[\"4K\", \"HDR\"]','ACTIVE',0,'2026-02-04 21:37:32.393','2026-02-04 21:37:32.393'),('80c57e7d-917e-4524-9db5-647d46e4b8a7','软件激活','Photoshop2026 AI填充','PS AI填充扩图正版 WIN|MAC 通用','【产品亮点】\n1. 官方正版授权 - 支持软件任意升级更新\n2. 双设备同时在线（Win/Mac/iOS全兼容）\n3. 免复杂激活 - 登录即用全套软件\n【服务承诺】\n下单马上 自动发货\n7x12小时在线技术指导\n注意：本产品为Adobe官方订阅账号，非破解版/共享账号\n【常见问题】\n问：能使用官方创建式AI？\n答：可以,百分百独享生成AI积分\n问：能更新软件吗？\n答：支持Creative Cloud所有版本更新\n问：支持多少设备登录？\n答：这是独享账号,你可以在2个不同设备使用\n问：保证使用天数？\n答：保证买多久质保多久',12.00,NULL,165,0,'/uploads/products/1770240122129_1d02985b9999411a.webp','[\"/uploads/products/1770240122129_1d02985b9999411a.webp\"]','[\"AI\", \"正版\"]','ACTIVE',0,'2026-02-04 21:22:04.629','2026-02-04 21:22:04.629'),('9d5acd01-5561-4619-8b09-fb54d5e997e7','683a940d-6bba-4eec-972d-3c32abaca526','Gemini Pro','Gemini3.0Pro 一年成品号现货秒发','Gemini3.0Pro 一年成品号现货秒发\n\n老号稳定性和持久性都是新号比不了的，新号用不了两个月就没了,质保一年！\n\n账号不回收，带一年geminipro会员，独享可改密可换绑。可用Nano banana,可用Veo3.1！3.0pro！\n\n质量保障在线秒发，质保一年！稳定不跑路！\n\n也可升级自己号 不知道怎么升级自己号的可以问我\n\n✅ 官方渠道正品，享受 Gemini 3、nano banana pro 模型 有效期一年\n✅ 不占号，非共享，完全属于你\n✅ 售后支持，官方验证\n✅ 立即开通，方便快捷\n✅ 老号，稳定不封号（非常重要）\n\n独享账号可登入可改密 可添加二次验证\n手搓成品号+到手直接使用。质保一年，出问题直接换新',88.00,200.00,128,8,'/uploads/products/1770025986640_a143a3f001b5e50c.jpg','[\"/uploads/products/1770025986640_a143a3f001b5e50c.jpg\", \"/uploads/products/1770025986641_835f14bf6c628369.png\"]','[\"AI，热销\"]','ACTIVE',0,'2026-01-31 17:52:13.101','2026-02-03 18:26:32.310'),('c17745fe-6678-4aac-bff5-e4445f5f7af7','软件激活','Google Account 谷歌Gmail','谷歌Gmail邮箱账号｜可改密｜2FA','本商品为 Google Account 谷歌 Gmail 邮箱账号，可正常登录 Google 全套服务。\n账号状态正常，支持修改密码，并可自行绑定 2FA 两步验证，安全性高，适合长期使用。\n📧 Gmail 邮箱服务\n🔐 支持修改密码\n🔑 支持开启 / 绑定 2FA\n🌍 可用于 Google 相关产品与服务\n\n【使用方法】\n1、使用提供的账号信息登录 Gmail / Google\n2、登录成功后 第一时间修改密码\n3、按需绑定手机号或开启 2FA 两步验证\n4、正常使用邮箱及 Google 相关服务\n【使用须知】\n虚拟商品，一经发货 非质量问题不支持退款\n请勿用于任何违法、违规用途\n请及时登录并修改密码，避免长期不使用\n因用户自身操作、平台风控等原因导致的问题，卖家不承担责任\n【适用场景】\n海外平台账号注册\nGoogle 服务使用\n备用邮箱 / 工作邮箱\n隐私保护，避免使用主邮箱',7.30,NULL,98,0,'/uploads/products/1770240426043_133bbffb2677f54d.webp','[\"/uploads/products/1770240426043_133bbffb2677f54d.webp\"]','[\"推荐\"]','ACTIVE',0,'2026-02-04 21:27:07.284','2026-02-04 21:27:07.284'),('caec3922-010e-4810-8fd7-cf5fce5b1256','683a940d-6bba-4eec-972d-3c32abaca526','Cursor Pro 一年','一年cursor Pro 现价低到骨折｜独享EDU可改密','可改密！质保6个月！cursor直登！！！\n不需要任何东西，直接登录可以使用\n一年cursor Pro=官方240美金，现价低到骨折｜独享EDU可改密｜无限Auto\n\n官方价值约240美元/年，这里一口价搞定一年权益\n真实EDU认证，账号独享可改密，安全性>共号/拼车\n无限Tab补全、Auto/Agents全开，研发/写作/脚本效率倍增\n赠EDU邮箱：学生折扣平台通用，1个月即可回本\n质保 6 个月\n\n质保要求：质保6月，不能使用再补一个。只要是正常使用被封禁的情况下才给补，如以使用超额量扣费不成而不能使用的账号情况下，不补',300.00,1600.00,28,0,'/uploads/products/1770143106120_1222ba9210c28001.png','[\"/uploads/products/1770143106120_1222ba9210c28001.png\"]','[\"AI\"]','ACTIVE',0,'2026-02-03 18:25:09.563','2026-02-03 18:26:57.710'),('f3d04c8b-c851-4f5e-bd90-f7bbefe638a5','视频会员','Emby影视库 ','直连｜4K｜HDR｜Emby影视库','EMBY影视库超值！稳定运行数年，有稳定活跃会员群！适合tv+、安卓TV及Mac、PC、iPhone、安卓手机平板等设备！\n【本影视库优势】：\n1.更新快又多，平均每天更新上百集、部剧集和电影；\n2.支持直连，无需各类科学工具；\n3.价格亲民，性价比高，充值年度会员更超值；\n\n汇集全球各地影视综艺纪录片，天天看不重样！',15.90,NULL,249,0,'/uploads/products/1770239936951_a855903c09b9b89b.png','[\"/uploads/products/1770239936951_a855903c09b9b89b.png\"]','[\"4K\", \"HDR\"]','ACTIVE',0,'2026-02-04 21:18:58.831','2026-02-04 21:18:58.831'),('f67a7ec4-e65a-4cbe-b757-b8d83656eaa6','社交账号','Google Voice 虚拟手机号','Google提供的美国虚拟号，支持接收短信和通话，购买后即可使用','【商品特点】\n🇺🇸 美国虚拟号码\n📩 支持短信验证码\n📞 支持拨打 / 接听电话\n📦 自动发货，到账即用\n【使用说明】\n请勿用于违法或违规用途\n避免长期不登录或异常操作\n【适用场景】\n账号注册 / 验证码接收 / 海外平台使用\n【特殊说明】\n老号GV更容易转移到自己的Google账号',30.00,NULL,81,0,'/uploads/products/1770238671728_dc62c53f5e60815b.jpeg','[\"/uploads/products/1770238671728_dc62c53f5e60815b.jpeg\"]','[]','ACTIVE',0,'2026-02-04 20:57:54.529','2026-02-04 20:57:54.529');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_key_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES ('032e1a6c-9db4-4b5b-9a61-d19a8867d992','usdtEnabled','true',NULL,'2026-02-03 09:31:25.631','2026-02-03 15:24:49.662'),('06e68738-c5f5-4f12-b65f-b637a41fa3d6','contactEmail','support@kashop.com',NULL,'2026-02-03 09:31:25.621','2026-02-03 15:24:49.651'),('0dae8064-05cd-4a56-bedc-3531384194b5','stockMode','manual',NULL,'2026-02-03 15:24:49.675','2026-02-03 15:24:49.675'),('0ef732d2-700d-45ef-9f7e-90cba05c0bfd','emailNotify','true',NULL,'2026-02-03 09:31:25.653','2026-02-03 15:24:49.689'),('1249cc8e-7048-4e7c-8a3a-f9053d0a3e1b','orderTimeout','30',NULL,'2026-02-03 09:31:25.633','2026-02-03 15:24:49.670'),('2f25854a-35ae-4d8b-80a8-9cfe83b19a7c','autoCancel','true',NULL,'2026-02-03 09:31:25.635','2026-02-03 15:24:49.673'),('30b7b7be-3975-4184-aee7-98f2f29344fd','delayedDeliveryMinutes','5',NULL,'2026-02-03 09:31:25.641','2026-02-03 15:24:49.692'),('5b210b71-79bb-426a-8864-5f0b53ec03b1','smtpPort','465',NULL,'2026-02-03 09:31:25.645','2026-02-03 15:24:49.681'),('5f0b4f19-5286-4e3a-bde0-52677dcada48','usdtExchangeRate','7',NULL,'2026-02-03 12:37:10.148','2026-02-03 15:24:49.667'),('64863b83-e73d-4004-9c4b-a4eea31de041','siteDescription','虚拟物品自动发卡平台',NULL,'2026-02-03 09:31:25.618','2026-02-03 15:24:49.648'),('7dba1b1e-589c-4ba0-8fae-cfab33eaf810','siteName','HaoDongXi',NULL,'2026-02-03 09:31:25.612','2026-02-03 15:24:49.641'),('b145eb2e-100e-48f8-a037-3233b1c0c571','smtpHost','smtp.qiye.aliyun.com',NULL,'2026-02-03 09:31:25.643','2026-02-03 15:24:49.678'),('b2f21e58-893f-40b3-adef-3be1fa3e936a','usdtWalletAddress','TEszBT21BfCaCZVhXeGVfYBnYq9pwLUkmW',NULL,'2026-02-03 12:37:10.143','2026-02-03 15:24:49.665'),('bba58c6d-14cd-41b4-b180-4f00f7ad25ca','wechatEnabled','false',NULL,'2026-02-03 09:31:25.628','2026-02-03 15:24:49.658'),('bff64b8f-e90d-4bb1-a8d9-ccae82e3d8fb','smtpUser','support@haodongxi.shop',NULL,'2026-02-03 09:31:25.647','2026-02-03 15:24:49.683'),('c04e71c7-2fbc-41b8-8816-c9ec6deb31cd','delayedDelivery','false',NULL,'2026-02-03 09:31:25.638','2026-02-03 15:24:49.695'),('db7193c4-4c0d-4276-ae4b-7b0151cf9e8e','alipayEnabled','true',NULL,'2026-02-03 09:31:25.625','2026-02-03 15:24:49.655'),('e3408165-18ee-4f49-8e6d-205bf8fb590e','smtpPass','Pure31415926.',NULL,'2026-02-03 09:31:25.649','2026-02-03 15:24:49.686');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_messages`
--

DROP TABLE IF EXISTS `ticket_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_messages` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ticket_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_admin` tinyint(1) NOT NULL DEFAULT '0',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `images` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ticket_messages_ticket_id_fkey` (`ticket_id`),
  KEY `ticket_messages_sender_id_fkey` (`sender_id`),
  CONSTRAINT `ticket_messages_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ticket_messages_ticket_id_fkey` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_messages`
--

LOCK TABLES `ticket_messages` WRITE;
/*!40000 ALTER TABLE `ticket_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `ticket_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ticket_no` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_no` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('ORDER_ISSUE','CARD_ISSUE','REFUND','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('OPEN','IN_PROGRESS','CLOSED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OPEN',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `closed_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tickets_ticket_no_key` (`ticket_no`),
  KEY `tickets_user_id_fkey` (`user_id`),
  KEY `tickets_order_id_fkey` (`order_id`),
  CONSTRAINT `tickets_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `tickets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('USER','ADMIN') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USER',
  `avatar` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `verification_token` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `reset_token` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_token_expiry` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('42f4723f-4635-4e36-88bd-9518a013e320','admin@kashop.com','$2a$10$w8qlHyRyuSyaIIRqYt613e56OCaQmXDGAYg5l6ZonLsvlKQuy3Yjm','Admin','ADMIN',NULL,0,NULL,'2026-01-23 15:48:25.914','2026-01-23 15:48:25.914',NULL,NULL),('90117b77-a502-42bb-86b1-e84a6877cf64','test_verify2@gmail.com','$2a$10$oIMGLJD.FLCCZZcLGcFeseLs8HPk7PQTvXQBCuUi4XcEZR66o5Baq','testuser2','USER',NULL,0,'f266e1a9747233b5ec2add1c215a3db8727d5e0dd109c77ae94cf0327875a0cd','2026-02-01 10:10:32.303','2026-02-01 10:10:32.303',NULL,NULL),('9a3e62c8-9d33-4251-ad0a-ec0993977e03','degencruise@gmail.com','$2a$10$YCM7JsnYoTSnQvihJfULg.VwBrAsPA7cKGn/javJ4t2tcossigoQi','Halla','USER',NULL,0,'24149c096a100d61310e142cc9e4d2eddf9934b9ad37d0b551dcb1c14529581a','2026-02-01 10:39:40.902','2026-02-01 10:39:40.902',NULL,NULL),('d5bae374-de14-4101-99a6-e6a49e1e518e','test_verify3@gmail.com','$2a$10$jRWHT2BCaqqAQHLmelJy.uLirjipFuV9VYMkUwcpYc1txa47IO87.','testuser3','USER',NULL,0,'88ea8cbbfc5888c639517362dfa1712f751b90b439672ad0c67a3448de717469','2026-02-01 10:11:11.485','2026-02-01 10:11:11.485',NULL,NULL),('f506b92d-3740-429c-9e7e-777a493006d4','luochun15@gmail.com','$2a$10$xJD7uduqF2SKo7WfuoX5SO5tTMDOhgMX94bWwiKsHygL1SpZl.Ppq','luochun','USER',NULL,1,NULL,'2026-02-03 09:27:06.029','2026-02-03 14:38:28.386','9568b8f4d8c074a124da271029b21473d573740d35e970cc3615d7ca68ac3d80','2026-02-03 15:08:28.385');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-04 21:48:36
