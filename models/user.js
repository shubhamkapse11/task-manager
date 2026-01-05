'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      User.hasMany(models.Task, { foreignKey: 'userId' });
    }

    // Instance method provided by Sequelize model
    async comparePassword(password) {
      return await bcrypt.compare(password, this.password);
    }

    generateToken() {
      return jwt.sign(
        {
          _id: this.id,
          email: this.email,
          name: this.name
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d",
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
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });
  return User;
};