const User = require("../models/Users");

const insert = (userData) => {
  // ...saving...
  const user = new User(userData);
  return user.save();
};

const loginUser = (loginData) => {
  return User.findOne(loginData);
};

const list = () => {
  // ...listing...
  return User.find({});
};

const modify = (where, updateData) => {
  //gelen data üzeinde filtrelemek bu işlemi Joi yapıyor fakar olsun...
  // const updateData = Object.keys(data).reduce((obj, key) => {
  //   if(key!== "password")obj[key] = data[key];
  //   return obj
  // }, {});
  return User.findOneAndUpdate(where, updateData, {new:true})
}

const remove = (id) => {
  return User.findByIdAndDelete(id);
};

module.exports = {
  insert,
  loginUser,
  list,
  modify,
  remove
};
