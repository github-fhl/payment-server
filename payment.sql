-- MySQL dump 10.13  Distrib 5.7.9, for Win64 (x86_64)
--
-- Host: localhost    Database: payment_test
-- ------------------------------------------------------
-- Server version	5.7.13-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `account` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `department` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `mail` varchar(255) DEFAULT NULL,
  `telephoneNumber` varchar(255) DEFAULT NULL,
  `status` int(11) DEFAULT '1',
  `remark` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `managerUsr` varchar(255) DEFAULT NULL,
  `directorUsr` varchar(255) DEFAULT NULL,
  `createdUsr` varchar(255) DEFAULT NULL,
  `updatedUsr` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `managerUsr` (`managerUsr`),
  KEY `directorUsr` (`directorUsr`),
  KEY `createdUsr` (`createdUsr`),
  KEY `updatedUsr` (`updatedUsr`),
  KEY `account_name` (`name`) USING BTREE,
  KEY `account_department` (`department`) USING BTREE,
  KEY `account_title` (`title`) USING BTREE,
  KEY `account_status` (`status`) USING BTREE,
  CONSTRAINT `account_ibfk_1` FOREIGN KEY (`managerUsr`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `account_ibfk_2` FOREIGN KEY (`directorUsr`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `account_ibfk_3` FOREIGN KEY (`createdUsr`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `account_ibfk_4` FOREIGN KEY (`updatedUsr`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account` VALUES ('A_applicant','申请人',NULL,NULL,NULL,NULL,1,NULL,'2017-05-22 06:11:06','2017-05-22 06:11:06','A_manager','A_manager_B',NULL,NULL),('A_cashier','出纳',NULL,NULL,NULL,NULL,1,NULL,'2017-05-22 06:11:06','2017-05-22 06:11:06',NULL,NULL,NULL,NULL),('A_chief','财务总监',NULL,NULL,NULL,NULL,1,NULL,'2017-05-22 06:11:06','2017-05-22 06:11:06',NULL,NULL,NULL,NULL),('A_finance','财务',NULL,NULL,NULL,NULL,1,NULL,'2017-05-22 06:11:06','2017-05-22 06:11:06',NULL,NULL,NULL,NULL),('A_general','普通员工',NULL,NULL,NULL,NULL,1,NULL,'2017-05-22 06:11:06','2017-05-22 06:11:06',NULL,NULL,NULL,NULL),('A_hr','人事',NULL,NULL,NULL,NULL,1,NULL,'2017-05-22 06:11:06','2017-05-22 06:11:06',NULL,NULL,NULL,NULL),('A_maintainer','维护人员',NULL,NULL,NULL,NULL,1,NULL,'2017-05-22 06:11:06','2017-05-22 06:11:06',NULL,NULL,NULL,NULL),('A_manager','主管',NULL,NULL,NULL,NULL,1,NULL,'2017-05-22 06:11:06','2017-05-22 06:11:06',NULL,NULL,NULL,NULL),('A_manager_B','另一个主管',NULL,NULL,NULL,NULL,1,NULL,'2017-05-22 06:11:06','2017-05-22 06:11:06',NULL,NULL,NULL,NULL),('shscan','shscan','财务部',NULL,NULL,'110',1,NULL,'2017-05-22 06:11:01','2017-05-22 06:11:01','shscan','shscan',NULL,NULL),('superMan','超人','财务部',NULL,NULL,'110',1,NULL,'2017-05-22 06:11:01','2017-05-22 06:11:01','superMan','superMan',NULL,NULL);
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accountrole`
--

DROP TABLE IF EXISTS `accountrole`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `accountrole` (
  `id` char(36) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `status` int(11) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `accountId` varchar(255) DEFAULT NULL,
  `roleId` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `accountrole_roleId_accountId_unique` (`accountId`,`roleId`),
  KEY `roleId` (`roleId`),
  CONSTRAINT `accountrole_ibfk_1` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `accountrole_ibfk_2` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accountrole`
--

LOCK TABLES `accountrole` WRITE;
/*!40000 ALTER TABLE `accountrole` DISABLE KEYS */;
INSERT INTO `accountrole` VALUES ('6e72f600-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:02','2017-05-22 06:11:02','superMan','admin'),('6e72f601-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:02','2017-05-22 06:11:02','shscan','admin'),('71401fc0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','A_general','general'),('71401fc1-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','A_manager','manager'),('71401fc2-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','A_manager','general'),('71401fc3-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','A_cashier','cashier'),('71401fc4-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','A_cashier','general'),('71401fc5-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','A_finance','finance'),('71401fc6-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','A_finance','general'),('71401fc7-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','A_chief','chief'),('71401fc8-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','A_chief','general'),('71401fc9-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','A_maintainer','maintainer'),('71401fca-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','A_maintainer','general'),('71401fcb-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','A_hr','hr'),('71401fcc-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','A_hr','general'),('71401fcd-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','A_applicant','applicant'),('71401fce-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','A_applicant','general'),('71401fcf-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','A_manager_B','manager'),('71401fd0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','A_manager_B','general');
/*!40000 ALTER TABLE `accountrole` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `applylog`
--

DROP TABLE IF EXISTS `applylog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `applylog` (
  `id` char(36) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `applyStatus` enum('toHandle','handled') DEFAULT 'toHandle',
  `time` int(11) DEFAULT '1',
  `remark` varchar(255) DEFAULT NULL,
  `status` int(11) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `orderId` varchar(255) NOT NULL,
  `operation` varchar(255) DEFAULT NULL,
  `operator` varchar(255) DEFAULT NULL,
  `toHandleUsr` varchar(255) DEFAULT NULL,
  `toHandleRole` varchar(255) DEFAULT NULL,
  `approType` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `orderId` (`orderId`),
  KEY `operation` (`operation`),
  KEY `operator` (`operator`),
  KEY `toHandleUsr` (`toHandleUsr`),
  KEY `toHandleRole` (`toHandleRole`),
  KEY `approType` (`approType`),
  KEY `applylog_apply_status` (`applyStatus`) USING BTREE,
  KEY `applylog_status` (`status`) USING BTREE,
  CONSTRAINT `applylog_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `applylog_ibfk_2` FOREIGN KEY (`operation`) REFERENCES `argdetail` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `applylog_ibfk_3` FOREIGN KEY (`operator`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `applylog_ibfk_4` FOREIGN KEY (`toHandleUsr`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `applylog_ibfk_5` FOREIGN KEY (`toHandleRole`) REFERENCES `role` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `applylog_ibfk_6` FOREIGN KEY (`approType`) REFERENCES `argdetail` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applylog`
--

LOCK TABLES `applylog` WRITE;
/*!40000 ALTER TABLE `applylog` DISABLE KEYS */;
INSERT INTO `applylog` VALUES ('b38de2c0-3ec1-11e7-8348-e5b2aa9af786','handled',1,NULL,1,'2017-05-22 07:38:52','2017-05-22 07:38:52','PR201705001','create','superMan','superMan',NULL,'byAccount'),('b39ed2b0-3ec1-11e7-8348-e5b2aa9af786','handled',1,NULL,1,'2017-05-22 07:38:54','2017-05-22 07:39:14','PR201705001','submit','superMan','superMan',NULL,'byAccount'),('c12fe040-3ec1-11e7-8348-e5b2aa9af786','toHandle',1,NULL,1,'2017-05-22 07:39:14','2017-05-22 07:39:14','PR201705001','managerAppro','superMan',NULL,'cashier','byRole');
/*!40000 ALTER TABLE `applylog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `argdetail`
--

DROP TABLE IF EXISTS `argdetail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `argdetail` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `status` int(11) DEFAULT '1',
  `remark` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `argmainId` varchar(255) NOT NULL,
  `createdUsr` varchar(255) DEFAULT NULL,
  `updatedUsr` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `argmainId` (`argmainId`),
  KEY `createdUsr` (`createdUsr`),
  KEY `updatedUsr` (`updatedUsr`),
  KEY `argdetail_name` (`name`) USING BTREE,
  KEY `argdetail_status` (`status`) USING BTREE,
  CONSTRAINT `argdetail_ibfk_1` FOREIGN KEY (`argmainId`) REFERENCES `argmain` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `argdetail_ibfk_2` FOREIGN KEY (`createdUsr`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `argdetail_ibfk_3` FOREIGN KEY (`updatedUsr`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `argdetail`
--

LOCK TABLES `argdetail` WRITE;
/*!40000 ALTER TABLE `argdetail` DISABLE KEYS */;
INSERT INTO `argdetail` VALUES ('abandon','废弃',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','operation',NULL,NULL),('abandoned','已废弃',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','approStatus',NULL,NULL),('applicantUpdate','申请人修改订单信息',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','operation',NULL,NULL),('byAccount','被用户审批',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','approType',NULL,NULL),('byRole','被角色审批',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','approType',NULL,NULL),('cashierAppro','出纳批准',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','operation',NULL,NULL),('cashierExport','出纳导出',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','operation',NULL,NULL),('cashierPayFailed','出纳付款失败',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','operation',NULL,NULL),('cashierPaySucceed','出纳付款成功',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','operation',NULL,NULL),('cashierRefuse','出纳拒绝',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','operation',NULL,NULL),('chiefAppro','总监批准',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','operation',NULL,NULL),('chiefRefuse','总监拒绝',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','operation',NULL,NULL),('CNY','人民币',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','currency',NULL,NULL),('create','创建',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','operation',NULL,NULL),('employee','员工类别',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','category',NULL,NULL),('financeAppro','财务批准',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','operation',NULL,NULL),('financeRefuse','财务拒绝',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','operation',NULL,NULL),('managerAppro','主管批准',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','operation',NULL,NULL),('managerRefuse','主管拒绝',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','operation',NULL,NULL),('operatingCost','运营成本',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','category',NULL,NULL),('payFailed','出纳付款失败，待出纳导出',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','approStatus',NULL,NULL),('paySucceed','出纳付款成功',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','approStatus',NULL,NULL),('refusedByCashier','出纳否决，待提交',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','approStatus',NULL,NULL),('refusedByChief','财务总监否决，待提交',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','approStatus',NULL,NULL),('refusedByFinance','财务否决，待提交',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','approStatus',NULL,NULL),('refusedByManager','主管否决，待提交',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','approStatus',NULL,NULL),('reimuser','报销人',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','payeeType',NULL,NULL),('submit','提交',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','operation',NULL,NULL),('toApproByCashier','主管已批准，待出纳审核',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','approStatus',NULL,NULL),('toApproByChief','财务已审核，待财务总监审批',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','approStatus',NULL,NULL),('toApproByFinance','出纳已审核，待财务审核',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','approStatus',NULL,NULL),('toApproByManager','已提交，待主管审批',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','approStatus',NULL,NULL),('toExportByCashier','财务总监已审批，待出纳导出',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','approStatus',NULL,NULL),('toPayByCashier','出纳已导出，待出纳付款',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','approStatus',NULL,NULL),('toSubmit','已创建，待提交',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','approStatus',NULL,NULL),('updatedByApplicant','申请人已修改信息，待出纳导出',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','approStatus',NULL,NULL),('USD','美元',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','currency',NULL,NULL),('vendor','供应商',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','payeeType',NULL,NULL);
/*!40000 ALTER TABLE `argdetail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `argmain`
--

DROP TABLE IF EXISTS `argmain`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `argmain` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `editFlag` enum('y','n') DEFAULT 'y',
  `status` int(11) DEFAULT '1',
  `remark` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `createdUsr` varchar(255) DEFAULT NULL,
  `updatedUsr` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `createdUsr` (`createdUsr`),
  KEY `updatedUsr` (`updatedUsr`),
  KEY `argmain_name` (`name`) USING BTREE,
  KEY `argmain_edit_flag` (`editFlag`) USING BTREE,
  KEY `argmain_status` (`status`) USING BTREE,
  CONSTRAINT `argmain_ibfk_1` FOREIGN KEY (`createdUsr`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `argmain_ibfk_2` FOREIGN KEY (`updatedUsr`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `argmain`
--

LOCK TABLES `argmain` WRITE;
/*!40000 ALTER TABLE `argmain` DISABLE KEYS */;
INSERT INTO `argmain` VALUES ('approStatus','当前审批状态','n',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('approType','申请单待操作角色类别','n',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('category','报销类型的类别','n',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('currency','货币','y',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('operation','对申请单的操作','n',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('payeeType','收款人类别','n',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL);
/*!40000 ALTER TABLE `argmain` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company`
--

DROP TABLE IF EXISTS `company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `company` (
  `id` char(36) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `bankNum` varchar(255) DEFAULT NULL,
  `code` varchar(255) NOT NULL,
  `telphone` varchar(255) DEFAULT NULL,
  `logoPath` varchar(255) DEFAULT NULL,
  `status` int(11) DEFAULT '1',
  `remark` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `createdUsr` varchar(255) DEFAULT NULL,
  `updatedUsr` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `company_name_unique` (`name`),
  UNIQUE KEY `company_code_unique` (`code`),
  KEY `createdUsr` (`createdUsr`),
  KEY `updatedUsr` (`updatedUsr`),
  KEY `company_name` (`name`) USING BTREE,
  KEY `company_status` (`status`) USING BTREE,
  CONSTRAINT `company_ibfk_1` FOREIGN KEY (`createdUsr`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `company_ibfk_2` FOREIGN KEY (`updatedUsr`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company`
--

LOCK TABLES `company` WRITE;
/*!40000 ALTER TABLE `company` DISABLE KEYS */;
INSERT INTO `company` VALUES ('12387241-06da-11e7-b23d-513f39f5849c','GTB',NULL,'GC',NULL,'upload/20170327/logo2.png',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('24787240-06da-11e7-b23d-513f39f5849c','Blue Hive',NULL,'BH',NULL,'upload/20170327/logo1.png',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('24787241-06da-11e7-b23d-513f39f5849c','Prism',NULL,'PR',NULL,'upload/20170327/logo2.png',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL);
/*!40000 ALTER TABLE `company` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grant`
--

DROP TABLE IF EXISTS `grant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `grant` (
  `id` char(36) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `status` int(11) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `roleId` varchar(255) NOT NULL,
  `targetroleId` varchar(255) DEFAULT NULL,
  `targetpermissionId` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `roleId` (`roleId`),
  KEY `targetroleId` (`targetroleId`),
  KEY `targetpermissionId` (`targetpermissionId`),
  CONSTRAINT `grant_ibfk_1` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `grant_ibfk_2` FOREIGN KEY (`targetroleId`) REFERENCES `role` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `grant_ibfk_3` FOREIGN KEY (`targetpermissionId`) REFERENCES `permission` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grant`
--

LOCK TABLES `grant` WRITE;
/*!40000 ALTER TABLE `grant` DISABLE KEYS */;
INSERT INTO `grant` VALUES ('6f8ddbe0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:03','2017-05-22 06:11:03','admin',NULL,'getlist_account'),('6f941d70-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'new_account'),('6f966760-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'get_account'),('6fa3d4e0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'delete_account'),('6fa50d60-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'update_account'),('6fb97fc0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'getlist_signature'),('6fbbf0c0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'new_signature'),('6fbd7760-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'get_signature'),('6fbe61c0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'delete_signature'),('6fbf4c20-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'update_signature'),('6fc00f70-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'getlist_role'),('6fc23250-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'new_role'),('6fc391e0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'get_role'),('6fc6ed40-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'delete_role'),('6fc93730-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'update_role'),('6fc9fa80-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'getlist_accountrole'),('6fcabdd0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'new_accountrole'),('6fcc1d60-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'get_accountrole'),('6fcd7cf0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'delete_accountrole'),('6fce6750-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'update_accountrole'),('6fcf0390-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'getlist_permission'),('6fcfc6e0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'new_permission'),('6fd12670-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'get_permission'),('6fd2fb30-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'delete_permission'),('6fd3be80-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'update_permission'),('6fd4a8e0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'getlist_grant'),('6fd59340-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'new_grant'),('6fd67da0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'get_grant'),('6fd6f2d0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'delete_grant'),('6fd80440-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'update_grant'),('6fd8c790-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'getlist_applylog'),('6fd963d0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'new_applylog'),('6ff10a80-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'get_applylog'),('6ff1f4e0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'delete_applylog'),('6ff26a10-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'update_applylog'),('6ff30650-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'getlist_order'),('6ff43ed0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'new_order'),('6ff4db10-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'get_order'),('6ff57750-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'delete_order'),('6ff63aa0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'update_order'),('6ff74c10-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'print_order'),('6ff80f60-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'get_paidNo'),('6ff8f9c0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'update_cashierOrder'),('6ff9e420-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'update_orderInvoice'),('6fface80-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'print_voucher'),('6ffb43b0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'receive_printedOrder'),('6ffbdff0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'submit_order'),('6ffcca50-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'backout_order'),('6ffd8da0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'managerAppro_order'),('7001fa70-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'managerRefuse_order'),('700296b0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'cashierAppro_order'),('700332f0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'cashierRefuse_order'),('7003cf30-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'financeAppro_order'),('7004e0a0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'financeRefuse_order'),('70057ce0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'chiefAppro_order'),('70066740-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'chiefRefuse_order'),('700778b0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'cashierExport_order'),('70086310-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'cashierPaySucceed_order'),('70092660-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'cashierPayFailed_order'),('700bbe70-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'applicantUpdate_order'),('700c81c0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'abandon_order'),('700d1e00-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'getlist_paytype'),('700dba40-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'new_paytype'),('700e2f70-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'get_paytype'),('700ecbb0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'delete_paytype'),('700fdd20-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'update_paytype'),('70107960-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'getlist_ordersubject'),('70113cb0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'new_ordersubject'),('7011d8f0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'get_ordersubject'),('70127530-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'delete_ordersubject'),('7012ea60-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'update_ordersubject'),('70135f90-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'getlist_subject'),('7013d4c0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'new_subject'),('70147100-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'get_subject'),('70150d40-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'delete_subject'),('701693e0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'update_subject'),('70173020-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'getlist_argmain'),('70184190-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'new_argmain'),('7018b6c0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'get_argmain'),('70197a10-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'delete_argmain'),('701a1650-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'update_argmain'),('701ab290-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'getlist_argdetail'),('701b4ed0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'new_argdetail'),('701beb10-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'get_argdetail'),('701c8750-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'delete_argdetail'),('701d2390-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'update_argdetail'),('701de6e0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'getlist_company'),('701e8320-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'new_company'),('701f4670-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'get_company'),('702030d0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'delete_company'),('7020cd10-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'update_company'),('70214240-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'getlist_vendor'),('7021de80-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'new_vendor'),('70227ac0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'get_vendor'),('70233e10-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'delete_vendor'),('7023b340-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'update_vendor'),('7024c4b0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'getlist_reimuser'),('702735b0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'new_reimuser'),('7027f900-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'get_reimuser'),('7028bc50-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'delete_reimuser'),('70295890-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'update_reimuser'),('702a1be0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'getlist_reimuserdetail'),('702ab820-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'new_reimuserdetail'),('702b2d50-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:04','2017-05-22 06:11:04','admin',NULL,'get_reimuserdetail'),('702bf0a0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:05','2017-05-22 06:11:05','admin',NULL,'delete_reimuserdetail'),('702cb3f0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:05','2017-05-22 06:11:05','admin',NULL,'update_reimuserdetail'),('702f24f0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:05','2017-05-22 06:11:05','admin',NULL,'getlist_ldap'),('702fc130-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:05','2017-05-22 06:11:05','admin',NULL,'getlist_department'),('71359870-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','general',NULL,'getlist_order'),('71359871-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','general',NULL,'get_order'),('71359872-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','general',NULL,'getlist_applylog'),('71359873-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','general',NULL,'get_paidNo'),('71359874-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','general',NULL,'getlist_ordersubject'),('71359875-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','general',NULL,'get_ordersubject'),('71359876-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','general',NULL,'print_order'),('71359877-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','manager',NULL,'managerAppro_order'),('7135bf80-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','manager',NULL,'managerRefuse_order'),('7135bf81-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','cashier',NULL,'cashierAppro_order'),('7135bf82-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','cashier',NULL,'cashierRefuse_order'),('7135bf83-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','cashier',NULL,'cashierExport_order'),('7135bf84-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','cashier',NULL,'cashierPaySucceed_order'),('7135bf85-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','cashier',NULL,'cashierPayFailed_order'),('7135bf86-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','cashier',NULL,'update_cashierOrder'),('7135bf87-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','cashier',NULL,'update_orderInvoice'),('7135bf88-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','cashier',NULL,'receive_printedOrder'),('7135bf89-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','finance',NULL,'financeAppro_order'),('7135bf8a-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','finance',NULL,'financeRefuse_order'),('7135bf8b-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','finance',NULL,'getlist_reimuser'),('7135bf8c-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','finance',NULL,'get_reimuser'),('7135bf8d-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','finance',NULL,'new_reimuserdetail'),('7135bf8e-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','finance',NULL,'update_reimuserdetail'),('7135bf8f-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','finance',NULL,'delete_reimuserdetail'),('7135bf90-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','finance',NULL,'new_ordersubject'),('7135bf91-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','finance',NULL,'getlist_ordersubject'),('7135bf92-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','finance',NULL,'get_ordersubject'),('7135bf93-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','finance',NULL,'delete_ordersubject'),('7135bf94-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','finance',NULL,'update_ordersubject'),('7135bf95-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','finance',NULL,'print_voucher'),('7135bf96-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','chief',NULL,'chiefAppro_order'),('7135bf97-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','chief',NULL,'chiefRefuse_order'),('7135bf98-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'getlist_paytype'),('7135bf99-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'new_paytype'),('7135bf9a-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'get_paytype'),('7135bf9b-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'delete_paytype'),('7135e690-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'update_paytype'),('7135e691-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'getlist_subject'),('7135e692-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'get_subject'),('7135e693-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'delete_subject'),('7135e694-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'update_subject'),('7135e695-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'getlist_company'),('7135e696-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'new_company'),('7135e697-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'get_company'),('7135e698-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'delete_company'),('7135e699-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'update_company'),('7135e69a-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'getlist_vendor'),('7135e69b-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'new_vendor'),('7135e69c-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'get_vendor'),('7135e69d-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'delete_vendor'),('7135e69e-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'update_vendor'),('7135e69f-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'getlist_reimuser'),('7135e6a0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'get_reimuser'),('7135e6a1-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'getlist_reimuserdetail'),('7135e6a2-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'get_reimuserdetail'),('7135e6a3-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'getlist_ldap'),('7135e6a4-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'getlist_department'),('7135e6a5-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'new_account'),('7135e6a6-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'getlist_account'),('7135e6a7-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'get_account'),('7135e6a8-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'delete_account'),('7135e6a9-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'update_account'),('7135e6aa-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'new_accountrole'),('7135e6ab-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer',NULL,'delete_accountrole'),('7135e6ac-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','hr',NULL,'new_reimuser'),('7135e6ad-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','hr',NULL,'update_reimuser'),('7135e6ae-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','hr',NULL,'delete_reimuser'),('71360da0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','hr',NULL,'getlist_reimuser'),('71360da1-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','hr',NULL,'get_reimuser'),('71360da2-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','applicant',NULL,'new_order'),('71360da3-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','applicant',NULL,'delete_order'),('71360da4-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','applicant',NULL,'update_order'),('71360da5-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','applicant',NULL,'submit_order'),('713634b0-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','applicant',NULL,'abandon_order'),('713634b1-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','applicant',NULL,'backout_order'),('713634b2-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','applicant',NULL,'update_cashierOrder'),('713634b3-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','applicant',NULL,'applicantUpdate_order'),('713f3560-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','manager','general',NULL),('713f3561-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','applicant','general',NULL),('713f3562-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','cashier','general',NULL),('713f3563-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','finance','general',NULL),('713f3564-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','chief','finance',NULL),('713f5c70-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','maintainer','general',NULL),('713f5c71-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','hr','general',NULL),('713f5c72-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','admin','manager',NULL),('713f5c73-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','admin','cashier',NULL),('713f5c74-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','admin','chief',NULL),('713f5c75-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','admin','maintainer',NULL),('713f5c76-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','admin','hr',NULL),('713f5c77-3eb5-11e7-ab37-4be1fa2fef17',1,'2017-05-22 06:11:06','2017-05-22 06:11:06','admin','applicant',NULL);
/*!40000 ALTER TABLE `grant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order` (
  `id` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `applyDate` datetime DEFAULT NULL,
  `amount` decimal(18,6) DEFAULT NULL,
  `subjectStatus` enum('y','n') DEFAULT 'n',
  `printStatus` enum('y','n') DEFAULT 'n',
  `paidDate` datetime DEFAULT NULL,
  `invoiceStatus` enum('y','n') DEFAULT 'n',
  `subjectDate` varchar(255) DEFAULT NULL,
  `receiveOrderStatus` enum('y','n') DEFAULT 'n',
  `paidNo` varchar(255) DEFAULT NULL,
  `vendorType` enum('user','company') DEFAULT NULL,
  `status` int(11) DEFAULT '1',
  `remark` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `companyId` char(36) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `currency` varchar(255) NOT NULL,
  `approStatus` varchar(255) DEFAULT NULL,
  `createdUsr` varchar(255) DEFAULT NULL,
  `updatedUsr` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `companyId` (`companyId`),
  KEY `currency` (`currency`),
  KEY `approStatus` (`approStatus`),
  KEY `createdUsr` (`createdUsr`),
  KEY `updatedUsr` (`updatedUsr`),
  KEY `order_apply_date` (`applyDate`) USING BTREE,
  KEY `order_subject_status` (`subjectStatus`) USING BTREE,
  KEY `order_print_status` (`printStatus`) USING BTREE,
  KEY `order_invoice_status` (`invoiceStatus`) USING BTREE,
  KEY `order_paid_no` (`paidNo`) USING BTREE,
  KEY `order_vendor_type` (`vendorType`) USING BTREE,
  KEY `order_status` (`status`) USING BTREE,
  CONSTRAINT `order_ibfk_1` FOREIGN KEY (`companyId`) REFERENCES `company` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `order_ibfk_2` FOREIGN KEY (`currency`) REFERENCES `argdetail` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `order_ibfk_3` FOREIGN KEY (`approStatus`) REFERENCES `argdetail` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `order_ibfk_4` FOREIGN KEY (`createdUsr`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `order_ibfk_5` FOREIGN KEY (`updatedUsr`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
INSERT INTO `order` VALUES ('PR201705001','niuhao ','2017-05-22 00:00:00',1000.000000,'n','n',NULL,'n',NULL,'n',NULL,'user',1,NULL,'2017-05-22 07:38:51','2017-05-22 07:39:14','24787240-06da-11e7-b23d-513f39f5849c','CNY','toApproByCashier','superMan','superMan');
/*!40000 ALTER TABLE `order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orderdetail`
--

DROP TABLE IF EXISTS `orderdetail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orderdetail` (
  `id` char(36) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `money` decimal(18,6) NOT NULL,
  `payDate` varchar(255) DEFAULT NULL,
  `bankNum` varchar(255) NOT NULL,
  `bankName` varchar(255) NOT NULL,
  `contacter` varchar(255) DEFAULT NULL,
  `telphone` varchar(255) DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL,
  `status` int(11) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `paytypeId` varchar(255) NOT NULL,
  `paytypedetailId` varchar(255) DEFAULT NULL,
  `orderId` varchar(255) NOT NULL,
  `spendUsr` char(36) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  `reimuserId` char(36) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  `vendorId` char(36) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  `payeeType` varchar(255) NOT NULL,
  `createdUsr` varchar(255) DEFAULT NULL,
  `updatedUsr` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `paytypeId` (`paytypeId`),
  KEY `paytypedetailId` (`paytypedetailId`),
  KEY `orderId` (`orderId`),
  KEY `spendUsr` (`spendUsr`),
  KEY `reimuserId` (`reimuserId`),
  KEY `vendorId` (`vendorId`),
  KEY `payeeType` (`payeeType`),
  KEY `createdUsr` (`createdUsr`),
  KEY `updatedUsr` (`updatedUsr`),
  KEY `orderdetail_status` (`status`) USING BTREE,
  CONSTRAINT `orderdetail_ibfk_1` FOREIGN KEY (`paytypeId`) REFERENCES `paytype` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `orderdetail_ibfk_2` FOREIGN KEY (`paytypedetailId`) REFERENCES `paytypedetail` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `orderdetail_ibfk_3` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `orderdetail_ibfk_4` FOREIGN KEY (`spendUsr`) REFERENCES `reimuser` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `orderdetail_ibfk_5` FOREIGN KEY (`reimuserId`) REFERENCES `reimuser` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `orderdetail_ibfk_6` FOREIGN KEY (`vendorId`) REFERENCES `vendor` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `orderdetail_ibfk_7` FOREIGN KEY (`payeeType`) REFERENCES `argdetail` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `orderdetail_ibfk_8` FOREIGN KEY (`createdUsr`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `orderdetail_ibfk_9` FOREIGN KEY (`updatedUsr`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderdetail`
--

LOCK TABLES `orderdetail` WRITE;
/*!40000 ALTER TABLE `orderdetail` DISABLE KEYS */;
INSERT INTO `orderdetail` VALUES ('b38c5c20-3ec1-11e7-8348-e5b2aa9af786',1000.000000,'2017-05','111111111111111111','上海银行',NULL,NULL,NULL,1,'2017-05-22 07:38:52','2017-05-22 07:38:52','COLA',NULL,'PR201705001',NULL,'24941090-06da-11e7-b23d-513f39f5849c','248a4c90-06da-11e7-b23d-513f39f5849c','reimuser','superMan',NULL);
/*!40000 ALTER TABLE `orderdetail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ordersubject`
--

DROP TABLE IF EXISTS `ordersubject`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ordersubject` (
  `id` char(36) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `type` enum('debit','credit') NOT NULL,
  `money` decimal(18,6) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` int(11) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `subjectId` char(36) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `orderId` varchar(255) NOT NULL,
  `createdUsr` varchar(255) DEFAULT NULL,
  `updatedUsr` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `subjectId` (`subjectId`),
  KEY `orderId` (`orderId`),
  KEY `createdUsr` (`createdUsr`),
  KEY `updatedUsr` (`updatedUsr`),
  KEY `ordersubject_type` (`type`) USING BTREE,
  KEY `ordersubject_status` (`status`) USING BTREE,
  CONSTRAINT `ordersubject_ibfk_1` FOREIGN KEY (`subjectId`) REFERENCES `subject` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `ordersubject_ibfk_2` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `ordersubject_ibfk_3` FOREIGN KEY (`createdUsr`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ordersubject_ibfk_4` FOREIGN KEY (`updatedUsr`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordersubject`
--

LOCK TABLES `ordersubject` WRITE;
/*!40000 ALTER TABLE `ordersubject` DISABLE KEYS */;
/*!40000 ALTER TABLE `ordersubject` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paytype`
--

DROP TABLE IF EXISTS `paytype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `paytype` (
  `id` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `rankNum` int(11) DEFAULT '1000',
  `status` int(11) DEFAULT '1',
  `remark` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `category` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `category` (`category`),
  KEY `paytype_status` (`status`) USING BTREE,
  CONSTRAINT `paytype_ibfk_1` FOREIGN KEY (`category`) REFERENCES `argdetail` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paytype`
--

LOCK TABLES `paytype` WRITE;
/*!40000 ALTER TABLE `paytype` DISABLE KEYS */;
INSERT INTO `paytype` VALUES ('Car-daily','',8,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','employee'),('Car-fixed','',7,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','employee'),('COLA','',5,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','employee'),('Commercial_Cost','',22,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','operatingCost'),('Education','',12,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','employee'),('Financial_Cost','',24,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','operatingCost'),('Freelancer','',3,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','employee'),('Housing','',6,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','employee'),('Housing Fund','',18,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','employee'),('Individual Income Tax','',16,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','employee'),('Intern','',4,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','employee'),('IT_Cost','',23,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','operatingCost'),('Language','',13,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','employee'),('Medical','',11,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','employee'),('Mobile-company','',9,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','employee'),('Mobile-staff','',10,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','employee'),('Office_Cost','',21,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','operatingCost'),('Others_Staff','',19,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','employee'),('Recruitment','',14,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','employee'),('Relocation','',15,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','employee'),('Salary-local payment','',1,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','employee'),('Salary-oversea payment','',2,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','employee'),('Social Insurances','',17,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','employee'),('Staff_Welfare_Cost','',20,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','operatingCost');
/*!40000 ALTER TABLE `paytype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paytypedetail`
--

DROP TABLE IF EXISTS `paytypedetail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `paytypedetail` (
  `id` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `rankNum` int(11) DEFAULT '1000',
  `status` int(11) DEFAULT '1',
  `remark` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `paytypeId` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `paytypeId` (`paytypeId`),
  KEY `paytypedetail_status` (`status`) USING BTREE,
  CONSTRAINT `paytypedetail_ibfk_1` FOREIGN KEY (`paytypeId`) REFERENCES `paytype` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paytypedetail`
--

LOCK TABLES `paytypedetail` WRITE;
/*!40000 ALTER TABLE `paytypedetail` DISABLE KEYS */;
INSERT INTO `paytypedetail` VALUES ('5@5','',4,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Staff_Welfare_Cost'),('Accessaries','',5,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','IT_Cost'),('Audit','',10,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Financial_Cost'),('Bagel/Town Hall','',3,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Staff_Welfare_Cost'),('Bank Charges','',6,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Financial_Cost'),('Brand Breakthrough (BBT)','',8,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Commercial_Cost'),('CAPEX','',1,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Office_Cost'),('Cash Advance','',3,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Financial_Cost'),('Client Entertainment','',4,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Commercial_Cost'),('Client Meeting','',5,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Commercial_Cost'),('Client Workshops','',6,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Commercial_Cost'),('CNY Party','',8,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Staff_Welfare_Cost'),('Company Trip','',6,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Staff_Welfare_Cost'),('Conference Call','',7,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','IT_Cost'),('Corporate Income Tax','',8,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Financial_Cost'),('Credit Card','',5,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Financial_Cost'),('Dividends','',14,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Financial_Cost'),('Dividends Tax','',15,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Financial_Cost'),('Facility Management','',6,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Office_Cost'),('Hardware-CAPEX','',1,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','IT_Cost'),('Hardware-expense','',2,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','IT_Cost'),('Holiday Gifts','',5,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Staff_Welfare_Cost'),('Hot House (HH)','',7,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Commercial_Cost'),('Intercompany','',2,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Financial_Cost'),('Internal Transfer','',1,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Financial_Cost'),('Landline','',8,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','IT_Cost'),('Legal','',11,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Financial_Cost'),('Lunch & Learn','',2,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Staff_Welfare_Cost'),('Magazines','',12,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Office_Cost'),('Management Fee','',3,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Office_Cost'),('Management Meeting','',3,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Commercial_Cost'),('Office Insurance','',11,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Office_Cost'),('Office Supplies','',8,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Office_Cost'),('Others_Commercial_Cost','',10,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Commercial_Cost'),('Others_Financial_Cost','',16,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Financial_Cost'),('Others_IT_Cost','',9,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','IT_Cost'),('Others_Office_Cost','',13,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Office_Cost'),('Others_Staff_Welfare_Cost','',11,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Staff_Welfare_Cost'),('Parking','',4,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Office_Cost'),('Petty Cash','',4,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Financial_Cost'),('Postage & Courier','',9,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Office_Cost'),('Presentation','',9,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Commercial_Cost'),('Printer','',4,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','IT_Cost'),('Red Packet','',9,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Staff_Welfare_Cost'),('Rental','',2,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Office_Cost'),('Repair','',6,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','IT_Cost'),('Software','',3,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','IT_Cost'),('Stationary','',7,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Office_Cost'),('Storage','',10,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Office_Cost'),('Tax Agent','',12,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Financial_Cost'),('Tax Consulting','',13,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Financial_Cost'),('Team Building/Meals','',10,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Staff_Welfare_Cost'),('Training','',1,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Staff_Welfare_Cost'),('Travel','',1,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Commercial_Cost'),('Utilities','',5,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Office_Cost'),('VAT & Surtaxes','',7,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Financial_Cost'),('Visa','',2,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Commercial_Cost'),('Withholding Tax','',9,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Financial_Cost'),('X\'mas Party','',7,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05','Staff_Welfare_Cost');
/*!40000 ALTER TABLE `paytypedetail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permission` (
  `id` varchar(255) NOT NULL,
  `object` varchar(255) NOT NULL,
  `operation` varchar(255) NOT NULL,
  `status` int(11) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permission`
--

LOCK TABLES `permission` WRITE;
/*!40000 ALTER TABLE `permission` DISABLE KEYS */;
INSERT INTO `permission` VALUES ('abandon_order','order','abandon',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('applicantUpdate_order','order','applicantUpdate',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('backout_order','order','backout',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('cashierAppro_order','order','cashierAppro',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('cashierExport_order','order','cashierExport',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('cashierPayFailed_order','order','cashierPayFailed',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('cashierPaySucceed_order','order','cashierPaySucceed',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('cashierRefuse_order','order','cashierRefuse',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('chiefAppro_order','order','chiefAppro',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('chiefRefuse_order','order','chiefRefuse',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('delete_account','account','delete',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('delete_accountrole','accountrole','delete',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('delete_applylog','applylog','delete',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('delete_argdetail','argdetail','delete',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('delete_argmain','argmain','delete',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('delete_company','company','delete',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('delete_grant','grant','delete',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('delete_order','order','delete',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('delete_ordersubject','ordersubject','delete',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('delete_paytype','paytype','delete',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('delete_permission','permission','delete',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('delete_reimuser','reimuser','delete',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('delete_reimuserdetail','reimuserdetail','delete',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('delete_role','role','delete',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('delete_signature','signature','delete',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('delete_subject','subject','delete',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('delete_vendor','vendor','delete',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('financeAppro_order','order','financeAppro',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('financeRefuse_order','order','financeRefuse',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('getlist_account','account','getlist',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('getlist_accountrole','accountrole','getlist',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('getlist_applylog','applylog','getlist',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('getlist_argdetail','argdetail','getlist',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('getlist_argmain','argmain','getlist',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('getlist_company','company','getlist',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('getlist_department','department','getlist',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('getlist_grant','grant','getlist',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('getlist_ldap','ldap','getlist',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('getlist_order','order','getlist',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('getlist_ordersubject','ordersubject','getlist',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('getlist_paytype','paytype','getlist',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('getlist_permission','permission','getlist',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('getlist_reimuser','reimuser','getlist',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('getlist_reimuserdetail','reimuserdetail','getlist',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('getlist_role','role','getlist',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('getlist_signature','signature','getlist',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('getlist_subject','subject','getlist',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('getlist_vendor','vendor','getlist',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('get_account','account','get',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('get_accountrole','accountrole','get',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('get_applylog','applylog','get',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('get_argdetail','argdetail','get',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('get_argmain','argmain','get',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('get_company','company','get',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('get_grant','grant','get',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('get_order','order','get',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('get_ordersubject','ordersubject','get',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('get_paidNo','paidNo','get',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('get_paytype','paytype','get',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('get_permission','permission','get',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('get_reimuser','reimuser','get',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('get_reimuserdetail','reimuserdetail','get',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('get_role','role','get',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('get_signature','signature','get',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('get_subject','subject','get',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('get_vendor','vendor','get',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('managerAppro_order','order','managerAppro',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('managerRefuse_order','order','managerRefuse',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('new_account','account','new',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('new_accountrole','accountrole','new',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('new_applylog','applylog','new',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('new_argdetail','argdetail','new',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('new_argmain','argmain','new',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('new_company','company','new',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('new_grant','grant','new',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('new_order','order','new',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('new_ordersubject','ordersubject','new',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('new_paytype','paytype','new',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('new_permission','permission','new',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('new_reimuser','reimuser','new',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('new_reimuserdetail','reimuserdetail','new',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('new_role','role','new',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('new_signature','signature','new',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('new_subject','subject','new',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('new_vendor','vendor','new',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('print_order','order','print',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('print_voucher','voucher','print',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('receive_printedOrder','printedOrder','receive',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('submit_order','order','submit',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('update_account','account','update',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('update_accountrole','accountrole','update',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('update_applylog','applylog','update',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('update_argdetail','argdetail','update',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('update_argmain','argmain','update',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('update_cashierOrder','cashierOrder','update',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('update_company','company','update',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('update_grant','grant','update',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('update_order','order','update',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('update_orderInvoice','orderInvoice','update',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('update_ordersubject','ordersubject','update',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('update_paytype','paytype','update',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('update_permission','permission','update',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('update_reimuser','reimuser','update',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('update_reimuserdetail','reimuserdetail','update',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('update_role','role','update',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('update_signature','signature','update',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('update_subject','subject','update',1,'2017-03-10 03:18:32','2017-03-10 03:18:32'),('update_vendor','vendor','update',1,'2017-03-10 03:18:32','2017-03-10 03:18:32');
/*!40000 ALTER TABLE `permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reimuser`
--

DROP TABLE IF EXISTS `reimuser`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reimuser` (
  `id` char(36) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` int(11) DEFAULT '1',
  `remark` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `createdUsr` varchar(255) DEFAULT NULL,
  `updatedUsr` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `createdUsr` (`createdUsr`),
  KEY `updatedUsr` (`updatedUsr`),
  KEY `reimuser_name` (`name`) USING BTREE,
  KEY `reimuser_status` (`status`) USING BTREE,
  CONSTRAINT `reimuser_ibfk_1` FOREIGN KEY (`createdUsr`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `reimuser_ibfk_2` FOREIGN KEY (`updatedUsr`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reimuser`
--

LOCK TABLES `reimuser` WRITE;
/*!40000 ALTER TABLE `reimuser` DISABLE KEYS */;
INSERT INTO `reimuser` VALUES ('24941090-06da-11e7-b23d-513f39f5849c','Robet',1,NULL,'2017-05-22 06:19:06','2017-05-22 06:19:06',NULL,NULL),('24a6ae30-06da-11e7-b23d-513f39f5849c','Blues',1,NULL,'2017-05-22 06:19:06','2017-05-22 06:19:06',NULL,NULL),('56a6ae30-06da-11e7-b23d-513f39f5849c','publicCost',1,NULL,'2017-05-22 06:19:06','2017-05-22 06:19:06',NULL,NULL);
/*!40000 ALTER TABLE `reimuser` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reimuserdetail`
--

DROP TABLE IF EXISTS `reimuserdetail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reimuserdetail` (
  `id` char(36) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `money` decimal(18,6) NOT NULL,
  `validDate` varchar(255) NOT NULL,
  `status` int(11) DEFAULT '1',
  `remark` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `reimuserId` char(36) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `paytypeId` varchar(255) NOT NULL,
  `vendordetailId` char(36) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  `createdUsr` varchar(255) DEFAULT NULL,
  `updatedUsr` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reimuserId` (`reimuserId`),
  KEY `paytypeId` (`paytypeId`),
  KEY `vendordetailId` (`vendordetailId`),
  KEY `createdUsr` (`createdUsr`),
  KEY `updatedUsr` (`updatedUsr`),
  KEY `reimuserdetail_valid_date` (`validDate`) USING BTREE,
  KEY `reimuserdetail_status` (`status`) USING BTREE,
  CONSTRAINT `reimuserdetail_ibfk_1` FOREIGN KEY (`reimuserId`) REFERENCES `reimuser` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `reimuserdetail_ibfk_2` FOREIGN KEY (`paytypeId`) REFERENCES `paytype` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `reimuserdetail_ibfk_3` FOREIGN KEY (`vendordetailId`) REFERENCES `vendordetail` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `reimuserdetail_ibfk_4` FOREIGN KEY (`createdUsr`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `reimuserdetail_ibfk_5` FOREIGN KEY (`updatedUsr`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reimuserdetail`
--

LOCK TABLES `reimuserdetail` WRITE;
/*!40000 ALTER TABLE `reimuserdetail` DISABLE KEYS */;
INSERT INTO `reimuserdetail` VALUES ('8f305990-3eb6-11e7-b5ee-e14fece367d1',1000.000000,'2017-02',1,NULL,'2017-05-22 06:19:06','2017-05-22 06:19:06','24941090-06da-11e7-b23d-513f39f5849c','COLA','69b6a690-0eca-11e7-8881-5f624753c8ec',NULL,NULL),('8f305991-3eb6-11e7-b5ee-e14fece367d1',3000.000000,'2017-02',1,NULL,'2017-05-22 06:19:06','2017-05-22 06:19:06','24941090-06da-11e7-b23d-513f39f5849c','Car-fixed','69b769e0-0eca-11e7-8881-5f624753c8ec',NULL,NULL),('8f412270-3eb6-11e7-b5ee-e14fece367d1',1000.000000,'2017-03',1,NULL,'2017-05-22 06:19:06','2017-05-22 06:19:06','24a6ae30-06da-11e7-b23d-513f39f5849c','COLA','69b6a690-0eca-11e7-8881-5f624753c8ec',NULL,NULL),('8f412271-3eb6-11e7-b5ee-e14fece367d1',3000.000000,'2017-01',1,NULL,'2017-05-22 06:19:06','2017-05-22 06:19:06','24a6ae30-06da-11e7-b23d-513f39f5849c','Car-fixed','69b769e0-0eca-11e7-8881-5f624753c8ec',NULL,NULL);
/*!40000 ALTER TABLE `reimuserdetail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` int(11) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `role_name` (`name`) USING BTREE,
  KEY `role_status` (`status`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES ('admin','管理员',1,'2017-05-22 06:11:02','2017-05-22 06:11:02'),('applicant','申请人',1,'2017-05-22 06:11:06','2017-05-22 06:11:06'),('cashier','出纳',1,'2017-05-22 06:11:06','2017-05-22 06:11:06'),('chief','财务总监',1,'2017-05-22 06:11:06','2017-05-22 06:11:06'),('finance','财务',1,'2017-05-22 06:11:06','2017-05-22 06:11:06'),('general','普通员工',1,'2017-05-22 06:11:06','2017-05-22 06:11:06'),('hr','人事',1,'2017-05-22 06:11:06','2017-05-22 06:11:06'),('maintainer','维护人员',1,'2017-05-22 06:11:06','2017-05-22 06:11:06'),('manager','主管',1,'2017-05-22 06:11:06','2017-05-22 06:11:06');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `session_id` varchar(255) COLLATE utf8_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` text COLLATE utf8_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('priSUYQalLBdNkYM6RhBMCoEXIsIyDiM',1495449558,'{\"cookie\":{\"originalMaxAge\":10799999,\"expires\":\"2017-05-22T18:39:17+08:00\",\"httpOnly\":true,\"domain\":\"\",\"path\":\"/\"},\"person\":null,\"sponsors\":null,\"passport\":{\"user\":\"superMan\"}}'),('y2Gp1LmvD_Zwil9NRFjC0j3R9AtE6Xiz',1495444747,'{\"cookie\":{\"originalMaxAge\":10800000,\"expires\":\"2017-05-22T17:19:06+08:00\",\"httpOnly\":true,\"domain\":\"\",\"path\":\"/\"}}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `signature`
--

DROP TABLE IF EXISTS `signature`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `signature` (
  `id` char(36) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `path` varchar(255) NOT NULL,
  `status` int(11) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `accountId` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `accountId` (`accountId`),
  KEY `signature_path` (`path`) USING BTREE,
  KEY `signature_status` (`status`) USING BTREE,
  CONSTRAINT `signature_ibfk_1` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `signature`
--

LOCK TABLES `signature` WRITE;
/*!40000 ALTER TABLE `signature` DISABLE KEYS */;
INSERT INTO `signature` VALUES ('98c680b0-12a1-11e7-922d-e717b0d3d397','20170327/1.png',1,'2017-05-22 06:11:01','2017-05-22 06:11:01','superMan'),('98c6a7c0-12a1-11e7-922d-e717b0d3d397','20170327/2.png',1,'2017-05-22 06:11:01','2017-05-22 06:11:01','shscan');
/*!40000 ALTER TABLE `signature` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subject`
--

DROP TABLE IF EXISTS `subject`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subject` (
  `id` char(36) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `bankFlag` enum('y','n') DEFAULT 'n',
  `description` varchar(255) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `accountType` varchar(255) DEFAULT NULL,
  `bankNum` varchar(255) DEFAULT NULL,
  `bankCode` varchar(255) DEFAULT NULL,
  `status` int(11) DEFAULT '1',
  `remark` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `createdUsr` varchar(255) DEFAULT NULL,
  `updatedUsr` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `bankNum` (`bankNum`),
  UNIQUE KEY `subject_name_unique` (`name`),
  UNIQUE KEY `subject_code_unique` (`code`),
  UNIQUE KEY `subject_bankNum_unique` (`bankNum`),
  KEY `createdUsr` (`createdUsr`),
  KEY `updatedUsr` (`updatedUsr`),
  KEY `subject_name` (`name`) USING BTREE,
  KEY `subject_bank_flag` (`bankFlag`) USING BTREE,
  KEY `subject_status` (`status`) USING BTREE,
  CONSTRAINT `subject_ibfk_1` FOREIGN KEY (`createdUsr`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `subject_ibfk_2` FOREIGN KEY (`updatedUsr`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subject`
--

LOCK TABLES `subject` WRITE;
/*!40000 ALTER TABLE `subject` DISABLE KEYS */;
INSERT INTO `subject` VALUES ('111a73a0-06da-11e7-b23d-513f39f5849c','Media Billings - TV媒体收入','n',NULL,'1011-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('222a73a0-06da-11e7-b23d-513f39f5849c','HSBC_CNY_GTB','y',NULL,'8110-0098','11','088-560396-011','HB',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea53091-3eb6-11e7-b5ee-e14fece367d1','BOC_CNY_GTB','y',NULL,'8110-201','11','444260849044','BC',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea53092-3eb6-11e7-b5ee-e14fece367d1','BOC_USD_GTB','y',NULL,'8110-202','12','437760849017','BC',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea557a0-3eb6-11e7-b5ee-e14fece367d1','BOC_USD_CAPITAL_GTB','y',NULL,'8110-203','13','435160848962','BC',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea557a1-3eb6-11e7-b5ee-e14fece367d1','BOC_CONSTRUCTION_GTB','y',NULL,'8110-0091','14','445571948034','BC',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea557a2-3eb6-11e7-b5ee-e14fece367d1','CASH_CNY_GTB','y',NULL,'8120-001','11',NULL,'CA',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea557a3-3eb6-11e7-b5ee-e14fece367d1','HSBC_CNY_PR','y',NULL,'8110-0092','11','088-560396-012','HB',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea557a5-3eb6-11e7-b5ee-e14fece367d1','Media Billings - Outdoors媒体收入','n',NULL,'1011-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea557a6-3eb6-11e7-b5ee-e14fece367d1','Media Billings - Magazine媒体收入','n',NULL,'1011-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea557a7-3eb6-11e7-b5ee-e14fece367d1','Media Billings - Radio媒体收入','n',NULL,'1011-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea557a8-3eb6-11e7-b5ee-e14fece367d1','Media Billings - Other媒体收入','n',NULL,'1011-005',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea557a9-3eb6-11e7-b5ee-e14fece367d1','Media Billing - Press媒体收入','n',NULL,'1011-008',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea557aa-3eb6-11e7-b5ee-e14fece367d1','Production Billings - TV制作收入','n',NULL,'1021-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea557ab-3eb6-11e7-b5ee-e14fece367d1','Production Billings - Print制作收入','n',NULL,'1021-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea557ac-3eb6-11e7-b5ee-e14fece367d1','Production Billings - Finished Arts','n',NULL,'1021-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea557ad-3eb6-11e7-b5ee-e14fece367d1','Production Billings - Design制作收入','n',NULL,'1021-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea557ae-3eb6-11e7-b5ee-e14fece367d1','Production Billings - Supervision','n',NULL,'1021-005',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea557af-3eb6-11e7-b5ee-e14fece367d1','Production Billings - Service制作收入','n',NULL,'1021-006',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea557b0-3eb6-11e7-b5ee-e14fece367d1','Production Billings - Other制作收入','n',NULL,'1021-007',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea557b1-3eb6-11e7-b5ee-e14fece367d1','Fee Billings - Retainer收入','n',NULL,'1031-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea557b2-3eb6-11e7-b5ee-e14fece367d1','Fee Billings - Interactive','n',NULL,'1031-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea57eb0-3eb6-11e7-b5ee-e14fece367d1','Billing for MB','n',NULL,'1041-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea57eb1-3eb6-11e7-b5ee-e14fece367d1','Production Billing - Website制作收入','n',NULL,'1051-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea57eb2-3eb6-11e7-b5ee-e14fece367d1','Production billing - Design','n',NULL,'1051-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea57eb3-3eb6-11e7-b5ee-e14fece367d1','Production billing - Sales Promotion','n',NULL,'1051-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea57eb4-3eb6-11e7-b5ee-e14fece367d1','Production billing - Campaign制作收入','n',NULL,'1051-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea57eb5-3eb6-11e7-b5ee-e14fece367d1','Production billing - PR','n',NULL,'1051-005',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea57eb6-3eb6-11e7-b5ee-e14fece367d1','Production billing - Direct Mail','n',NULL,'1051-006',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea57eb7-3eb6-11e7-b5ee-e14fece367d1','Production billing - Other(IF)','n',NULL,'1051-007',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea57eb8-3eb6-11e7-b5ee-e14fece367d1','Rave Project billings','n',NULL,'1061-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea57eb9-3eb6-11e7-b5ee-e14fece367d1','I/G Revenue HG','n',NULL,'1093-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea57eba-3eb6-11e7-b5ee-e14fece367d1','Media Cost of Billings - TV','n',NULL,'1111-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea57ebb-3eb6-11e7-b5ee-e14fece367d1','Media Cost of Billings - Outdoors','n',NULL,'1111-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea57ebc-3eb6-11e7-b5ee-e14fece367d1','Media Cost of Billings - Magazine','n',NULL,'1111-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea57ebd-3eb6-11e7-b5ee-e14fece367d1','Media Cost of Billings - Radio','n',NULL,'1111-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea57ebe-3eb6-11e7-b5ee-e14fece367d1','Media Cost of Billings - Other','n',NULL,'1111-005',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea57ebf-3eb6-11e7-b5ee-e14fece367d1','Media cost of Billing - Press','n',NULL,'1111-008',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5a5c0-3eb6-11e7-b5ee-e14fece367d1','Production Cost of Billings - TV制作成本','n',NULL,'1121-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5a5c1-3eb6-11e7-b5ee-e14fece367d1','Production Cost of Billings - Print成本','n',NULL,'1121-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5a5c2-3eb6-11e7-b5ee-e14fece367d1','Production CostofBillings-Finish Art成本','n',NULL,'1121-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5a5c3-3eb6-11e7-b5ee-e14fece367d1','Production Cost of Billings - Design成本','n',NULL,'1121-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5a5c4-3eb6-11e7-b5ee-e14fece367d1','Production CostofBillings-Supervisio成本','n',NULL,'1121-005',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5a5c5-3eb6-11e7-b5ee-e14fece367d1','Production Cost of Billings -Service成本','n',NULL,'1121-006',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5a5c6-3eb6-11e7-b5ee-e14fece367d1','Production Cost of Billings - Other成本','n',NULL,'1121-007',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5a5c7-3eb6-11e7-b5ee-e14fece367d1','Cost for MB','n',NULL,'1141-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5a5c8-3eb6-11e7-b5ee-e14fece367d1','Production Cost of Billing - Website成本','n',NULL,'1151-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5a5c9-3eb6-11e7-b5ee-e14fece367d1','Production cost of billing - Design','n',NULL,'1151-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5a5ca-3eb6-11e7-b5ee-e14fece367d1','Production cost of billing - Sale promot','n',NULL,'1151-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5a5cb-3eb6-11e7-b5ee-e14fece367d1','Production cost of billing -Campaign成本','n',NULL,'1151-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5a5cc-3eb6-11e7-b5ee-e14fece367d1','Production cost of biliing - PR','n',NULL,'1151-005',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5a5cd-3eb6-11e7-b5ee-e14fece367d1','Production cost of billing - Direct Mail','n',NULL,'1151-006',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5a5ce-3eb6-11e7-b5ee-e14fece367d1','Production cost of billing - Other(IF)','n',NULL,'1151-007',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5a5cf-3eb6-11e7-b5ee-e14fece367d1','Rave project costs of billings','n',NULL,'1161-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5a5d0-3eb6-11e7-b5ee-e14fece367d1','Landor Cost of Service Billed 成本','n',NULL,'1171-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5a5d1-3eb6-11e7-b5ee-e14fece367d1','Media Revenue - TV','n',NULL,'1211-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5a5d2-3eb6-11e7-b5ee-e14fece367d1','Media Revenue - OD','n',NULL,'1211-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5a5d3-3eb6-11e7-b5ee-e14fece367d1','Media Revenue - Magazine','n',NULL,'1211-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5a5d4-3eb6-11e7-b5ee-e14fece367d1','Media Revenue - Radio','n',NULL,'1211-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5a5d5-3eb6-11e7-b5ee-e14fece367d1','Media Revenue - Other','n',NULL,'1211-005',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5a5d6-3eb6-11e7-b5ee-e14fece367d1','Media Revenue for Tax Billing','n',NULL,'1211-006',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5ccd0-3eb6-11e7-b5ee-e14fece367d1','Agency rebate to MS','n',NULL,'1211-007',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5ccd1-3eb6-11e7-b5ee-e14fece367d1','Media Revenue - Press','n',NULL,'1211-008',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5ccd2-3eb6-11e7-b5ee-e14fece367d1','Production Revenue - TV收入','n',NULL,'1221-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5ccd3-3eb6-11e7-b5ee-e14fece367d1','Production Revenue - Print','n',NULL,'1221-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5ccd4-3eb6-11e7-b5ee-e14fece367d1','Production Revenue - Finished Arts','n',NULL,'1221-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5ccd5-3eb6-11e7-b5ee-e14fece367d1','Production Revenue - Design收入','n',NULL,'1221-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5ccd6-3eb6-11e7-b5ee-e14fece367d1','Production Revenue - Supervision','n',NULL,'1221-005',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5ccd7-3eb6-11e7-b5ee-e14fece367d1','Production Revenue - Service收入','n',NULL,'1221-006',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5ccd8-3eb6-11e7-b5ee-e14fece367d1','Production Revnue - Other收入','n',NULL,'1221-007',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5ccd9-3eb6-11e7-b5ee-e14fece367d1','Production Revenue for Tax Billing收入','n',NULL,'1221-008',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5ccda-3eb6-11e7-b5ee-e14fece367d1','Job Closure (P)/L收入','n',NULL,'1221-010',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5ccdb-3eb6-11e7-b5ee-e14fece367d1','Fee Billings - Production收入','n',NULL,'1231-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5ccdc-3eb6-11e7-b5ee-e14fece367d1','Production Revenue - Website收入','n',NULL,'1251-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5ccdd-3eb6-11e7-b5ee-e14fece367d1','Production revenue - Design','n',NULL,'1251-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5ccde-3eb6-11e7-b5ee-e14fece367d1','Production revenue - Sales promotion','n',NULL,'1251-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5ccdf-3eb6-11e7-b5ee-e14fece367d1','Production revenue - Campaign收入','n',NULL,'1251-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5cce0-3eb6-11e7-b5ee-e14fece367d1','production revenue - PR','n',NULL,'1251-005',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5cce1-3eb6-11e7-b5ee-e14fece367d1','Production revenue - Direct Mail','n',NULL,'1251-006',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5cce2-3eb6-11e7-b5ee-e14fece367d1','Production revenue - Other(IF)','n',NULL,'1251-007',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5cce3-3eb6-11e7-b5ee-e14fece367d1','Service Billed to Clients Landor收入','n',NULL,'1251-008',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5cce4-3eb6-11e7-b5ee-e14fece367d1','Rave project revenue','n',NULL,'1261-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5cce5-3eb6-11e7-b5ee-e14fece367d1','Discount Taken','n',NULL,'1300-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5cce6-3eb6-11e7-b5ee-e14fece367d1','Discount Given','n',NULL,'1310-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5cce7-3eb6-11e7-b5ee-e14fece367d1','Staff Salary - Account Handling工资','n',NULL,'1405-101',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5cce8-3eb6-11e7-b5ee-e14fece367d1','Cost of Living - Account Handling工资','n',NULL,'1405-111',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5cce9-3eb6-11e7-b5ee-e14fece367d1','Staff Salary - Creative工资','n',NULL,'1405-201',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5ccea-3eb6-11e7-b5ee-e14fece367d1','Cost of Living - Creative工资','n',NULL,'1405-211',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3e0-3eb6-11e7-b5ee-e14fece367d1','Staff Salary - Productiion / Traffic工资','n',NULL,'1405-301',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3e1-3eb6-11e7-b5ee-e14fece367d1','Cost of Living - Production /Traffic工资','n',NULL,'1405-311',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3e2-3eb6-11e7-b5ee-e14fece367d1','Staff Salary - Media工资','n',NULL,'1405-401',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3e3-3eb6-11e7-b5ee-e14fece367d1','Cost of Living - Media工资','n',NULL,'1405-411',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3e4-3eb6-11e7-b5ee-e14fece367d1','Staff Salary - Research工资','n',NULL,'1405-501',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3e5-3eb6-11e7-b5ee-e14fece367d1','Cost of Living - Research工资','n',NULL,'1405-511',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3e6-3eb6-11e7-b5ee-e14fece367d1','Staff Salary - DPS/DIC工资','n',NULL,'1405-601',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3e7-3eb6-11e7-b5ee-e14fece367d1','Cost of Living - DPS/DIC','n',NULL,'1405-611',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3e8-3eb6-11e7-b5ee-e14fece367d1','Staff Salary for Image Factory','n',NULL,'1405-621',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3e9-3eb6-11e7-b5ee-e14fece367d1','Staff Salary - Event Market','n',NULL,'1405-631',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3ea-3eb6-11e7-b5ee-e14fece367d1','Staff Salary - General Management工资','n',NULL,'1405-701',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3eb-3eb6-11e7-b5ee-e14fece367d1','Cost of Living - General Management工资','n',NULL,'1405-711',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3ec-3eb6-11e7-b5ee-e14fece367d1','Staff Salary - Finance & Admin工资','n',NULL,'1405-801',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3ed-3eb6-11e7-b5ee-e14fece367d1','Cost of Living - Finance & Admin','n',NULL,'1405-811',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3ee-3eb6-11e7-b5ee-e14fece367d1','Staff Overtime Taxi','n',NULL,'1405-901',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3ef-3eb6-11e7-b5ee-e14fece367d1','Over Time - Dinner','n',NULL,'1405-911',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3f0-3eb6-11e7-b5ee-e14fece367d1','Staff Medical Expense','n',NULL,'1405-921',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3f1-3eb6-11e7-b5ee-e14fece367d1','Client Taxi 差旅费','n',NULL,'1405-931',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3f2-3eb6-11e7-b5ee-e14fece367d1','Salary - MS Management','n',NULL,'1406-101',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3f3-3eb6-11e7-b5ee-e14fece367d1','MS Cost of Living - Management','n',NULL,'1406-111',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3f4-3eb6-11e7-b5ee-e14fece367d1','Salary - MS Planning','n',NULL,'1406-201',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3f5-3eb6-11e7-b5ee-e14fece367d1','MS Cost of Living - MS Planning','n',NULL,'1406-211',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3f6-3eb6-11e7-b5ee-e14fece367d1','Salary - MS Mone','n',NULL,'1406-301',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3f7-3eb6-11e7-b5ee-e14fece367d1','MS Cost of Living - Mone','n',NULL,'1406-311',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3f8-3eb6-11e7-b5ee-e14fece367d1','Salary - MS ATG','n',NULL,'1406-401',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3f9-3eb6-11e7-b5ee-e14fece367d1','MS Cost of Living - ATG','n',NULL,'1406-411',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3fa-3eb6-11e7-b5ee-e14fece367d1','Salary - MS Broadmind','n',NULL,'1406-501',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3fb-3eb6-11e7-b5ee-e14fece367d1','MS Cost of Living - Broadmind','n',NULL,'1406-511',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3fc-3eb6-11e7-b5ee-e14fece367d1','Salary - MS Finance & Admin','n',NULL,'1406-601',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea5f3fd-3eb6-11e7-b5ee-e14fece367d1','MS Cost of Living - Finance & Admin','n',NULL,'1406-611',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea61af0-3eb6-11e7-b5ee-e14fece367d1','Salary - MS IT','n',NULL,'1406-701',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea61af1-3eb6-11e7-b5ee-e14fece367d1','MS Cost of Living - IT','n',NULL,'1406-711',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea61af2-3eb6-11e7-b5ee-e14fece367d1','Salary - MS Buying','n',NULL,'1406-801',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea61af3-3eb6-11e7-b5ee-e14fece367d1','MS Cost of Living - Buying','n',NULL,'1406-811',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea61af4-3eb6-11e7-b5ee-e14fece367d1','Salary - MS Outdoor','n',NULL,'1406-901',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea61af5-3eb6-11e7-b5ee-e14fece367d1','MS Cost of Living - Outdoor','n',NULL,'1406-911',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea61af6-3eb6-11e7-b5ee-e14fece367d1','Salary - MS Research','n',NULL,'1406-A01',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea61af7-3eb6-11e7-b5ee-e14fece367d1','MS Cost of Living - Research','n',NULL,'1406-A11',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea61af8-3eb6-11e7-b5ee-e14fece367d1','Salary - MS Unilever TV','n',NULL,'1406-B01',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea61af9-3eb6-11e7-b5ee-e14fece367d1','MS Cost of Living - Unilever TV','n',NULL,'1406-B11',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea61afa-3eb6-11e7-b5ee-e14fece367d1','MS Salary - Maxus','n',NULL,'1406-C01',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea61afb-3eb6-11e7-b5ee-e14fece367d1','MS Cost of Living - Maxus','n',NULL,'1406-C11',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea61afc-3eb6-11e7-b5ee-e14fece367d1','Staff Salay -Landor-Account Handling工资','n',NULL,'1407-101',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea61afd-3eb6-11e7-b5ee-e14fece367d1','Staff Salary - Landor - New Business工资','n',NULL,'1407-201',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea61afe-3eb6-11e7-b5ee-e14fece367d1','Employer\'s Social Taxes社保费','n',NULL,'1410-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea61aff-3eb6-11e7-b5ee-e14fece367d1','Pensions养老金','n',NULL,'1420-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea61b00-3eb6-11e7-b5ee-e14fece367d1','Severances离职费','n',NULL,'1425-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea61b01-3eb6-11e7-b5ee-e14fece367d1','Freelance / Temporary Help临时工','n',NULL,'1440-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea61b02-3eb6-11e7-b5ee-e14fece367d1','Freelance - Aiyi临时工','n',NULL,'1440-0011',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea61b03-3eb6-11e7-b5ee-e14fece367d1','Freelance for Temp Aryi','n',NULL,'1440-0012',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea61b04-3eb6-11e7-b5ee-e14fece367d1','Freelance - Operation临时工','n',NULL,'1440-0013',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea61b05-3eb6-11e7-b5ee-e14fece367d1','Freelance for Finance & IT','n',NULL,'1440-0014',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea61b06-3eb6-11e7-b5ee-e14fece367d1','Freelance for Creative临时工','n',NULL,'1440-0015',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea61b07-3eb6-11e7-b5ee-e14fece367d1','Sales Commissions / Spot Bonuses','n',NULL,'1450-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea61b08-3eb6-11e7-b5ee-e14fece367d1','Short Term Incentive Bonuses奖金','n',NULL,'1451-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea61b09-3eb6-11e7-b5ee-e14fece367d1','recruitment Fee招聘费','n',NULL,'1452-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea61b0a-3eb6-11e7-b5ee-e14fece367d1','I/Co. Time of Staff - INTRA 内部员工成本','n',NULL,'1460-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea64200-3eb6-11e7-b5ee-e14fece367d1','I/Co. Time of Staff - INTER 内部员工成本','n',NULL,'1460-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea64201-3eb6-11e7-b5ee-e14fece367d1','Other Staff Costs其他员工成本','n',NULL,'1470-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea64202-3eb6-11e7-b5ee-e14fece367d1','Other Staff Costs - Charge to Landor','n',NULL,'1470-0011',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea64203-3eb6-11e7-b5ee-e14fece367d1','Other Staff Costs - China Partner','n',NULL,'1470-0012',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea64204-3eb6-11e7-b5ee-e14fece367d1','Other Staff Costs - PRC Finance','n',NULL,'1470-0013',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea64205-3eb6-11e7-b5ee-e14fece367d1','Other Staff Costs - BJ HQ Charge','n',NULL,'1470-0014',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea64206-3eb6-11e7-b5ee-e14fece367d1','Other Staff Costs - Pepsi GZ','n',NULL,'1470-0015',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea64207-3eb6-11e7-b5ee-e14fece367d1','Other Staff Costs - Siemens GZ','n',NULL,'1470-0016',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea64208-3eb6-11e7-b5ee-e14fece367d1','Other Staff Costs - Unicharm GZ','n',NULL,'1470-0017',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea64209-3eb6-11e7-b5ee-e14fece367d1','Other Staff Costs - Unicharm BJ','n',NULL,'1470-0018',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6420a-3eb6-11e7-b5ee-e14fece367d1','Holiday Pay','n',NULL,'1470-0019',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6420b-3eb6-11e7-b5ee-e14fece367d1','JWTGZ Expense','n',NULL,'1470-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6420c-3eb6-11e7-b5ee-e14fece367d1','Employee relocation expenses','n',NULL,'1471-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6420d-3eb6-11e7-b5ee-e14fece367d1','Benefits - Overtime福利','n',NULL,'1480-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6420e-3eb6-11e7-b5ee-e14fece367d1','Benefits - House Allowance福利','n',NULL,'1480-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6420f-3eb6-11e7-b5ee-e14fece367d1','Benefits - Home Leave Allowance福利','n',NULL,'1480-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea64210-3eb6-11e7-b5ee-e14fece367d1','Benefits - Car Park Allowance福利','n',NULL,'1480-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea64211-3eb6-11e7-b5ee-e14fece367d1','Benefits - Expatriate Positioning福利','n',NULL,'1480-005',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea64212-3eb6-11e7-b5ee-e14fece367d1','Benefits - Medical福利','n',NULL,'1480-006',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea64213-3eb6-11e7-b5ee-e14fece367d1','Benefits - Membership & Subscriptions','n',NULL,'1480-007',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea64214-3eb6-11e7-b5ee-e14fece367d1','Benefits - Other Allowance福利','n',NULL,'1480-008',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea64215-3eb6-11e7-b5ee-e14fece367d1','Car Running Costs / Leases差旅费','n',NULL,'1485-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea64216-3eb6-11e7-b5ee-e14fece367d1','Car Depreciation','n',NULL,'1486-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea64217-3eb6-11e7-b5ee-e14fece367d1','Rent办公室租金','n',NULL,'1500-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea64218-3eb6-11e7-b5ee-e14fece367d1','Rates','n',NULL,'1501-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea64219-3eb6-11e7-b5ee-e14fece367d1','Management Fee物业管理费','n',NULL,'1502-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66910-3eb6-11e7-b5ee-e14fece367d1','Building Depreciation房屋折旧','n',NULL,'1510-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66911-3eb6-11e7-b5ee-e14fece367d1','Dilapidations(back to normal cost)重置费','n',NULL,'1515-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66912-3eb6-11e7-b5ee-e14fece367d1','Electricity电费','n',NULL,'1520-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66913-3eb6-11e7-b5ee-e14fece367d1','Office Cleaning清洁费','n',NULL,'1521-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66914-3eb6-11e7-b5ee-e14fece367d1','Office Flowers办公室鲜花','n',NULL,'1521-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66915-3eb6-11e7-b5ee-e14fece367d1','Bike Parking','n',NULL,'1521-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66916-3eb6-11e7-b5ee-e14fece367d1','Other Utilities办公费','n',NULL,'1522-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66917-3eb6-11e7-b5ee-e14fece367d1','Repairs & Renewals维修费','n',NULL,'1530-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66918-3eb6-11e7-b5ee-e14fece367d1','I/C Service & Facilities公司内部服务费','n',NULL,'1540-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66919-3eb6-11e7-b5ee-e14fece367d1','Other Establishment Costs其他设施费','n',NULL,'1550-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6691a-3eb6-11e7-b5ee-e14fece367d1','Travel差旅费','n',NULL,'1600-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6691b-3eb6-11e7-b5ee-e14fece367d1','Travel - Finance差旅费','n',NULL,'1600-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6691c-3eb6-11e7-b5ee-e14fece367d1','Travel - Management差旅费','n',NULL,'1600-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6691d-3eb6-11e7-b5ee-e14fece367d1','Travel for Account Service差旅费','n',NULL,'1600-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6691e-3eb6-11e7-b5ee-e14fece367d1','Travel for Strategy & Planning差旅费','n',NULL,'1600-005',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6691f-3eb6-11e7-b5ee-e14fece367d1','Travel for Creative Department差旅费','n',NULL,'1600-006',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66920-3eb6-11e7-b5ee-e14fece367d1','Travel for IT and Admin差旅费','n',NULL,'1600-007',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66921-3eb6-11e7-b5ee-e14fece367d1','Travel for China Partner差旅费','n',NULL,'1600-008',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66922-3eb6-11e7-b5ee-e14fece367d1','Travel for Regional Staff 差旅费','n',NULL,'1600-009',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66923-3eb6-11e7-b5ee-e14fece367d1','Travel Client meetings差旅费-客户','n',NULL,'1600-101',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66924-3eb6-11e7-b5ee-e14fece367d1','Travel Internal meetings/conferences差旅国外','n',NULL,'1600-102',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66925-3eb6-11e7-b5ee-e14fece367d1','Travel Other差旅费-其他','n',NULL,'1600-103',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66926-3eb6-11e7-b5ee-e14fece367d1','Allowrance津贴','n',NULL,'1604-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66927-3eb6-11e7-b5ee-e14fece367d1','Entertainment - Others & Personal应酬费','n',NULL,'1605-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66928-3eb6-11e7-b5ee-e14fece367d1','Entertainment - China Partner应酬费','n',NULL,'1620-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66929-3eb6-11e7-b5ee-e14fece367d1','Entertainment - China Finance&Fin应酬费','n',NULL,'1620-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6692a-3eb6-11e7-b5ee-e14fece367d1','Entertainment - Management应酬费','n',NULL,'1620-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6692b-3eb6-11e7-b5ee-e14fece367d1','Entertainment - Account Service应酬费','n',NULL,'1620-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6692c-3eb6-11e7-b5ee-e14fece367d1','Entertainment - Strategy&Planning应酬费','n',NULL,'1620-005',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6692d-3eb6-11e7-b5ee-e14fece367d1','Entertainment - Creative & CSU应酬费','n',NULL,'1620-006',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6692e-3eb6-11e7-b5ee-e14fece367d1','Staff Training - Travel培训差旅费','n',NULL,'1630-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6692f-3eb6-11e7-b5ee-e14fece367d1','Staff Training - Accommodation培训住宿费','n',NULL,'1630-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66930-3eb6-11e7-b5ee-e14fece367d1','Staff Training - Course Fee课程费','n',NULL,'1630-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66931-3eb6-11e7-b5ee-e14fece367d1','Staff Training - Annual Review Board','n',NULL,'1630-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66932-3eb6-11e7-b5ee-e14fece367d1','Staff Training - Subscribtion','n',NULL,'1630-005',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66933-3eb6-11e7-b5ee-e14fece367d1','Staff Training - IT & SM','n',NULL,'1630-006',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66934-3eb6-11e7-b5ee-e14fece367d1','Staff Training - Others培训费','n',NULL,'1630-007',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66935-3eb6-11e7-b5ee-e14fece367d1','Other Personal Costs其他人事费用','n',NULL,'1640-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66936-3eb6-11e7-b5ee-e14fece367d1','Membership dues and subscription','n',NULL,'1641-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66937-3eb6-11e7-b5ee-e14fece367d1','Employee flower/gifts','n',NULL,'1642-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66938-3eb6-11e7-b5ee-e14fece367d1','I/C Personal Costs Rechg公司内部人事费用','n',NULL,'1644-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66939-3eb6-11e7-b5ee-e14fece367d1','Advertising & Promotion - Award Entry Fe','n',NULL,'1700-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6693a-3eb6-11e7-b5ee-e14fece367d1','Adver.& Pro. - Direct MB & JWT Brand.','n',NULL,'1700-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6693b-3eb6-11e7-b5ee-e14fece367d1','Adver. & Pro. - Frame','n',NULL,'1700-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6693c-3eb6-11e7-b5ee-e14fece367d1','Adver. & Pro. - JWT Campaign','n',NULL,'1700-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6693d-3eb6-11e7-b5ee-e14fece367d1','Adver. & Pro - EW & GC Web Site','n',NULL,'1700-005',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6693e-3eb6-11e7-b5ee-e14fece367d1','Adver. & Pro. - Others广告促销费','n',NULL,'1700-006',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6693f-3eb6-11e7-b5ee-e14fece367d1','Bad Debts坏帐费用','n',NULL,'1710-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66940-3eb6-11e7-b5ee-e14fece367d1','Non-Billable Production不可收客户费用','n',NULL,'1730-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66941-3eb6-11e7-b5ee-e14fece367d1','Non-Billable Prod-Illustration不可收插画','n',NULL,'1730-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea66942-3eb6-11e7-b5ee-e14fece367d1','WIP > 180 days','n',NULL,'1732-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea69020-3eb6-11e7-b5ee-e14fece367d1','Other Commercial Costs商业费用','n',NULL,'1740-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea69021-3eb6-11e7-b5ee-e14fece367d1','Corporate membership subscriptions','n',NULL,'1741-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea69022-3eb6-11e7-b5ee-e14fece367d1','Award shows参赛费','n',NULL,'1743-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea69023-3eb6-11e7-b5ee-e14fece367d1','New business Accommodation and subsisten','n',NULL,'1750-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea69024-3eb6-11e7-b5ee-e14fece367d1','New business Consultants or Freelances o','n',NULL,'1750-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea69025-3eb6-11e7-b5ee-e14fece367d1','New business Other新业务开发','n',NULL,'1750-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea69026-3eb6-11e7-b5ee-e14fece367d1','New business Production','n',NULL,'1750-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea69027-3eb6-11e7-b5ee-e14fece367d1','New business Travel','n',NULL,'1750-005',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea69028-3eb6-11e7-b5ee-e14fece367d1','Research Cost - SRG Ad Bank','n',NULL,'1760-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea69029-3eb6-11e7-b5ee-e14fece367d1','Research Cost - Tapes','n',NULL,'1760-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6902a-3eb6-11e7-b5ee-e14fece367d1','Research Cost - In Focus Group','n',NULL,'1760-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6902b-3eb6-11e7-b5ee-e14fece367d1','Research Cost - Others调研费','n',NULL,'1760-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6902c-3eb6-11e7-b5ee-e14fece367d1','I/G Media Buying Fees','n',NULL,'1785-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6902d-3eb6-11e7-b5ee-e14fece367d1','Stationery / Office Supplies办公费','n',NULL,'1800-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6902e-3eb6-11e7-b5ee-e14fece367d1','Printings印刷费','n',NULL,'1800-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6902f-3eb6-11e7-b5ee-e14fece367d1','Arts Materials办公费','n',NULL,'1800-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea69030-3eb6-11e7-b5ee-e14fece367d1','Stationery - Tapes','n',NULL,'1800-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea69031-3eb6-11e7-b5ee-e14fece367d1','Stationery - Others办公费','n',NULL,'1800-005',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea69032-3eb6-11e7-b5ee-e14fece367d1','Equipment Lease (non Motor)','n',NULL,'1810-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea69033-3eb6-11e7-b5ee-e14fece367d1','Maintenance - Copiers维护费','n',NULL,'1820-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea69034-3eb6-11e7-b5ee-e14fece367d1','Maintenance - Others维护费','n',NULL,'1820-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea69035-3eb6-11e7-b5ee-e14fece367d1','Maintenance/Service-ComputerEquip维护费','n',NULL,'1820-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea69036-3eb6-11e7-b5ee-e14fece367d1','Soft & Hardware-ComputerMaintenace维护费','n',NULL,'1830-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6b730-3eb6-11e7-b5ee-e14fece367d1','Soft & Hardware-Printer Maintenace维护费','n',NULL,'1830-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6b731-3eb6-11e7-b5ee-e14fece367d1','Soft & Hardware-CreativeMaintenace维护费','n',NULL,'1830-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6b732-3eb6-11e7-b5ee-e14fece367d1','Soft & Hardware - Finance','n',NULL,'1830-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6b733-3eb6-11e7-b5ee-e14fece367d1','Soft & Hardware - Software etc.维护费','n',NULL,'1830-005',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6b734-3eb6-11e7-b5ee-e14fece367d1','Soft & Hardware - Others维护费','n',NULL,'1830-006',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6b735-3eb6-11e7-b5ee-e14fece367d1','Depreciation - Computer 电脑折旧费','n',NULL,'1840-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6b736-3eb6-11e7-b5ee-e14fece367d1','Depriation-Furniture&Fixture办公家具折旧','n',NULL,'1840-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6b737-3eb6-11e7-b5ee-e14fece367d1','Amortization - Leasehold Improvement','n',NULL,'1840-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6b738-3eb6-11e7-b5ee-e14fece367d1','Telephone & Fax - IDD & DDD电话费','n',NULL,'1850-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6b739-3eb6-11e7-b5ee-e14fece367d1','Telephone & Fax - Lease Line电话费','n',NULL,'1850-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6b73a-3eb6-11e7-b5ee-e14fece367d1','Telephone & Fax - Mobile Phone电话费','n',NULL,'1850-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6b73b-3eb6-11e7-b5ee-e14fece367d1','Tel & Fax - Others','n',NULL,'1850-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6b73c-3eb6-11e7-b5ee-e14fece367d1','Data Communication Cost 电话费','n',NULL,'1855-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6b73d-3eb6-11e7-b5ee-e14fece367d1','Postage - EMS邮寄费','n',NULL,'1860-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6b73e-3eb6-11e7-b5ee-e14fece367d1','Postage - Local Courier邮寄费','n',NULL,'1860-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de40-3eb6-11e7-b5ee-e14fece367d1','Postage - Others邮寄费','n',NULL,'1860-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de41-3eb6-11e7-b5ee-e14fece367d1','Group Finance System Costs','n',NULL,'1864-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de42-3eb6-11e7-b5ee-e14fece367d1','Other IT & Communication Costs信息费','n',NULL,'1865-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de43-3eb6-11e7-b5ee-e14fece367d1','Industry Costs','n',NULL,'1870-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de44-3eb6-11e7-b5ee-e14fece367d1','Newspaper & Clippings 报刊费','n',NULL,'1870-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de45-3eb6-11e7-b5ee-e14fece367d1','Air freight','n',NULL,'1870-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de46-3eb6-11e7-b5ee-e14fece367d1','Library & Reference Materials','n',NULL,'1870-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de47-3eb6-11e7-b5ee-e14fece367d1','Audio / Visual Costs','n',NULL,'1870-005',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de48-3eb6-11e7-b5ee-e14fece367d1','Photography','n',NULL,'1870-006',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de49-3eb6-11e7-b5ee-e14fece367d1','Awards Entry Costs','n',NULL,'1870-007',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de4a-3eb6-11e7-b5ee-e14fece367d1','Miscellaneous杂费','n',NULL,'1870-008',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de4b-3eb6-11e7-b5ee-e14fece367d1','China Partner','n',NULL,'1870-009',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de4c-3eb6-11e7-b5ee-e14fece367d1','Photocopies (B/W)','n',NULL,'1885-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de4d-3eb6-11e7-b5ee-e14fece367d1','Photocopies (Colour)','n',NULL,'1885-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de4e-3eb6-11e7-b5ee-e14fece367d1','Xerox Printing equipment lease','n',NULL,'1885-101',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de4f-3eb6-11e7-b5ee-e14fece367d1','Xerox Printing equipment cost incl maint','n',NULL,'1885-102',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de50-3eb6-11e7-b5ee-e14fece367d1','Xerox Printing other','n',NULL,'1885-103',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de51-3eb6-11e7-b5ee-e14fece367d1','Other print suppliers Printing equipment_1','n',NULL,'1885-201',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de52-3eb6-11e7-b5ee-e14fece367d1','Other print suppliers Printing equipment_2','n',NULL,'1885-202',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de53-3eb6-11e7-b5ee-e14fece367d1','Other print suppliers Printing other','n',NULL,'1885-203',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de54-3eb6-11e7-b5ee-e14fece367d1','Outsourced Business System外包系统费','n',NULL,'1886-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de55-3eb6-11e7-b5ee-e14fece367d1','Inter-company IT costs recharges','n',NULL,'1886-005',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de56-3eb6-11e7-b5ee-e14fece367d1','Outsourced IT Service','n',NULL,'1887-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de57-3eb6-11e7-b5ee-e14fece367d1','WPP Business Services/IBM costs','n',NULL,'1888-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de58-3eb6-11e7-b5ee-e14fece367d1','Audit Fees审计费','n',NULL,'1900-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de59-3eb6-11e7-b5ee-e14fece367d1','Tax Filing Fees','n',NULL,'1900-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de5a-3eb6-11e7-b5ee-e14fece367d1','Accountancy Costs会计成本','n',NULL,'1910-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de5b-3eb6-11e7-b5ee-e14fece367d1','Legal Fees - JV','n',NULL,'1920-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de5c-3eb6-11e7-b5ee-e14fece367d1','Legal Fee律师费','n',NULL,'1920-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de5d-3eb6-11e7-b5ee-e14fece367d1','Legal Fee - AA','n',NULL,'1920-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de5e-3eb6-11e7-b5ee-e14fece367d1','Legal - Others律师费','n',NULL,'1920-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de5f-3eb6-11e7-b5ee-e14fece367d1','Acquisition Advisory cost','n',NULL,'1922-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de60-3eb6-11e7-b5ee-e14fece367d1','Insurance Property财产保险','n',NULL,'1930-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de61-3eb6-11e7-b5ee-e14fece367d1','Insurance - People','n',NULL,'1930-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de62-3eb6-11e7-b5ee-e14fece367d1','Bank Charges银行手续费','n',NULL,'1935-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de63-3eb6-11e7-b5ee-e14fece367d1','Other Finance / General Costs办公费','n',NULL,'1940-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de64-3eb6-11e7-b5ee-e14fece367d1','Co-ordination Costs协调费','n',NULL,'1971-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de65-3eb6-11e7-b5ee-e14fece367d1','Co-codination O/H Reverse协调费冲回','n',NULL,'1971-011',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de66-3eb6-11e7-b5ee-e14fece367d1','Regional OH Allocation Costs地区成本分配','n',NULL,'1972-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de67-3eb6-11e7-b5ee-e14fece367d1','Reginal Overhead Reverse地区成本冲回','n',NULL,'1972-011',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de68-3eb6-11e7-b5ee-e14fece367d1','Worldwide OverheadAllocation全球成本分配','n',NULL,'1973-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de69-3eb6-11e7-b5ee-e14fece367d1','Worldwide Overhead Reverse全球成本冲回','n',NULL,'1973-011',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de6a-3eb6-11e7-b5ee-e14fece367d1','Exceptional Items','n',NULL,'1991-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de6b-3eb6-11e7-b5ee-e14fece367d1','(Gains) / Losses on Sale FA 营业外收支','n',NULL,'1992-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de6c-3eb6-11e7-b5ee-e14fece367d1','Exchange(Gains)/Losses-Realized汇兑损益 ','n',NULL,'1993-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de6d-3eb6-11e7-b5ee-e14fece367d1','I/G Exchange (Gains)/Losses 汇兑损益','n',NULL,'1993-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de6e-3eb6-11e7-b5ee-e14fece367d1','Goodwill Amortization','n',NULL,'1994-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea6de6f-3eb6-11e7-b5ee-e14fece367d1','Landor Managment fee - BAV License','n',NULL,'1995-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea70550-3eb6-11e7-b5ee-e14fece367d1','Equity Income (Loss)','n',NULL,'1996-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea70551-3eb6-11e7-b5ee-e14fece367d1','Other (Income) / Expenses其他收入','n',NULL,'1998-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea70552-3eb6-11e7-b5ee-e14fece367d1','MPLB Adjustment管理层调整','n',NULL,'1998-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea70553-3eb6-11e7-b5ee-e14fece367d1','Other Income 其他收入','n',NULL,'1998-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea70554-3eb6-11e7-b5ee-e14fece367d1','Revenue for MPLB Reverse 管理层收入冲回','n',NULL,'1998-012',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea70555-3eb6-11e7-b5ee-e14fece367d1','External Interest Income外部利息收入','n',NULL,'2291-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea70556-3eb6-11e7-b5ee-e14fece367d1','I/G Interest Income','n',NULL,'2292-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea70557-3eb6-11e7-b5ee-e14fece367d1','External Interest Expenses','n',NULL,'2294-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea70558-3eb6-11e7-b5ee-e14fece367d1','I/G Interest Expenses','n',NULL,'2294-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea70559-3eb6-11e7-b5ee-e14fece367d1','HP / Lease Interest Expenses','n',NULL,'2294-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7055a-3eb6-11e7-b5ee-e14fece367d1','Tax Expense - BT & UCT营业税及河道税','n',NULL,'2600-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7055b-3eb6-11e7-b5ee-e14fece367d1','Tax Expenses - Stamp Duty印花税','n',NULL,'2600-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7055c-3eb6-11e7-b5ee-e14fece367d1','Tax - Income Tax','n',NULL,'2600-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7055d-3eb6-11e7-b5ee-e14fece367d1','Service Fee','n',NULL,'2860-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7055e-3eb6-11e7-b5ee-e14fece367d1','Trade Debtors - JWT应收帐款','n',NULL,'8150-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7055f-3eb6-11e7-b5ee-e14fece367d1','Trade Debtors - MS应收帐款','n',NULL,'8150-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea70560-3eb6-11e7-b5ee-e14fece367d1','Other Debtors其他应收款','n',NULL,'8150-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea70561-3eb6-11e7-b5ee-e14fece367d1','JWT Intercompany Receivables公司内部应收','n',NULL,'8150-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea70562-3eb6-11e7-b5ee-e14fece367d1','Fee  Debtor Accrual','n',NULL,'8150-005',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea70563-3eb6-11e7-b5ee-e14fece367d1','Trade Debtors - MB','n',NULL,'8150-006',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea70564-3eb6-11e7-b5ee-e14fece367d1','MS Intercompany Receivables公司内部应收','n',NULL,'8150-007',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea70565-3eb6-11e7-b5ee-e14fece367d1','Production Debtors-Direct cost','n',NULL,'8150-008',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea70566-3eb6-11e7-b5ee-e14fece367d1','C&W Intercompany Receivables公司内部应收','n',NULL,'8150-009',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea70567-3eb6-11e7-b5ee-e14fece367d1','Other Debtors-Travel其他应收款','n',NULL,'8150-010',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea72c60-3eb6-11e7-b5ee-e14fece367d1','Other Debtors-Other Expense其他应收款','n',NULL,'8150-011',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea72c61-3eb6-11e7-b5ee-e14fece367d1','Provision for Doubtful Debts坏帐准备','n',NULL,'8151-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea72c62-3eb6-11e7-b5ee-e14fece367d1','Work in Progress - External自制半成品','n',NULL,'8200-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea72c63-3eb6-11e7-b5ee-e14fece367d1','Work in Progress - Internal自制半成品','n',NULL,'8200-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea72c64-3eb6-11e7-b5ee-e14fece367d1','Work in Progress - Internal Offset半成品','n',NULL,'8200-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea72c65-3eb6-11e7-b5ee-e14fece367d1','Work in Progress - Overhead','n',NULL,'8200-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea72c66-3eb6-11e7-b5ee-e14fece367d1','Work in Progress-Estimate Billing半成品','n',NULL,'8200-005',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea75370-3eb6-11e7-b5ee-e14fece367d1','Work in Progress - Manual','n',NULL,'8200-006',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea75371-3eb6-11e7-b5ee-e14fece367d1','Work in Progress - Non Job','n',NULL,'8200-007',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea75372-3eb6-11e7-b5ee-e14fece367d1','WIP - Image Factory & Rave','n',NULL,'8200-101',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea75373-3eb6-11e7-b5ee-e14fece367d1','WIP - Rave自制半成品','n',NULL,'8200-102',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea75374-3eb6-11e7-b5ee-e14fece367d1','Provision for Unchargeable Prod\'n Costs','n',NULL,'8201-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea75375-3eb6-11e7-b5ee-e14fece367d1','Cash Advance -备用金','n',NULL,'8300-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea75376-3eb6-11e7-b5ee-e14fece367d1','Cash Advance - DPS/DIC','n',NULL,'8300-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea75377-3eb6-11e7-b5ee-e14fece367d1','Cash Advance - MB','n',NULL,'8300-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea75378-3eb6-11e7-b5ee-e14fece367d1','Cash Advance - IF','n',NULL,'8300-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea75379-3eb6-11e7-b5ee-e14fece367d1','Refundable Deposit押金','n',NULL,'8310-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7537a-3eb6-11e7-b5ee-e14fece367d1','Revenue accrual - MS预估收入','n',NULL,'8315-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7537b-3eb6-11e7-b5ee-e14fece367d1','Inter Office Receivable - BJ','n',NULL,'8315-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7537c-3eb6-11e7-b5ee-e14fece367d1','Inter Office Receivable -GZ','n',NULL,'8315-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7537d-3eb6-11e7-b5ee-e14fece367d1','Prepayment to Media Vendor预付帐款','n',NULL,'8315-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7537e-3eb6-11e7-b5ee-e14fece367d1','Prepayment to Production Suppliers','n',NULL,'8315-005',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7537f-3eb6-11e7-b5ee-e14fece367d1','Prepayment to Other Suppliers预付帐款','n',NULL,'8315-006',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea75380-3eb6-11e7-b5ee-e14fece367d1','Prepaid Media','n',NULL,'8315-007',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea75381-3eb6-11e7-b5ee-e14fece367d1','Prepayment for Mindworks','n',NULL,'8315-008',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea75382-3eb6-11e7-b5ee-e14fece367d1','Media prepayment for MF','n',NULL,'8315-009',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea75383-3eb6-11e7-b5ee-e14fece367d1','Rebate MS Suspense Account','n',NULL,'8315-011',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea75384-3eb6-11e7-b5ee-e14fece367d1','Other Receivable - MB','n',NULL,'8350-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea75385-3eb6-11e7-b5ee-e14fece367d1','OtherReceivable-IntercomSuspense其他应收','n',NULL,'8350-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea75386-3eb6-11e7-b5ee-e14fece367d1','Interest Receivable (Non-Group Only)','n',NULL,'8360-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea75387-3eb6-11e7-b5ee-e14fece367d1','Pension Prepayment','n',NULL,'8370-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea75388-3eb6-11e7-b5ee-e14fece367d1','Other Current Assets','n',NULL,'8399-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea75389-3eb6-11e7-b5ee-e14fece367d1','Debeers - DIC/DPS Direct Charges','n',NULL,'8399-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea77a80-3eb6-11e7-b5ee-e14fece367d1','Fee Debtors Accrual - JWT预估收入','n',NULL,'8399-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea77a81-3eb6-11e7-b5ee-e14fece367d1','Prepaid Expense待摊费用','n',NULL,'8399-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea77a82-3eb6-11e7-b5ee-e14fece367d1','Midland Bank Trust Fund','n',NULL,'8400-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea77a83-3eb6-11e7-b5ee-e14fece367d1','Pre-Operating Expense','n',NULL,'8500-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea77a84-3eb6-11e7-b5ee-e14fece367d1','Pre-Operating Expense- Amortization','n',NULL,'8500-011',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea77a85-3eb6-11e7-b5ee-e14fece367d1','Investment in Subsidies','n',NULL,'8550-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea77a86-3eb6-11e7-b5ee-e14fece367d1','Furniture & Fixtures固定资产','n',NULL,'8600-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea77a87-3eb6-11e7-b5ee-e14fece367d1','Computer Equipment固定资产','n',NULL,'8600-010',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea77a88-3eb6-11e7-b5ee-e14fece367d1','Other Office Equipment固定资产','n',NULL,'8600-0111',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea77a89-3eb6-11e7-b5ee-e14fece367d1','Motor Car','n',NULL,'8600-020',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea77a8a-3eb6-11e7-b5ee-e14fece367d1','Leasehold Improvement - A长期待摊费用','n',NULL,'8600-025',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea77a8b-3eb6-11e7-b5ee-e14fece367d1','Leasehold Improvement - B','n',NULL,'8600-026',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea77a8c-3eb6-11e7-b5ee-e14fece367d1','Leasehold Improvement 长期待摊费用','n',NULL,'8600-027',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7a190-3eb6-11e7-b5ee-e14fece367d1','Leasehold Improvement - IF','n',NULL,'8600-028',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7a191-3eb6-11e7-b5ee-e14fece367d1','Depreciation Furniture&Fixtures累计折旧','n',NULL,'8601-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7a192-3eb6-11e7-b5ee-e14fece367d1','Depreciation - ComputerEquipment累计折旧','n',NULL,'8601-011',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7a193-3eb6-11e7-b5ee-e14fece367d1','Depreciation-OtherOfficeEquipment累计折','n',NULL,'8601-0111',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7a194-3eb6-11e7-b5ee-e14fece367d1','Depreciation - Car','n',NULL,'8601-020',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7a195-3eb6-11e7-b5ee-e14fece367d1','Amort\'n L/H Improvement - A长期待摊费用','n',NULL,'8601-025',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7c8a0-3eb6-11e7-b5ee-e14fece367d1','Amort\'n - L/H Improvement - B','n',NULL,'8601-026',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7c8a1-3eb6-11e7-b5ee-e14fece367d1','Leasehold Improvement Amotization - GZ ','n',NULL,'8601-027',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7c8a2-3eb6-11e7-b5ee-e14fece367d1','Leasehold Improvement Amortization -IF','n',NULL,'8601-028',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7c8a3-3eb6-11e7-b5ee-e14fece367d1','Bank Overdraft','n',NULL,'9100-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7c8a4-3eb6-11e7-b5ee-e14fece367d1','Production Creditors应付帐款','n',NULL,'9150-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7c8a5-3eb6-11e7-b5ee-e14fece367d1','Media Creditors应付帐款','n',NULL,'9150-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7c8a6-3eb6-11e7-b5ee-e14fece367d1','Other Creditors其他应付款','n',NULL,'9150-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7c8a7-3eb6-11e7-b5ee-e14fece367d1','JWT Intercompany Payables公司内部应付款','n',NULL,'9150-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7c8a8-3eb6-11e7-b5ee-e14fece367d1','Other MillwardBrown Payable','n',NULL,'9150-005',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7c8a9-3eb6-11e7-b5ee-e14fece367d1','Trade Creditors - MB','n',NULL,'9150-006',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7c8aa-3eb6-11e7-b5ee-e14fece367d1','Agency rebate to MS代理折扣','n',NULL,'9150-007',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7c8ab-3eb6-11e7-b5ee-e14fece367d1','MS Intercompany Payables公司内部应付款','n',NULL,'9150-008',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7c8ac-3eb6-11e7-b5ee-e14fece367d1','C&W Intercompany Payables公司内部应付款','n',NULL,'9150-009',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7c8ad-3eb6-11e7-b5ee-e14fece367d1','Other Creditors for Mindshare','n',NULL,'9150-013',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7c8ae-3eb6-11e7-b5ee-e14fece367d1','Other Trade Creditors Accruals','n',NULL,'9151-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7c8af-3eb6-11e7-b5ee-e14fece367d1','Media Accrual媒体预提','n',NULL,'9155-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7c8b0-3eb6-11e7-b5ee-e14fece367d1','Media Accrual for MF媒体预提','n',NULL,'9155-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7c8b1-3eb6-11e7-b5ee-e14fece367d1','Tax Payable - CT-4%应交税金','n',NULL,'9200-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7c8b2-3eb6-11e7-b5ee-e14fece367d1','Tax Payable - BT-5%应交税金','n',NULL,'9200-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7c8b3-3eb6-11e7-b5ee-e14fece367d1','Tax Payable - MT-5%*0.5%应交税金','n',NULL,'9200-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7c8b4-3eb6-11e7-b5ee-e14fece367d1','Tax Payable 应交税金','n',NULL,'9200-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7c8b5-3eb6-11e7-b5ee-e14fece367d1','Income Tax Payable','n',NULL,'9200-005',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7c8b6-3eb6-11e7-b5ee-e14fece367d1','Tax Payable-VAT in 应交税金-应交增值税-进项税额','n',NULL,'9200-101',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7c8b7-3eb6-11e7-b5ee-e14fece367d1','Tax Payable-VAT paid 应交税金-应交增值税-已交税金','n',NULL,'9200-102',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7c8b8-3eb6-11e7-b5ee-e14fece367d1','Tax Payable-VAT Unpay 应交税金-应交增值税-转出未交增值税','n',NULL,'9200-103',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7c8b9-3eb6-11e7-b5ee-e14fece367d1','Tax Payable-VAT out 应交税金-应交增值税-销项税额','n',NULL,'9200-104',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7efb0-3eb6-11e7-b5ee-e14fece367d1','Tax Payable-VAT in transout 应交增值税-进项税额转出','n',NULL,'9200-105',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7efb1-3eb6-11e7-b5ee-e14fece367d1','Tax Payable-VAT overpay 应交税金应交增值税转出多交增值税','n',NULL,'9200-106',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7efb2-3eb6-11e7-b5ee-e14fece367d1','Tax Payable-Unpay VAT 应交税金-未交增值税','n',NULL,'9200-107',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7efb3-3eb6-11e7-b5ee-e14fece367d1','AL Pension  Housing&Medical-JWT应付福利','n',NULL,'9300-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7efb4-3eb6-11e7-b5ee-e14fece367d1','OT Dinner','n',NULL,'9300-0012',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7efb5-3eb6-11e7-b5ee-e14fece367d1','AL Pension  Housing&Medical-MS应付福利费','n',NULL,'9300-011',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7efb6-3eb6-11e7-b5ee-e14fece367d1','Accrual - Pension Housing & Madical IF','n',NULL,'9300-021',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7efb7-3eb6-11e7-b5ee-e14fece367d1','Welfare Fund - JWT GZ','n',NULL,'9300-031',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7efb8-3eb6-11e7-b5ee-e14fece367d1','OT Taxi 加班出租车','n',NULL,'9300-111',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7efb9-3eb6-11e7-b5ee-e14fece367d1','OT Dinner 加班餐费','n',NULL,'9300-112',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7efba-3eb6-11e7-b5ee-e14fece367d1','Staff Medical','n',NULL,'9300-113',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7efbb-3eb6-11e7-b5ee-e14fece367d1','Deferred Income - Costs递延收入','n',NULL,'9350-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7efbc-3eb6-11e7-b5ee-e14fece367d1','Deferred Income - Revenue递延收入','n',NULL,'9350-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7efbd-3eb6-11e7-b5ee-e14fece367d1','Deferred Income - Tax递延收入','n',NULL,'9350-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7efbe-3eb6-11e7-b5ee-e14fece367d1','Deferred Income - MB','n',NULL,'9350-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7efbf-3eb6-11e7-b5ee-e14fece367d1','Deferred Income-Prod-Tax Excl.递延收入','n',NULL,'9360-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7efc0-3eb6-11e7-b5ee-e14fece367d1','Deferred Income -Production-Tax递延收入','n',NULL,'9360-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7efc1-3eb6-11e7-b5ee-e14fece367d1','Advances from Clients预收货款','n',NULL,'9400-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7efc2-3eb6-11e7-b5ee-e14fece367d1','VAT / Sales Taxes Payable','n',NULL,'9400-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7efc3-3eb6-11e7-b5ee-e14fece367d1','Finance Leases & Hire Purchase经营租赁','n',NULL,'9400-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea7efc4-3eb6-11e7-b5ee-e14fece367d1','Interest Payable (Non Group Only)','n',NULL,'9400-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea816c0-3eb6-11e7-b5ee-e14fece367d1','Dividends payable (Non Group Only)','n',NULL,'9400-005',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea816c1-3eb6-11e7-b5ee-e14fece367d1','Capital Expenditure','n',NULL,'9400-006',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea816c2-3eb6-11e7-b5ee-e14fece367d1','Salary accrual - JWT应付工资','n',NULL,'9400-007',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea816c3-3eb6-11e7-b5ee-e14fece367d1','Holiday Pay应付工资','n',NULL,'9400-008',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea816c4-3eb6-11e7-b5ee-e14fece367d1','Rents & Rates','n',NULL,'9400-009',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea83dd0-3eb6-11e7-b5ee-e14fece367d1','Legal & Professional','n',NULL,'9400-010',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea83dd1-3eb6-11e7-b5ee-e14fece367d1','Audit & Tax Filing Fees','n',NULL,'9400-011',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea83dd2-3eb6-11e7-b5ee-e14fece367d1','Outstanding Pension Contributions','n',NULL,'9400-012',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea83dd3-3eb6-11e7-b5ee-e14fece367d1','Media Provision','n',NULL,'9400-013',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea83dd4-3eb6-11e7-b5ee-e14fece367d1','Salary Accrual - MS应付工资','n',NULL,'9400-017',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea83dd5-3eb6-11e7-b5ee-e14fece367d1','Salary Accruals - C&W','n',NULL,'9400-018',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea83dd6-3eb6-11e7-b5ee-e14fece367d1','Other Accruals - JWT预提费用','n',NULL,'9400-020',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea83dd7-3eb6-11e7-b5ee-e14fece367d1','Other Accruals - MS预提费用','n',NULL,'9400-021',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea83dd8-3eb6-11e7-b5ee-e14fece367d1','Other Accrual for IF','n',NULL,'9400-022',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea83dd9-3eb6-11e7-b5ee-e14fece367d1','Accrual for Intercom time of staff JWT','n',NULL,'9400-027',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea83dda-3eb6-11e7-b5ee-e14fece367d1','Salary accrual for IF','n',NULL,'9400-037',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea864e0-3eb6-11e7-b5ee-e14fece367d1','Other Payables其他应付款','n',NULL,'9400-040',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea864e1-3eb6-11e7-b5ee-e14fece367d1','Employee Payable其他应付款-员工报销','n',NULL,'9400-050',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea864e2-3eb6-11e7-b5ee-e14fece367d1','Other Creditors for MPLB Adjustment','n',NULL,'9400-111',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea864e3-3eb6-11e7-b5ee-e14fece367d1','Accrual intercom. Staff MS','n',NULL,'9400-127',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea864e4-3eb6-11e7-b5ee-e14fece367d1','Other Accrual Non Media Rebates HG','n',NULL,'9400-201',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea864e5-3eb6-11e7-b5ee-e14fece367d1','Short Term Loans ','n',NULL,'9500-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea864e6-3eb6-11e7-b5ee-e14fece367d1','Long Term payable','n',NULL,'9500-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea864e7-3eb6-11e7-b5ee-e14fece367d1','JWT - Hong Kong','n',NULL,'9555-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea864e8-3eb6-11e7-b5ee-e14fece367d1','JWT - Asia Pacific','n',NULL,'9555-050',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea864e9-3eb6-11e7-b5ee-e14fece367d1','Tax Payable - Long Term','n',NULL,'9560-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea864ea-3eb6-11e7-b5ee-e14fece367d1','Deferred Tax','n',NULL,'9590-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea864eb-3eb6-11e7-b5ee-e14fece367d1','Other Deferred Liabilities','n',NULL,'9620-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea864ec-3eb6-11e7-b5ee-e14fece367d1','Share Capital实收资本','n',NULL,'9700-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea864ed-3eb6-11e7-b5ee-e14fece367d1','Capital Reserve准备金','n',NULL,'9700-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea864ee-3eb6-11e7-b5ee-e14fece367d1','Retained Earnings - B/F未分配利润','n',NULL,'9800-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea864ef-3eb6-11e7-b5ee-e14fece367d1','Dividend and EIT股利分配及所得税','n',NULL,'9800-010',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea864f0-3eb6-11e7-b5ee-e14fece367d1','Prior Year Adjustment以前年度损益调整','n',NULL,'9800-011',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea864f1-3eb6-11e7-b5ee-e14fece367d1','Reserve Fund准备金','n',NULL,'9810-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea864f2-3eb6-11e7-b5ee-e14fece367d1','Minority Interest','n',NULL,'9900-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea864f3-3eb6-11e7-b5ee-e14fece367d1','Opening Balance Clearing Account','n',NULL,'9999-000',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea864f4-3eb6-11e7-b5ee-e14fece367d1','Suspense过渡账户','n',NULL,'9999-001',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea864f5-3eb6-11e7-b5ee-e14fece367d1','Suspense Account for Adjustment过渡账户','n',NULL,'9999-002',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea864f6-3eb6-11e7-b5ee-e14fece367d1','UST Debtors','n',NULL,'9999-003',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea864f7-3eb6-11e7-b5ee-e14fece367d1','HF Debtors','n',NULL,'9999-004',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea864f8-3eb6-11e7-b5ee-e14fece367d1','Suspense - Media Financials','n',NULL,'9999-005',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea88bf0-3eb6-11e7-b5ee-e14fece367d1','OtherDebtors-Ford Regional内部应收','n',NULL,'9999-007',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea88bf1-3eb6-11e7-b5ee-e14fece367d1','Other Debtors - DPS/DIC其他应收款','n',NULL,'9999-008',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea88bf2-3eb6-11e7-b5ee-e14fece367d1','WPP Adjustment','n',NULL,'9999-009',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea88bf3-3eb6-11e7-b5ee-e14fece367d1','Suspense for RMB 过渡账户','n',NULL,'9999-101',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea88bf4-3eb6-11e7-b5ee-e14fece367d1','Suspense for USD','n',NULL,'9999-102',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea88bf5-3eb6-11e7-b5ee-e14fece367d1','Suspense for HKD','n',NULL,'9999-103',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('8ea88bf6-3eb6-11e7-b5ee-e14fece367d1','Credit Control Suspense Account','n',NULL,'9999-111',NULL,NULL,NULL,1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL);
/*!40000 ALTER TABLE `subject` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendor`
--

DROP TABLE IF EXISTS `vendor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vendor` (
  `id` char(36) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `contacter` varchar(255) DEFAULT NULL,
  `telphone` varchar(255) DEFAULT NULL,
  `vendorType` enum('user','company') DEFAULT 'company',
  `code` varchar(255) DEFAULT NULL,
  `status` int(11) DEFAULT '1',
  `remark` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `createdUsr` varchar(255) DEFAULT NULL,
  `updatedUsr` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `vendor_name_unique` (`name`),
  KEY `createdUsr` (`createdUsr`),
  KEY `updatedUsr` (`updatedUsr`),
  KEY `vendor_name` (`name`) USING BTREE,
  KEY `vendor_vendor_type` (`vendorType`) USING BTREE,
  KEY `vendor_code` (`code`) USING BTREE,
  KEY `vendor_status` (`status`) USING BTREE,
  CONSTRAINT `vendor_ibfk_1` FOREIGN KEY (`createdUsr`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `vendor_ibfk_2` FOREIGN KEY (`updatedUsr`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor`
--

LOCK TABLES `vendor` WRITE;
/*!40000 ALTER TABLE `vendor` DISABLE KEYS */;
INSERT INTO `vendor` VALUES ('123a73a0-06da-11e7-b23d-513f39f5849c','个人供应商1','个1','021-31213345','user','个人供应商1',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL),('248a4c90-06da-11e7-b23d-513f39f5849c','上海出租车','强哥','021-31313445','company','上海出租车',1,NULL,'2017-05-22 06:19:05','2017-05-22 07:38:51',NULL,NULL),('248a73a0-06da-11e7-b23d-513f39f5849c','上海餐饮','华哥','021-31313445','company','上海餐饮',1,NULL,'2017-05-22 06:19:05','2017-05-22 06:19:05',NULL,NULL);
/*!40000 ALTER TABLE `vendor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendordetail`
--

DROP TABLE IF EXISTS `vendordetail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vendordetail` (
  `id` char(36) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `bankNum` varchar(255) NOT NULL,
  `bankName` varchar(255) NOT NULL,
  `payDate` datetime DEFAULT NULL,
  `status` int(11) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `vendorId` char(36) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `createdUsr` varchar(255) DEFAULT NULL,
  `updatedUsr` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `vendorId` (`vendorId`),
  KEY `createdUsr` (`createdUsr`),
  KEY `updatedUsr` (`updatedUsr`),
  KEY `vendordetail_pay_date` (`payDate`) USING BTREE,
  KEY `vendordetail_status` (`status`) USING BTREE,
  CONSTRAINT `vendordetail_ibfk_1` FOREIGN KEY (`vendorId`) REFERENCES `vendor` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `vendordetail_ibfk_2` FOREIGN KEY (`createdUsr`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `vendordetail_ibfk_3` FOREIGN KEY (`updatedUsr`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendordetail`
--

LOCK TABLES `vendordetail` WRITE;
/*!40000 ALTER TABLE `vendordetail` DISABLE KEYS */;
INSERT INTO `vendordetail` VALUES ('69b6a690-0eca-11e7-8881-5f624753c8ec','111111111111111111','上海银行',NULL,1,'2017-05-22 06:19:05','2017-05-22 06:19:05','248a4c90-06da-11e7-b23d-513f39f5849c',NULL,NULL),('69b769e0-0eca-11e7-8881-5f624753c8ec','222222222222222222','中国银行',NULL,1,'2017-05-22 06:19:05','2017-05-22 06:19:05','248a73a0-06da-11e7-b23d-513f39f5849c',NULL,NULL),('789769e0-0eca-11e7-8881-5f624753c8ec','333333333333333333','工商银行',NULL,1,'2017-05-22 06:19:05','2017-05-22 06:19:05','123a73a0-06da-11e7-b23d-513f39f5849c',NULL,NULL);
/*!40000 ALTER TABLE `vendordetail` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-05-22 15:43:08
