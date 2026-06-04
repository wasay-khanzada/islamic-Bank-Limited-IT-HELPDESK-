/**
 * Ensure Users.accountStatus exists (safe, additive).
 */

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users')
      BEGIN
        IF COL_LENGTH('Users', 'accountStatus') IS NULL
        BEGIN
          ALTER TABLE [Users]
          ADD [accountStatus] NVARCHAR(50) NOT NULL
          CONSTRAINT [DF_Users_accountStatus] DEFAULT 'pending';
        END
      END
    `);
  },

  async down() {
    // no-op: do not drop for safety
  },
};

