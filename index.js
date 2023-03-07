const express = require("express");
const Sequelize = require("sequelize");
const { DataTypes, Op, model } = require("sequelize");
const bcrypt = require("bcrypt");
const app = express();
const port = 3000;
app.use(express.urlencoded({ extended: true }));

const sequelize = new Sequelize("t3_soa_220116919", "root", "", {
  host: "localhost",
  port: 3306,
  dialect: "mysql",
  logging: console.log,
  timezone: "+07:00",
});

const Nasabah = sequelize.define(
  "nasabah",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nama_lengkap: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nomor_hp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    saldo_RDN: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "nasabah",
    freezeTableName: true,
  }
);

const Perusahaan = sequelize.define(
  "perusahaan",
  {
    singkatan: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    nama_perusahaan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    instrumen: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kategori: {
      type: DataTypes.ENUM,
      values: ["SA", "RU", "RT", "OB"],
      allowNull: false,
    },
    harga: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "perusahaan",
    freezeTableName: true,
  }
);

const Portofolio = sequelize.define(
  "portofolio",
  {
    kode_beli: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    nasabah_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    total: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    jumlah: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "portofolio",
    freezeTableName: true,
  }
);

const Log_Jual = sequelize.define(
  "log_jual",
  {
    kode_beli: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    nasabah_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    total: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  },
  { sequelize, timestamps: false, modelName: "log_jual", freezeTableName: true }
);

// Nasabah.belongsToMany(Perusahaan, {
//   through: Portofolio,
//   foreignKey: "nasabah_id",
// });
// Perusahaan.belongsToMany(Nasabah, { through: Portofolio, foreignKey: "kode" });

Nasabah.hasMany(Portofolio, { foreignKey: "nasabah_id" });
Portofolio.belongsTo(Nasabah, { foreignKey: "nasabah_id" });

Perusahaan.hasMany(Portofolio, { foreignKey: "kode" });
Portofolio.belongsTo(Perusahaan, { foreignKey: "kode" });

Nasabah.hasMany(Log_Jual, { foreignKey: "nasabah_id" });
Log_Jual.belongsTo(Nasabah, { foreignKey: "nasabah_id" });

// NOMOR 1
app.post("/api/nasabah", async (req, res) => {
  const { email, nama_lengkap, nomor_KTP, nomor_hp, pin } = req.body;

  // CHECK EMPTY, PIN LENGTH = 6
  if (
    !email ||
    !nama_lengkap ||
    !nomor_KTP ||
    !nomor_hp ||
    !pin ||
    pin.length !== 6
  ) {
    return res.status(400).send({
      message: "Terdapat field yang kosong/format salah/tidak ada!",
    });
  }

  // CHECK UNIQUE EMAIL
  const nasabah = await Nasabah.findOne({ where: { email } });
  if (nasabah) {
    return res.status(400).send({ message: "Email sudah terdaftar!" });
  }

  // BCRYPT PIN 10 ROUNDS
  const hashedPin = await bcrypt.hash(pin, 10);

  // GENERATE ID
  const list_nasabah = await Nasabah.findAll();
  const id = `BI${(list_nasabah.length + 1 + "").padStart(3, "0")}`;

  // CREATE NASABAH
  await Nasabah.create({
    id,
    email,
    nama_lengkap,
    nomor_hp,
    pin: hashedPin,
  });

  return res.status(201).send({
    id,
    email,
    nama_lengkap,
    nomor_KTP,
    nomor_hp,
    pin: hashedPin,
    saldo_RDN: "Rp 0",
    total_portofolio: "Rp 0",
  });
});

// NOMOR 2
app.get("/api/nasabah/:id?", async (req, res) => {
  const { id } = req.params;

  if (id != ":id" && id) {
    // CHECK NASABAH
    const nasabah = await Nasabah.findOne({
      where: { id },
      include: [
        {
          model: Portofolio,
          attributes: ["kode", "total", "jumlah"],
          //   through: {
          //     attributes: [],
          //   },
        },
      ],
    });

    if (!nasabah) {
      return res.status(404).send({ message: "User tidak ditemukan!" });
    }

    // GET TOTAL PORTOFOLIO
    let total_portofolio = 0;
    for (let i = 0; i < nasabah.portofolios.length; i++) {
      total_portofolio += nasabah.portofolios[i].total;
    }

    // FORMAT PORTOFOLIO
    let portofolio = [];
    for (let i = 0; i < nasabah.portofolios.length; i++) {
      portofolio.push({
        kode: nasabah.portofolios[i].kode,
        total: `Rp ${nasabah.portofolios[i].total}`,
        jumlah: nasabah.portofolios[i].jumlah,
      });
    }

    return res.status(200).send({
      id,
      email: nasabah.email,
      nama_lengkap: nasabah.nama_lengkap,
      nomor_hp: nasabah.nomor_hp,
      pin: nasabah.pin,
      saldo_RDN: `Rp ${nasabah.saldo_RDN}`,
      total_portofolio: `Rp ${total_portofolio}`,
      portofolio,
      //   portofolio: nasabah.perusahaans,
    });
  }

  // GET NASABAH
  const nasabah = await Nasabah.findAll({
    include: [
      {
        model: Portofolio,
        attributes: ["kode", "total", "jumlah"],
      },
    ],
  });
  let resNasabah = [];
  for (let i = 0; i < nasabah.length; i++) {
    // GET TOTAL PORTOFOLIO
    let total_portofolio = 0;
    for (let j = 0; j < nasabah[i].portofolios.length; j++) {
      total_portofolio += nasabah[i].portofolios[j].total;
    }

    // FORMAT PORTOFOLIO
    let portofolio = [];
    for (let j = 0; j < nasabah[i].portofolios.length; j++) {
      portofolio.push({
        kode: nasabah[i].portofolios[j].kode,
        total: `Rp ${nasabah[i].portofolios[j].total}`,
        jumlah: nasabah[i].portofolios[j].jumlah,
      });
    }

    resNasabah.push({
      id: nasabah[i].id,
      email: nasabah[i].email,
      nama_lengkap: nasabah[i].nama_lengkap,
      nomor_hp: nasabah[i].nomor_hp,
      pin: nasabah[i].pin,
      saldo_RDN: `Rp ${nasabah[i].saldo_RDN}`,
      total_portofolio: `Rp ${total_portofolio}`,
      portofolio,
    });
  }

  return res.status(200).send(resNasabah);
});

// NOMOR 3
app.post("/api/topup", async (req, res) => {
  const { id_user, nominal } = req.body;

  // CHECK EMPTY
  if (!id_user || !nominal) {
    return res.status(400).send({
      message: "Terdapat field yang kosong/format salah/tidak ada!",
    });
  }

  // CHECK NASABAH
  const nasabah = await Nasabah.findOne({ where: { id: id_user } });
  if (!nasabah) {
    return res.status(404).send({ message: "User tidak ditemukan!" });
  }

  // CHECK NOMINAL
  if (nominal < 10000) {
    return res.status(400).send({
      message: "Nominal minimal adalah Rp 10.000!",
    });
  }

  // UPDATE NASABAH
  await Nasabah.update(
    { saldo_RDN: parseInt(nasabah.saldo_RDN) + parseInt(nominal) },
    { where: { id: id_user } }
  );

  return res.status(201).send({
    message: `Berhasil menambah saldo ${nasabah.nama_lengkap} sebanyak Rp ${nominal}!`,
  });
});

// NOMOR 4
app.post("/api/investasi", async (req, res) => {
  const { nama_perusahaan, instrumen, singkatan, kategori, harga } = req.body;

  // CHECK EMPTY, HARGA > 0, NAMA PERUSAHAAN ENDS WITH TBK (CASE INSENSITIVE), SINGKATAN LENGTH = 4, KATEGORI = SA/RU/RT/OB
  if (
    !nama_perusahaan ||
    !instrumen ||
    !singkatan ||
    !kategori ||
    !harga ||
    harga <= 0 ||
    singkatan.length !== 4 ||
    (kategori !== "SA" &&
      kategori !== "RU" &&
      kategori !== "RT" &&
      kategori !== "OB") ||
    nama_perusahaan.substring(nama_perusahaan.length - 3).toLowerCase() !==
      "tbk"
  ) {
    return res.status(400).send({
      message: "Terdapat field yang kosong/format salah/tidak ada!",
    });
  }

  // CHECK PERUSAHAAN
  const perusahaan = await Perusahaan.findOne({ where: { singkatan } });
  if (perusahaan) {
    return res.status(400).send({
      message: "Perusahaan sudah terdaftar!",
    });
  }

  // CREATE PERUSAHAAN
  await Perusahaan.create({
    singkatan,
    nama_perusahaan,
    instrumen,
    kategori,
    harga,
  });

  return res.status(201).send({
    nama_perusahaan,
    instrumen,
    singkatan,
    kategori,
    harga,
  });
});

// NOMOR 5
app.get("/api/investasi/:kode?", async (req, res) => {
  const { kode } = req.params;

  if (kode != ":kode" && kode) {
    // CHECK PERUSAHAAN
    const perusahaan = await Perusahaan.findOne({ where: { singkatan: kode } });
    if (!perusahaan) {
      return res
        .status(404)
        .send({ message: "Instrumen Investasi tidak ditemukan!" });
    }

    return res.status(200).send({
      nama_perusahaan: perusahaan.nama_perusahaan,
      instrumen: perusahaan.instrumen,
      singkatan: perusahaan.singkatan,
      kategori: perusahaan.kategori,
      harga: perusahaan.harga,
    });
  }

  // GET PERUSAHAAN
  const perusahaan = await Perusahaan.findAll();
  let resPerusahaan = [];
  for (let i = 0; i < perusahaan.length; i++) {
    resPerusahaan.push({
      nama_perusahaan: perusahaan[i].nama_perusahaan,
      instrumen: perusahaan[i].instrumen,
      singkatan: perusahaan[i].singkatan,
      kategori: perusahaan[i].kategori,
      harga: perusahaan[i].harga,
    });
  }

  return res.status(200).send(resPerusahaan);
});

// NOMOR 6
app.put("/api/investasi/harga", async (req, res) => {
  const { kode_investasi, harga_jual } = req.body;

  // CHECK EMPTY, HARGA JUAL > 0
  if (!kode_investasi || !harga_jual || harga_jual <= 0) {
    return res.status(400).send({
      message: "Terdapat field yang kosong/format salah/tidak ada!",
    });
  }

  // CHECK PERUSAHAAN
  const perusahaan = await Perusahaan.findOne({
    where: { singkatan: kode_investasi },
  });
  if (!perusahaan) {
    return res.status(404).send({ message: "Perusahaan tidak ditemukan!" });
  }

  const status =
    perusahaan.harga > harga_jual
      ? "turun"
      : perusahaan.harga < harga_jual
      ? "naik"
      : "tetap";
  const old_harga = perusahaan.harga;

  // UPDATE PERUSAHAAN
  await Perusahaan.update(
    { harga: harga_jual },
    { where: { singkatan: kode_investasi } }
  );

  return res.status(201).send({
    message: `Harga jual ${kode_investasi} ${status} dari Rp ${old_harga} ke Rp ${harga_jual}`,
  });
});

// NOMOR 7
app.post("/api/investasi/beli", async (req, res) => {
  const { kode_investasi, id_user, nominal } = req.body;

  // CHECK EMPTY
  if (!kode_investasi || !id_user || !nominal) {
    return res.status(400).send({
      message: "Terdapat field yang kosong/format salah/tidak ada!",
    });
  }

  // CHECK PERUSAHAAN
  const perusahaan = await Perusahaan.findOne({
    where: { singkatan: kode_investasi },
  });
  if (!perusahaan) {
    return res
      .status(404)
      .send({ message: "Instrumen Investasi tidak ditemukan!" });
  }

  // CHECK NASABAH
  const nasabah = await Nasabah.findOne({ where: { id: id_user } });
  if (!nasabah) {
    return res.status(404).send({ message: "User tidak ditemukan!" });
  }

  // CHECK SALDO RDN
  if (parseInt(nasabah.saldo_RDN) < parseInt(nominal)) {
    return res.status(400).send({
      message: "Saldo RDN tidak mencukupi!",
    });
  }

  // CHECK KELIPATAN
  if (parseInt(nominal) % parseInt(perusahaan.harga) !== 0) {
    return res.status(400).send({
      message: "Nominal tidak sesuai kelipatan harga beli",
    });
  }

  const portofolio = await Portofolio.findOne({
    where: { nasabah_id: id_user, kode: kode_investasi },
  });
  let kode_beli;
  if (portofolio) {
    // UPDATE PORTOFOLIO
    await Portofolio.update(
      {
        total: parseInt(portofolio.total) + parseInt(nominal),
        jumlah:
          parseInt(portofolio.jumlah) +
          parseInt(nominal) / parseInt(perusahaan.harga),
      },
      { where: { kode_beli: portofolio.kode_beli } }
    );
  } else {
    // GENERATE KODE BELI
    const bl = await Portofolio.findAll();
    kode_beli = `BL${(bl.length + 1 + "").padStart(5, "0")}`;

    // CREATE PORTOFOLIO
    await Portofolio.create({
      kode_beli,
      nasabah_id: id_user,
      kode: kode_investasi,
      total: nominal,
      jumlah: parseInt(nominal) / parseInt(perusahaan.harga),
    });
  }

  // UPDATE NASABAH SALDO RDN
  await Nasabah.update(
    {
      saldo_RDN: parseInt(nasabah.saldo_RDN) - parseInt(nominal),
    },
    { where: { id: id_user } }
  );

  return res.status(201).send({
    kode_beli,
    kode_investasi,
    nama_user: nasabah.nama_lengkap,
    nominal: `Rp ${nominal}`,
    jumlah_beli: parseInt(nominal) / parseInt(perusahaan.harga),
    saldo_RDN: `Rp ${parseInt(nasabah.saldo_RDN) - parseInt(nominal)}`,
  });
});

// NOMOR 8
app.post("/api/investasi/jual", async (req, res) => {
  const { kode_investasi, id_user, harga_jual } = req.body;

  // CHECK EMPTY
  if (!kode_investasi || !id_user || !harga_jual) {
    return res.status(400).send({
      message: "Terdapat field yang kosong/format salah/tidak ada!",
    });
  }

  // CHECK PERUSAHAAN
  const perusahaan = await Perusahaan.findOne({
    where: { singkatan: kode_investasi },
  });
  if (!perusahaan) {
    return res
      .status(404)
      .send({ message: "Instrumen Investasi tidak ditemukan!" });
  }

  // CHECK NASABAH
  const nasabah = await Nasabah.findOne({ where: { id: id_user } });
  if (!nasabah) {
    return res.status(404).send({ message: "User tidak ditemukan!" });
  }

  // CHECK PORTOFOLIO
  const portofolio = await Portofolio.findOne({
    where: { nasabah_id: id_user, kode: kode_investasi },
  });
  if (!portofolio) {
    return res.status(404).send({ message: "Investasi tidak ditemukan!" });
  }

  // CHECK TOTAL INVESTASI
  if (parseInt(portofolio.total) < parseInt(harga_jual)) {
    return res.status(400).send({
      message: "Anda tidak memiliki investasi sebanyak itu!",
    });
  }

  // GENERATE KODE JUAL
  const jl = await Log_Jual.findAll();
  const kode_jual = `JL${(jl.length + 1 + "").padStart(5, "0")}`;

  // CREATE LOG_JUAL
  await Log_Jual.create({
    kode_beli: kode_jual,
    nasabah_id: id_user,
    kode: kode_investasi,
    total: harga_jual,
  });

  // UPDATE PORTOFOLIO
  await Portofolio.update(
    {
      total: parseInt(portofolio.total) - parseInt(harga_jual),
    },
    { where: { kode_beli: portofolio.kode_beli } }
  );

  // UPDATE NASABAH SALDO RDN
  await Nasabah.update(
    {
      saldo_RDN: parseInt(nasabah.saldo_RDN) + parseInt(harga_jual),
    },
    { where: { id: id_user } }
  );

  return res.status(201).send({
    kode_beli: kode_jual,
    kode_investasi,
    nama_user: nasabah.nama_lengkap,
    nominal: `Rp ${harga_jual}`,
    saldo_RDN: `Rp ${parseInt(nasabah.saldo_RDN) + parseInt(harga_jual)}`,
  });
});

app.listen(port, () => {
  console.log(`listening at port ${port}`);
});
