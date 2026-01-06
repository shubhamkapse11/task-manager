'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs'); // Used for hashing passwords securely
const jwt = require('jsonwebtoken'); // Used for generating JWT tokens for authentication

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This establishes relationships between models.
     */
    static associate(models) {
      // User has many Tasks (One-to-Many relationship)
      User.hasMany(models.Task, { foreignKey: 'userId' });
    }

    /**
     * Compares the provided plain text password with the hashed password in the database.
     * Used during user login.
     * @param {string} password - The plain text password to verify.
     * @returns {Promise<boolean>} - True if passwords match, false otherwise.
     */
    async comparePassword(password) {
      return await bcrypt.compare(password, this.password);
    }

    /**
     * Generates a JSON Web Token (JWT) for the user.
     * This token is sent to the client and used for subsequent authenticated requests.
     * @returns {string} - The signed JWT token.
     */
    generateToken() {
      return jwt.sign(
        {
          _id: this.id, // Payload: User ID
          email: this.email, // Payload: User Email
          name: this.name // Payload: User Name
        },
        process.env.ACCESS_TOKEN_SECRET, // Secret key from environment variables
        {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d", // Token expiration
        }
      );
    }
  }

  User.init({
    name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
   },
   {
    sequelize,
    modelName: 'User',
    hooks: {
      // Before creating a user, hash the password if it exists
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      // Before updating a user, hash the password only if it has been modified
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });
  return User;
};