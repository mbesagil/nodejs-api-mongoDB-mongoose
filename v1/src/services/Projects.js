const Project = require("../models/Projects");

const insert = (projectData) => {
  // ...saving...
  const project = new Project(projectData);
  return project.save();
};

const list = (where) => {
  // ...listing...
  return Project.find(where || {}).populate({
    path: "user_id",
    select: "full_name email profile_image",
  });
};

const modify = (id, data) => {
  return Project.findByIdAndUpdate(id, data, { new: true });
  // return Project.findById(id).then((project) => {
  //     project.name = data?.name;
  //     return project.save();
  // })
};

const remove = (id) => {
  return Project.findByIdAndDelete(id);
};


module.exports = {
  insert,
  list,
  modify,
  remove,
};
