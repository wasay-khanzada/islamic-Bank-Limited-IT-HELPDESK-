/**
 * Safe schema extensions for IT Support Ticket System (MSSQL).
 * - No DROP statements (backward compatible)
 * - Uses IF NOT EXISTS guards
 */

module.exports = {
  async up(queryInterface) {
    // Departments
    await queryInterface.sequelize.query(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Departments')
      BEGIN
        CREATE TABLE [Departments] (
          [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
          [name] NVARCHAR(255) NOT NULL UNIQUE,
          [createdAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
          [updatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
        );
      END
    `);

    // Categories
    await queryInterface.sequelize.query(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Categories')
      BEGIN
        CREATE TABLE [Categories] (
          [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
          [name] NVARCHAR(255) NOT NULL UNIQUE,
          [createdAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
          [updatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
        );
      END
    `);

    // Assets
    await queryInterface.sequelize.query(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Assets')
      BEGIN
        CREATE TABLE [Assets] (
          [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
          [name] NVARCHAR(255) NOT NULL,
          [type] NVARCHAR(50) NOT NULL,
          [createdAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
          [updatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
        );
      END
    `);

    // UserAssets (join table)
    await queryInterface.sequelize.query(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'UserAssets')
      BEGIN
        CREATE TABLE [UserAssets] (
          [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
          [userId] INT NOT NULL,
          [assetId] INT NOT NULL,
          [createdAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
          [updatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
        );
      END
    `);

    // Users: employeeId, branchCode, departmentId, designation, organization, status (additive)
    // NOTE: keep ALTER + CREATE INDEX in separate batches for SQL Server compatibility.
    await queryInterface.sequelize.query(`
      IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users')
      BEGIN
        IF COL_LENGTH('Users', 'employeeId') IS NULL
          ALTER TABLE [Users] ADD [employeeId] NVARCHAR(5) NULL;

        IF COL_LENGTH('Users', 'branchCode') IS NULL
          ALTER TABLE [Users] ADD [branchCode] NVARCHAR(255) NULL;

        IF COL_LENGTH('Users', 'departmentId') IS NULL
          ALTER TABLE [Users] ADD [departmentId] INT NULL;

        IF COL_LENGTH('Users', 'designation') IS NULL
          ALTER TABLE [Users] ADD [designation] NVARCHAR(255) NULL;

        IF COL_LENGTH('Users', 'organization') IS NULL
          ALTER TABLE [Users] ADD [organization] NVARCHAR(255) NULL;

        IF COL_LENGTH('Users', 'status') IS NULL
          ALTER TABLE [Users] ADD [status] NVARCHAR(50) NOT NULL CONSTRAINT [DF_Users_status] DEFAULT 'pending';
      END
    `);

    await queryInterface.sequelize.query(`
      IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users')
      BEGIN
        IF COL_LENGTH('Users', 'employeeId') IS NOT NULL
           AND NOT EXISTS (
             SELECT * FROM sys.indexes
             WHERE name = 'UQ_Users_employeeId' AND object_id = OBJECT_ID('Users')
           )
        BEGIN
          CREATE UNIQUE INDEX [UQ_Users_employeeId]
          ON [Users]([employeeId])
          WHERE [employeeId] IS NOT NULL;
        END
      END
    `);

    // Tickets: departmentId, categoryId, assetId (additive)
    await queryInterface.sequelize.query(`
      IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Tickets')
      BEGIN
        IF COL_LENGTH('Tickets', 'departmentId') IS NULL
          ALTER TABLE [Tickets] ADD [departmentId] INT NULL;

        IF COL_LENGTH('Tickets', 'categoryId') IS NULL
          ALTER TABLE [Tickets] ADD [categoryId] INT NULL;

        IF COL_LENGTH('Tickets', 'assetId') IS NULL
          ALTER TABLE [Tickets] ADD [assetId] INT NULL;
      END
    `);
  },

  async down() {
    // Intentionally no-op: do not drop tables/columns for safety.
  },
};

