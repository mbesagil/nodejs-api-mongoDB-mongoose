const Section = require("../models/Sections");

const list = (where) => {
  // ...listing...
  return Section.find(where || {}).populate({
    path: "user_id",
    select: "full_name email profile_image",
  });
  // .populate({
  //   path: "project_id",
  //   select: "name",
  // });
};

const insert = (sectionData) => {
  // ...saving...
  const section = new Section(sectionData);
  return section.save();
};

const modify = (id, data) => {
  return Section.findByIdAndUpdate(id, data, { new: true });
  // return Project.findById(id).then((project) => {
  //     project.name = data?.name;
  //     return project.save();
  // })
};

const remove = (id) => {
  return Section.findByIdAndDelete(id);
};

module.exports = {
  insert,
  list,
  modify,
  remove,
};
