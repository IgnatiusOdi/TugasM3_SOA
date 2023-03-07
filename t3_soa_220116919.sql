/*
SQLyog Community v13.2.0 (64 bit)
MySQL - 8.0.30 : Database - t3_soa_220116919
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`t3_soa_220116919` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `t3_soa_220116919`;

/*Table structure for table `log_jual` */

DROP TABLE IF EXISTS `log_jual`;

CREATE TABLE `log_jual` (
  `kode_beli` varchar(7) NOT NULL,
  `nasabah_id` varchar(5) NOT NULL,
  `kode` varchar(4) NOT NULL,
  `total` bigint NOT NULL,
  PRIMARY KEY (`kode_beli`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `log_jual` */

insert  into `log_jual`(`kode_beli`,`nasabah_id`,`kode`,`total`) values 
('JL00001','BI002','BBCA',850000),
('JL00002','BI002','BBCA',850000);

/*Table structure for table `nasabah` */

DROP TABLE IF EXISTS `nasabah`;

CREATE TABLE `nasabah` (
  `id` varchar(5) NOT NULL,
  `email` varchar(255) NOT NULL,
  `nama_lengkap` varchar(255) NOT NULL,
  `nomor_hp` varchar(255) NOT NULL,
  `pin` varchar(255) NOT NULL,
  `saldo_RDN` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `nasabah` */

insert  into `nasabah`(`id`,`email`,`nama_lengkap`,`nomor_hp`,`pin`,`saldo_RDN`) values 
('BI001','lawrencepatrick@gmail.com','Lawrence Patrick','081231513457','$2b$10$0RXWTP5Qg.IsrwbWO8vU0uJV7yvvnZd8178tF.0Njk0MrLXvzZViS',999999),
('BI002','davidcahyadi@gmail.com','David Cahyadi','082123455231','$2b$10$0RXWTP5Qg.IsrwbWO8vU0uJV7yvvnZd8178tF.0Njk0MrLXvzZViS',997449999);

/*Table structure for table `perusahaan` */

DROP TABLE IF EXISTS `perusahaan`;

CREATE TABLE `perusahaan` (
  `nama_perusahaan` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `instrumen` varchar(255) NOT NULL,
  `singkatan` varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `kategori` enum('SA','RU','RT','OB') NOT NULL,
  `harga` bigint DEFAULT NULL,
  PRIMARY KEY (`singkatan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `perusahaan` */

insert  into `perusahaan`(`nama_perusahaan`,`instrumen`,`singkatan`,`kategori`,`harga`) values 
('PT Bank Central Asia','BCA Saham','BBCA','SA',850000),
('PT Gudang Garam Tbk','Gudang Garam Saham','GGRM','SA',55000),
('PT Syailendra Capital Tbk','Syailendra Pendapatan Tetap Premium','SPTP','RT',15000);

/*Table structure for table `portofolio` */

DROP TABLE IF EXISTS `portofolio`;

CREATE TABLE `portofolio` (
  `kode_beli` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `nasabah_id` varchar(5) NOT NULL,
  `kode` varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `total` bigint NOT NULL,
  `jumlah` int NOT NULL,
  PRIMARY KEY (`kode_beli`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `portofolio` */

insert  into `portofolio`(`kode_beli`,`nasabah_id`,`kode`,`total`,`jumlah`) values 
('BL00001','BI001','GGRM',550000,10),
('BL00002','BI001','SPTP',60000,4),
('BL00003','BI002','BBCA',1700000,2);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
